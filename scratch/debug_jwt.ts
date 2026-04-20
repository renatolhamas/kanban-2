
import { SignJWT } from "jose";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const secretString = process.env.JWT_SECRET || "default-dev-secret-change-in-production";
const secret = new TextEncoder().encode(secretString);

async function debugJWT() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: "2d96e273-7cab-4f8e-a2ec-346c21ffab8e",
    tenant_id: "4b54f906-6567-462e-a4fa-3e40da1eadfc",
    email: "cli1@renatolhamas.com.br",
    role: "owner"
  };

  const token = await new SignJWT({
    ...payload,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {
      tenant_id: payload.tenant_id,
      role: payload.role,
    },
    iat: now,
    exp: now + 3600,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secret);

  console.log("Generated Token Payload Structure:");
  const parts = token.split(".");
  const decodedPayload = JSON.parse(Buffer.from(parts[1], "base64").toString());
  console.log(JSON.stringify(decodedPayload, null, 2));
  
  console.log("\nJWT_SECRET length:", secretString.length);
  if (process.env.JWT_SECRET) {
      console.log("JWT_SECRET is set in .env.local");
  } else {
      console.log("JWT_SECRET is NOT set, using default dev secret!");
  }
}

debugJWT();
