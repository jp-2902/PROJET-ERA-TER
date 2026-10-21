const mongoose =
  require("mongoose");

// ============================================================
// ORDER ITEM
// ============================================================

const orderItemSchema =
  new mongoose.Schema(
    {
      artwork: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Artwork",

        required: true,
      },

      artist: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      title: {
        type: String,

        required: true,
      },

      artistName: {
        type: String,

        required: true,
      },

      image: {
        type: String,

        default: "",
      },

      price: {
        type: Number,

        required: true,
      },

      quantity: {
        type: Number,

        default: 1,

        min: 1,
      },

      isOriginal: {
        type: Boolean,

        default: true,
      },
    },

    {
      _id: false,
    }
  );

// ============================================================
// SHIPPING
// ============================================================

const shippingSchema =
  new mongoose.Schema(
    {
      firstName: {
        type: String,

        required: true,
      },

      lastName: {
        type: String,

        required: true,
      },

      email: {
        type: String,

        required: true,
      },

      phone: {
        type: String,

        required: true,
      },

      country: {
        type: String,

        required: true,
      },

      city: {
        type: String,

        required: true,
      },

      address: {
        type: String,

        required: true,
      },

      postalCode: {
        type: String,

        required: true,
      },
    },

    {
      _id: false,
    }
  );

// ============================================================
// BLOCKCHAIN
// ============================================================

const blockchainSchema =
  new mongoose.Schema(
    {
      transactionHash: {
        type: String,

        default: "",
      },

      walletAddress: {
        type: String,

        default: "",
      },

      sender: {
        type: String,

        default: "",
      },

      recipient: {
        type: String,

        default: "",
      },

      network: {
        type: String,

        default: "",
      },

      chainId: {
        type: Number,

        default: null,
      },

      blockNumber: {
        type: Number,

        default: null,
      },

      amountEth: {
        type: String,

        default: "",
      },

      status: {
        type: Number,

        default: null,
      },
    },

    {
      _id: false,
    }
  );

// ============================================================
// ORDER
// ============================================================

const orderSchema =
  new mongoose.Schema(
    {
      orderNumber: {
        type: String,

        required: true,

        unique: true,

        index: true,
      },

      // ======================================================
      // BUYER
      // ======================================================

      buyer: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      buyerEmail: {
        type: String,

        required: true,
      },

      buyerName: {
        type: String,

        required: true,
      },

      // ======================================================
      // ITEMS
      // ======================================================

      items: {
        type: [orderItemSchema],

        required: true,

        validate: [
          (items) =>
            Array.isArray(
              items
            ) &&
            items.length >
              0,

          "Order must contain at least one artwork.",
        ],
      },

      // ======================================================
      // MONEY
      // ======================================================

      subtotal: {
        type: Number,

        required: true,

        min: 0,
      },

      shippingCost: {
        type: Number,

        default: 0,

        min: 0,
      },

      total: {
        type: Number,

        required: true,

        min: 0,
      },

      // ======================================================
      // PAYMENT
      // ======================================================

      paymentMethod: {
        type: String,

        enum: [
          "card",
          "paypal",
          "revolut",
          "blockchain",
        ],

        required: true,
      },

      paymentStatus: {
        type: String,

        enum: [
          "Pending",
          "Paid",
          "Failed",
          "Refunded",
        ],

        default: "Paid",
      },

      // ======================================================
      // ORDER STATUS
      // ======================================================

      status: {
        type: String,

        enum: [
          "Preparing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ],

        default:
          "Preparing",
      },

      // ======================================================
      // SHIPPING
      // ======================================================

      shippingInformation: {
        type:
          shippingSchema,

        required: true,
      },

      // ======================================================
      // BLOCKCHAIN
      // ======================================================

      blockchain: {
        type:
          blockchainSchema,

        default:
          undefined,
      },
    },

    {
      timestamps: true,
    }
  );

// ============================================================
// INDEXES
// ============================================================

orderSchema.index({
  buyer: 1,
  createdAt: -1,
});

orderSchema.index({
  "items.artist": 1,
  createdAt: -1,
});

orderSchema.index({
  "blockchain.transactionHash":
    1,
});

// ============================================================
// EXPORT
// ============================================================

module.exports =
  mongoose.model(
    "Order",
    orderSchema
  );