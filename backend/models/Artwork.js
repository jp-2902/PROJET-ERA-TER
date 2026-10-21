const mongoose =
  require("mongoose");

// ============================================================
// MESSINA GALLERY DIGITAL CERTIFICATE
// ============================================================

const certificateSchema =
  new mongoose.Schema(
    {
      enabled: {
        type: Boolean,
        default: false,
      },

      authenticated: {
        type: Boolean,
        default: false,
      },

      status: {
        type: String,

        enum: [
          "Not certified",
          "Pending",
          "Authenticated",
          "Revoked",
          "Failed",
        ],

        default:
          "Not certified",
      },

      certificateId: {
        type: String,
        default: "",
        trim: true,
      },

      sha256: {
        type: String,
        default: "",
        trim: true,
      },

      signature: {
        type: String,
        default: "",
        trim: true,
      },

      qrCodePath: {
        type: String,
        default: "",
        trim: true,
      },

      verificationUrl: {
        type: String,
        default: "",
        trim: true,
      },

      certifiedAt: {
        type: Date,
        default: null,
      },

      revokedAt: {
        type: Date,
        default: null,
      },
    },

    {
      _id: false,
    }
  );

// ============================================================
// ARTWORK SCHEMA
// ============================================================

const artworkSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // ARTIST
      // ======================================================

      artist: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      artistCode: {
        type: String,
        default: "",
        trim: true,
      },

      artistName: {
        type: String,
        required: true,
        trim: true,
      },

      // ======================================================
      // ARTWORK INFORMATION
      // ======================================================

      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },

      story: {
        type: String,
        default: "",
        trim: true,
      },

      inspiration: {
        type: String,
        default: "",
        trim: true,
      },

      category: {
        type: String,

        required: true,

        enum: [
          "Painting",
          "Sculpture",
          "Photography",
          "Mixed Media",
          "Drawing",
          "Digital Art",
          "Other",
        ],
      },

      // ======================================================
      // COMMERCIAL INFORMATION
      // ======================================================

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      available: {
        type: Boolean,
        default: true,
      },

      sold: {
        type: Boolean,
        default: false,
      },

      soldAt: {
        type: Date,
        default: null,
      },

      // ======================================================
      // ARTWORK DETAILS
      // ======================================================

      year: {
        type: Number,
        default: null,
      },

      dimensions: {
        type: String,
        default: "",
        trim: true,
      },

      country: {
        type: String,
        default: "",
        trim: true,
      },

      isOriginal: {
        type: Boolean,
        default: true,
      },

      // ======================================================
      // IMAGES
      // ======================================================

      image: {
        type: String,
        required: true,
        trim: true,
      },

      additionalImages: {
        type: [String],
        default: [],
      },

      // ======================================================
      // IMAGE DIGITAL FINGERPRINT
      // ======================================================

      imageSha256: {
        type: String,
        default: undefined,
        trim: true,
        lowercase: true,
      },

      // ======================================================
      // AI VISUAL EMBEDDING
      // ======================================================

      imageEmbedding: {
        type: [Number],
        default: undefined,
      },

      // ======================================================
      // AI VISUAL AUTHENTICATION
      // ======================================================

      aiAuthenticationCheck: {
        similarityScore: {
          type: Number,
          default: 0,
        },

        status: {
          type: String,
          enum: [
            "Not Checked",
            "Accepted",
            "Rejected",
          ],
          default: "Not Checked",
        },

        matchedArtwork: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Artwork",
          default: null,
        },

        model: {
          type: String,
          default: null,
        },

        checkedAt: {
          type: Date,
          default: null,
        },
      },

      // ======================================================
      // VISIBILITY
      // ======================================================

      published: {
        type: Boolean,
        default: true,
      },

      // ======================================================
      // MESSINA GALLERY DIGITAL CERTIFICATE
      // ======================================================

      certificate: {
        type:
          certificateSchema,

        default:
          () => ({}),
      },
    },

    {
      timestamps: true,
    }
  );

// ============================================================
// TEXT SEARCH
// ============================================================

artworkSchema.index({
  title: "text",
  artistName: "text",
  description: "text",
  category: "text",
});

// ============================================================
// IMAGE SHA-256 INDEX
// ============================================================

artworkSchema.index({
  imageSha256: 1,
});

// ============================================================
// CERTIFICATE INDEXES
// ============================================================

artworkSchema.index({
  "certificate.certificateId":
    1,
});

artworkSchema.index({
  "certificate.sha256":
    1,
});

// ============================================================
// COMMON FILTER INDEXES
// ============================================================

artworkSchema.index({
  published: 1,
  available: 1,
  createdAt: -1,
});

artworkSchema.index({
  artist: 1,
  createdAt: -1,
});

// ============================================================
// EXPORT
// ============================================================

module.exports =
  mongoose.model(
    "Artwork",
    artworkSchema
  );