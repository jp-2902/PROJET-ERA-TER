const express =
  require("express");

const router =
  express.Router();

const multer =
  require("multer");

const path =
  require("path");

const fs =
  require("fs");

const crypto =
  require("crypto");

const User =
  require("../models/User");

const Artwork =
  require("../models/Artwork");

const {
  authenticateToken,
  requireRoles,
} =
  require("../middleware/authMiddleware");

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDirectory =
  path.join(
    __dirname,
    "../uploads"
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
        `artist-${Date.now()}-${random}${extension}`
      );
    },
  });

// ============================================================
// MULTER
// ============================================================

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
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

const publicArtist =
  (artist) => ({
    id:
      artist._id,

    _id:
      artist._id,

    firstName:
      artist.firstName || "",

    lastName:
      artist.lastName || "",

    artistName:
      artist.artistName ||
      `${artist.firstName || ""} ${artist.lastName || ""}`.trim(),

    artistCode:
      artist.artistCode || "",

    bio:
      artist.bio || "",

    specialty:
      artist.specialty || "",

    artisticOrigin:
      artist.artisticOrigin || "",

    artisticPerception:
      artist.artisticPerception || "",

    inspiration:
      artist.inspiration || "",

    country:
      artist.country || "",

    city:
      artist.city || "",

    birthPlace:
      artist.birthPlace || "",

    birthCountry:
      artist.birthCountry || "",

    startYear:
      artist.startYear || null,

    website:
      artist.website || "",

    instagram:
      artist.instagram || "",

    profileImage:
      artist.profileImage || "",

    artistApproved:
      artist.artistApproved !==
      false,

    createdAt:
      artist.createdAt,
  });

// ============================================================
// PUBLIC - ALL ARTISTS
// GET /api/artists
// ============================================================

router.get(
  "/",

  async (
    req,
    res
  ) => {
    try {
      const artists =
        await User.find({
          role:
            "artist",

          isActive: {
            $ne: false,
          },

          artistApproved: {
            $ne: false,
          },
        })
          .select(
            [
              "firstName",
              "lastName",
              "artistName",
              "artistCode",
              "bio",
              "specialty",
              "artisticOrigin",
              "artisticPerception",
              "inspiration",
              "country",
              "city",
              "birthPlace",
              "birthCountry",
              "startYear",
              "website",
              "instagram",
              "profileImage",
              "artistApproved",
              "createdAt",
            ].join(" ")
          )
          .sort({
            createdAt:
              -1,
          });

      const artistIds =
        artists.map(
          (artist) =>
            artist._id
        );

      let artworkCountMap =
        new Map();

      if (
        artistIds.length >
        0
      ) {
        const counts =
          await Artwork.aggregate([
            {
              $match: {
                artist: {
                  $in:
                    artistIds,
                },

                published:
                  true,
              },
            },

            {
              $group: {
                _id:
                  "$artist",

                count: {
                  $sum: 1,
                },
              },
            },
          ]);

        artworkCountMap =
          new Map(
            counts.map(
              (item) => [
                String(
                  item._id
                ),

                item.count,
              ]
            )
          );
      }

      const result =
        artists.map(
          (artist) => ({
            ...publicArtist(
              artist
            ),

            artworkCount:
              artworkCountMap.get(
                String(
                  artist._id
                )
              ) || 0,
          })
        );

      return res.json({
        success: true,

        artists:
          result,
      });
    } catch (error) {
      console.error(
        "GET ARTISTS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load artists.",
        });
    }
  }
);

// ============================================================
// IMPORTANT
// /me MUST REMAIN BEFORE /:id
// ============================================================

// ============================================================
// ARTIST - PRIVATE PROFILE
// GET /api/artists/me
// ============================================================

router.get(
  "/me",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    try {
      const artist =
        await User.findById(
          req.userId
        ).select(
          "-password -resetToken -resetTokenExpiration"
        );

      if (!artist) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artist not found.",
          });
      }

      return res.json({
        success: true,

        artist,
      });
    } catch (error) {
      console.error(
        "GET PRIVATE ARTIST ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load artist profile.",
        });
    }
  }
);

// ============================================================
// ARTIST - UPDATE PUBLIC PROFILE
// PUT /api/artists/me
// ============================================================

router.put(
  "/me",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  upload.single(
    "profilePhoto"
  ),

  async (
    req,
    res
  ) => {
    try {
      const artist =
        await User.findById(
          req.userId
        );

      if (!artist) {
        if (
          req.file?.path
        ) {
          fs.unlink(
            req.file.path,
            () => {}
          );
        }

        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artist not found.",
          });
      }

      const editableFields = [
        "artistName",
        "bio",
        "specialty",
        "artisticOrigin",
        "artisticPerception",
        "inspiration",
        "birthPlace",
        "birthCountry",
        "website",
        "instagram",
      ];

      editableFields.forEach(
        (field) => {
          if (
            req.body[
              field
            ] !==
            undefined
          ) {
            artist[
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

      // ======================================================
      // START YEAR
      // ======================================================

      if (
        req.body
          .startYear !==
        undefined
      ) {
        if (
          req.body
            .startYear ===
            ""
        ) {
          artist.startYear =
            null;
        } else {
          const numericStartYear =
            Number(
              req.body
                .startYear
            );

          if (
            Number.isNaN(
              numericStartYear
            )
          ) {
            if (
              req.file?.path
            ) {
              fs.unlink(
                req.file.path,
                () => {}
              );
            }

            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  "Invalid start year.",
              });
          }

          artist.startYear =
            numericStartYear;
        }
      }

      // ======================================================
      // PROFILE IMAGE
      // ======================================================

      if (req.file) {
        const previousImage =
          artist.profileImage;

        artist.profileImage =
          `/uploads/${req.file.filename}`;

        if (
          previousImage &&
          previousImage.startsWith(
            "/uploads/"
          )
        ) {
          const previousImagePath =
            path.join(
              __dirname,
              "..",
              previousImage.replace(
                /^\/+/,
                ""
              )
            );

          if (
            fs.existsSync(
              previousImagePath
            )
          ) {
            fs.unlink(
              previousImagePath,
              () => {}
            );
          }
        }
      }

      await artist.save();

      const safeArtist =
        await User.findById(
          artist._id
        ).select(
          "-password -resetToken -resetTokenExpiration"
        );

      return res.json({
        success: true,

        message:
          "Public artist profile updated successfully.",

        artist:
          safeArtist,
      });
    } catch (error) {
      if (
        req.file?.path
      ) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      console.error(
        "UPDATE ARTIST PROFILE ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update artist profile.",
        });
    }
  }
);

// ============================================================
// PUBLIC - ONE ARTIST
// GET /api/artists/:id
// ============================================================

router.get(
  "/:id",

  async (
    req,
    res
  ) => {
    try {
      const artist =
        await User.findOne({
          _id:
            req.params.id,

          role:
            "artist",

          isActive: {
            $ne: false,
          },

          artistApproved: {
            $ne: false,
          },
        }).select(
          [
            "firstName",
            "lastName",
            "artistName",
            "artistCode",
            "bio",
            "specialty",
            "artisticOrigin",
            "artisticPerception",
            "inspiration",
            "country",
            "city",
            "birthPlace",
            "birthCountry",
            "startYear",
            "website",
            "instagram",
            "profileImage",
            "artistApproved",
            "createdAt",
          ].join(" ")
        );

      if (!artist) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artist not found.",
          });
      }

      const artworks =
        await Artwork
          .find({
            artist:
              artist._id,

            published:
              true,
          })
          .sort({
            createdAt:
              -1,
          });

      const artworkCount =
        artworks.length;

      return res.json({
        success: true,

        artist: {
          ...publicArtist(
            artist
          ),

          artworkCount,
        },

        artworks,
      });
    } catch (error) {
      console.error(
        "GET PUBLIC ARTIST ERROR:",
        error
      );

      return res
        .status(404)
        .json({
          success:
            false,

          message:
            "Artist not found.",
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
              ? "Profile image is too large. Maximum size is 5 MB."
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