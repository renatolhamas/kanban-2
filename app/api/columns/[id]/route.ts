import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = user.app_metadata?.tenant_id;
    const { name } = await request.json();

    // STEP 1: Validation
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name is required and must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    // STEP 2: Check existence and ownership (via Kanban)
    const { data: column, error: fetchError } = await supabase
      .from("columns")
      .select("*, kanbans!inner(tenant_id)")
      .eq("id", id)
      .eq("kanbans.tenant_id", tenantId)
      .single();

    if (fetchError || !column) {
      return NextResponse.json({ success: false, error: "Column not found or access denied" }, { status: 404 });
    }

    // STEP 3: Check for duplicate name in same Kanban
    const { data: existingColumn } = await supabase
      .from("columns")
      .select("id")
      .eq("kanban_id", column.kanban_id)
      .ilike("name", name)
      .neq("id", id)
      .maybeSingle();

    if (existingColumn) {
      return NextResponse.json(
        { success: false, error: "Another column with this name already exists in this Kanban" },
        { status: 409 }
      );
    }

    // STEP 4: Update
    const { data: updatedColumn, error: updateError } = await supabase
      .from("columns")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updatedColumn });

  } catch (error) {
    console.error("[API_COLUMNS_UPDATE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update column" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = user.app_metadata?.tenant_id;

    // STEP 1: Check existence and ownership
    const { data: column, error: fetchError } = await supabase
      .from("columns")
      .select("*, kanbans!inner(tenant_id)")
      .eq("id", id)
      .eq("kanbans.tenant_id", tenantId)
      .single();

    if (fetchError || !column) {
      return NextResponse.json({ success: false, error: "Column not found or access denied" }, { status: 404 });
    }

    // STEP 2: Safeguard - Cannot delete if only 1 column remains
    const { count, error: countError } = await supabase
      .from("columns")
      .select("*", { count: "exact", head: true })
      .eq("kanban_id", column.kanban_id);

    if (countError) throw countError;

    if (count && count <= 1) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the last column of a Kanban" },
        { status: 409 }
      );
    }

    // STEP 3: Find first available column (min order_position) excluding the one being deleted
    const { data: targetColumn, error: targetError } = await supabase
      .from("columns")
      .select("id")
      .eq("kanban_id", column.kanban_id)
      .neq("id", id)
      .order("order_position", { ascending: true })
      .limit(1)
      .single();

    if (targetError || !targetColumn) {
      return NextResponse.json(
        { success: false, error: "Target column for reassignment not found" },
        { status: 500 }
      );
    }

    // STEP 4: Application-Layer Orchestration - Reassign conversations
    const { count: movedCount, error: reassignError } = await supabase
      .from("conversations")
      .update({ 
        column_id: targetColumn.id,
        updated_at: new Date().toISOString() 
      }, { count: 'exact' })
      .eq("column_id", id);

    if (reassignError) {
      console.error("Reassignment error:", reassignError);
      return NextResponse.json(
        { success: false, error: "Failed to reassign conversations" },
        { status: 500 }
      );
    }

    // STEP 5: Delete the column
    const { error: deleteError } = await supabase
      .from("columns")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ 
      success: true, 
      message: "Column deleted successfully",
      conversations_moved: movedCount || 0
    });

  } catch (error) {
    console.error("[API_COLUMNS_DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete column" },
      { status: 500 }
    );
  }
}
