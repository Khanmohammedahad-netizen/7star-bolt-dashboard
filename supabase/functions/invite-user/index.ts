import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { email, role, region } = await req.json();

  if (!email || !role || !region) {
    return new Response(
      JSON.stringify({ error: "Missing email, role or region" }),
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role, region }
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    });
  }

  return new Response(
    JSON.stringify({ success: true, userId: data.user?.id }),
    { status: 200 }
  );
});
