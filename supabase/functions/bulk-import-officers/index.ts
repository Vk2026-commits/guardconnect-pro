import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const IMPORT_SECRET = Deno.env.get("CRON_SECRET")!;

Deno.serve(async (req) => {
  if (req.headers.get("x-import-secret") !== IMPORT_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { officers } = await req.json();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const results = { created: 0, skipped: 0, errors: [] as any[] };

  for (const o of officers) {
    try {
      const { data: u, error: ue } = await admin.auth.admin.createUser({
        email: o.email,
        email_confirm: true,
        password: crypto.randomUUID() + "Aa1!",
        user_metadata: { full_name: o.full_name, role: "officer" },
      });
      if (ue || !u.user) {
        results.skipped++;
        results.errors.push({ email: o.email, error: ue?.message });
        continue;
      }
      const uid = u.user.id;
      // profile row is auto-created by handle_new_user trigger; update name
      await admin.from("profiles").update({ full_name: o.full_name }).eq("id", uid);
      const { error: opErr } = await admin.from("officer_profiles").insert({
        user_id: uid,
        title: o.title,
        phone: o.phone || null,
        address_street: o.address_street || null,
        address_unit: o.address_unit || null,
        address_city: o.address_city || null,
        address_state: o.address_state || null,
        address_zip: o.address_zip || null,
        date_of_birth: o.date_of_birth,
        account_status: "inactive",
      });
      if (opErr) results.errors.push({ email: o.email, error: opErr.message });
      results.created++;
    } catch (e: any) {
      results.errors.push({ email: o.email, error: String(e) });
    }
  }
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
});
