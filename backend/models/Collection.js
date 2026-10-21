const mongoose =
  require("mongoose");

// ============================================================
// COLLECTION SCHEMA
// ============================================================

const collectionSchema =
  new mongoose.Schema(
    {
      // ======================================================
      // OWNER ARTIST
      // ======================================================

      artist: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      artistName: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      artistCode: {
        type:
          String,

        default:
          "",

        trim:
          true,
      },

      // ======================================================
      // COLLECTION INFORMATION
      // ======================================================

      name: {
        type:
          String,

        required:
          true,

        trim:
          true,

        minlength:
          2,

        maxlength:
          120,
      },

      description: {
        type:
          String,

        default:
          "",

        trim:
          true,

        maxlength:
          2000,
      },

      // ======================================================
      // COVER
      // ======================================================

      coverImage: {
        type:
          String,

        default:
          "",

        trim:
          true,
      },

      // ======================================================
      // ARTWORKS
      // ======================================================

      artworks: [
        {
          type:
            mongoose.Schema.Types.ObjectId,

          ref:
            "Artwork",
        },
      ],

      // ======================================================
      // VISIBILITY
      // ======================================================

      published: {
        type:
          Boolean,

        default:
          true,
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

collectionSchema.index({
  artist:
    1,

  createdAt:
    -1,
});

collectionSchema.index({
  published:
    1,

  createdAt:
    -1,
});

collectionSchema.index({
  name:
    "text",

  artistName:
    "text",

  description:
    "text",
});

// ============================================================
// EXPORT
// ============================================================

module.exports =
  mongoose.model(
    "Collection",
    collectionSchema
  );