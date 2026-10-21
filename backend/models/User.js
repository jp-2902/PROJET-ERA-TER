const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ============================================================
    // PERSONAL INFORMATION
    // ============================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // ============================================================
    // ROLE
    //
    // "user" = Collector (legacy + current backend compatibility)
    // "artist" = Artist
    // "admin" = Administrator
    // ============================================================

    role: {
      type: String,
      enum: [
        "user",
        "artist",
        "admin",
      ],
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    // ============================================================
    // ARTIST PUBLIC PROFILE
    // ============================================================

    artistName: {
      type: String,
      default: "",
      trim: true,
    },

    artistCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    specialty: {
      type: String,
      default: "",
      trim: true,
    },

    artisticOrigin: {
      type: String,
      default: "",
      trim: true,
    },

    artisticPerception: {
      type: String,
      default: "",
      trim: true,
    },

    inspiration: {
      type: String,
      default: "",
      trim: true,
    },

    birthDate: {
      type: Date,
      default: null,
    },

    birthPlace: {
      type: String,
      default: "",
      trim: true,
    },

    birthCountry: {
      type: String,
      default: "",
      trim: true,
    },

    startYear: {
      type: Number,
      default: null,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ============================================================
    // ADMIN / MODERATION
    // ============================================================

    artistApproved: {
      type: Boolean,
      default: true,
    },

    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },

    // ============================================================
    // PASSWORD RESET
    // ============================================================

    resetToken: {
      type: String,
      default: undefined,
    },

    resetTokenExpiration: {
      type: Date,
      default: undefined,
    },
  },

  {
    timestamps: true,
  }
);

userSchema.index({
  role: 1,
  createdAt: -1,
});

module.exports =
  mongoose.model(
    "User",
    userSchema
  );