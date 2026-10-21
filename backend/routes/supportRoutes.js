const express =
  require("express");

const crypto =
  require("crypto");

const SupportRequest =
  require("../models/SupportRequest");

const {
  sendEmail,
} =
  require("../utils/sendEmail");

const {
  authenticateToken,
  requireRoles,
} =
  require("../middleware/authMiddleware");

const router =
  express.Router();

// ============================================================
// HELPERS
// ============================================================

const createReference =
  () => {
    const year =
      new Date().getFullYear();

    const random =
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `MG-SUPPORT-${year}-${random}`;
  };

// ============================================================
// ESCAPE HTML
// ============================================================

const escapeHtml =
  (
    value
  ) =>
    String(
      value || ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );

// ============================================================
// PUBLIC - CREATE SUPPORT REQUEST
// POST /api/support
// ============================================================

router.post(
  "/",
  async (
    req,
    res
  ) => {
    try {
      const {
        name,
        email,
        phone = "",
        subject,
        category =
          "General question",
        message,
      } =
        req.body;

      // ======================================================
      // VALIDATION
      // ======================================================

      if (
        !name?.trim() ||
        !email?.trim() ||
        !subject?.trim() ||
        !message?.trim()
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

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          email.trim()
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Please enter a valid email address.",
          });
      }

      // ======================================================
      // PRIORITY
      // ======================================================

      const priority =
        category ===
        "Emergency"
          ? "Urgent"
          : category ===
              "Technical issue"
          ? "High"
          : "Normal";

      // ======================================================
      // CREATE SUPPORT REQUEST
      // ======================================================

      const supportRequest =
        await SupportRequest.create({
          reference:
            createReference(),

          name:
            name.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          phone:
            phone.trim(),

          subject:
            subject.trim(),

          category,

          message:
            message.trim(),

          priority,
        });

      // ======================================================
      // SUPPORT EMAIL DESTINATION
      // ======================================================

      const supportEmail =
        process.env
          .SUPPORT_EMAIL ||
        process.env
          .EMAIL_USER;

      // ======================================================
      // SEND NOTIFICATION EMAIL TO SUPPORT
      // ======================================================

      if (
        supportEmail
      ) {
        try {
          const urgentPrefix =
            priority ===
            "Urgent"
              ? "URGENT - "
              : priority ===
                  "High"
              ? "HIGH PRIORITY - "
              : "";

          const emailSubject =
            `${urgentPrefix}${supportRequest.reference} - ${supportRequest.subject}`;

          const emailHtml =
            `
<div
  style="
    font-family: Arial, Helvetica, sans-serif;
    max-width: 680px;
    margin: 0 auto;
    background: #F5F9FC;
    padding: 24px;
  "
>
  <div
    style="
      background: #061B30;
      color: white;
      padding: 24px;
    "
  >
    <h2
      style="
        margin: 0;
        font-size: 24px;
      "
    >
      Messina Gallery
    </h2>

    <p
      style="
        margin: 8px 0 0;
        color: #63BEFF;
      "
    >
      New support request
    </p>
  </div>

  <div
    style="
      background: white;
      padding: 26px;
      border: 1px solid #DCE7EF;
      color: #10233D;
    "
  >
    <p>
      <strong>
        Reference:
      </strong>

      ${escapeHtml(
        supportRequest.reference
      )}
    </p>

    <p>
      <strong>
        Priority:
      </strong>

      ${escapeHtml(
        supportRequest.priority
      )}
    </p>

    <p>
      <strong>
        Category:
      </strong>

      ${escapeHtml(
        supportRequest.category
      )}
    </p>

    <p>
      <strong>
        Name:
      </strong>

      ${escapeHtml(
        supportRequest.name
      )}
    </p>

    <p>
      <strong>
        Email:
      </strong>

      ${escapeHtml(
        supportRequest.email
      )}
    </p>

    <p>
      <strong>
        Phone:
      </strong>

      ${escapeHtml(
        supportRequest.phone ||
        "Not provided"
      )}
    </p>

    <p>
      <strong>
        Subject:
      </strong>

      ${escapeHtml(
        supportRequest.subject
      )}
    </p>

    <hr
      style="
        border: none;
        border-top: 1px solid #DCE7EF;
        margin: 24px 0;
      "
    />

    <p>
      <strong>
        Message
      </strong>
    </p>

    <p
      style="
        line-height: 1.7;
        color: #334155;
        white-space: pre-wrap;
      "
    >
      ${escapeHtml(
        supportRequest.message
      )}
    </p>
  </div>
</div>
          `;

          const emailResult =
            await sendEmail(
              supportEmail,
              emailSubject,
              emailHtml
            );

          if (
            emailResult
          ) {
            supportRequest.emailSent =
              true;

            supportRequest.emailError =
              "";
          } else {
            supportRequest.emailSent =
              false;

            supportRequest.emailError =
              "Email service returned no result.";
          }

        } catch (
          emailError
        ) {
          console.error(
            "SUPPORT EMAIL ERROR:",
            emailError
          );

          supportRequest.emailSent =
            false;

          supportRequest.emailError =
            emailError.message ||
            "Unable to send support email.";
        }

        await supportRequest.save();

      } else {
        supportRequest.emailSent =
          false;

        supportRequest.emailError =
          "SUPPORT_EMAIL and EMAIL_USER are not configured.";

        await supportRequest.save();
      }

      // ======================================================
      // RESPONSE
      // ======================================================

      return res
        .status(201)
        .json({
          success:
            true,

          message:
            "Your support request has been submitted successfully.",

          request: {
            _id:
              supportRequest._id,

            reference:
              supportRequest.reference,

            status:
              supportRequest.status,

            priority:
              supportRequest.priority,

            emailSent:
              supportRequest.emailSent,

            emailError:
              supportRequest.emailError,
          },
        });

    } catch (
      error
    ) {
      console.error(
        "CREATE SUPPORT REQUEST ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to submit your support request.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// ADMIN - GET ALL SUPPORT REQUESTS
// GET /api/support/admin
// ============================================================

router.get(
  "/admin",

  authenticateToken,

  requireRoles(
    "admin"
  ),

  async (
    req,
    res
  ) => {
    try {
      const requests =
        await SupportRequest
          .find()
          .sort({
            createdAt:
              -1,
          });

      return res.json({
        success:
          true,

        count:
          requests.length,

        requests,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN SUPPORT REQUESTS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to load support requests.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// ADMIN - UPDATE SUPPORT REQUEST
// PATCH /api/support/admin/:id
// ============================================================

router.patch(
  "/admin/:id",

  authenticateToken,

  requireRoles(
    "admin"
  ),

  async (
    req,
    res
  ) => {
    try {
      const {
        status,
        adminNote,
      } =
        req.body;

      const supportRequest =
        await SupportRequest.findById(
          req.params.id
        );

      if (
        !supportRequest
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Support request not found.",
          });
      }

      // ======================================================
      // UPDATE STATUS
      // ======================================================

      if (
        typeof status ===
        "string"
      ) {
        supportRequest.status =
          status;

        if (
          status ===
          "Resolved"
        ) {
          supportRequest.resolvedAt =
            new Date();

        } else {
          supportRequest.resolvedAt =
            null;
        }
      }

      // ======================================================
      // UPDATE INTERNAL NOTE
      // ======================================================

      if (
        typeof adminNote ===
        "string"
      ) {
        supportRequest.adminNote =
          adminNote.trim();
      }

      await supportRequest.save();

      return res.json({
        success:
          true,

        message:
          "Support request updated successfully.",

        request:
          supportRequest,
      });

    } catch (
      error
    ) {
      console.error(
        "UPDATE SUPPORT REQUEST ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to update support request.",

          error:
            error.message,
        });
    }
  }
);

// ============================================================
// ADMIN - REPLY TO SUPPORT REQUEST
// POST /api/support/admin/:id/reply
// ============================================================

router.post(
  "/admin/:id/reply",

  authenticateToken,

  requireRoles(
    "admin"
  ),

  async (
    req,
    res
  ) => {
    try {
      const {
        reply,
        resolve =
          false,
      } =
        req.body;

      // ======================================================
      // VALIDATE REPLY
      // ======================================================

      if (
        !reply ||
        !String(
          reply
        ).trim()
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Reply message is required.",
          });
      }

      // ======================================================
      // FIND SUPPORT REQUEST
      // ======================================================

      const supportRequest =
        await SupportRequest.findById(
          req.params.id
        );

      if (
        !supportRequest
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Support request not found.",
          });
      }

      if (
        !supportRequest.email
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Customer email address is missing.",
          });
      }

      const cleanReply =
        String(
          reply
        ).trim();

      // ======================================================
      // EMAIL SUBJECT
      // ======================================================

      const emailSubject =
        `Re: ${supportRequest.reference} - ${supportRequest.subject}`;

      // ======================================================
      // EMAIL TEMPLATE
      // ======================================================

      const emailHtml =
        `
<div
  style="
    font-family: Arial, Helvetica, sans-serif;
    max-width: 680px;
    margin: 0 auto;
    background: #F5F9FC;
    padding: 24px;
  "
>
  <div
    style="
      background: #061B30;
      color: white;
      padding: 26px;
    "
  >
    <h2
      style="
        margin: 0;
        font-size: 25px;
      "
    >
      Messina Gallery
    </h2>

    <p
      style="
        margin: 8px 0 0;
        color: #63BEFF;
      "
    >
      Support
    </p>
  </div>

  <div
    style="
      background: white;
      border: 1px solid #DCE7EF;
      padding: 28px;
      color: #10233D;
    "
  >
    <p>
      Hello
      ${escapeHtml(
        supportRequest.name
      )},
    </p>

    <p
      style="
        line-height: 1.7;
        color: #334155;
      "
    >
      Thank you for contacting Messina Gallery.
    </p>

    <div
      style="
        margin: 24px 0;
        padding: 20px;
        background: #F5F9FC;
        border-left: 4px solid #168BE8;
        line-height: 1.8;
        white-space: pre-wrap;
        color: #10233D;
      "
    >${escapeHtml(
      cleanReply
    )}</div>

    <p
      style="
        margin-top: 28px;
        font-size: 13px;
        color: #64748B;
      "
    >
      Support reference:
      <strong>
        ${escapeHtml(
          supportRequest.reference
        )}
      </strong>
    </p>

    <hr
      style="
        margin: 26px 0;
        border: none;
        border-top: 1px solid #DCE7EF;
      "
    />

    <p
      style="
        font-size: 13px;
        color: #64748B;
      "
    >
      Messina Gallery Support
    </p>
  </div>
</div>
      `;

      // ======================================================
      // SEND EMAIL
      // ======================================================

      let emailResult;

      try {
        emailResult =
          await sendEmail(
            supportRequest.email,
            emailSubject,
            emailHtml
          );

      } catch (
        emailError
      ) {
        console.error(
          "SUPPORT REPLY EMAIL ERROR:",
          emailError
        );

        supportRequest.replyEmailSent =
          false;

        supportRequest.replyEmailError =
          emailError.message ||
          "Unable to send reply email.";

        await supportRequest.save();

        return res
          .status(502)
          .json({
            success:
              false,

            message:
              "Unable to send reply email.",

            error:
              supportRequest.replyEmailError,
          });
      }

      // ======================================================
      // VERIFY EMAIL RESULT
      // ======================================================

      if (
        !emailResult
      ) {
        supportRequest.replyEmailSent =
          false;

        supportRequest.replyEmailError =
          "Email service returned no result.";

        await supportRequest.save();

        return res
          .status(502)
          .json({
            success:
              false,

            message:
              "Unable to send reply email.",

            error:
              supportRequest.replyEmailError,
          });
      }

      // ======================================================
      // SAVE ADMIN REPLY
      // ======================================================

      supportRequest.adminReply =
        cleanReply;

      supportRequest.repliedAt =
        new Date();

      supportRequest.repliedBy =
        req.userId ||
        null;

      supportRequest.replyEmailSent =
        true;

      supportRequest.replyEmailError =
        "";

      // ======================================================
      // UPDATE STATUS
      // ======================================================

      if (
        resolve ===
        true
      ) {
        supportRequest.status =
          "Resolved";

        supportRequest.resolvedAt =
          new Date();

      } else if (
        supportRequest.status ===
        "Pending"
      ) {
        supportRequest.status =
          "In progress";
      }

      // ======================================================
      // SAVE REQUEST
      // ======================================================

      await supportRequest.save();

      // ======================================================
      // RESPONSE
      // ======================================================

      return res.json({
        success:
          true,

        message:
          resolve ===
          true
            ? "Reply sent successfully and support request resolved."
            : "Reply sent successfully.",

        request:
          supportRequest,
      });

    } catch (
      error
    ) {
      console.error(
        "ADMIN SUPPORT REPLY ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to send support reply.",

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