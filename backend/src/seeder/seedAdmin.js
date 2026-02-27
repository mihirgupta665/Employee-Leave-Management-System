import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@company.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await Admin.create({
      name: "System Admin",
      email,
      password,
      role: "admin"
    });

    console.log(`Admin created -> ${email}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
