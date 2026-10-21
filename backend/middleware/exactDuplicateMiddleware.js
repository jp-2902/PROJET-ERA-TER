const fs = require("fs");

const Artwork =
  require("../models/Artwork");

const {
  calculateFileSha256,
} =
  require("../services/imageHashService");

// ============================================================
// REMOVE TEMPORARY UPLOADED FILE
// ============================================================

function removeUploadedFile(file) {
  if (!file?.path) {
    return;
  }

  fs.unlink(
    file.path,
    () => {}
  );
}

// ============================================================
// EXACT IMAGE DUPLICATE DETECTION
// ============================================================

async function rejectExactDuplicateImage(
  req,
  res,
  next
) {
  try {
    // No new image uploaded.
    // This can happen during an artwork update.
    if (!req.file?.path) {
      return next();
    }

    // --------------------------------------------------------
    // Calculate SHA-256 only from the uploaded image file.
    // --------------------------------------------------------

    const imageSha256 =
      await calculateFileSha256(
        req.file.path
      );

    console.log("");
    console.log("====================================");
    console.log("SHA-256 UPLOAD CHECK");
    console.log("====================================");
    console.log(
      "Original filename:",
      req.file.originalname
    );
    console.log(
      "Stored filename:",
      req.file.filename
    );
    console.log(
      "Uploaded SHA-256:",
      imageSha256
    );

    // --------------------------------------------------------
    // Search an existing artwork having exactly the same image.
    // --------------------------------------------------------

    const query = {
      imageSha256,
    };

    // During an artwork update, do not compare the artwork
    // against itself.
    if (req.params?.id) {
      query._id = {
        $ne: req.params.id,
      };
    }

    const duplicate =
      await Artwork
        .findOne(query)
        .select(
          "_id title artistName category image imageSha256"
        );

    if (duplicate) {
      console.log(
        "❌ EXACT DUPLICATE FOUND:"
      );

      console.log(
        "Matched artwork:",
        duplicate.title
      );

      console.log(
        "Matched SHA-256:",
        duplicate.imageSha256
      );

      console.log(
        "===================================="
      );

      removeUploadedFile(
        req.file
      );

      return res
        .status(409)
        .json({
          success: false,

          code:
            "EXACT_ARTWORK_DUPLICATE",

          message:
            "This image already exists in Messina Gallery. The artwork cannot be accepted as a new original artwork.",

          duplicateDetected:
            true,

          detectionMethod:
            "SHA-256",

          matchedArtwork: {
            id:
              duplicate._id,

            title:
              duplicate.title,

            artistName:
              duplicate.artistName,

            category:
              duplicate.category,
          },
        });
    }

    // Make the hash available to the following route handler.
    req.imageSha256 =
      imageSha256;

    return next();

  } catch (error) {
    removeUploadedFile(
      req.file
    );

    console.error(
      "IMAGE DUPLICATE CHECK ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to verify the artwork image.",
      });
  }
}

module.exports = {
  rejectExactDuplicateImage,
};
