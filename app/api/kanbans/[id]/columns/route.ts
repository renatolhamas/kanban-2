import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kanbanId } = await context.params;
    const supabase = await createClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = user.app_metadata?.tenant_id;

    // STEP 1: Validate Kanban ownership
    const { data: kanban, error: kanbanError } = await supabase
      .from("kanbans")
      .select("id")
      .eq("id", kanbanId)
      .eq("tenant_id", tenantId)
      .single();

    if (kanbanError || !kanban) {
      return NextResponse.json({ success: false, error: "Kanban not found or access denied" }, { status: 404 });
    }

    // STEP 2: Fetch columns
    const { data: columns, error: columnsError } = await supabase
      .from("columns")
      .select("*")
      .eq("kanban_id", kanbanId)
      .order("order_position", { ascending: true });

    if (columnsError) throw columnsError;

    return NextResponse.json({ success: true, data: columns });

  } catch (error) {
    console.error("[API_COLUMNS_GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch columns" },
      { status: 500 }
    );
  }
}
