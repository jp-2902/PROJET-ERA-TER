const mongoose =
  require("mongoose");

const loginEventSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // USER
      // ======================================================

      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      // ======================================================
      // ROLE AT LOGIN TIME
      // ======================================================

      role: {
        type:
          String,

        enum: [
          "user",
          "artist",
          "admin",
        ],

        required:
          true,

        index:
          true,
      },

      // ======================================================
      // LOGIN STATUS
      // ======================================================

      success: {
        type:
          Boolean,

        default:
          true,

        index:
          true,
      },

      // ======================================================
      // OPTIONAL TECHNICAL INFORMATION
      // ======================================================

      ipAddress: {
        type:
          String,

        default:
          "",
      },

      userAgent: {
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
// INDEXES FOR ADMIN ANALYTICS
// ============================================================

loginEventSchema.index({
  createdAt:
    -1,
});

loginEventSchema.index({
  role:
    1,

  createdAt:
    -1,
});

module.exports =
  mongoose.model(
    "LoginEvent",
    loginEventSchema
  );
