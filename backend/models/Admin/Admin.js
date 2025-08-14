const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username must be less than 20 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    permissions: {
      userManagement: { type: Boolean, default: true },
      contentModeration: { type: Boolean, default: true },
      planManagement: { type: Boolean, default: true },
      systemSettings: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: String,
      contactInfo: String, // Admin's contact information for users
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      dashboardTheme: { type: String, default: "light" },
      language: { type: String, default: "en" },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

// Virtual for full name
adminSchema.virtual("fullName").get(function () {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual for isLocked
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to generate JWT token
adminSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      type: "admin", // Distinguish from user tokens
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  });
};

// Method to check if admin has permission
adminSchema.methods.hasPermission = function (permission) {
  if (this.role === "super_admin") return true;
  return this.permissions[permission] || false;
};

// Method to get admin info (without sensitive data)
adminSchema.methods.getPublicInfo = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    profile: this.profile,
    permissions: this.permissions,
    preferences: this.preferences,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to find admin by credentials
adminSchema.statics.findByCredentials = async function (email, password) {
  const admin = await this.findOne({ email }).select("+password");
  
  if (!admin) {
    throw new Error("Invalid credentials");
  }

  if (!admin.isActive) {
    throw new Error("Account is deactivated");
  }

  if (admin.isLocked) {
    throw new Error("Account is temporarily locked due to too many failed login attempts");
  }

  const isPasswordValid = await admin.comparePassword(password);
  
  if (!isPasswordValid) {
    await admin.incLoginAttempts();
    throw new Error("Invalid credentials");
  }

  // Reset login attempts on successful login
  await admin.resetLoginAttempts();
  
  return admin;
};

// Static method to create admin with validation
adminSchema.statics.createAdmin = async function (adminData, adminCode) {
  // Validate admin code
  const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || "SUPER_ADMIN_2024_SECURE";
  if (adminCode !== validAdminCode) {
    throw new Error("Invalid admin registration code");
  }

  // Check if email already exists
  const existingAdmin = await this.findOne({ email: adminData.email });
  if (existingAdmin) {
    throw new Error("Email already registered");
  }

  // Check if username already exists
  const existingUsername = await this.findOne({ username: adminData.username });
  if (existingUsername) {
    throw new Error("Username already taken");
  }

  // Create admin
  const admin = new this(adminData);
  await admin.save();
  
  return admin;
};

// Static method to create admin without admin code validation
adminSchema.statics.createAdminWithoutCode = async function (adminData) {
  // Check if email already exists
  const existingAdmin = await this.findOne({ email: adminData.email });
  if (existingAdmin) {
    throw new Error("Email already registered");
  }

  // Check if username already exists
  const existingUsername = await this.findOne({ username: adminData.username });
  if (existingUsername) {
    throw new Error("Username already taken");
  }

  // Create admin
  const admin = new this(adminData);
  await admin.save();
  
  return admin;
};

module.exports = mongoose.model("Admin", adminSchema);



