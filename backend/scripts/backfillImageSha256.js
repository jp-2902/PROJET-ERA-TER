const mongoose =
  require("mongoose");

const path =
  require("path");

const fs =
  require("fs");

require("dotenv").config({
  path: path.join(
    __dirname,
    "../.env"
  ),
});

const Artwork =
  require("../models/Artwork");

const {
  calculateFileSha256,
} =
  require("../services/imageHashService");

// ============================================================
// RESOLVE LOCAL ARTWORK IMAGE PATH
// ============================================================

function resolveArtworkImagePath(
  image
) {
  if (!image) {
    return null;
  }

  const normalized =
    image.replace(
      /^\/+/,
      ""
    );

  return path.join(
    __dirname,
    "..",
    normalized
  );
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  try {
    const mongoUri =
      process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is missing from backend/.env"
      );
    }

    await mongoose.connect(
      mongoUri
    );

    console.log(
      "✅ MongoDB connected"
    );

    const artworks =
      await Artwork.find({});

    console.log(
      `Found ${artworks.length} artwork(s)`
    );

    let updated = 0;
    let skipped = 0;
    let missing = 0;
    let errors = 0;

    for (
      const artwork of artworks
    ) {
      try {
        if (
          artwork.imageSha256
        ) {
          console.log(
            `SKIP: ${artwork.title} already has imageSha256`
          );

          skipped++;
          continue;
        }

        const filePath =
          resolveArtworkImagePath(
            artwork.image
          );

        if (
          !filePath ||
          !fs.existsSync(
            filePath
          )
        ) {
          console.log(
            `MISSING IMAGE: ${artwork.title} -> ${artwork.image}`
          );

          missing++;
          continue;
        }

        const imageSha256 =
          await calculateFileSha256(
            filePath
          );

        artwork.imageSha256 =
          imageSha256;

        await artwork.save();

        console.log(
          `UPDATED: ${artwork.title}`
        );

        updated++;

      } catch (error) {
        console.error(
          `ERROR: ${artwork.title}`,
          error.message
        );

        errors++;
      }
    }

    console.log("");
    console.log(
      "=============================="
    );
    console.log(
      "SHA-256 MIGRATION SUMMARY"
    );
    console.log(
      "=============================="
    );
    console.log(
      `Updated: ${updated}`
    );
    console.log(
      `Skipped: ${skipped}`
    );
    console.log(
      `Missing images: ${missing}`
    );
    console.log(
      `Errors: ${errors}`
    );

  } catch (error) {
    console.error(
      "Migration failed:",
      error
    );

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected"
    );
  }
}

main();
