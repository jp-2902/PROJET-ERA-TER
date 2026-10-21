const express =
  require("express");

const router =
  express.Router();

const Collection =
  require("../models/Collection");

const Artwork =
  require("../models/Artwork");

const User =
  require("../models/User");

const {
  authenticateToken,
  requireRoles,
} =
  require("../middleware/authMiddleware");

// ============================================================
// HELPERS
// ============================================================

const normalizeText =
  (
    value
  ) =>
    String(
      value || ""
    ).trim();

// ============================================================
// PUBLIC - ALL PUBLISHED COLLECTIONS
// GET /api/collections
// ============================================================

router.get(
  "/",

  async (
    req,
    res
  ) => {
    try {
      const collections =
        await Collection
          .find({
            published:
              true,
          })
          .populate(
            "artist",
            "firstName lastName artistName artistCode profileImage country"
          )
          .populate({
            path:
              "artworks",

            match: {
              published:
                true,
            },

            select:
              "title image price category available sold isOriginal certificate",
          })
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        collections,
      });

    } catch (
      error
    ) {
      console.error(
        "GET COLLECTIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load collections.",
        });
    }
  }
);

// ============================================================
// PUBLIC - ONE COLLECTION
// GET /api/collections/:id
// ============================================================

router.get(
  "/:id",

  async (
    req,
    res
  ) => {
    try {
      const collection =
        await Collection
          .findOne({
            _id:
              req.params.id,

            published:
              true,
          })
          .populate(
            "artist",
            "firstName lastName artistName artistCode profileImage country bio specialty"
          )
          .populate({
            path:
              "artworks",

            match: {
              published:
                true,
            },

            populate: {
              path:
                "artist",

              select:
                "firstName lastName artistName artistCode profileImage country",
            },
          });

      if (
        !collection
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Collection not found.",
          });
      }

      return res.json({
        success:
          true,

        collection,
      });

    } catch (
      error
    ) {
      console.error(
        "GET COLLECTION ERROR:",
        error
      );

      return res
        .status(404)
        .json({
          success:
            false,

          message:
            "Collection not found.",
        });
    }
  }
);

// ============================================================
// PUBLIC - COLLECTIONS BY ARTIST
// GET /api/collections/artist/:artistId
// ============================================================

router.get(
  "/artist/:artistId",

  async (
    req,
    res
  ) => {
    try {
      const collections =
        await Collection
          .find({
            artist:
              req.params
                .artistId,

            published:
              true,
          })
          .populate({
            path:
              "artworks",

            match: {
              published:
                true,
            },

            select:
              "title image price category available sold isOriginal certificate",
          })
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        collections,
      });

    } catch (
      error
    ) {
      console.error(
        "GET ARTIST COLLECTIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load artist collections.",
        });
    }
  }
);

// ============================================================
// ARTIST - MY COLLECTIONS
// GET /api/collections/mine/all
// ============================================================

router.get(
  "/mine/all",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    try {
      const collections =
        await Collection
          .find({
            artist:
              req.userId,
          })
          .populate(
            "artworks"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        collections,
      });

    } catch (
      error
    ) {
      console.error(
        "GET MY COLLECTIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load your collections.",
        });
    }
  }
);

// ============================================================
// ARTIST - CREATE COLLECTION
// POST /api/collections
// ============================================================

router.post(
  "/",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    try {
      const {
        name,
        description,
        published,
      } =
        req.body;

      const cleanName =
        normalizeText(
          name
        );

      const cleanDescription =
        normalizeText(
          description
        );

      if (
        !cleanName
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Collection name is required.",
          });
      }

      const artist =
        await User.findById(
          req.userId
        );

      if (
        !artist
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artist account not found.",
          });
      }

      const existingCollection =
        await Collection.findOne({
          artist:
            req.userId,

          name: {
            $regex:
              new RegExp(
                `^${cleanName.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}$`,
                "i"
              ),
          },
        });

      if (
        existingCollection
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "You already have a collection with this name.",
          });
      }

      const artistName =
        artist.artistName ||
        `${artist.firstName || ""} ${artist.lastName || ""}`.trim();

      const collection =
        await Collection.create({
          artist:
            artist._id,

          artistName,

          artistCode:
            artist.artistCode ||
            "",

          name:
            cleanName,

          description:
            cleanDescription,

          published:
            published !==
            false &&
            published !==
            "false",

          artworks:
            [],
        });

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Collection created successfully.",

          collection,
        });

    } catch (
      error
    ) {
      console.error(
        "CREATE COLLECTION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to create collection.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// ARTIST - UPDATE COLLECTION
// PUT /api/collections/:id
// ============================================================

router.put(
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
      const collection =
        await Collection.findOne({
          _id:
            req.params.id,

          artist:
            req.userId,
        });

      if (
        !collection
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Collection not found or you are not its owner.",
          });
      }

      if (
        req.body.name !==
        undefined
      ) {
        const cleanName =
          normalizeText(
            req.body.name
          );

        if (
          !cleanName
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Collection name cannot be empty.",
            });
        }

        collection.name =
          cleanName;
      }

      if (
        req.body.description !==
        undefined
      ) {
        collection.description =
          normalizeText(
            req.body
              .description
          );
      }

      if (
        req.body.published !==
        undefined
      ) {
        collection.published =
          req.body
            .published ===
            true ||
          req.body
            .published ===
            "true";
      }

      await collection.save();

      return res.json({
        success:
          true,

        message:
          "Collection updated successfully.",

        collection,
      });

    } catch (
      error
    ) {
      console.error(
        "UPDATE COLLECTION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update collection.",
        });
    }
  }
);

// ============================================================
// ARTIST - ADD ARTWORK TO COLLECTION
// POST /api/collections/:id/artworks/:artworkId
// ============================================================

router.post(
  "/:id/artworks/:artworkId",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    try {
      const collection =
        await Collection.findOne({
          _id:
            req.params.id,

          artist:
            req.userId,
        });

      if (
        !collection
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Collection not found or you are not its owner.",
          });
      }

      const artwork =
        await Artwork.findOne({
          _id:
            req.params
              .artworkId,

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

      const alreadyIncluded =
        collection.artworks.some(
          (
            artworkId
          ) =>
            String(
              artworkId
            ) ===
            String(
              artwork._id
            )
        );

      if (
        alreadyIncluded
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "This artwork is already in this collection.",
          });
      }

      collection.artworks.push(
        artwork._id
      );

      if (
        !collection
          .coverImage
      ) {
        collection.coverImage =
          artwork.image;
      }

      await collection.save();

      return res.json({
        success:
          true,

        message:
          "Artwork added to collection.",

        collection,
      });

    } catch (
      error
    ) {
      console.error(
        "ADD ARTWORK TO COLLECTION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to add artwork to collection.",
        });
    }
  }
);

// ============================================================
// ARTIST - REMOVE ARTWORK FROM COLLECTION
// DELETE /api/collections/:id/artworks/:artworkId
// ============================================================

router.delete(
  "/:id/artworks/:artworkId",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (
    req,
    res
  ) => {
    try {
      const collection =
        await Collection.findOne({
          _id:
            req.params.id,

          artist:
            req.userId,
        });

      if (
        !collection
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Collection not found or you are not its owner.",
          });
      }

      collection.artworks =
        collection.artworks.filter(
          (
            artworkId
          ) =>
            String(
              artworkId
            ) !==
            String(
              req.params
                .artworkId
            )
        );

      if (
        collection
          .artworks
          .length ===
        0
      ) {
        collection.coverImage =
          "";
      } else {
        const firstArtwork =
          await Artwork.findById(
            collection
              .artworks[0]
          );

        collection.coverImage =
          firstArtwork
            ?.image ||
          "";
      }

      await collection.save();

      return res.json({
        success:
          true,

        message:
          "Artwork removed from collection.",

        collection,
      });

    } catch (
      error
    ) {
      console.error(
        "REMOVE ARTWORK FROM COLLECTION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to remove artwork from collection.",
        });
    }
  }
);

// ============================================================
// ARTIST - DELETE COLLECTION
// DELETE /api/collections/:id
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
      const collection =
        await Collection.findOne({
          _id:
            req.params.id,

          artist:
            req.userId,
        });

      if (
        !collection
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Collection not found or you are not its owner.",
          });
      }

      await collection.deleteOne();

      return res.json({
        success:
          true,

        message:
          "Collection deleted successfully.",
      });

    } catch (
      error
    ) {
      console.error(
        "DELETE COLLECTION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to delete collection.",
        });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;