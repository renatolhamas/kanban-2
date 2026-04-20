
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function checkColumns() {
  console.log("--- Checking Kanbans ---");
  const { data: kanbans } = await supabase.from("kanbans").select("*");
  console.table(kanbans?.map(k => ({ id: k.id, name: k.name, tenant_id: k.tenant_id })));

  if (kanbans && kanbans.length > 0) {
      const kanbanId = kanbans[0].id;
      console.log(`--- Checking Columns for Kanban: ${kanbans[0].name} (${kanbanId}) ---`);
      const { data: columns, error } = await supabase
        .from("columns")
        .select("*")
        .eq("kanban_id", kanbanId);
      
      if (error) {
        console.error("Error fetching columns:", error);
      } else {
        console.log(`Found ${columns?.length} columns.`);
        console.table(columns?.map(c => ({ id: c.id, name: c.name, order: c.order_position })));
      }
  }
}

checkColumns();
