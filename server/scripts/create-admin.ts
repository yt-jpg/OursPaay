
import { db } from "../db";
import { users, wallets } from "@shared/schema";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  try {
    const email = "admin@ourspaay.com";
    const username = "admin";
    const password = "Admin@123456"; // Altere esta senha após o primeiro login
    
    // Check if admin already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (existingUser) {
      console.log("❌ Admin user already exists!");
      process.exit(1);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate referral code
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email,
        username,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "System",
        role: "admin",
        isActive: true,
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false,
        language: "pt-BR",
        referralCode,
      })
      .returning();
    
    // Create wallet for admin
    await db.insert(wallets).values({
      id: randomUUID(),
      userId: adminUser.id,
      balance: "0",
      cashbackBalance: "0",
      referralBonus: "0",
      totalEarned: "0",
      totalWithdrawn: "0",
    });
    
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", email);
    console.log("👤 Username:", username);
    console.log("🔑 Password:", password);
    console.log("\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
