const express =
  require("express");

const mongoose =
  require("mongoose");

const router =
  express.Router();

const User =
  require("../models/User");

const Artwork =
  require("../models/Artwork");

const Order =
  require("../models/Order");

const LoginEvent =
  require("../models/LoginEvent");

const {
  authenticateToken,
  requireRoles,
} =
  require("../middleware/authMiddleware");

// ============================================================
// ALL ADMIN ROUTES ARE PROTECTED
// ============================================================

router.use(
  authenticateToken,
  requireRoles("admin")
);

// ============================================================
// HELPERS
// ============================================================

const isValidId = (
  id
) =>
  mongoose.Types.ObjectId.isValid(
    id
  );

// ============================================================
// ORDER / PAYMENT RELEASE STATUSES
// ============================================================

const RELEASE_STATUSES = [
  "rejected",
  "cancelled",
  "canceled",
  "failed",
  "refunded",
];

// ============================================================
// SHOULD RELEASE ARTWORKS
// ============================================================

const shouldReleaseArtworks = (
  value
) => {
  const normalized =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  return RELEASE_STATUSES.includes(
    normalized
  );
};

// ============================================================
// RELEASE ORIGINAL ARTWORKS FROM ORDER
// ============================================================

const releaseOriginalArtworksFromOrder =
  async (
    order
  ) => {
    if (
      !order ||
      !Array.isArray(
        order.items
      ) ||
      order.items.length ===
        0
    ) {
      return;
    }

    const artworkIds =
      [
        ...new Set(
          order.items
            .map(
              (
                item
              ) =>
                item.artwork
            )
            .filter(
              Boolean
            )
            .map(
              (
                id
              ) =>
                String(
                  id
                )
            )
        ),
      ];

    if (
      artworkIds.length ===
      0
    ) {
      return;
    }

    await Artwork.updateMany(
      {
        _id: {
          $in:
            artworkIds,
        },

        isOriginal:
          true,
      },

      {
        $set: {
          available:
            true,

          sold:
            false,

          soldAt:
            null,
        },
      }
    );
  };

// ============================================================
// ADMIN DASHBOARD
// GET /api/admin/dashboard
// ============================================================

router.get(
  "/dashboard",
  async (
    req,
    res
  ) => {
    try {
      const [
        totalUsers,
        totalCollectors,
        totalArtists,
        activeArtists,
        totalArtworks,
        availableArtworks,
        soldArtworks,
        totalOrders,
        paidOrders,
        certifiedArtworks,
        revenueResult,
        recentUsers,
        recentArtworks,
        recentOrders,
      ] =
        await Promise.all([
          User.countDocuments({
            role: {
              $in: [
                "user",
                "artist",
              ],
            },
          }),

          User.countDocuments({
            role:
              "user",
          }),

          User.countDocuments({
            role:
              "artist",
          }),

          User.countDocuments({
            role:
              "artist",

            isActive: {
              $ne: false,
            },

            artistApproved: {
              $ne: false,
            },
          }),

          Artwork.countDocuments(),

          Artwork.countDocuments({
            available:
              true,

            sold: {
              $ne: true,
            },
          }),

          Artwork.countDocuments({
            sold:
              true,
          }),

          Order.countDocuments(),

          Order.countDocuments({
            paymentStatus:
              "Paid",
          }),

          Artwork.countDocuments({
            "certificate.authenticated":
              true,

            "certificate.status":
              "Authenticated",
          }),

          Order.aggregate([
            {
              $match: {
                paymentStatus:
                  "Paid",
              },
            },

            {
              $group: {
                _id:
                  null,

                totalRevenue: {
                  $sum:
                    "$total",
                },
              },
            },
          ]),

          User.find({
            role: {
              $in: [
                "user",
                "artist",
              ],
            },
          })
            .select(
              "firstName lastName email role isActive artistName createdAt"
            )
            .sort({
              createdAt:
                -1,
            })
            .limit(5),

          Artwork.find()
            .select(
              "title artistName image category price available sold createdAt"
            )
            .sort({
              createdAt:
                -1,
            })
            .limit(5),

          Order.find()
            .populate(
              "buyer",
              "firstName lastName email role"
            )
            .sort({
              createdAt:
                -1,
            })
            .limit(5),
        ]);

      const totalRevenue =
        Number(
          revenueResult?.[0]
            ?.totalRevenue ||
            0
        );

      return res.json({
        success:
          true,

        stats: {
          totalUsers,

          totalCollectors,

          totalArtists,

          activeArtists,

          totalArtworks,

          availableArtworks,

          soldArtworks,

          totalOrders,

          paidOrders,

          totalRevenue,

          certifiedArtworks,
        },

        recent: {
          users:
            recentUsers,

          artworks:
            recentArtworks,

          orders:
            recentOrders,
        },
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN DASHBOARD ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load administration dashboard.",
        });
    }
  }
);

// ============================================================
// ADMIN ANALYTICS BY DATE RANGE
// GET /api/admin/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// ============================================================

router.get(
  "/analytics",
  async (
    req,
    res
  ) => {
    try {
      const {
        startDate,
        endDate,
      } =
        req.query;

      if (
        !startDate ||
        !endDate
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "startDate and endDate are required.",
          });
      }

      const start =
        new Date(
          `${startDate}T00:00:00.000Z`
        );

      const end =
        new Date(
          `${endDate}T23:59:59.999Z`
        );

      if (
        Number.isNaN(
          start.getTime()
        ) ||
        Number.isNaN(
          end.getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid date range.",
          });
      }

      if (
        start >
        end
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Start date cannot be after end date.",
          });
      }

      const dateFilter = {
        createdAt: {
          $gte:
            start,

          $lte:
            end,
        },
      };

      const [
        newAccounts,
        newCollectors,
        newArtists,
        connections,
        artworksAdded,
        ordersCreated,
        paidOrders,
        revenueResult,
      ] =
        await Promise.all([
          User.countDocuments({
            ...dateFilter,

            role: {
              $in: [
                "user",
                "artist",
              ],
            },
          }),

          User.countDocuments({
            ...dateFilter,

            role:
              "user",
          }),

          User.countDocuments({
            ...dateFilter,

            role:
              "artist",
          }),

          LoginEvent.countDocuments({
            ...dateFilter,

            success:
              true,
          }),

          Artwork.countDocuments({
            ...dateFilter,
          }),

          Order.countDocuments({
            ...dateFilter,
          }),

          Order.countDocuments({
            ...dateFilter,

            paymentStatus:
              "Paid",
          }),

          Order.aggregate([
            {
              $match: {
                ...dateFilter,

                paymentStatus:
                  "Paid",
              },
            },

            {
              $group: {
                _id:
                  null,

                totalRevenue: {
                  $sum:
                    "$total",
                },
              },
            },
          ]),
        ]);

      const totalRevenue =
        Number(
          revenueResult?.[0]
            ?.totalRevenue ||
            0
        );

      return res.json({
        success:
          true,

        period: {
          startDate,

          endDate,
        },

        analytics: {
          newAccounts,

          newCollectors,

          newArtists,

          connections,

          artworksAdded,

          ordersCreated,

          paidOrders,

          totalRevenue,
        },
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN ANALYTICS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load analytics.",
        });
    }
  }
);

// ============================================================
// ADMIN ANALYTICS RANKINGS BY DATE RANGE
// GET /api/admin/analytics/rankings
// ============================================================

router.get(
  "/analytics/rankings",
  async (
    req,
    res
  ) => {
    try {
      const {
        startDate,
        endDate,
      } =
        req.query;

      if (
        !startDate ||
        !endDate
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "startDate and endDate are required.",
          });
      }

      const start =
        new Date(
          `${startDate}T00:00:00.000Z`
        );

      const end =
        new Date(
          `${endDate}T23:59:59.999Z`
        );

      if (
        Number.isNaN(
          start.getTime()
        ) ||
        Number.isNaN(
          end.getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid date range.",
          });
      }

      if (
        start >
        end
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Start date cannot be after end date.",
          });
      }

      // ======================================================
      // ARTWORKS ADDED BY CATEGORY
      // ======================================================

      const artworksByCategory =
        await Artwork.aggregate([
          {
            $match: {
              createdAt: {
                $gte: start,
                $lte: end,
              },
            },
          },

          {
            $group: {
              _id: "$category",

              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              count: -1,
            },
          },
        ]);

      // ======================================================
      // SALES BY CATEGORY
      // ======================================================

      const salesByCategory =
        await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: start,
                $lte: end,
              },

              paymentStatus:
                "Paid",
            },
          },

          {
            $unwind:
              "$items",
          },

          {
            $lookup: {
              from:
                "artworks",

              localField:
                "items.artwork",

              foreignField:
                "_id",

              as:
                "artworkData",
            },
          },

          {
            $unwind: {
              path:
                "$artworkData",

              preserveNullAndEmptyArrays:
                true,
            },
          },

          {
            $group: {
              _id: {
                $ifNull: [
                  "$artworkData.category",
                  "Unknown",
                ],
              },

              sales: {
                $sum:
                  "$items.quantity",
              },

              revenue: {
                $sum: {
                  $multiply: [
                    "$items.price",
                    "$items.quantity",
                  ],
                },
              },
            },
          },

          {
            $sort: {
              sales: -1,
            },
          },
        ]);

      // ======================================================
      // TOP ARTISTS
      // ======================================================

      const topArtists =
        await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: start,
                $lte: end,
              },

              paymentStatus:
                "Paid",
            },
          },

          {
            $unwind:
              "$items",
          },

          {
            $group: {
              _id:
                "$items.artist",

              artistName: {
                $first:
                  "$items.artistName",
              },

              sales: {
                $sum:
                  "$items.quantity",
              },

              revenue: {
                $sum: {
                  $multiply: [
                    "$items.price",
                    "$items.quantity",
                  ],
                },
              },
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },

          {
            $limit: 10,
          },
        ]);

      return res.json({
        success:
          true,

        period: {
          startDate,
          endDate,
        },

        rankings: {
          artworksByCategory:
            artworksByCategory.map(
              (item) => ({
                category:
                  item._id ||
                  "Unknown",

                count:
                  item.count,
              })
            ),

          salesByCategory:
            salesByCategory.map(
              (item) => ({
                category:
                  item._id,

                sales:
                  item.sales,

                revenue:
                  item.revenue,
              })
            ),

          topArtists:
            topArtists.map(
              (item) => ({
                artistId:
                  item._id,

                artistName:
                  item.artistName ||
                  "Unknown artist",

                sales:
                  item.sales,

                revenue:
                  item.revenue,
              })
            ),
        },
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN RANKINGS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load admin rankings.",
        });
    }
  }
);

// ============================================================
// ADMIN - ALL USERS
// GET /api/admin/users
// ============================================================

router.get(
  "/users",
  async (
    req,
    res
  ) => {
    try {
      const {
        search = "",
        role = "",
        status = "",
      } =
        req.query;

      const filter = {};

      if (
        role
      ) {
        filter.role =
          role;
      }

      if (
        status ===
        "active"
      ) {
        filter.isActive = {
          $ne: false,
        };
      }

      if (
        status ===
        "inactive"
      ) {
        filter.isActive =
          false;
      }

      if (
        search.trim()
      ) {
        const pattern =
          new RegExp(
            search.trim(),
            "i"
          );

        filter.$or = [
          {
            firstName:
              pattern,
          },

          {
            lastName:
              pattern,
          },

          {
            email:
              pattern,
          },

          {
            artistName:
              pattern,
          },

          {
            artistCode:
              pattern,
          },
        ];
      }

      const users =
        await User.find(
          filter
        )
          .select(
            "-password -resetToken -resetTokenExpiration"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        count:
          users.length,

        users,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN USERS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load users.",
        });
    }
  }
);

// ============================================================
// ADMIN - ACTIVATE / DEACTIVATE USER
// PATCH /api/admin/users/:id/status
// ============================================================

router.patch(
  "/users/:id/status",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const {
        isActive,
      } =
        req.body;

      if (
        !isValidId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid user ID.",
          });
      }

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "isActive must be a boolean.",
          });
      }

      if (
        String(
          req.userId
        ) ===
          String(
            id
          ) &&
        isActive ===
          false
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "You cannot deactivate your own administrator account.",
          });
      }

      const user =
        await User.findById(
          id
        );

      if (
        !user
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "User not found.",
          });
      }

      user.isActive =
        isActive;

      await user.save();

      return res.json({
        success:
          true,

        message:
          isActive
            ? "User activated successfully."
            : "User deactivated successfully.",

        user: {
          _id:
            user._id,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          email:
            user.email,

          role:
            user.role,

          isActive:
            user.isActive,
        },
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN USER STATUS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update user status.",
        });
    }
  }
);

// ============================================================
// ADMIN - ALL ARTISTS
// GET /api/admin/artists
// ============================================================

router.get(
  "/artists",
  async (
    req,
    res
  ) => {
    try {
      const artists =
        await User.find({
          role:
            "artist",
        })
          .select(
            "-password -resetToken -resetTokenExpiration"
          )
          .sort({
            createdAt:
              -1,
          });

      const artistIds =
        artists.map(
          (
            artist
          ) =>
            artist._id
        );

      const counts =
        artistIds.length
          ? await Artwork.aggregate([
              {
                $match: {
                  artist: {
                    $in:
                      artistIds,
                  },
                },
              },

              {
                $group: {
                  _id:
                    "$artist",

                  count: {
                    $sum:
                      1,
                  },
                },
              },
            ])
          : [];

      const countMap =
        new Map(
          counts.map(
            (
              item
            ) => [
              String(
                item._id
              ),

              item.count,
            ]
          )
        );

      const result =
        artists.map(
          (
            artist
          ) => ({
            ...artist.toObject(),

            artworkCount:
              countMap.get(
                String(
                  artist._id
                )
              ) ||
              0,
          })
        );

      return res.json({
        success:
          true,

        count:
          result.length,

        artists:
          result,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN ARTISTS ERROR:",
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
// ADMIN - APPROVE / REJECT ARTIST
// PATCH /api/admin/artists/:id/approval
// ============================================================

router.patch(
  "/artists/:id/approval",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const {
        approved,
      } =
        req.body;

      if (
        !isValidId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid artist ID.",
          });
      }

      if (
        typeof approved !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "approved must be a boolean.",
          });
      }

      const artist =
        await User.findOne({
          _id:
            id,

          role:
            "artist",
        });

      if (
        !artist
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Artist not found.",
          });
      }

      artist.artistApproved =
        approved;

      await artist.save();

      return res.json({
        success:
          true,

        message:
          approved
            ? "Artist approved successfully."
            : "Artist approval removed.",

        artist: {
          _id:
            artist._id,

          artistName:
            artist.artistName,

          artistCode:
            artist.artistCode,

          artistApproved:
            artist.artistApproved,

          isActive:
            artist.isActive,
        },
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN ARTIST APPROVAL ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update artist approval.",
        });
    }
  }
);

// ============================================================
// ADMIN - ALL ARTWORKS
// GET /api/admin/artworks
// ============================================================

router.get(
  "/artworks",
  async (
    req,
    res
  ) => {
    try {
      const {
        search = "",
        category = "",
        status = "",
      } =
        req.query;

      const filter = {};

      if (
        category
      ) {
        filter.category =
          category;
      }

      if (
        status ===
        "available"
      ) {
        filter.available =
          true;

        filter.sold = {
          $ne:
            true,
        };
      }

      if (
        status ===
        "sold"
      ) {
        filter.sold =
          true;
      }

      if (
        status ===
        "certified"
      ) {
        filter[
          "certificate.authenticated"
        ] =
          true;

        filter[
          "certificate.status"
        ] =
          "Authenticated";
      }

      if (
        search.trim()
      ) {
        const pattern =
          new RegExp(
            search.trim(),
            "i"
          );

        filter.$or = [
          {
            title:
              pattern,
          },

          {
            artistName:
              pattern,
          },

          {
            category:
              pattern,
          },

          {
            "certificate.certificateId":
              pattern,
          },
        ];
      }

      const artworks =
        await Artwork.find(
          filter
        )
          .populate(
            "artist",
            "firstName lastName artistName artistCode email"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        count:
          artworks.length,

        artworks,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN ARTWORKS ERROR:",
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
// ADMIN - PUBLISH / HIDE ARTWORK
// PATCH /api/admin/artworks/:id/publication
// ============================================================

router.patch(
  "/artworks/:id/publication",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const {
        published,
      } =
        req.body;

      if (
        !isValidId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid artwork ID.",
          });
      }

      if (
        typeof published !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "published must be a boolean.",
          });
      }

      const artwork =
        await Artwork.findById(
          id
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

      artwork.published =
        published;

      await artwork.save();

      return res.json({
        success:
          true,

        message:
          published
            ? "Artwork published successfully."
            : "Artwork hidden successfully.",

        artwork,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN ARTWORK PUBLICATION ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update artwork publication.",
        });
    }
  }
);

// ============================================================
// ADMIN - REVOKE CERTIFICATE
// PATCH /api/admin/artworks/:id/certificate/revoke
// ============================================================

router.patch(
  "/artworks/:id/certificate/revoke",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      if (
        !isValidId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid artwork ID.",
          });
      }

      const artwork =
        await Artwork.findById(
          id
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
        !artwork
          .certificate
          ?.certificateId
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "This artwork does not have a digital certificate.",
          });
      }

      if (
        artwork
          .certificate
          .status ===
        "Revoked"
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "This certificate has already been revoked.",
          });
      }

      artwork.certificate.enabled =
        false;

      artwork.certificate.authenticated =
        false;

      artwork.certificate.status =
        "Revoked";

      artwork.certificate.revokedAt =
        new Date();

      await artwork.save();

      return res.json({
        success:
          true,

        message:
          "Digital certificate revoked successfully.",

        certificate:
          artwork.certificate,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN CERTIFICATE REVOKE ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to revoke certificate.",
        });
    }
  }
);

// ============================================================
// ADMIN - ALL ORDERS
// GET /api/admin/orders
// ============================================================

router.get(
  "/orders",
  async (
    req,
    res
  ) => {
    try {
      const {
        search = "",
        status = "",
        paymentStatus = "",
      } =
        req.query;

      const filter = {};

      if (
        status
      ) {
        filter.status =
          status;
      }

      if (
        paymentStatus
      ) {
        filter.paymentStatus =
          paymentStatus;
      }

      if (
        search.trim()
      ) {
        const pattern =
          new RegExp(
            search.trim(),
            "i"
          );

        filter.$or = [
          {
            orderNumber:
              pattern,
          },

          {
            buyerEmail:
              pattern,
          },

          {
            buyerName:
              pattern,
          },
        ];
      }

      const orders =
        await Order.find(
          filter
        )
          .populate(
            "buyer",
            "firstName lastName email role"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        count:
          orders.length,

        orders,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN ORDERS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load orders.",
        });
    }
  }
);

// ============================================================
// ADMIN - UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id/status
// ============================================================

router.patch(
  "/orders/:id/status",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const {
        status,
      } =
        req.body;

      if (
        !isValidId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid order ID.",
          });
      }

      if (
        !status
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Order status is required.",
          });
      }

      const order =
        await Order.findById(
          id
        );

      if (
        !order
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Order not found.",
          });
      }

      order.status =
        status;

      // ======================================================
      // IMPORTANT:
      // IF ADMIN CANCELS / REJECTS ORDER,
      // RELEASE ORIGINAL ARTWORKS
      // ======================================================

      if (
        shouldReleaseArtworks(
          status
        )
      ) {
        await releaseOriginalArtworksFromOrder(
          order
        );
      }

      await order.save();

      return res.json({
        success:
          true,

        message:
          shouldReleaseArtworks(
            status
          )
            ? "Order status updated and artworks made available again."
            : "Order status updated successfully.",

        order,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN ORDER STATUS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update order status.",
        });
    }
  }
);

// ============================================================
// ADMIN - UPDATE PAYMENT STATUS
// PATCH /api/admin/orders/:id/payment-status
// ============================================================

router.patch(
  "/orders/:id/payment-status",
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const {
        paymentStatus,
      } =
        req.body;

      if (
        !isValidId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid order ID.",
          });
      }

      if (
        !paymentStatus
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Payment status is required.",
          });
      }

      const order =
        await Order.findById(
          id
        );

      if (
        !order
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Order not found.",
          });
      }

      order.paymentStatus =
        paymentStatus;

      // ======================================================
      // IMPORTANT:
      // REJECTED / CANCELLED / FAILED / REFUNDED PAYMENT
      // MAKES ORIGINAL ARTWORKS AVAILABLE AGAIN
      // ======================================================

      if (
        shouldReleaseArtworks(
          paymentStatus
        )
      ) {
        await releaseOriginalArtworksFromOrder(
          order
        );
      }

      await order.save();

      return res.json({
        success:
          true,

        message:
          shouldReleaseArtworks(
            paymentStatus
          )
            ? "Payment status updated and artworks made available again."
            : "Payment status updated successfully.",

        order,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN PAYMENT STATUS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update payment status.",
        });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;