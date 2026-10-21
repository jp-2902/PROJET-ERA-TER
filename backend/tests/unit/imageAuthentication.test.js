const test =
  require("node:test");

const assert =
  require("node:assert/strict");

const fs =
  require("fs");

const path =
  require("path");

const {
  calculateFileSha256,
} =
  require("../../services/imageHashService");

const {
  cosineSimilarity,
  similarityPercentage,
} =
  require("../../services/visualEmbeddingService");

const {
  VISUAL_DUPLICATE_THRESHOLD,
} =
  require("../../middleware/visualDuplicateMiddleware");

// ============================================================
// TEST FILES
// ============================================================

const TEST_DIR =
  path.join(
    __dirname,
    "../temp"
  );

const FILE_A =
  path.join(
    TEST_DIR,
    "image-a.txt"
  );

const FILE_A_COPY =
  path.join(
    TEST_DIR,
    "image-a-copy.txt"
  );

const FILE_B =
  path.join(
    TEST_DIR,
    "image-b.txt"
  );

// ============================================================
// SETUP
// ============================================================

test.before(() => {
  fs.mkdirSync(
    TEST_DIR,
    {
      recursive: true,
    }
  );

  fs.writeFileSync(
    FILE_A,
    "MESSINA_GALLERY_IMAGE_A"
  );

  fs.writeFileSync(
    FILE_A_COPY,
    "MESSINA_GALLERY_IMAGE_A"
  );

  fs.writeFileSync(
    FILE_B,
    "MESSINA_GALLERY_IMAGE_B"
  );
});

// ============================================================
// CLEANUP
// ============================================================

test.after(() => {
  fs.rmSync(
    TEST_DIR,
    {
      recursive: true,
      force: true,
    }
  );
});

// ============================================================
// SHA-256 TESTS
// ============================================================

test(
  "SHA-256: identical files must produce identical hashes",
  async () => {
    const hashA =
      await calculateFileSha256(
        FILE_A
      );

    const hashCopy =
      await calculateFileSha256(
        FILE_A_COPY
      );

    assert.equal(
      hashA,
      hashCopy
    );

    assert.equal(
      hashA.length,
      64
    );
  }
);

test(
  "SHA-256: different files must produce different hashes",
  async () => {
    const hashA =
      await calculateFileSha256(
        FILE_A
      );

    const hashB =
      await calculateFileSha256(
        FILE_B
      );

    assert.notEqual(
      hashA,
      hashB
    );
  }
);

// ============================================================
// COSINE SIMILARITY TESTS
// ============================================================

test(
  "AI similarity: identical vectors must return 100%",
  () => {
    const vector =
      [
        1,
        2,
        3,
        4,
      ];

    const score =
      cosineSimilarity(
        vector,
        vector
      );

    assert.equal(
      similarityPercentage(
        score
      ),
      100
    );
  }
);

test(
  "AI similarity: perpendicular vectors must return 0%",
  () => {
    const vectorA =
      [
        1,
        0,
      ];

    const vectorB =
      [
        0,
        1,
      ];

    const score =
      cosineSimilarity(
        vectorA,
        vectorB
      );

    assert.equal(
      similarityPercentage(
        score
      ),
      0
    );
  }
);

test(
  "AI similarity: invalid vector dimensions must return 0",
  () => {
    const score =
      cosineSimilarity(
        [
          1,
          2,
        ],
        [
          1,
          2,
          3,
        ]
      );

    assert.equal(
      score,
      0
    );
  }
);

// ============================================================
// DUPLICATE THRESHOLD TESTS
// ============================================================

test(
  "AI duplicate threshold must be 70%",
  () => {
    assert.equal(
      VISUAL_DUPLICATE_THRESHOLD,
      0.70
    );
  }
);

test(
  "70% similarity must be rejected",
  () => {
    const similarity =
      0.70;

    const isDuplicate =
      similarity >=
      VISUAL_DUPLICATE_THRESHOLD;

    assert.equal(
      isDuplicate,
      true
    );
  }
);

test(
  "80% similarity must be rejected",
  () => {
    const similarity =
      0.80;

    const isDuplicate =
      similarity >=
      VISUAL_DUPLICATE_THRESHOLD;

    assert.equal(
      isDuplicate,
      true
    );
  }
);

test(
  "69.99% similarity must be accepted",
  () => {
    const similarity =
      0.6999;

    const isDuplicate =
      similarity >=
      VISUAL_DUPLICATE_THRESHOLD;

    assert.equal(
      isDuplicate,
      false
    );
  }
);

test(
  "50.44% similarity must be accepted",
  () => {
    const similarity =
      0.5044;

    const isDuplicate =
      similarity >=
      VISUAL_DUPLICATE_THRESHOLD;

    assert.equal(
      isDuplicate,
      false
    );
  }
);
