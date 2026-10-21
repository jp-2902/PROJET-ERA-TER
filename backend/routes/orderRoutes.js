const express =
  require("express");

const router =
  express.Router();

const crypto =
  require("crypto");

const {
  parseEther,
} = require("ethers");

const Order =
  require("../models/Order");

const Artwork =
  require("../models/Artwork");

const User =
  require("../models/User");

const {
  authenticateToken,
  requireRoles,
} = require("../middleware/authMiddleware");

const {
  verifySepoliaTransaction,
} = require("../services/blockchainService");

// ============================================================
// BLOCKCHAIN CONFIGURATION
// ============================================================

const SEPOLIA_CHAIN_ID =
  11155111;

// Petit montant utilisé pour la démonstration universitaire.
// Il doit correspondre au montant envoyé par PaymentPage.jsx.
const BLOCKCHAIN_TEST_AMOUNT_ETH =
  "0.0001";

// ============================================================
// ORDER NUMBER
// ============================================================

const generateOrderNumber =
  () => {
    const random =
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `MG-${Date.now()}-${random}`;
  };

// ============================================================
// BASIC BLOCKCHAIN DATA VALIDATION
// ============================================================

const validateBlockchainPayload =
  (blockchain) => {
    if (!blockchain) {
      return {
        valid: false,

        message:
          "Blockchain transaction data is required.",
      };
    }

    const transactionHash =
      String(
        blockchain.transactionHash ||
          ""
      ).trim();

    if (
      !/^0x[a-fA-F0-9]{64}$/.test(
        transactionHash
      )
    ) {
      return {
        valid: false,

        message:
          "Invalid blockchain transaction hash.",
      };
    }

    return {
      valid: true,

      transactionHash,
    };
  };

// ============================================================
// CREATE ORDER
// POST /api/orders
// ============================================================

router.post(
  "/",

  authenticateToken,

  async (req, res) => {
    try {
      const {
        artworkIds,
        paymentMethod,
        shippingInformation,
        blockchain,
      } = req.body;

      // ======================================================
      // ORDER VALIDATION
      // ======================================================

      if (
        !Array.isArray(
          artworkIds
        ) ||
        artworkIds.length ===
          0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Your order is empty.",
          });
      }

      const allowedPayments = [
        "card",
        "paypal",
        "revolut",
        "blockchain",
      ];

      if (
        !allowedPayments.includes(
          paymentMethod
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid payment method.",
          });
      }

      // ======================================================
      // SHIPPING VALIDATION
      // ======================================================

      const requiredShipping = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "country",
        "city",
        "address",
        "postalCode",
      ];

      const missingShipping =
        requiredShipping.some(
          (field) =>
            !shippingInformation?.[
              field
            ]
        );

      if (
        missingShipping
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Complete shipping information is required.",
          });
      }

      // ======================================================
      // BUYER
      // ======================================================

      const buyer =
        await User.findById(
          req.userId
        );

      if (!buyer) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Buyer account not found.",
          });
      }

      if (
        buyer.isActive ===
        false
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "This account has been disabled.",
          });
      }

      // ======================================================
      // LOAD ARTWORKS
      // Never trust frontend prices.
      // ======================================================

      const artworks =
        await Artwork.find({
          _id: {
            $in: artworkIds,
          },
        });

      if (
        artworks.length !==
        artworkIds.length
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "One or more artworks no longer exist.",
          });
      }

      // ======================================================
      // ARTWORK AVAILABILITY
      // ======================================================

      for (
        const artwork
        of artworks
      ) {
        if (
          !artwork.available ||
          artwork.sold
        ) {
          return res
            .status(409)
            .json({
              success: false,

              message:
                `"${artwork.title}" is no longer available.`,
            });
        }
      }

      // ======================================================
      // ITEMS SNAPSHOT
      // ======================================================

      const items =
        artworks.map(
          (artwork) => ({
            artwork:
              artwork._id,

            artist:
              artwork.artist,

            title:
              artwork.title,

            artistName:
              artwork.artistName,

            image:
              artwork.image,

            price:
              artwork.price,

            quantity: 1,

            isOriginal:
              artwork.isOriginal,
          })
        );

      // ======================================================
      // ORDER TOTAL
      // ======================================================

      const subtotal =
        items.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.price
            ),

          0
        );

      const shippingCost =
        subtotal > 0
          ? 40
          : 0;

      const total =
        subtotal +
        shippingCost;

      // ======================================================
      // REAL BLOCKCHAIN VERIFICATION
      // ======================================================

      let blockchainData;

      if (
        paymentMethod ===
        "blockchain"
      ) {
        // ----------------------------------------------------
        // 1. Check transaction hash format
        // ----------------------------------------------------

        const payloadValidation =
          validateBlockchainPayload(
            blockchain
          );

        if (
          !payloadValidation.valid
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                payloadValidation.message,
            });
        }

        const {
          transactionHash,
        } =
          payloadValidation;

        // ----------------------------------------------------
        // 2. Prevent transaction reuse
        // ----------------------------------------------------

        const existingOrder =
          await Order.findOne({
            "blockchain.transactionHash":
              transactionHash,
          });

        if (
          existingOrder
        ) {
          return res
            .status(409)
            .json({
              success: false,

              message:
                "This blockchain transaction has already been used for another order.",
            });
        }

        // ----------------------------------------------------
        // 3. Receiver configured in backend/.env
        // ----------------------------------------------------

        const expectedRecipient =
          process.env
            .BLOCKCHAIN_RECEIVER_ADDRESS;

        if (
          !expectedRecipient
        ) {
          return res
            .status(500)
            .json({
              success: false,

              message:
                "Blockchain receiver address is not configured.",
            });
        }

        // ----------------------------------------------------
        // 4. Query Ethereum Sepolia through Alchemy
        // ----------------------------------------------------

        const verification =
          await verifySepoliaTransaction(
            {
              transactionHash,

              expectedRecipient,
            }
          );

        if (
          !verification.valid
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                verification.message,
            });
        }

        const verifiedTransaction =
          verification.transaction;

        // ----------------------------------------------------
        // 5. Verify Sepolia chain
        // ----------------------------------------------------

        if (
          Number(
            verifiedTransaction.chainId
          ) !==
          SEPOLIA_CHAIN_ID
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "The blockchain transaction is not on Ethereum Sepolia.",
            });
        }

        // ----------------------------------------------------
        // 6. Verify exact test ETH amount
        // ----------------------------------------------------

        const expectedValueWei =
          parseEther(
            BLOCKCHAIN_TEST_AMOUNT_ETH
          );

        const actualValueWei =
          BigInt(
            verifiedTransaction.valueWei
          );

        if (
          actualValueWei !==
          expectedValueWei
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                `Invalid blockchain amount. Expected ${BLOCKCHAIN_TEST_AMOUNT_ETH} Sepolia ETH.`,
            });
        }

        // ----------------------------------------------------
        // 7. Use ONLY verified blockchain data
        // ----------------------------------------------------

        blockchainData = {
          transactionHash:
            verifiedTransaction
              .transactionHash,

          walletAddress:
            verifiedTransaction
              .sender,

          sender:
            verifiedTransaction
              .sender,

          recipient:
            verifiedTransaction
              .recipient,

          network:
            "sepolia",

          chainId:
            verifiedTransaction
              .chainId,

          blockNumber:
            verifiedTransaction
              .blockNumber,

          amountEth:
            BLOCKCHAIN_TEST_AMOUNT_ETH,

          status:
            verifiedTransaction
              .status,
        };
      }

      // ======================================================
      // CREATE ORDER
      // ======================================================

      const order =
        await Order.create({
          orderNumber:
            generateOrderNumber(),

          buyer:
            buyer._id,

          buyerEmail:
            buyer.email,

          buyerName:
            `${buyer.firstName} ${buyer.lastName}`,

          items,

          subtotal,

          shippingCost,

          total,

          paymentMethod,

          paymentStatus:
            "Paid",

          status:
            "Preparing",

          shippingInformation,

          blockchain:
            paymentMethod ===
            "blockchain"
              ? blockchainData
              : undefined,
        });

      // ======================================================
      // MARK ORIGINAL ARTWORKS SOLD
      // ======================================================

      for (
        const artwork
        of artworks
      ) {
        if (
          artwork.isOriginal
        ) {
          artwork.available =
            false;

          artwork.sold =
            true;

          artwork.soldAt =
            new Date();

          await artwork.save();
        }
      }

      // ======================================================
      // RETURN ORDER
      // ======================================================

      const populatedOrder =
        await Order.findById(
          order._id
        ).populate(
          "buyer",

          "firstName lastName email role"
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            paymentMethod ===
            "blockchain"
              ? "Blockchain transaction verified on Sepolia and order created successfully."
              : "Order created successfully.",

          order:
            populatedOrder,
        });
    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to create order.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// BUYER - MY ORDERS
// GET /api/orders/mine
// ============================================================

router.get(
  "/mine",

  authenticateToken,

  async (req, res) => {
    try {
      const orders =
        await Order.find({
          buyer:
            req.userId,
        }).sort({
          createdAt: -1,
        });

      return res.json({
        success: true,

        orders,
      });
    } catch (error) {
      console.error(
        "MY ORDERS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load your orders.",
        });
    }
  }
);

// ============================================================
// ARTIST - SALES
// GET /api/orders/artist-sales
// ============================================================

router.get(
  "/artist-sales",

  authenticateToken,

  requireRoles(
    "artist"
  ),

  async (req, res) => {
    try {
      const orders =
        await Order.find({
          "items.artist":
            req.userId,

          paymentStatus:
            "Paid",
        })
          .populate(
            "buyer",

            "firstName lastName email country"
          )
          .sort({
            createdAt: -1,
          });

      const sales =
        orders.flatMap(
          (order) =>
            order.items
              .filter(
                (item) =>
                  String(
                    item.artist
                  ) ===
                  String(
                    req.userId
                  )
              )
              .map(
                (item) => ({
                  orderId:
                    order._id,

                  orderNumber:
                    order.orderNumber,

                  status:
                    order.status,

                  paymentStatus:
                    order.paymentStatus,

                  paymentMethod:
                    order.paymentMethod,

                  blockchain:
                    order.paymentMethod ===
                    "blockchain"
                      ? order.blockchain
                      : undefined,

                  createdAt:
                    order.createdAt,

                  buyer:
                    order.buyer,

                  artwork: {
                    id:
                      item.artwork,

                    title:
                      item.title,

                    image:
                      item.image,

                    price:
                      item.price,
                  },
                })
              )
        );

      const revenue =
        sales.reduce(
          (
            total,
            sale
          ) =>
            total +
            Number(
              sale.artwork
                .price ||
                0
            ),

          0
        );

      return res.json({
        success: true,

        count:
          sales.length,

        revenue,

        sales,
      });
    } catch (error) {
      console.error(
        "ARTIST SALES ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load artist sales.",
        });
    }
  }
);

// ============================================================
// BUYER - ONE ORDER
// GET /api/orders/:id
// ============================================================

router.get(
  "/:id",

  authenticateToken,

  async (req, res) => {
    try {
      const order =
        await Order.findOne({
          _id:
            req.params.id,

          buyer:
            req.userId,
        });

      if (!order) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Order not found.",
          });
      }

      return res.json({
        success: true,

        order,
      });
    } catch (error) {
      console.error(
        "GET ORDER ERROR:",
        error.message
      );

      return res
        .status(404)
        .json({
          success: false,

          message:
            "Order not found.",
        });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;