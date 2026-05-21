require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn("⚠  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in server/.env");
}

// Service-role client — bypasses RLS, full DB access
const supabase = createClient(url || "", key || "", {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { headers: { "x-mmn-client": "api-server" } },
});

module.exports = supabase;
