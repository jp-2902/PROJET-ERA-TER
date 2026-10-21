const mongoose =
  require("mongoose");

// ============================================================
// SUPPORT REQUEST SCHEMA
// ============================================================

const supportRequestSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // REFERENCE
      // ======================================================

      reference: {
        type:
          String,

        required:
          true,

        unique:
          true,

        index:
          true,

        trim:
          true,
      },

      // ======================================================
      // USER INFORMATION
      // ======================================================

      name: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      email: {
        type:
          String,

        required:
          true,

        trim:
          true,

        lowercase:
          true,
      },

      phone: {
        type:
          String,

        default:
          "",

        trim:
          true,
      },

      // ======================================================
      // REQUEST INFORMATION
      // ======================================================

      subject: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      category: {
        type:
          String,

        enum: [
          "General question",
          "Artwork",
          "Order",
          "Payment",
          "Shipping",
          "Return",
          "Artist account",
          "Collector account",
          "Technical issue",
          "Emergency",
          "Other",
        ],

        default:
          "General question",
      },

      message: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      // ======================================================
      // PRIORITY
      // ======================================================

      priority: {
        type:
          String,

        enum: [
          "Normal",
          "High",
          "Urgent",
        ],

        default:
          "Normal",

        index:
          true,
      },

      // ======================================================
      // ADMIN STATUS
      // ======================================================

      status: {
        type:
          String,

        enum: [
          "Pending",
          "In progress",
          "Resolved",
          "Closed",
        ],

        default:
          "Pending",

        index:
          true,
      },

      // ======================================================
      // INTERNAL ADMIN NOTE
      // NOT SENT TO THE CUSTOMER
      // ======================================================

      adminNote: {
        type:
          String,

        default:
          "",

        trim:
          true,
      },

      // ======================================================
      // RESOLUTION
      // ======================================================

      resolvedAt: {
        type:
          Date,

        default:
          null,
      },

      // ======================================================
      // ADMIN REPLY
      // ======================================================

      adminReply: {
        type:
          String,

        default:
          "",

        trim:
          true,
      },

      repliedAt: {
        type:
          Date,

        default:
          null,
      },

      repliedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        default:
          null,
      },

      // ======================================================
      // REPLY EMAIL STATUS
      // ======================================================

      replyEmailSent: {
        type:
          Boolean,

        default:
          false,
      },

      replyEmailError: {
        type:
          String,

        default:
          "",
      },

      // ======================================================
      // ORIGINAL SUPPORT EMAIL STATUS
      // ======================================================

      emailSent: {
        type:
          Boolean,

        default:
          false,
      },

      emailError: {
        type:
          String,

        default:
          "",
      },
    },

    {
      timestamps:
        true,
    }
  );

// ============================================================
// INDEXES
// ============================================================

supportRequestSchema.index({
  createdAt:
    -1,
});

supportRequestSchema.index({
  email:
    1,

  createdAt:
    -1,
});

supportRequestSchema.index({
  status:
    1,

  createdAt:
    -1,
});

supportRequestSchema.index({
  priority:
    1,

  createdAt:
    -1,
});

// ============================================================
// MODEL
// ============================================================

const SupportRequest =
  mongoose.models.SupportRequest ||
  mongoose.model(
    "SupportRequest",
    supportRequestSchema
  );

// ============================================================
// EXPORT
// ============================================================

module.exports =
  SupportRequest;