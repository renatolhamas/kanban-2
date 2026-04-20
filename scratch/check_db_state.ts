
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

async function checkData() {
  console.log("--- Checking Kanbans ---");
  const { data: kanbans, error: kError } = await supabase
    .from("kanbans")
    .select("*");
  
  if (kError) {
    console.error("Error fetching kanbans:", kError);
  } else {
    console.log(`Found ${kanbans?.length} kanbans.`);
    console.table(kanbans?.map(k => ({ id: k.id, name: k.name, tenant_id: k.tenant_id, is_main: k.is_main })));
  }

  console.log("\n--- Checking Users ---");
  const { data: users, error: uError } = await supabase
    .from("users")
    .select("*");
  
  if (uError) {
    console.error("Error fetching users:", uError);
  } else {
    console.log(`Found ${users?.length} users.`);
    console.table(users?.map(u => ({ id: u.id, email: u.email, tenant_id: u.tenant_id })));
  }
}

checkData();
