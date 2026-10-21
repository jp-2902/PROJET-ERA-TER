const fs = require("fs");
const path = require("path");

// ============================================================
// PINATA CONFIG
// ============================================================

function getPinataConfig() {
  const jwt =
    process.env.PINATA_JWT;

  if (!jwt) {
    throw new Error(
      "PINATA_JWT is missing."
    );
  }

  return {
    jwt,
  };
}

// ============================================================
// NORMALIZE LOCAL ARTWORK IMAGE PATH
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

  if (!fs.existsSync(fullPath)) {
    throw new Error(
      "Artwork image file not found."
    );
  }

  return fullPath;
}

// ============================================================
// UPLOAD FILE TO IPFS THROUGH PINATA
// ============================================================

async function uploadFileToIPFS(
  filePath
) {
  const {
    jwt,
  } =
    getPinataConfig();

  const fileBuffer =
    fs.readFileSync(
      filePath
    );

  const fileName =
    path.basename(
      filePath
    );

  const formData =
    new FormData();

  const blob =
    new Blob(
      [fileBuffer]
    );

  formData.append(
    "file",
    blob,
    fileName
  );

  const response =
    await fetch(
      "https://uploads.pinata.cloud/v3/files",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${jwt}`,
        },

        body:
          formData,
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      "PINATA FILE ERROR:",
      data
    );

    throw new Error(
      "Unable to upload artwork image to IPFS."
    );
  }

  const cid =
    data?.data?.cid;

  if (!cid) {
    throw new Error(
      "Pinata did not return an IPFS CID for the image."
    );
  }

  return {
    cid,
    ipfsURI:
      `ipfs://${cid}`,
  };
}

// ============================================================
// UPLOAD JSON METADATA TO IPFS
// ============================================================

async function uploadJSONToIPFS(
  metadata
) {
  const {
    jwt,
  } =
    getPinataConfig();

  const response =
    await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${jwt}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            pinataMetadata: {
              name:
                metadata.name ||
                "Messina Gallery Artwork",
            },

            pinataContent:
              metadata,
          }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      "PINATA JSON ERROR:",
      data
    );

    throw new Error(
      "Unable to upload NFT metadata to IPFS."
    );
  }

  const cid =
    data.IpfsHash;

  if (!cid) {
    throw new Error(
      "Pinata did not return an IPFS CID for metadata."
    );
  }

  return {
    cid,

    metadataURI:
      `ipfs://${cid}`,
  };
}

// ============================================================
// CREATE NFT METADATA
// ============================================================

function buildArtworkMetadata({
  artwork,
  artist,
  imageURI,
}) {
  return {
    name:
      artwork.title,

    description:
      artwork.description,

    image:
      imageURI,

    external_url:
      process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/artworks/${artwork._id}`
        : undefined,

    attributes: [
      {
        trait_type:
          "Artist",

        value:
          artwork.artistName ||
          artist?.artistName ||
          `${artist?.firstName || ""} ${artist?.lastName || ""}`.trim(),
      },

      {
        trait_type:
          "Category",

        value:
          artwork.category ||
          "",
      },

      {
        trait_type:
          "Year",

        value:
          artwork.year ||
          "",
      },

      {
        trait_type:
          "Dimensions",

        value:
          artwork.dimensions ||
          "",
      },

      {
        trait_type:
          "Country",

        value:
          artwork.country ||
          "",
      },

      {
        trait_type:
          "Original",

        value:
          artwork.isOriginal
            ? "Yes"
            : "No",
      },

      {
        trait_type:
          "Messina Gallery Artwork ID",

        value:
          artwork._id.toString(),
      },

      {
        trait_type:
          "Artist Code",

        value:
          artwork.artistCode ||
          artist?.artistCode ||
          "",
      },
    ],

    properties: {
      platform:
        "MESSINA GALLERY",

      artworkId:
        artwork._id.toString(),

      artistId:
        artwork.artist?.toString?.() ||
        artist?._id?.toString?.() ||
        "",

      story:
        artwork.story ||
        "",

      inspiration:
        artwork.inspiration ||
        "",

      certificationNetwork:
        "Ethereum Sepolia",

      certificationType:
        "NFT originality certificate",
    },
  };
}

// ============================================================
// CREATE AND UPLOAD COMPLETE ARTWORK NFT METADATA
// ============================================================

async function createArtworkNFTMetadata({
  artwork,
  artist,
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

  const imageUpload =
    await uploadFileToIPFS(
      imagePath
    );

  const metadata =
    buildArtworkMetadata({
      artwork,
      artist,
      imageURI:
        imageUpload.ipfsURI,
    });

  const metadataUpload =
    await uploadJSONToIPFS(
      metadata
    );

  return {
    imageCID:
      imageUpload.cid,

    imageURI:
      imageUpload.ipfsURI,

    metadataCID:
      metadataUpload.cid,

    metadataURI:
      metadataUpload.metadataURI,

    metadata,
  };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createArtworkNFTMetadata,
  uploadFileToIPFS,
  uploadJSONToIPFS,
};