import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = user.app_metadata?.tenant_id;
    const { name, kanban_id } = await request.json();

    // STEP 1: Validation
    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name is required and must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    if (!kanban_id) {
      return NextResponse.json({ success: false, error: "Kanban ID is required" }, { status: 400 });
    }

    // STEP 2: Check Kanban ownership
    const { data: kanban, error: kanbanError } = await supabase
      .from("kanbans")
      .select("id")
      .eq("id", kanban_id)
      .eq("tenant_id", tenantId)
      .single();

    if (kanbanError || !kanban) {
      return NextResponse.json({ success: false, error: "Kanban not found or access denied" }, { status: 404 });
    }

    // STEP 3: Check column count limit (Max 10)
    const { count, error: countError } = await supabase
      .from("columns")
      .select("*", { count: "exact", head: true })
      .eq("kanban_id", kanban_id);

    if (countError) throw countError;

    if (count && count >= 10) {
      return NextResponse.json(
        { success: false, error: "Maximum limit of 10 columns reached for this Kanban" },
        { status: 409 }
      );
    }

    // STEP 4: Check for duplicate name in same Kanban
    const { data: existingColumn } = await supabase
      .from("columns")
      .select("id")
      .eq("kanban_id", kanban_id)
      .ilike("name", name)
      .maybeSingle();

    if (existingColumn) {
      return NextResponse.json(
        { success: false, error: "A column with this name already exists in this Kanban" },
        { status: 409 }
      );
    }

    // STEP 5: Get next order_position
    const { data: lastColumn } = await supabase
      .from("columns")
      .select("order_position")
      .eq("kanban_id", kanban_id)
      .order("order_position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = lastColumn ? lastColumn.order_position + 1 : 0;

    // STEP 6: Create
    const { data: newColumn, error: createError } = await supabase
      .from("columns")
      .insert({
        name,
        kanban_id,
        order_position: nextOrder
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({ success: true, data: newColumn });

  } catch (error) {
    console.error("[API_COLUMNS_CREATE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create column" },
      { status: 500 }
    );
  }
}
