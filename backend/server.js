const express =
  require("express");

const mongoose =
  require("mongoose");

const cors =
  require("cors");

const path =
  require("path");

const dotenv =
  require("dotenv");

// ============================================================
// ENV
// ============================================================

dotenv.config();

// ============================================================
// ROUTES
// ============================================================

const authRoutes =
  require("./routes/authRoutes");

const artworkRoutes =
  require("./routes/artworkRoutes");

const orderRoutes =
  require("./routes/orderRoutes");

const artistRoutes =
  require("./routes/artistRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const supportRoutes =
  require("./routes/supportRoutes");

const collectionRoutes =
  require("./routes/collectionRoutes");

// ============================================================
// APP
// ============================================================

const app =
  express();

// ============================================================
// PORT
// ============================================================

const PORT =
  process.env.PORT ||
  5001;

// ============================================================
// CORS
// ============================================================

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",

    credentials:
      true,
  })
);

// ============================================================
// BODY PARSERS
// ============================================================

app.use(
  express.json({
    limit:
      "10mb",
  })
);

app.use(
  express.urlencoded({
    extended:
      true,

    limit:
      "10mb",
  })
);

// ============================================================
// STATIC UPLOADS
// ============================================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// ============================================================
// HEALTH
// ============================================================

app.get(
  "/",
  (
    req,
    res
  ) => {
    return res.json({
      success:
        true,

      message:
        "Messina Gallery API is running.",
    });
  }
);

app.get(
  "/api/health",
  (
    req,
    res
  ) => {
    return res.json({
      success:
        true,

      server:
        "Messina Gallery",

      status:
        "online",
    });
  }
);

// ============================================================
// API ROUTES
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/artworks",
  artworkRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/artists",
  artistRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/support",
  supportRoutes
);

app.use(
  "/api/collections",
  collectionRoutes
);

// ============================================================
// 404
// ============================================================

app.use(
  (
    req,
    res
  ) => {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          "Route not found.",
      });
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      error
    );

    if (
      res.headersSent
    ) {
      return next(
        error
      );
    }

    return res
      .status(
        error.status ||
          500
      )
      .json({
        success:
          false,

        message:
          error.message ||
          "Internal server error.",
      });
  }
);

// ============================================================
// MONGODB
// ============================================================

const connectDatabase =
  async () => {
    try {
      const mongoUri =
        process.env.MONGO_URI ||
        "mongodb://127.0.0.1:27017/messina_gallery";

      await mongoose.connect(
        mongoUri
      );

      console.log(
        "MongoDB connecté"
      );

    } catch (
      error
    ) {
      console.error(
        "MongoDB connection error:",
        error
      );

      process.exit(1);
    }
  };

// ============================================================
// START SERVER
// ============================================================

const startServer =
  async () => {
    await connectDatabase();

    app.listen(
      PORT,
      () => {
        console.log(
          `Serveur lancé sur le port ${PORT}`
        );

        console.log(
          `Backend: http://localhost:${PORT}`
        );
      }
    );
  };

startServer();