const express =
  require("express");

const router =
  express.Router();

const jwt =
  require("jsonwebtoken");

const bcrypt =
  require("bcryptjs");

const crypto =
  require("crypto");

const multer =
  require("multer");

const path =
  require("path");

const fs =
  require("fs");

const User =
  require("../models/User");

const LoginEvent =
  require("../models/LoginEvent");

const {
  authenticateToken,
} =
  require("../middleware/authMiddleware");

require("dotenv").config();

const {
  sendEmail,
  sendWelcomeEmail,
  sendLoginEmail,
  sendAccountUpdatedEmail,
} =
  require("../utils/sendEmail");

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
// MULTER - PROFILE PHOTO
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

      const randomPart =
        crypto
          .randomBytes(4)
          .toString("hex");

      const fileName =
        `profile-${Date.now()}-${randomPart}${extension}`;

      cb(
        null,
        fileName
      );
    },
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        5 *
        1024 *
        1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const allowedTypes =
        [
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

const generateArtistCode =
  () => {
    const randomCode =
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `MG-ART-${randomCode}`;
  };

const lettersRegex =
  /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

const phoneRegex =
  /^\+?[0-9\s().-]{7,20}$/;

// ============================================================
// USER SERIALIZER
// ============================================================

const serializeUser =
  (
    user
  ) => {
    return {
      id:
        user._id,

      _id:
        user._id,

      firstName:
        user.firstName ||
        "",

      lastName:
        user.lastName ||
        "",

      email:
        user.email ||
        "",

      phone:
        user.phone ||
        "",

      country:
        user.country ||
        "",

      city:
        user.city ||
        "",

      address:
        user.address ||
        "",

      role:
        user.role ||
        "user",

      isActive:
        user.isActive !==
        false,

      artistName:
        user.artistName ||
        "",

      artistCode:
        user.artistCode ||
        null,

      bio:
        user.bio ||
        "",

      specialty:
        user.specialty ||
        "",

      birthDate:
        user.birthDate ||
        null,

      birthPlace:
        user.birthPlace ||
        "",

      birthCountry:
        user.birthCountry ||
        "",

      profileImage:
        user.profileImage ||
        "",

      createdAt:
        user.createdAt,

      updatedAt:
        user.updatedAt,
    };
  };

// ============================================================
// DELETE OLD PROFILE PHOTO
// ============================================================

const deleteOldProfilePhoto =
  (
    profileImage
  ) => {
    try {
      if (
        !profileImage ||
        !profileImage.startsWith(
          "/uploads/"
        )
      ) {
        return;
      }

      const filename =
        path.basename(
          profileImage
        );

      const imagePath =
        path.join(
          uploadDirectory,
          filename
        );

      if (
        fs.existsSync(
          imagePath
        )
      ) {
        fs.unlinkSync(
          imagePath
        );
      }

    } catch (
      error
    ) {
      console.error(
        "PROFILE PHOTO DELETE ERROR:",
        error.message
      );
    }
  };

// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================

router.post(
  "/register",

  upload.single(
    "profilePhoto"
  ),

  async (
    req,
    res
  ) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        country,
        city,
        address,
        role,

        artistName,
        bio,
        specialty,

        birthDate,
        birthPlace,
        birthCountry,

        acceptedTerms,
        termsAccepted,
      } =
        req.body;

      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !phone ||
        !country ||
        !city ||
        !address
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Please complete all required fields.",
          });
      }

      if (
        !lettersRegex.test(
          firstName.trim()
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "First name must contain letters only.",
          });
      }

      if (
        !lettersRegex.test(
          lastName.trim()
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Last name must contain letters only.",
          });
      }

      if (
        !lettersRegex.test(
          country.trim()
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Country must contain letters only.",
          });
      }

      if (
        !lettersRegex.test(
          city.trim()
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "City must contain letters only.",
          });
      }

      if (
        !phoneRegex.test(
          phone.trim()
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Please enter a valid phone number.",
          });
      }

      if (
        password.length <
        6
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Password must contain at least 6 characters.",
          });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (
        existingUser
      ) {
        return res
          .status(409)
          .json({
            success:
              false,

            message:
              "An account already exists with this email.",
          });
      }

      let userRole =
        role ||
        "user";

      if (
        userRole ===
          "collector" ||
        userRole ===
          "customer" ||
        userRole ===
          "client"
      ) {
        userRole =
          "user";
      }

      if (
        ![
          "user",
          "artist",
        ].includes(
          userRole
        )
      ) {
        userRole =
          "user";
      }

      const hasAcceptedTerms =
        acceptedTerms ===
          true ||
        acceptedTerms ===
          "true" ||
        termsAccepted ===
          true ||
        termsAccepted ===
          "true";

      if (
        !hasAcceptedTerms
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "You must accept the Terms of Service and Privacy Policy.",
          });
      }

      if (
        userRole ===
        "artist"
      ) {
        if (
          !artistName ||
          !bio ||
          !specialty ||
          !birthDate ||
          !birthPlace ||
          !birthCountry
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Please complete all required artist information.",
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
                "A profile photo is required for artist accounts.",
            });
        }
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      let artistCode =
        null;

      if (
        userRole ===
        "artist"
      ) {
        artistCode =
          generateArtistCode();

        while (
          await User.exists({
            artistCode,
          })
        ) {
          artistCode =
            generateArtistCode();
        }
      }

      const profileImage =
        req.file
          ? `/uploads/${req.file.filename}`
          : "";

      const newUser =
        await User.create({
          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          email:
            normalizedEmail,

          password:
            hashedPassword,

          phone:
            phone.trim(),

          country:
            country.trim(),

          city:
            city.trim(),

          address:
            address.trim(),

          role:
            userRole,

          acceptedTerms:
            hasAcceptedTerms,

          termsAcceptedAt:
            new Date(),

          artistName:
            userRole ===
            "artist"
              ? artistName.trim()
              : "",

          artistCode,

          bio:
            userRole ===
            "artist"
              ? bio.trim()
              : "",

          specialty:
            userRole ===
            "artist"
              ? specialty.trim()
              : "",

          birthDate:
            userRole ===
            "artist"
              ? birthDate
              : null,

          birthPlace:
            userRole ===
            "artist"
              ? birthPlace.trim()
              : "",

          birthCountry:
            userRole ===
            "artist"
              ? birthCountry.trim()
              : "",

          profileImage,
        });

      try {
        await sendWelcomeEmail(
          newUser.email,
          newUser.firstName,
          newUser.role
        );

      } catch (
        emailError
      ) {
        console.error(
          "WELCOME EMAIL ERROR:",
          emailError.message
        );
      }

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Account created successfully.",

          user:
            serializeUser(
              newUser
            ),
        });

    } catch (
      error
    ) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Server error while creating account.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

router.post(
  "/login",

  async (
    req,
    res
  ) => {
    try {
      const {
        email,
        password,
        role,
      } =
        req.body;

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Email and password are required.",
          });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (
        !user
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Invalid email or password.",
          });
      }

      if (
        user.isActive ===
        false
      ) {
        return res
          .status(403)
          .json({
            success:
              false,

            message:
              "This account has been disabled.",
          });
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );

      if (
        !passwordMatches
      ) {
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Invalid email or password.",
          });
      }

      // ======================================================
      // VERIFY SELECTED LOGIN ROLE
      // ======================================================

      if (
        role
      ) {
        let requestedRole =
          role;

        if (
          requestedRole ===
            "collector" ||
          requestedRole ===
            "customer" ||
          requestedRole ===
            "client"
        ) {
          requestedRole =
            "user";
        }

        if (
          requestedRole !==
          user.role
        ) {
          return res
            .status(403)
            .json({
              success:
                false,

              message:
                "The selected account type does not match this account.",
            });
        }
      }

      if (
        !process.env
          .JWT_SECRET
      ) {
        throw new Error(
          "JWT_SECRET is missing from .env"
        );
      }

      const token =
        jwt.sign(
          {
            id:
              user._id,

            role:
              user.role,
          },

          process.env
            .JWT_SECRET,

          {
            expiresIn:
              "7d",
          }
        );

      try {
        await sendLoginEmail(
          user.email,
          user.firstName
        );

      } catch (
        emailError
      ) {
        console.error(
          "LOGIN EMAIL ERROR:",
          emailError.message
        );
      }

      // ======================================================
      // RECORD SUCCESSFUL LOGIN
      // ======================================================

      try {
        await LoginEvent.create({
          user:
            user._id,

          role:
            user.role,

          success:
            true,

          ipAddress:
            req.ip ||
            "",

          userAgent:
            req.get(
              "user-agent"
            ) ||
            "",
        });

      } catch (
        loginEventError
      ) {
        console.error(
          "LOGIN EVENT RECORD ERROR:",
          loginEventError.message
        );
      }

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Login successful.",

          token,

          user:
            serializeUser(
              user
            ),
        });

    } catch (
      error
    ) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Server error while signing in.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// CURRENT USER
// GET /api/auth/me
// ============================================================

router.get(
  "/me",

  authenticateToken,

  async (
    req,
    res
  ) => {
    try {
      const user =
        await User.findById(
          req.userId
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

      return res
        .status(200)
        .json({
          success:
            true,

          user:
            serializeUser(
              user
            ),
        });

    } catch (
      error
    ) {
      console.error(
        "GET CURRENT USER ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load user.",
        });
    }
  }
);

// ============================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ============================================================

router.put(
  "/profile",

  authenticateToken,

  upload.single(
    "profilePhoto"
  ),

  async (
    req,
    res
  ) => {
    try {
      const user =
        await User.findById(
          req.userId
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

      const {
        firstName,
        lastName,
        phone,
        country,
        city,
        address,

        artistName,
        bio,
        specialty,

        birthDate,
        birthPlace,
        birthCountry,
      } =
        req.body;

      if (
        firstName !==
        undefined
      ) {
        if (
          !lettersRegex.test(
            firstName.trim()
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "First name must contain letters only.",
            });
        }

        user.firstName =
          firstName.trim();
      }

      if (
        lastName !==
        undefined
      ) {
        if (
          !lettersRegex.test(
            lastName.trim()
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Last name must contain letters only.",
            });
        }

        user.lastName =
          lastName.trim();
      }

      if (
        phone !==
        undefined
      ) {
        if (
          !phoneRegex.test(
            phone.trim()
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Please enter a valid phone number.",
            });
        }

        user.phone =
          phone.trim();
      }

      if (
        country !==
        undefined
      ) {
        if (
          !lettersRegex.test(
            country.trim()
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Country must contain letters only.",
            });
        }

        user.country =
          country.trim();
      }

      if (
        city !==
        undefined
      ) {
        if (
          !lettersRegex.test(
            city.trim()
          )
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "City must contain letters only.",
            });
        }

        user.city =
          city.trim();
      }

      if (
        address !==
        undefined
      ) {
        user.address =
          address.trim();
      }

      if (
        user.role ===
        "artist"
      ) {
        if (
          artistName !==
          undefined
        ) {
          user.artistName =
            artistName.trim();
        }

        if (
          bio !==
          undefined
        ) {
          user.bio =
            bio.trim();
        }

        if (
          specialty !==
          undefined
        ) {
          user.specialty =
            specialty.trim();
        }

        if (
          birthDate !==
          undefined
        ) {
          user.birthDate =
            birthDate ||
            null;
        }

        if (
          birthPlace !==
          undefined
        ) {
          user.birthPlace =
            birthPlace.trim();
        }

        if (
          birthCountry !==
          undefined
        ) {
          user.birthCountry =
            birthCountry.trim();
        }
      }

      if (
        req.file
      ) {
        deleteOldProfilePhoto(
          user.profileImage
        );

        user.profileImage =
          `/uploads/${req.file.filename}`;
      }

      await user.save();

      try {
        await sendAccountUpdatedEmail(
          user.email,
          user.firstName
        );

      } catch (
        emailError
      ) {
        console.error(
          "PROFILE UPDATE EMAIL ERROR:",
          emailError.message
        );
      }

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Profile updated successfully.",

          user:
            serializeUser(
              user
            ),
        });

    } catch (
      error
    ) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update profile.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// SUPPORT
// POST /api/auth/support
// ============================================================

router.post(
  "/support",

  async (
    req,
    res
  ) => {
    try {
      const {
        name,
        email,
        subject,
        message,
      } =
        req.body;

      if (
        !name ||
        !email ||
        !subject ||
        !message
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Please complete all support fields.",
          });
      }

      const safeName =
        String(
          name
        ).trim();

      const safeEmail =
        String(
          email
        )
          .trim()
          .toLowerCase();

      const safeSubject =
        String(
          subject
        ).trim();

      const safeMessage =
        String(
          message
        ).trim();

      const supportEmail =
        process.env
          .EMAIL_USER;

      if (
        !supportEmail
      ) {
        return res
          .status(500)
          .json({
            success:
              false,

            message:
              "Support email is not configured.",
          });
      }

      const emailResult =
        await sendEmail(
          supportEmail,

          `MESSINA GALLERY SUPPORT - ${safeSubject}`,

          `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 650px;
              margin: auto;
              line-height: 1.6;
            ">
              <h2>
                New support request
              </h2>

              <p>
                <strong>Name:</strong>
                ${safeName}
              </p>

              <p>
                <strong>Email:</strong>
                ${safeEmail}
              </p>

              <p>
                <strong>Subject:</strong>
                ${safeSubject}
              </p>

              <hr />

              <p style="
                white-space: pre-wrap;
              ">
                ${safeMessage}
              </p>
            </div>
          `
        );

      if (
        !emailResult
      ) {
        return res
          .status(500)
          .json({
            success:
              false,

            message:
              "Unable to send support request.",
          });
      }

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Your message has been sent to Messina Gallery Support.",
        });

    } catch (
      error
    ) {
      console.error(
        "SUPPORT ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to send support request.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ============================================================

router.post(
  "/forgot-password",

  async (
    req,
    res
  ) => {
    try {
      const {
        email,
      } =
        req.body;

      if (
        !email
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Email is required.",
          });
      }

      const normalizedEmail =
        String(
          email
        )
          .toLowerCase()
          .trim();

      console.log(
        "PASSWORD RESET REQUEST:",
        normalizedEmail
      );

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (
        !user
      ) {
        console.log(
          "PASSWORD RESET: USER NOT FOUND"
        );

        return res
          .status(200)
          .json({
            success:
              true,

            message:
              "If this email belongs to a Messina Gallery account, a reset link will be sent.",
          });
      }

      console.log(
        "PASSWORD RESET USER FOUND:",
        user.email
      );

      // ======================================================
      // GENERATE TOKEN
      // ======================================================

      const resetToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      user.resetToken =
        resetToken;

      user.resetTokenExpiration =
        new Date(
          Date.now() +
          60 *
            60 *
            1000
        );

      await user.save();

      console.log(
        "PASSWORD RESET TOKEN SAVED"
      );

      // ======================================================
      // RESET LINK
      // ======================================================

      const frontendUrl =
        (
          process.env
            .FRONTEND_URL ||
          "http://localhost:5173"
        ).replace(
          /\/$/,
          ""
        );

      const resetLink =
        `${frontendUrl}/reset-password/${resetToken}`;

      console.log(
        "PASSWORD RESET LINK:",
        resetLink
      );

      // ======================================================
      // RESET EMAIL
      // ======================================================

      const resetEmailHtml =
        `
<div
  style="
    font-family: Arial, Helvetica, sans-serif;
    max-width: 620px;
    margin: 0 auto;
    padding: 35px;
    background: #FFFFFF;
    color: #10233D;
  "
>
  <div
    style="
      text-align: center;
      margin-bottom: 30px;
    "
  >
    <h1
      style="
        color: #168BE8;
        margin: 0;
        font-size: 28px;
      "
    >
      Messina Gallery
    </h1>

    <p
      style="
        margin-top: 10px;
        font-size: 11px;
        color: #718296;
        letter-spacing: 3px;
      "
    >
      ACCOUNT SECURITY
    </p>
  </div>

  <hr
    style="
      border: none;
      border-top: 1px solid #DCE9F3;
      margin: 25px 0;
    "
  />

  <p
    style="
      font-size: 16px;
      line-height: 1.7;
    "
  >
    Hello${
      user.firstName
        ? ` ${user.firstName}`
        : ""
    },
  </p>

  <p
    style="
      font-size: 15px;
      line-height: 1.7;
      color: #526579;
    "
  >
    We received a request to reset
    the password associated with your
    <strong>
      Messina Gallery
    </strong>
    account.
  </p>

  <div
    style="
      margin: 30px 0;
      text-align: center;
    "
  >
    <a
      href="${resetLink}"
      style="
        display: inline-block;
        padding: 16px 30px;
        background: #168BE8;
        color: #FFFFFF;
        text-decoration: none;
        font-size: 14px;
        font-weight: bold;
      "
    >
      Reset my password
    </a>
  </div>

  <p
    style="
      font-size: 13px;
      color: #718296;
      line-height: 1.7;
    "
  >
    If the button does not work,
    copy and paste this link into
    your browser:
  </p>

  <div
    style="
      padding: 15px;
      background: #F7FAFC;
      border: 1px solid #DCE9F3;
      word-break: break-all;
      color: #168BE8;
      font-size: 12px;
    "
  >
    ${resetLink}
  </div>

  <div
    style="
      margin-top: 30px;
      padding: 18px;
      background: #FFF8E8;
      border-left: 4px solid #F2B84B;
    "
  >
    <strong
      style="
        color: #805B10;
      "
    >
      Security notice
    </strong>

    <p
      style="
        margin-bottom: 0;
        color: #806C45;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      This link expires in one hour.

      <br /><br />

      If you did not request this
      password reset, you can safely
      ignore this email.
    </p>
  </div>

  <p
    style="
      margin-top: 30px;
      line-height: 1.7;
    "
  >
    Best regards,
    <br />

    <strong>
      The Messina Gallery Team
    </strong>
  </p>
</div>
        `;

      const emailResult =
        await sendEmail(
          user.email,
          "Reset your password - Messina Gallery",
          resetEmailHtml
        );

      // ======================================================
      // EMAIL FAILURE
      // ======================================================

      if (
        !emailResult
      ) {
        console.error(
          "PASSWORD RESET EMAIL FAILED"
        );

        user.resetToken =
          undefined;

        user.resetTokenExpiration =
          undefined;

        await user.save();

        return res
          .status(500)
          .json({
            success:
              false,

            message:
              "Unable to send the password reset email. Please try again.",
          });
      }

      console.log(
        "PASSWORD RESET EMAIL SENT TO:",
        user.email
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "If this email belongs to a Messina Gallery account, a reset link will be sent.",
        });

    } catch (
      error
    ) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Server error while requesting password reset.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password/:token
// ============================================================

router.post(
  "/reset-password/:token",

  async (
    req,
    res
  ) => {
    try {
      const {
        token,
      } =
        req.params;

      const {
        newPassword,
      } =
        req.body;

      if (
        !newPassword ||
        newPassword.length <
          6
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Password must contain at least 6 characters.",
          });
      }

      const user =
        await User.findOne({
          resetToken:
            token,

          resetTokenExpiration: {
            $gt:
              new Date(),
          },
        });

      if (
        !user
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid or expired reset link.",
          });
      }

      // ======================================================
      // HASH NEW PASSWORD
      // ======================================================

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      // ======================================================
      // REMOVE TOKEN
      // ======================================================

      user.resetToken =
        undefined;

      user.resetTokenExpiration =
        undefined;

      await user.save();

      console.log(
        "PASSWORD RESET SUCCESS:",
        user.email
      );

      // ======================================================
      // CONFIRMATION EMAIL
      // ======================================================

      try {
        await sendAccountUpdatedEmail(
          user.email,
          user.firstName
        );

      } catch (
        emailError
      ) {
        console.error(
          "Password confirmation email error:",
          emailError.message
        );
      }

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Password successfully reset. You can now sign in with your new password.",
        });

    } catch (
      error
    ) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Server error while resetting password.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;