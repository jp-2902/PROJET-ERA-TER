const path =
  require("path");

// ============================================================
// MODEL CONFIGURATION
// ============================================================

const MODEL_NAME =
  "Xenova/clip-vit-base-patch32";

let extractorPromise =
  null;

// ============================================================
// LOAD CLIP MODEL
// ============================================================

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise =
      import(
        "@huggingface/transformers"
      ).then(
        async ({
          pipeline,
        }) => {
          console.log(
            "Loading CLIP visual model..."
          );

          const extractor =
            await pipeline(
              "image-feature-extraction",
              MODEL_NAME
            );

          console.log(
            "✅ CLIP visual model loaded"
          );

          return extractor;
        }
      );
  }

  return extractorPromise;
}

// ============================================================
// GENERATE IMAGE EMBEDDING
// ============================================================

async function generateImageEmbedding(
  filePath
) {
  if (!filePath) {
    throw new Error(
      "Image path is required"
    );
  }

  const absolutePath =
    path.resolve(
      filePath
    );

  const {
    RawImage,
  } =
    await import(
      "@huggingface/transformers"
    );

  const image =
    await RawImage.read(
      absolutePath
    );

  const extractor =
    await getExtractor();

  const output =
    await extractor(
      image
    );

  const embedding =
    Array.from(
      output.data
    );

  if (
    embedding.length !==
    512
  ) {
    throw new Error(
      `Unexpected embedding size: ${embedding.length}`
    );
  }

  return embedding;
}

// ============================================================
// COSINE SIMILARITY
// ============================================================

function cosineSimilarity(
  vectorA,
  vectorB
) {
  if (
    !Array.isArray(
      vectorA
    ) ||
    !Array.isArray(
      vectorB
    ) ||
    vectorA.length === 0 ||
    vectorA.length !==
      vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (
    let i = 0;
    i < vectorA.length;
    i += 1
  ) {
    const a =
      Number(
        vectorA[i]
      );

    const b =
      Number(
        vectorB[i]
      );

    dotProduct +=
      a * b;

    normA +=
      a * a;

    normB +=
      b * b;
  }

  if (
    normA === 0 ||
    normB === 0
  ) {
    return 0;
  }

  return (
    dotProduct /
    (
      Math.sqrt(
        normA
      ) *
      Math.sqrt(
        normB
      )
    )
  );
}

// ============================================================
// SIMILARITY PERCENTAGE
// ============================================================

function similarityPercentage(
  score
) {
  return Number(
    (
      score * 100
    ).toFixed(
      2
    )
  );
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  MODEL_NAME,
  generateImageEmbedding,
  cosineSimilarity,
  similarityPercentage,
};
