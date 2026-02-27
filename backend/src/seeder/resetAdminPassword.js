import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const resetAdminPassword = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@company.com";
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error("ADMIN_PASSWORD is required to reset admin password");
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error(`Admin not found for email: ${email}`);
    }

    admin.password = password;
    await admin.save();

    console.log(`Admin password reset -> ${email}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

resetAdminPassword();
