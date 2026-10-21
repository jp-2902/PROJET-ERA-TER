const fs =
  require("fs");

const path =
  require("path");

const {
  generateImageEmbedding,
  cosineSimilarity,
  similarityPercentage,
} =
  require("../services/visualEmbeddingService");

// ============================================================
// CONFIGURATION
// ============================================================

const TEST_DIR =
  path.join(
    __dirname,
    "../test-images/visual-similarity"
  );

// ============================================================
// MAIN
// ============================================================

async function main() {
  const files =
    fs
      .readdirSync(
        TEST_DIR
      )
      .filter(
        (file) =>
          /\.(jpg|jpeg|png)$/i.test(
            file
          )
      )
      .sort();

  if (
    files.length < 2
  ) {
    throw new Error(
      "Not enough test images"
    );
  }

  const originalFile =
    files.find(
      (file) =>
        file.startsWith(
          "01-original"
        )
    );

  if (
    !originalFile
  ) {
    throw new Error(
      "Original image not found"
    );
  }

  const originalPath =
    path.join(
      TEST_DIR,
      originalFile
    );

  console.log(
    "============================================="
  );

  console.log(
    "MESSINA GALLERY"
  );

  console.log(
    "AI VISUAL SIMILARITY TEST"
  );

  console.log(
    "============================================="
  );

  console.log("");
  console.log(
    `Original: ${originalFile}`
  );

  console.log("");
  console.log(
    "Generating original embedding..."
  );

  const originalEmbedding =
    await generateImageEmbedding(
      originalPath
    );

  console.log(
    "✅ Original embedding ready"
  );

  const results =
    [];

  for (
    const file of files
  ) {
    if (
      file === originalFile
    ) {
      continue;
    }

    console.log("");
    console.log(
      `Analyzing: ${file}`
    );

    const filePath =
      path.join(
        TEST_DIR,
        file
      );

    const embedding =
      await generateImageEmbedding(
        filePath
      );

    const score =
      cosineSimilarity(
        originalEmbedding,
        embedding
      );

    const percentage =
      similarityPercentage(
        score
      );

    results.push({
      file,
      percentage,
    });

    console.log(
      `Similarity: ${percentage}%`
    );
  }

  results.sort(
    (a, b) =>
      b.percentage -
      a.percentage
  );

  console.log("");
  console.log(
    "============================================="
  );

  console.log(
    "FINAL RESULTS"
  );

  console.log(
    "============================================="
  );

  for (
    const result of results
  ) {
    console.log(
      `${result.file.padEnd(30)} ${result.percentage}%`
    );
  }

  console.log(
    "============================================="
  );
}

main()
  .catch(
    (error) => {
      console.error(
        "❌ Test failed:",
        error
      );

      process.exit(
        1
      );
    }
  );
