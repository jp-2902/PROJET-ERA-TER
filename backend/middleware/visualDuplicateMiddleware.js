const fs =
  require("fs");

const Artwork =
  require("../models/Artwork");

const {
  MODEL_NAME,
  generateImageEmbedding,
  cosineSimilarity,
  similarityPercentage,
} =
  require("../services/visualEmbeddingService");

// ============================================================
// VISUAL DUPLICATE THRESHOLD
// ============================================================

// 70% or more = visually duplicated artwork.
const VISUAL_DUPLICATE_THRESHOLD =
  0.70;

// ============================================================
// REMOVE UPLOADED FILE
// ============================================================

function removeUploadedFile(
  file
) {
  if (!file?.path) {
    return;
  }

  fs.unlink(
    file.path,
    () => {}
  );
}

// ============================================================
// AI VISUAL DUPLICATE DETECTION
// ============================================================

async function rejectVisualDuplicateImage(
  req,
  res,
  next
) {
  try {
    // No image uploaded
    if (!req.file?.path) {
      return next();
    }

    // ========================================================
    // GENERATE CLIP EMBEDDING
    // ========================================================

    const imageEmbedding =
      await generateImageEmbedding(
        req.file.path
      );

    // ========================================================
    // GET EXISTING ARTWORK EMBEDDINGS
    // ========================================================

    const query = {
      imageEmbedding: {
        $exists: true,
      },
    };

    // When updating an artwork,
    // exclude the artwork itself.
    if (req.params?.id) {
      query._id = {
        $ne:
          req.params.id,
      };
    }

    const artworks =
      await Artwork
        .find(query)
        .select(
          "_id title artistName category imageEmbedding"
        );

    let bestMatch =
      null;

    let bestScore =
      -1;

    // ========================================================
    // COMPARE AGAINST EXISTING ARTWORKS
    // ========================================================

    for (
      const artwork
      of artworks
    ) {
      if (
        !Array.isArray(
          artwork.imageEmbedding
        ) ||
        artwork.imageEmbedding.length !==
          512
      ) {
        continue;
      }

      const score =
        cosineSimilarity(
          imageEmbedding,
          artwork.imageEmbedding
        );

      if (
        score >
        bestScore
      ) {
        bestScore =
          score;

        bestMatch =
          artwork;
      }
    }

    // ========================================================
    // NO EXISTING COMPARABLE ARTWORK
    // ========================================================

    if (
      !bestMatch
    ) {
      req.imageEmbedding =
        imageEmbedding;

      req.aiAuthenticationCheck = {
        similarityScore:
          0,

        status:
          "Accepted",

        matchedArtwork:
          null,

        model:
          MODEL_NAME,

        checkedAt:
          new Date(),
      };

      console.log(
        "AI CHECK: no comparable artwork found → ACCEPTED"
      );

      return next();
    }

    // ========================================================
    // SIMILARITY RESULT
    // ========================================================

    const similarity =
      similarityPercentage(
        bestScore
      );

    const thresholdPercentage =
      similarityPercentage(
        VISUAL_DUPLICATE_THRESHOLD
      );

    console.log(
      "===================================="
    );

    console.log(
      "AI VISUAL AUTHENTICATION CHECK"
    );

    console.log(
      "===================================="
    );

    console.log(
      `Best match: "${bestMatch.title}"`
    );

    console.log(
      `Similarity: ${similarity}%`
    );

    console.log(
      `Threshold: ${thresholdPercentage}%`
    );

    console.log(
      `Raw score: ${bestScore}`
    );

    console.log(
      `Raw threshold: ${VISUAL_DUPLICATE_THRESHOLD}`
    );

    // ========================================================
    // REJECT ONLY IF >= 70%
    // ========================================================

    if (
      bestScore >=
      VISUAL_DUPLICATE_THRESHOLD
    ) {
      console.log(
        "Decision: REJECTED"
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
          success:
            false,

          code:
            "VISUAL_ARTWORK_DUPLICATE",

          message:
            "This artwork is visually too similar to an artwork already registered in Messina Gallery.",

          duplicateDetected:
            true,

          detectionMethod:
            "CLIP_AI",

          threshold:
            thresholdPercentage,

          similarityScore:
            similarity,

          matchedArtwork: {
            id:
              bestMatch._id,

            title:
              bestMatch.title,

            artistName:
              bestMatch.artistName,

            category:
              bestMatch.category,
          },
        });
    }

    // ========================================================
    // ACCEPT BELOW 70%
    // ========================================================

    console.log(
      "Decision: ACCEPTED"
    );

    console.log(
      "===================================="
    );

    req.imageEmbedding =
      imageEmbedding;

    req.aiAuthenticationCheck = {
      similarityScore:
        similarity,

      status:
        "Accepted",

      matchedArtwork:
        bestMatch._id,

      model:
        MODEL_NAME,

      checkedAt:
        new Date(),
    };

    return next();

  } catch (
    error
  ) {
    removeUploadedFile(
      req.file
    );

    console.error(
      "AI VISUAL DUPLICATE CHECK ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to perform AI visual authentication of the artwork.",
      });
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  VISUAL_DUPLICATE_THRESHOLD,
  rejectVisualDuplicateImage,
};
