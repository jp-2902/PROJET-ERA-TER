const QRCode =
  require("qrcode");

const fs =
  require("fs");

const path =
  require("path");

// ============================================================
// QR CODE DIRECTORY
// ============================================================

const qrDirectory =
  path.join(
    __dirname,
    "../uploads/certificates"
  );

if (
  !fs.existsSync(
    qrDirectory
  )
) {
  fs.mkdirSync(
    qrDirectory,
    {
      recursive: true,
    }
  );
}

// ============================================================
// CLEAN CERTIFICATE ID
// ============================================================

function normalizeCertificateId(
  certificateId
) {
  if (!certificateId) {
    throw new Error(
      "Certificate ID is required."
    );
  }

  return String(
    certificateId
  )
    .trim()
    .toUpperCase();
}

// ============================================================
// VALIDATE VERIFICATION URL
// ============================================================

function validateVerificationUrl(
  verificationUrl
) {
  if (
    !verificationUrl
  ) {
    throw new Error(
      "Certificate verification URL is required."
    );
  }

  let parsedUrl;

  try {
    parsedUrl =
      new URL(
        verificationUrl
      );
  } catch {
    throw new Error(
      "Certificate verification URL is invalid."
    );
  }

  if (
    ![
      "http:",
      "https:",
    ].includes(
      parsedUrl.protocol
    )
  ) {
    throw new Error(
      "Certificate verification URL must use HTTP or HTTPS."
    );
  }

  return parsedUrl.toString();
}

// ============================================================
// GENERATE CERTIFICATE QR CODE
// ============================================================

async function generateCertificateQRCode({
  certificateId,
  artworkTitle,
  artistName,
  sha256,
  status = "Authenticated",
  verificationUrl = "",
}) {
  // ==========================================================
  // VALIDATION
  // ==========================================================

  const normalizedCertificateId =
    normalizeCertificateId(
      certificateId
    );

  if (
    !artworkTitle
  ) {
    throw new Error(
      "Artwork title is required."
    );
  }

  if (
    !artistName
  ) {
    throw new Error(
      "Artist name is required."
    );
  }

  if (
    !sha256
  ) {
    throw new Error(
      "SHA-256 fingerprint is required."
    );
  }

  const publicVerificationUrl =
    validateVerificationUrl(
      verificationUrl
    );

  // ==========================================================
  // FILE NAME
  // ==========================================================

  const safeCertificateId =
    normalizedCertificateId.replace(
      /[^A-Z0-9-_]/g,
      "_"
    );

  const fileName =
    `${safeCertificateId}.png`;

  const filePath =
    path.join(
      qrDirectory,
      fileName
    );

  // ==========================================================
  // QR CONTENT
  // ==========================================================
  //
  // IMPORTANT:
  // The QR contains ONLY the public verification URL.
  //
  // Example:
  //
  // https://messinagallery.com/c/MG-2026-A1B2C3D4
  //
  // This makes the QR:
  // - easier to scan
  // - readable by iPhone
  // - readable by Android
  // - directly clickable
  // - independent from private user areas
  //
  // ==========================================================

  const qrText =
    publicVerificationUrl;

  // ==========================================================
  // GENERATE PNG QR CODE
  // ==========================================================

  await QRCode.toFile(
    filePath,
    qrText,
    {
      type:
        "png",

      width:
        700,

      margin:
        3,

      errorCorrectionLevel:
        "H",
    }
  );

  // ==========================================================
  // RETURN DATA
  // ==========================================================

  return {
    certificateId:
      normalizedCertificateId,

    artworkTitle,

    artistName,

    sha256,

    status,

    verificationUrl:
      publicVerificationUrl,

    filePath,

    qrCodePath:
      `/uploads/certificates/${fileName}`,

    qrText,
  };
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  generateCertificateQRCode,
};