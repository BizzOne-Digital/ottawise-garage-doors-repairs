/**
 * Admin bootstrap. Creates an admin, or resets the password of an existing one.
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin
 * There is no public registration; this command is the only way to create admins.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AdminSession, AdminUser } from "../lib/models";

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Administrator";
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("ADMIN_EMAIL must be a valid email");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");

  await mongoose.connect(uri);
  await AdminUser.syncIndexes();
  await AdminSession.syncIndexes();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.name = name;
    await existing.save();
    await AdminSession.deleteMany({ userId: existing._id }); // sign out old sessions
    console.log(`Updated password for ${email} and signed out existing sessions.`);
  } else {
    await AdminUser.create({ email, name, passwordHash });
    console.log(`Created admin ${email}.`);
  }
  console.log("Remove ADMIN_PASSWORD from your environment now.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("create-admin failed:", e.message);
  process.exit(1);
});
