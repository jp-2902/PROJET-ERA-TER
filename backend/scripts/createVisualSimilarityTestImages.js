const fs =
  require("fs");

const path =
  require("path");

const sharp =
  require("sharp");

// ============================================================
// CONFIGURATION
// ============================================================

const ARTWORKS_DIR =
  path.join(
    __dirname,
    "../uploads/artworks"
  );

const OUTPUT_DIR =
  path.join(
    __dirname,
    "../test-images/visual-similarity"
  );

// ============================================================
// FIND ONE EXISTING ARTWORK
// ============================================================

function findTestImage() {
  const files =
    fs
      .readdirSync(
        ARTWORKS_DIR
      )
      .filter(
        (file) =>
          /\.(jpg|jpeg|png)$/i.test(
            file
          )
      );

  if (
    files.length === 0
  ) {
    throw new Error(
      "No artwork image found"
    );
  }

  return path.join(
    ARTWORKS_DIR,
    files[0]
  );
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  fs.mkdirSync(
    OUTPUT_DIR,
    {
      recursive: true,
    }
  );

  const original =
    findTestImage();

  console.log(
    "Original image:"
  );

  console.log(
    original
  );

  // ----------------------------------------------------------
  // ORIGINAL COPY
  // ----------------------------------------------------------

  await sharp(
    original
  )
    .toFile(
      path.join(
        OUTPUT_DIR,
        "01-original.jpg"
      )
    );

  // ----------------------------------------------------------
  // RESIZED
  // ----------------------------------------------------------

  await sharp(
    original
  )
    .resize({
      width: 500,
    })
    .jpeg({
      quality: 85,
    })
    .toFile(
      path.join(
        OUTPUT_DIR,
        "02-resized.jpg"
      )
    );

  // ----------------------------------------------------------
  // JPEG RECOMPRESSION
  // ----------------------------------------------------------

  await sharp(
    original
  )
    .jpeg({
      quality: 55,
    })
    .toFile(
      path.join(
        OUTPUT_DIR,
        "03-compressed.jpg"
      )
    );

  // ----------------------------------------------------------
  // BRIGHTER
  // ----------------------------------------------------------

  await sharp(
    original
  )
    .modulate({
      brightness: 1.25,
    })
    .jpeg()
    .toFile(
      path.join(
        OUTPUT_DIR,
        "04-brighter.jpg"
      )
    );

  // ----------------------------------------------------------
  // DARKER
  // ----------------------------------------------------------

  await sharp(
    original
  )
    .modulate({
      brightness: 0.7,
    })
    .jpeg()
    .toFile(
      path.join(
        OUTPUT_DIR,
        "05-darker.jpg"
      )
    );

  // ----------------------------------------------------------
  // CROPPED
  // ----------------------------------------------------------

  const metadata =
    await sharp(
      original
    ).metadata();

  const width =
    metadata.width;

  const height =
    metadata.height;

  if (
    width &&
    height
  ) {
    const cropWidth =
      Math.floor(
        width * 0.8
      );

    const cropHeight =
      Math.floor(
        height * 0.8
      );

    const left =
      Math.floor(
        (width - cropWidth) / 2
      );

    const top =
      Math.floor(
        (height - cropHeight) / 2
      );

    await sharp(
      original
    )
      .extract({
        left,
        top,
        width: cropWidth,
        height: cropHeight,
      })
      .jpeg()
      .toFile(
        path.join(
          OUTPUT_DIR,
          "06-cropped.jpg"
        )
      );
  }

  // ----------------------------------------------------------
  // ROTATED
  // ----------------------------------------------------------

  await sharp(
    original
  )
    .rotate(
      5,
      {
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 1,
        },
      }
    )
    .jpeg()
    .toFile(
      path.join(
        OUTPUT_DIR,
        "07-rotated.jpg"
      )
    );

  console.log("");
  console.log(
    "✅ Test images created"
  );

  console.log(
    OUTPUT_DIR
  );
}

main()
  .catch(
    (error) => {
      console.error(
        "❌ Error:",
        error
      );

      process.exit(
        1
      );
    }
  );
