const express =
  require("express");

const router =
  express.Router();

const crypto =
  require("crypto");

const multer =
  require("multer");

const path =
  require("path");

const fs =
  require("fs");

const Artwork =
  require("../models/Artwork");

const User =
  require("../models/User");

const {
  authenticateToken,
  requireRoles,
} =
  require("../middleware/authMiddleware");

const {
  createCertificateData,
} =
  require("../services/certificateService");

const {
  generateCertificateQRCode,
} =
  require("../services/qrCodeService");

const {
  rejectExactDuplicateImage,
} =
  require("../middleware/exactDuplicateMiddleware");

const {
  rejectVisualDuplicateImage,
} =
  require("../middleware/visualDuplicateMiddleware");

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDirectory =
  path.join(
    __dirname,
    "../uploads/artworks"
  );

if (
  !fs.existsSync(
    uploadDirectory
  )
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}

// ============================================================
// MULTER STORAGE
// ============================================================

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path
          .extname(
            file.originalname
          )
          .toLowerCase();

      const random =
        crypto
          .randomBytes(4)
          .toString("hex");

      cb(
        null,
        `artwork-${Date.now()}-${random}${extension}`
      );
    },
  });

// ============================================================
// MULTER UPLOAD
// ============================================================

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.mimetype
        )
      ) {
        return cb(
          new Error(
            "Only JPG, PNG and WEBP images are allowed."
          )
        );
      }

      cb(
        null,
        true
      );
    },
  });

// ============================================================
// HELPERS
// ============================================================

const isArtworkCertified = (
  artwork
) =>
  artwork?.certificate
    ?.authenticated === true &&
  artwork?.certificate
    ?.status ===
    "Authenticated";

const parseBoolean = (
  value
) =>
  value === true ||
  value === "true";

const removeUploadedFile = (
  file
) => {
  if (
    !file?.path
  ) {
    return;
  }

  fs.unlink(
    file.path,
    () => {}
  );
};

// ============================================================
// PUBLIC - ALL ARTWORKS
// GET /api/artworks
// ============================================================

router.get(
  "/",

  async (
    req,
    res
  ) => {
    try {
      // Sold artworks remain visible in the public gallery.
      // They simply become impossible to purchase.

      const artworks =
        await Artwork
          .find({
            published:
              true,
          })
          .populate(
            "artist",
            "firstName lastName artistName artistCode profileImage country"
          )
          .sort({
            sold:
              1,

            available:
              -1,

            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        artworks,
      });

    } catch (
      error
    ) {
      console.error(
        "GET ARTWORKS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load artworks.",
        });
    }
  }
);

// ============================================================
// ARTIST - MY ARTWORKS
// GET /api/artworks/mine
// ============================================================

router.get(
  "/mine",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    try {
      const artworks =
        await Artwork
          .find({
            artist:
              req.userId,
          })
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        artworks,
      });

    } catch (
      error
    ) {
      console.error(
        "MY ARTWORKS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load your artworks.",
        });
    }
  }
);

// ============================================================
// ARTIST - CREATE DIGITAL CERTIFICATE
// POST /api/artworks/:id/certificate
// ============================================================

router.post(
  "/:id/certificate",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    let artwork =
      null;

    try {
      artwork =
        await Artwork.findOne({
          _id:
            req.params.id,

          artist:
            req.userId,
        });

      if (
        !artwork
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artwork not found or you are not its owner.",
          });
      }

      if (
        !artwork.isOriginal
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Only original artworks can be authenticated.",
          });
      }

      if (
        isArtworkCertified(
          artwork
        )
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "This artwork is already authenticated.",

            certificate:
              artwork.certificate,
          });
      }

      // ======================================================
      // PENDING
      // ======================================================

      artwork.certificate.enabled =
        true;

      artwork.certificate.authenticated =
        false;

      artwork.certificate.status =
        "Pending";

      await artwork.save();

      // ======================================================
      // GENERATE CERTIFICATE DATA
      // ======================================================

      const certificateData =
        createCertificateData({
          artwork,
        });

      // ======================================================
      // GENERATE QR CODE
      // ======================================================

      const qrResult =
        await generateCertificateQRCode({
          certificateId:
            certificateData
              .certificateId,

          artworkTitle:
            artwork.title,

          artistName:
            artwork.artistName,

          sha256:
            certificateData
              .sha256,

          status:
            "Authenticated",

          verificationUrl:
            certificateData
              .verificationUrl,
        });

      // ======================================================
      // SAVE CERTIFICATE
      // ======================================================

      artwork.certificate.enabled =
        true;

      artwork.certificate.authenticated =
        true;

      artwork.certificate.status =
        "Authenticated";

      artwork.certificate.certificateId =
        certificateData
          .certificateId;

      artwork.certificate.sha256 =
        certificateData
          .sha256;

      artwork.certificate.verificationUrl =
        certificateData
          .verificationUrl;

      artwork.certificate.qrCodePath =
        qrResult
          .qrCodePath;

      artwork.certificate.certifiedAt =
        certificateData
          .certifiedAt;

      artwork.certificate.revokedAt =
        null;

      await artwork.save();

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Artwork authenticated successfully.",

          certificate:
            artwork.certificate,

          artwork,
        });

    } catch (
      error
    ) {
      console.error(
        "CREATE CERTIFICATE ERROR:",
        error
      );

      if (
        artwork
      ) {
        try {
          artwork.certificate.enabled =
            true;

          artwork.certificate.authenticated =
            false;

          artwork.certificate.status =
            "Failed";

          await artwork.save();

        } catch (
          saveError
        ) {
          console.error(
            "CERTIFICATE STATUS SAVE ERROR:",
            saveError
          );
        }
      }

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to authenticate artwork.",
        });
    }
  }
);

// ============================================================
// PUBLIC - GET CERTIFICATE
// GET /api/artworks/certificate/:certificateId
// ============================================================

router.get(
  "/certificate/:certificateId",

  async (
    req,
    res
  ) => {
    try {
      const certificateId =
        req.params
          .certificateId
          .trim()
          .toUpperCase();

      const artwork =
        await Artwork
          .findOne({
            "certificate.certificateId":
              certificateId,
          })
          .populate(
            "artist",
            "firstName lastName artistName artistCode profileImage country"
          );

      if (
        !artwork
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            valid:
              false,

            message:
              "Certificate not found.",
          });
      }

      const certificate =
        artwork.certificate;

      const valid =
        certificate
          ?.authenticated ===
          true &&
        certificate
          ?.status ===
          "Authenticated";

      return res.json({
        success:
          true,

        valid,

        certificate: {
          certificateId:
            certificate
              .certificateId,

          sha256:
            certificate
              .sha256,

          status:
            certificate
              .status,

          qrCodePath:
            certificate
              .qrCodePath,

          verificationUrl:
            certificate
              .verificationUrl,

          certifiedAt:
            certificate
              .certifiedAt,

          revokedAt:
            certificate
              .revokedAt,
        },

        artwork: {
          _id:
            artwork._id,

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

          image:
            artwork.image,

          isOriginal:
            artwork.isOriginal,

          sold:
            artwork.sold,

          soldAt:
            artwork.soldAt,

          available:
            artwork.available,

          artistName:
            artwork.artistName,

          artistCode:
            artwork.artistCode,

          artist:
            artwork.artist,
        },
      });

    } catch (
      error
    ) {
      console.error(
        "GET CERTIFICATE ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          valid:
            false,

          message:
            "Unable to verify certificate.",
        });
    }
  }
);

// ============================================================
// PUBLIC - ONE ARTWORK
// GET /api/artworks/:id
// ============================================================

router.get(
  "/:id",

  async (
    req,
    res
  ) => {
    try {
      const artwork =
        await Artwork
          .findById(
            req.params.id
          )
          .populate(
            "artist",
            "firstName lastName artistName artistCode profileImage country bio specialty"
          );

      if (
        !artwork
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artwork not found.",
          });
      }

      if (
        artwork.published ===
        false
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artwork not found.",
          });
      }

      return res.json({
        success:
          true,

        artwork,
      });

    } catch (
      error
    ) {
      console.error(
        "GET ARTWORK ERROR:",
        error
      );

      return res
        .status(404)
        .json({
          success:
            false,

          message:
            "Artwork not found.",
        });
    }
  }
);

// ============================================================
// ARTIST - CREATE ARTWORK
// POST /api/artworks
// ============================================================

router.post(
  "/",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  upload.single(
    "image"
  ),

  rejectExactDuplicateImage,

  rejectVisualDuplicateImage,

  async (
    req,
    res
  ) => {
    try {
      const artist =
        await User.findById(
          req.userId
        );

      if (
        !artist
      ) {
        removeUploadedFile(
          req.file
        );

        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artist account not found.",
          });
      }

      const {
        title,
        description,
        story,
        inspiration,
        category,
        price,
        year,
        dimensions,
        country,
        isOriginal,
      } =
        req.body;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !category ||
        price ===
          undefined
      ) {
        removeUploadedFile(
          req.file
        );

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Title, description, category and price are required.",
          });
      }

      if (
        !req.file
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Artwork image is required.",
          });
      }

      const numericPrice =
        Number(
          price
        );

      if (
        Number.isNaN(
          numericPrice
        ) ||
        numericPrice <
          0
      ) {
        removeUploadedFile(
          req.file
        );

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid artwork price.",
          });
      }

      const numericYear =
        year
          ? Number(
              year
            )
          : null;

      if (
        year &&
        Number.isNaN(
          numericYear
        )
      ) {
        removeUploadedFile(
          req.file
        );

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid artwork year.",
          });
      }

      const artistDisplayName =
        artist.artistName ||
        `${artist.firstName} ${artist.lastName}`;

      const artwork =
        await Artwork.create({
          artist:
            artist._id,

          artistCode:
            artist.artistCode ||
            "",

          artistName:
            artistDisplayName,

          title:
            title.trim(),

          description:
            description.trim(),

          story:
            story?.trim() ||
            "",

          inspiration:
            inspiration?.trim() ||
            "",

          category,

          price:
            numericPrice,

          year:
            numericYear,

          dimensions:
            dimensions?.trim() ||
            "",

          country:
            country?.trim() ||
            artist.country ||
            "",

          image:
            `/uploads/artworks/${req.file.filename}`,

          imageSha256:
            req.imageSha256,

          imageEmbedding:
            req.imageEmbedding,

          aiAuthenticationCheck:
            req.aiAuthenticationCheck,

          isOriginal:
            isOriginal !==
            "false",

          available:
            true,

          sold:
            false,

          soldAt:
            null,

          published:
            true,
        });

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Artwork published successfully.",

          artwork,
        });

    } catch (
      error
    ) {
      removeUploadedFile(
        req.file
      );

      console.error(
        "CREATE ARTWORK ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to publish artwork.",
        });
    }
  }
);

// ============================================================
// ARTIST - UPDATE OWN ARTWORK
// PUT /api/artworks/:id
// ============================================================

router.put(
  "/:id",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  upload.single(
    "image"
  ),

  rejectExactDuplicateImage,

  rejectVisualDuplicateImage,

  async (
    req,
    res
  ) => {
    try {
      const artwork =
        await Artwork.findOne({
          _id:
            req.params.id,

          artist:
            req.userId,
        });

      if (
        !artwork
      ) {
        removeUploadedFile(
          req.file
        );

        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artwork not found or you are not its owner.",
          });
      }

      // ======================================================
      // CERTIFICATE PROTECTION
      // ======================================================

      const certified =
        isArtworkCertified(
          artwork
        );

      const protectedFields = [
        "title",
        "description",
        "story",
        "inspiration",
        "category",
        "year",
        "dimensions",
        "country",
        "isOriginal",
      ];

      const protectedFieldChanged =
        protectedFields.some(
          (
            field
          ) =>
            req.body[
              field
            ] !==
            undefined
        );

      if (
        certified &&
        (
          protectedFieldChanged ||
          req.file
        )
      ) {
        removeUploadedFile(
          req.file
        );

        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "This artwork is certified. Its identity information and image can no longer be modified while the certificate is active.",
          });
      }

      // ======================================================
      // EDITABLE IDENTITY FIELDS
      // ======================================================

      if (
        !certified
      ) {
        const editableFields = [
          "title",
          "description",
          "story",
          "inspiration",
          "category",
          "dimensions",
          "country",
        ];

        editableFields.forEach(
          (
            field
          ) => {
            if (
              req.body[
                field
              ] !==
              undefined
            ) {
              artwork[
                field
              ] =
                String(
                  req.body[
                    field
                  ]
                ).trim();
            }
          }
        );

        if (
          req.body.year !==
          undefined
        ) {
          const numericYear =
            req.body.year
              ? Number(
                  req.body.year
                )
              : null;

          if (
            req.body.year &&
            Number.isNaN(
              numericYear
            )
          ) {
            removeUploadedFile(
              req.file
            );

            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  "Invalid artwork year.",
              });
          }

          artwork.year =
            numericYear;
        }

        if (
          req.body
            .isOriginal !==
          undefined
        ) {
          artwork.isOriginal =
            parseBoolean(
              req.body
                .isOriginal
            );
        }

        if (
          req.file
        ) {
          artwork.image =
            `/uploads/artworks/${req.file.filename}`;

          artwork.imageSha256 =
            req.imageSha256;

          artwork.imageEmbedding =
            req.imageEmbedding;

          artwork.aiAuthenticationCheck =
            req.aiAuthenticationCheck;
        }
      }

      // ======================================================
      // COMMERCIAL FIELDS
      // ======================================================

      if (
        req.body.price !==
        undefined
      ) {
        const numericPrice =
          Number(
            req.body.price
          );

        if (
          Number.isNaN(
            numericPrice
          ) ||
          numericPrice <
            0
        ) {
          removeUploadedFile(
            req.file
          );

          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Invalid price.",
            });
        }

        artwork.price =
          numericPrice;
      }

      if (
        req.body.available !==
        undefined
      ) {
        artwork.available =
          parseBoolean(
            req.body.available
          );
      }

      if (
        req.body.published !==
        undefined
      ) {
        artwork.published =
          parseBoolean(
            req.body.published
          );
      }

      await artwork.save();

      return res.json({
        success:
          true,

        message:
          "Artwork updated successfully.",

        artwork,
      });

    } catch (
      error
    ) {
      removeUploadedFile(
        req.file
      );

      console.error(
        "UPDATE ARTWORK ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update artwork.",
        });
    }
  }
);

// ============================================================
// ARTIST - DELETE OWN ARTWORK
// DELETE /api/artworks/:id
// ============================================================

router.delete(
  "/:id",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    try {
      const artwork =
        await Artwork.findOne({
          _id:
            req.params.id,

          artist:
            req.userId,
        });

      if (
        !artwork
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artwork not found or you are not its owner.",
          });
      }

      if (
        artwork.sold
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "A sold artwork cannot be deleted.",
          });
      }

      if (
        isArtworkCertified(
          artwork
        )
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "A certified artwork cannot be deleted while its certificate is active.",
          });
      }

      const imagePath =
        artwork.image
          ? path.join(
              __dirname,
              "..",
              artwork.image.replace(
                /^\/+/,
                ""
              )
            )
          : null;

      await artwork.deleteOne();

      if (
        imagePath &&
        fs.existsSync(
          imagePath
        )
      ) {
        fs.unlink(
          imagePath,
          () => {}
        );
      }

      return res.json({
        success:
          true,

        message:
          "Artwork removed successfully.",
      });

    } catch (
      error
    ) {
      console.error(
        "DELETE ARTWORK ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to remove artwork.",
        });
    }
  }
);

// ============================================================
// MULTER ERROR HANDLER
// ============================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            error.code ===
            "LIMIT_FILE_SIZE"
              ? "Image is too large. Maximum size is 10 MB."
              : error.message,
        });
    }

    if (
      error?.message ===
      "Only JPG, PNG and WEBP images are allowed."
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            error.message,
        });
    }

    return next(
      error
    );
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;