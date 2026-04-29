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
    const body = await request.json();
    const { name } = body;

    // STEP 1: Validate input
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name is required and must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    // STEP 2: Check existence and ownership
    const { data: kanban, error: fetchError } = await supabase
      .from("kanbans")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !kanban) {
      return NextResponse.json({ success: false, error: "Kanban not found" }, { status: 404 });
    }

    // STEP 3: Safeguard - Cannot rename "Main" kanban
    if (kanban.is_main) {
      return NextResponse.json(
        { success: false, error: "Cannot rename the Main kanban board" },
        { status: 409 }
      );
    }

    // STEP 4: Update
    const { data: updatedKanban, error: updateError } = await supabase
      .from("kanbans")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: updatedKanban });

  } catch (error) {
    console.error("[API_KANBANS_UPDATE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update kanban" },
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

    // STEP 1: Check existence, ownership and is_main status
    const { data: kanban, error: fetchError } = await supabase
      .from("kanbans")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (fetchError || !kanban) {
      return NextResponse.json({ success: false, error: "Kanban not found" }, { status: 404 });
    }

    if (kanban.is_main) {
      return NextResponse.json(
        { success: false, error: "Cannot delete the Main kanban board" },
        { status: 409 }
      );
    }

    // STEP 2: Find the "Main" kanban for this tenant to reassign conversations
    const { data: mainKanban, error: mainError } = await supabase
      .from("kanbans")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("is_main", true)
      .single();

    if (mainError || !mainKanban) {
      return NextResponse.json(
        { success: false, error: "Main kanban not found. Cleanup inhibited." },
        { status: 500 }
      );
    }

    // STEP 3: Application-Layer Orchestration - Reassign conversations
    // We update all conversations linked to the kanban being deleted
    // They are moved to the Main kanban and their column is set to NULL (to be reassigned manually)
    const { count, error: reassignError } = await supabase
      .from("conversations")
      .update({ 
        kanban_id: mainKanban.id,
        column_id: null, // Move to 'inbox' state of the main kanban
        updated_at: new Date().toISOString() 
      }, { count: 'exact' })
      .eq("kanban_id", id);

    if (reassignError) {
      console.error("Reassignment error:", reassignError);
      return NextResponse.json(
        { success: false, error: "Failed to reassign conversations" },
        { status: 500 }
      );
    }

    // STEP 4: Delete the kanban (cascade will handle columns)
    const { error: deleteError } = await supabase
      .from("kanbans")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ 
      success: true, 
      message: "Kanban deleted successfully",
      reassigned_conversations: count || 0
    });

  } catch (error) {
    console.error("[API_KANBANS_DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete kanban" },
      { status: 500 }
    );
  }
}
