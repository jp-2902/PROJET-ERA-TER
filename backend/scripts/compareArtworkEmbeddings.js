const mongoose =
  require("mongoose");

const path =
  require("path");

require("dotenv").config({
  path: path.join(
    __dirname,
    "../.env"
  ),
});

const Artwork =
  require("../models/Artwork");

const {
  cosineSimilarity,
  similarityPercentage,
} =
  require("../services/visualEmbeddingService");

// ============================================================
// MAIN
// ============================================================

async function main() {
  try {
    if (
      !process.env.MONGO_URI
    ) {
      throw new Error(
        "MONGO_URI is missing"
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB connected"
    );

    const artworks =
      await Artwork.find({
        imageEmbedding: {
          $exists: true,
        },
      }).select(
        "title category imageEmbedding"
      );

    console.log(
      `Found ${artworks.length} artwork(s) with AI embeddings`
    );

    console.log("");
    console.log(
      "============================================="
    );
    console.log(
      "VISUAL SIMILARITY BETWEEN EXISTING ARTWORKS"
    );
    console.log(
      "============================================="
    );

    const results =
      [];

    for (
      let i = 0;
      i < artworks.length;
      i += 1
    ) {
      for (
        let j = i + 1;
        j < artworks.length;
        j += 1
      ) {
        const artworkA =
          artworks[i];

        const artworkB =
          artworks[j];

        if (
          !Array.isArray(
            artworkA.imageEmbedding
          ) ||
          artworkA.imageEmbedding.length !== 512 ||
          !Array.isArray(
            artworkB.imageEmbedding
          ) ||
          artworkB.imageEmbedding.length !== 512
        ) {
          continue;
        }

        const score =
          cosineSimilarity(
            artworkA.imageEmbedding,
            artworkB.imageEmbedding
          );

        const percentage =
          similarityPercentage(
            score
          );

        results.push({
          artworkA:
            artworkA.title,

          artworkB:
            artworkB.title,

          percentage,
        });
      }
    }

    results.sort(
      (a, b) =>
        b.percentage -
        a.percentage
    );

    for (
      const result of results
    ) {
      console.log("");
      console.log(
        `${result.artworkA}`
      );

      console.log(
        "       VS"
      );

      console.log(
        `${result.artworkB}`
      );

      console.log(
        `Similarity: ${result.percentage}%`
      );
    }

    console.log("");
    console.log(
      "============================================="
    );

    if (
      results.length > 0
    ) {
      console.log(
        "MOST SIMILAR EXISTING PAIR"
      );

      console.log(
        `${results[0].artworkA} <-> ${results[0].artworkB}`
      );

      console.log(
        `${results[0].percentage}%`
      );
    }

    console.log(
      "============================================="
    );

  } catch (error) {
    console.error(
      "❌ Comparison failed:",
      error
    );

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();

    console.log("");
    console.log(
      "MongoDB disconnected"
    );
  }
}

main();
