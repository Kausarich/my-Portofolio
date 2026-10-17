import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
if (existsSync(".env.local")) {
  console.log(
    ".env.local already exists. Existing configuration was preserved.",
  );
  process.exit(0);
}
const email = process.env.SETUP_OWNER_EMAIL || "owner@portfolio.local";
const password = randomBytes(18).toString("base64url");
const salt = randomBytes(16).toString("hex");
const slug = `portal-${randomBytes(8).toString("hex")}`;
writeFileSync(
  ".env.local",
  `AUTH_SECRET=${randomBytes(48).toString("hex")}\nSECRET_LOGIN_SLUG=${slug}\nOWNER_EMAIL=${email}\nOWNER_PASSWORD_HASH=${salt}:${scryptSync(password, salt, 64).toString("hex")}\n`,
);
writeFileSync(
  ".owner-access.txt",
  `Local portfolio owner access\nURL: /${slug}\nEmail: ${email}\nPassword: ${password}\n\nUse Ctrl/Cmd + Shift + L on the public page to open sign-in.\nKeep this file private. Rotate credentials before production.\n`,
);
console.log(
  "Owner configured. Credentials saved privately to .owner-access.txt.",
);
