import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  return argv.reduce((result, item, index, source) => {
    if (!item.startsWith("--")) {
      return result;
    }

    const key = item.slice(2);
    const nextValue = source[index + 1];
    result[key] = nextValue && !nextValue.startsWith("--") ? nextValue : "true";
    return result;
  }, {});
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#"))
    .reduce((result, line) => {
      const delimiterIndex = line.indexOf("=");

      if (delimiterIndex === -1) {
        return result;
      }

      const key = line.slice(0, delimiterIndex).trim();
      const value = line.slice(delimiterIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      result[key] = value;
      return result;
    }, {});
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const envLocal = readEnvFile(path.join(projectRoot, ".env.local"));
  const envExample = readEnvFile(path.join(projectRoot, ".env.example"));
  const env = { ...envExample, ...envLocal, ...process.env };

  const email = (args.email || "").trim().toLowerCase();
  const fullName = (args.name || "").trim() || null;

  if (!email) {
    throw new Error("Pouzij: npm run bootstrap:admin -- --email admin@firma.cz --name \"Tvoje jmeno\"");
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("V .env.local chybi NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.");
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let authUser = null;
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw new Error(`Nepodarilo se nacist auth users: ${error.message}`);
    }

    authUser = data.users.find((user) => (user.email || "").toLowerCase() === email) || null;

    if (authUser || data.users.length < 200) {
      break;
    }

    page += 1;
  }

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${appUrl}/auth/callback`,
      data: {
        access_type: "admin",
      },
    });

    if (error || !data.user) {
      throw new Error(`Nepodarilo se vytvorit admin invite: ${error?.message || "neznamy problem"}`);
    }

    authUser = data.user;
    console.log("Admin pozvanka byla odeslana.");
  } else {
    console.log("Auth user uz existuje, jen dorovnavam app-level admin profil.");
  }

  const { data: existingProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, account_status")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Nepodarilo se nacist user profile: ${profileError.message}`);
  }

  if (!existingProfile) {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("user_profiles")
      .insert({
        auth_user_id: authUser.id,
        full_name: fullName,
        login_email: email,
        access_type: "admin",
        account_status: authUser.last_sign_in_at ? "active" : "invited",
      })
      .select("id")
      .single();

    if (insertError || !insertedProfile) {
      throw new Error(`Nepodarilo se vytvorit admin profile: ${insertError?.message || "neznamy problem"}`);
    }

    const { error: preferenceError } = await supabase.from("email_notification_preferences").upsert(
      { user_profile_id: insertedProfile.id },
      { onConflict: "user_profile_id" },
    );

    if (preferenceError) {
      throw new Error(`Admin profil vznikl, ale email preference ne: ${preferenceError.message}`);
    }
  } else {
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        login_email: email,
        access_type: "admin",
        account_status: existingProfile.account_status === "archived" ? "active" : existingProfile.account_status,
      })
      .eq("id", existingProfile.id);

    if (updateError) {
      throw new Error(`Nepodarilo se dorovnat admin profil: ${updateError.message}`);
    }
  }

  console.log("Bootstrap admin foundation je pripraveny pro:", email);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
