const crypto =
  require("crypto");

const fs =
  require("fs");

const path =
  require("path");

// ============================================================
// GENERATE CERTIFICATE ID
// ============================================================

function generateCertificateId() {
  const year =
    new Date().getFullYear();

  const randomPart =
    crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

  return `MG-${year}-${randomPart}`;
}

// ============================================================
// GET ARTWORK IMAGE PATH
// ============================================================

function getArtworkImagePath(
  artworkImage
) {
  if (!artworkImage) {
    throw new Error(
      "Artwork image is missing."
    );
  }

  const cleanPath =
    artworkImage.replace(
      /^\/+/,
      ""
    );

  const fullPath =
    path.join(
      __dirname,
      "..",
      cleanPath
    );

  if (
    !fs.existsSync(
      fullPath
    )
  ) {
    throw new Error(
      "Artwork image file not found."
    );
  }

  return fullPath;
}

// ============================================================
// CREATE SHA-256 FINGERPRINT
// ============================================================

function generateArtworkHash({
  artwork,
}) {
  if (!artwork) {
    throw new Error(
      "Artwork is required."
    );
  }

  const imagePath =
    getArtworkImagePath(
      artwork.image
    );

  const imageBuffer =
    fs.readFileSync(
      imagePath
    );

  const artworkData =
    JSON.stringify({
      artworkId:
        artwork._id.toString(),

      artistId:
        artwork.artist.toString(),

      artistName:
        artwork.artistName,

      artistCode:
        artwork.artistCode,

      title:
        artwork.title,

      description:
        artwork.description,

      story:
        artwork.story,

      inspiration:
        artwork.inspiration,

      category:
        artwork.category,

      year:
        artwork.year,

      dimensions:
        artwork.dimensions,

      country:
        artwork.country,

      isOriginal:
        artwork.isOriginal,
    });

  const hash =
    crypto.createHash(
      "sha256"
    );

  hash.update(
    imageBuffer
  );

  hash.update(
    artworkData
  );

  return hash.digest(
    "hex"
  );
}

// ============================================================
// PUBLIC SITE URL
// ============================================================

function getPublicSiteUrl() {
  const url =
    process.env
      .PUBLIC_SITE_URL ||
    process.env
      .FRONTEND_URL ||
    "http://localhost:5173";

  return url.replace(
    /\/+$/,
    ""
  );
}

// ============================================================
// CREATE PUBLIC VERIFICATION URL
// ============================================================

function createVerificationUrl(
  certificateId
) {
  if (
    !certificateId
  ) {
    throw new Error(
      "Certificate ID is required."
    );
  }

  const publicSiteUrl =
    getPublicSiteUrl();

  return (
    `${publicSiteUrl}/c/` +
    encodeURIComponent(
      certificateId
    )
  );
}

// ============================================================
// CREATE CERTIFICATE DATA
// ============================================================

function createCertificateData({
  artwork,
}) {
  if (!artwork) {
    throw new Error(
      "Artwork is required."
    );
  }

  const certificateId =
    generateCertificateId();

  const sha256 =
    generateArtworkHash({
      artwork,
    });

  const verificationUrl =
    createVerificationUrl(
      certificateId
    );

  return {
    certificateId,

    sha256,

    verificationUrl,

    certifiedAt:
      new Date(),
  };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  generateCertificateId,
  generateArtworkHash,
  createVerificationUrl,
  createCertificateData,
};