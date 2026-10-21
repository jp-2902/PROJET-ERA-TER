import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import Navbar from "../components/Navbar";

import api from "../api";

// ============================================================
// SUPPORT FORM
// ============================================================

function SupportForm() {
  const [
    form,
    setForm,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category:
      "General question",
    message: "",
  });

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (
        current
      ) => ({
        ...current,

        [name]:
          value,
      })
    );

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.name.trim() ||
        !form.email.trim() ||
        !form.subject.trim() ||
        !form.message.trim()
      ) {
        setError(
          "Please complete all required fields."
        );

        return;
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          form.email.trim()
        )
      ) {
        setError(
          "Please enter a valid email address."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            "/api/support",
            {
              name:
                form.name.trim(),

              email:
                form.email
                  .trim()
                  .toLowerCase(),

              phone:
                form.phone.trim(),

              subject:
                form.subject.trim(),

              category:
                form.category,

              message:
                form.message.trim(),
            }
          );

        setSuccess(
          response.data
            ?.message ||
            "Your support request has been submitted successfully."
        );

        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          category:
            "General question",
          message: "",
        });
      } catch (
        requestError
      ) {
        console.error(
          "SUPPORT REQUEST ERROR:",
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to submit your support request."
        );
      } finally {
        setLoading(false);
      }
    };

  const inputClass = `
    w-full
    px-4
    py-3.5
    bg-white
    dark:bg-[#103650]
    border
    border-[#D7E5EF]
    dark:border-[#82D1FF]/15
    text-[#10233D]
    dark:text-white
    text-sm
    outline-none
    placeholder:text-[#98A7B4]
    focus:border-[#168BE8]
    dark:focus:border-[#82D1FF]
    transition-all
  `;

  const labelClass = `
    block
    mb-2
    text-[9px]
    uppercase
    tracking-[0.18em]
    text-[#5E7385]
    dark:text-[#B9D5E7]
  `;

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="
        bg-white
        dark:bg-[#0B2940]
        border
        border-white/15
        p-6
        md:p-8
        text-[#10233D]
        dark:text-white
        shadow-[0_20px_50px_rgba(3,25,45,0.18)]
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <span
          className="
            w-8
            h-[2px]
            bg-[#168BE8]
          "
        />

        <p
          className="
            text-[9px]
            uppercase
            tracking-[0.22em]
            text-[#168BE8]
            dark:text-[#82D1FF]
          "
        >
          Send a request
        </p>
      </div>

      <h3
        className="
          mt-3
          font-serif
          text-[30px]
        "
      >
        Contact Support
      </h3>

      <p
        className="
          mt-3
          text-xs
          leading-6
          text-[#718296]
          dark:text-[#B9D5E7]
        "
      >
        Fill in the form below.
        Your request will be sent
        directly to the Messina
        Gallery administration.
      </p>

      <div
        className="
          mt-7
          grid
          grid-cols-1
          md:grid-cols-2
          gap-5
        "
      >
        <div>
          <label
            htmlFor="support-name"
            className={
              labelClass
            }
          >
            Full name *
          </label>

          <input
            id="support-name"
            type="text"
            name="name"
            value={
              form.name
            }
            onChange={
              handleChange
            }
            placeholder="Your full name"
            className={
              inputClass
            }
          />
        </div>

        <div>
          <label
            htmlFor="support-email"
            className={
              labelClass
            }
          >
            Email address *
          </label>

          <input
            id="support-email"
            type="email"
            name="email"
            value={
              form.email
            }
            onChange={
              handleChange
            }
            placeholder="your@email.com"
            className={
              inputClass
            }
          />
        </div>

        <div>
          <label
            htmlFor="support-phone"
            className={
              labelClass
            }
          >
            Phone number
          </label>

          <input
            id="support-phone"
            type="tel"
            name="phone"
            value={
              form.phone
            }
            onChange={
              handleChange
            }
            placeholder="+33..."
            className={
              inputClass
            }
          />
        </div>

        <div>
          <label
            htmlFor="support-category"
            className={
              labelClass
            }
          >
            Category
          </label>

          <select
            id="support-category"
            name="category"
            value={
              form.category
            }
            onChange={
              handleChange
            }
            className={
              inputClass
            }
          >
            <option>
              General question
            </option>

            <option>
              Artwork
            </option>

            <option>
              Order
            </option>

            <option>
              Payment
            </option>

            <option>
              Shipping
            </option>

            <option>
              Return
            </option>

            <option>
              Artist account
            </option>

            <option>
              Collector account
            </option>

            <option>
              Technical issue
            </option>

            <option>
              Emergency
            </option>

            <option>
              Other
            </option>
          </select>
        </div>

        <div
          className="
            md:col-span-2
          "
        >
          <label
            htmlFor="support-subject"
            className={
              labelClass
            }
          >
            Subject *
          </label>

          <input
            id="support-subject"
            type="text"
            name="subject"
            value={
              form.subject
            }
            onChange={
              handleChange
            }
            placeholder="How can we help?"
            className={
              inputClass
            }
          />
        </div>

        <div
          className="
            md:col-span-2
          "
        >
          <label
            htmlFor="support-message"
            className={
              labelClass
            }
          >
            Message *
          </label>

          <textarea
            id="support-message"
            name="message"
            value={
              form.message
            }
            onChange={
              handleChange
            }
            rows="6"
            placeholder="Describe your request..."
            className={`
              ${inputClass}
              resize-none
            `}
          />
        </div>
      </div>

      {form.category ===
        "Emergency" && (
        <div
          className="
            mt-5
            p-4
            bg-[#FFF4F4]
            dark:bg-red-950/20
            border
            border-red-200
            dark:border-red-900/40
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <Icon
              icon="mdi:alert-octagon-outline"
              width="22"
              className="
                flex-shrink-0
                text-red-500
              "
            />

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  text-red-600
                  dark:text-red-300
                "
              >
                Emergency request
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-5
                  text-[#718296]
                  dark:text-[#B9D5E7]
                "
              >
                This request will be
                marked as urgent for
                the Messina Gallery
                administration.
              </p>

              <a
                href="tel:+393276036350"
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                <Icon
                  icon="mdi:phone-outline"
                  width="18"
                />

                +39 327 6036350
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          className="
            mt-5
            p-4
            bg-[#FFF1F3]
            dark:bg-[#3D2230]
            border
            border-[#F3BCC7]
            dark:border-[#874258]
            flex
            items-center
            gap-3
            text-sm
            text-[#C73C58]
            dark:text-[#FFC1CE]
          "
        >
          <Icon
            icon="mdi:alert-circle-outline"
            width="20"
          />

          {error}
        </div>
      )}

      {success && (
        <div
          className="
            mt-5
            p-4
            bg-[#EAF9F3]
            dark:bg-[#123D38]
            border
            border-[#BDE6D5]
            dark:border-[#2D6B58]
            flex
            items-center
            gap-3
            text-sm
            text-[#26946C]
            dark:text-[#85E2C2]
          "
        >
          <Icon
            icon="mdi:check-circle-outline"
            width="20"
          />

          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={
          loading
        }
        className="
          mt-6
          w-full
          h-[56px]
          flex
          items-center
          justify-center
          gap-3
          bg-gradient-to-r
          from-[#1677E8]
          via-[#2F80ED]
          to-[#52B6FA]
          text-white
          text-[10px]
          uppercase
          tracking-[0.18em]
          font-semibold
          shadow-[0_10px_25px_rgba(22,119,232,0.22)]
          hover:-translate-y-1
          disabled:opacity-60
          disabled:hover:translate-y-0
          transition-all
        "
      >
        {loading ? (
          <>
            <Icon
              icon="mdi:loading"
              width="19"
              className="
                animate-spin
              "
            />

            Sending...
          </>
        ) : (
          <>
            <Icon
              icon="mdi:send-outline"
              width="19"
            />

            Send support request
          </>
        )}
      </button>

      <div
        className="
          mt-5
          flex
          items-center
          justify-center
          gap-2
          text-[9px]
          text-[#8799A8]
          dark:text-[#8197AA]
        "
      >
        <Icon
          icon="mdi:shield-lock-outline"
          width="14"
        />

        Your request is securely
        transmitted to Messina
        Gallery.
      </div>
    </form>
  );
}

// ============================================================
// SECTIONS
// ============================================================

const sections = [
  {
    id: "about",
    label: "About Us",
    icon:
      "mdi:information-outline",
  },

  {
    id: "mission",
    label: "Our Mission",
    icon:
      "mdi:target",
  },

  {
    id: "trust",
    label:
      "Trust & Authenticity",
    icon:
      "mdi:shield-check-outline",
  },

  {
    id: "terms",
    label:
      "Terms of Service",
    icon:
      "mdi:file-document-outline",
  },

  {
    id: "privacy",
    label:
      "Privacy Policy",
    icon:
      "mdi:lock-outline",
  },

  {
    id: "payments",
    label:
      "Payments & Security",
    icon:
      "mdi:credit-card-lock-outline",
  },

  {
    id: "shipping",
    label:
      "Shipping & Returns",
    icon:
      "mdi:truck-delivery-outline",
  },

  {
    id: "faq",
    label: "FAQs",
    icon:
      "mdi:frequently-asked-questions",
  },

  {
    id: "support",
    label:
      "Contact & Support",
    icon:
      "mdi:headset",
  },
];

// ============================================================
// PAGE
// ============================================================

function AboutLegalPage() {
  const location =
    useLocation();

  const [
    activeSection,
    setActiveSection,
  ] =
    useState("about");

  // ==========================================================
  // SCROLL
  // ==========================================================

  const scrollToSection =
    (
      sectionId
    ) => {
      const element =
        document.getElementById(
          sectionId
        );

      if (element) {
        element.scrollIntoView({
          behavior:
            "smooth",

          block:
            "start",
        });

        setActiveSection(
          sectionId
        );
      }
    };

  // ==========================================================
  // ROUTE -> SECTION
  // ==========================================================

  useEffect(() => {
    const routeMap = {
      "/terms":
        "terms",

      "/privacy":
        "privacy",

      "/shipping":
        "shipping",

      "/faq":
        "faq",
    };

    const sectionId =
      routeMap[
        location.pathname
      ];

    // ========================================================
    // ABOUT
    // Async callback prevents eslint set-state-in-effect error
    // ========================================================

    if (
      location.pathname ===
        "/about" ||
      location.pathname ===
        "/about-legal"
    ) {
      const timeoutId =
        window.setTimeout(
          () => {
            setActiveSection(
              "about"
            );

            window.scrollTo({
              top: 0,

              behavior:
                "auto",
            });
          },
          0
        );

      return () => {
        window.clearTimeout(
          timeoutId
        );
      };
    }

    if (!sectionId) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          const element =
            document.getElementById(
              sectionId
            );

          if (
            element
          ) {
            element.scrollIntoView({
              behavior:
                "auto",

              block:
                "start",
            });

            setActiveSection(
              sectionId
            );
          }
        },
        0
      );

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    location.pathname,
  ]);

  return (
    <div
      className="
        min-h-screen
        bg-[#EEF7FD]
        dark:bg-[#071C2C]
        text-[#10233D]
        dark:text-[#F5FBFF]
        transition-colors
        duration-500
      "
    >
      <Navbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          bg-gradient-to-r
          from-[#082A47]
          via-[#0C416D]
          to-[#17679F]
          text-white
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_70%_20%,rgba(99,190,255,0.25),transparent_38%)]
          "
        />

        <div
          className="
            relative
            z-10
            max-w-[1250px]
            mx-auto
            px-6
            py-20
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                w-10
                h-[2px]
                bg-[#63BEFF]
              "
            />

            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.27em]
                text-[#9DD8FF]
              "
            >
              About Messina Gallery
            </span>
          </div>

          <h1
            className="
              mt-6
              max-w-[900px]
              font-serif
              text-[48px]
              md:text-[68px]
              leading-[1.05]
            "
          >
            Art, trust and{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              meaningful
              connections.
            </span>
          </h1>

          <p
            className="
              mt-6
              max-w-[720px]
              text-sm
              md:text-[15px]
              leading-8
              text-white/70
            "
          >
            Messina Gallery
            connects artists and
            collectors through a
            refined digital platform
            where artworks can be
            discovered, understood,
            appreciated and
            purchased with
            confidence.
          </p>
        </div>
      </section>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        className="
          max-w-[1250px]
          mx-auto
          px-6
          py-14
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[270px_1fr]
            gap-9
            items-start
          "
        >
          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside
            className="
              lg:sticky
              lg:top-[110px]
              bg-white
              dark:bg-[#0B2940]
              border
              border-[#DCE9F3]
              dark:border-[#82D1FF]/15
              overflow-hidden
            "
          >
            <div
              className="
                p-5
                bg-gradient-to-r
                from-[#E8F5FD]
                to-[#F8FCFF]
                dark:from-[#103650]
                dark:to-[#154765]
                border-b
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.20em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Information center
              </p>

              <h2
                className="
                  mt-2
                  font-serif
                  text-[24px]
                "
              >
                About & Legal
              </h2>
            </div>

            <div
              className="p-3"
            >
              {sections.map(
                (
                  section
                ) => (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        section.id
                      )
                    }
                    className={`
                      w-full
                      px-4
                      py-3.5
                      flex
                      items-center
                      gap-3
                      text-left
                      text-xs
                      transition-all

                      ${
                        activeSection ===
                        section.id
                          ? `
                            bg-[#EAF5FD]
                            dark:bg-[#154765]
                            text-[#168BE8]
                            dark:text-[#82D1FF]
                          `
                          : `
                            text-[#5F7385]
                            dark:text-[#B9D5E7]
                            hover:bg-[#F6FBFE]
                            dark:hover:bg-[#103650]
                          `
                      }
                    `}
                  >
                    <Icon
                      icon={
                        section.icon
                      }
                      width="19"
                    />

                    {
                      section.label
                    }
                  </button>
                )
              )}
            </div>
          </aside>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div
            className="
              space-y-8
            "
          >
            {/* ABOUT */}

            <section
              id="about"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                About Us
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                Where art meets
                people.
              </h2>

              <p
                className="
                  mt-5
                  text-sm
                  leading-8
                  text-[#677B8E]
                  dark:text-[#B9D5E7]
                "
              >
                Messina Gallery is
                an online art
                marketplace designed
                to bring artists and
                collectors together
                in one elegant
                digital environment.
                Artists can present
                their identity,
                creative approach
                and artworks, while
                collectors can
                explore pieces,
                understand their
                stories and build
                meaningful
                collections.
              </p>
            </section>

            {/* MISSION */}

            <section
              id="mission"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Our Mission
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                More than buying
                art.
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-8
                  text-[#677B8E]
                  dark:text-[#B9D5E7]
                "
              >
                Our purpose is not
                only to facilitate
                the sale of artworks,
                but also to give
                every work a voice
                by presenting its
                story, inspiration
                and artistic
                identity.
              </p>
            </section>

            {/* TRUST */}

            <section
              id="trust"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Trust &
                Authenticity
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                Building confidence
                around every artwork.
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-8
                  text-[#677B8E]
                  dark:text-[#B9D5E7]
                "
              >
                Messina Gallery can
                provide digital
                certificates,
                verification
                identifiers and
                public authenticity
                information for
                supported artworks.
              </p>
            </section>

            {/* TERMS */}

            <section
              id="terms"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Terms of Service
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                Rules for using
                Messina Gallery.
              </h2>

              <div
                className="
                  mt-6
                  space-y-5
                "
              >
                <p
                  className="
                    text-sm
                    leading-8
                    text-[#677B8E]
                    dark:text-[#B9D5E7]
                  "
                >
                  Users must provide
                  accurate
                  information when
                  creating an account
                  and are responsible
                  for protecting
                  their credentials.
                </p>

                <p
                  className="
                    text-sm
                    leading-8
                    text-[#677B8E]
                    dark:text-[#B9D5E7]
                  "
                >
                  Artists must only
                  publish artworks
                  they are legally
                  authorised to sell
                  and must provide
                  accurate
                  information about
                  their works.
                </p>
              </div>
            </section>

            {/* PRIVACY */}

            <section
              id="privacy"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Privacy Policy
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                Your information
                matters.
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-8
                  text-[#677B8E]
                  dark:text-[#B9D5E7]
                "
              >
                Information may be
                used to manage user
                accounts, orders,
                deliveries,
                payments and
                customer support.
              </p>
            </section>

            {/* PAYMENTS */}

            <section
              id="payments"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Payments & Security
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                Flexible payment
                experiences.
              </h2>

              <div
                className="
                  mt-7
                  grid
                  grid-cols-2
                  md:grid-cols-4
                  gap-4
                "
              >
                {[
                  [
                    "mdi:credit-card-outline",
                    "Card",
                  ],

                  [
                    "mdi:paypal",
                    "PayPal",
                  ],

                  [
                    "mdi:bank-outline",
                    "Revolut",
                  ],

                  [
                    "mdi:cube-outline",
                    "Blockchain",
                  ],
                ].map(
                  ([
                    icon,
                    title,
                  ]) => (
                    <div
                      key={
                        title
                      }
                      className="
                        min-h-[115px]
                        p-4
                        bg-[#F6FBFE]
                        dark:bg-[#103650]
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-3
                      "
                    >
                      <Icon
                        icon={
                          icon
                        }
                        width="28"
                        className="
                          text-[#168BE8]
                          dark:text-[#82D1FF]
                        "
                      />

                      <span
                        className="
                          text-xs
                          font-semibold
                        "
                      >
                        {title}
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* SHIPPING */}

            <section
              id="shipping"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Shipping & Returns
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                Artwork delivery
                with care.
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-8
                  text-[#677B8E]
                  dark:text-[#B9D5E7]
                "
              >
                Artwork should be
                securely prepared
                before shipment.
                Delivery and return
                procedures may
                depend on the
                artwork and
                marketplace policy.
              </p>
            </section>

            {/* FAQ */}

            <section
              id="faq"
              className="
                scroll-mt-[115px]
                bg-white
                dark:bg-[#0B2940]
                border
                border-[#DCE9F3]
                dark:border-[#82D1FF]/15
                p-7
                md:p-9
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                  dark:text-[#82D1FF]
                "
              >
                Frequently Asked
                Questions
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                Questions? We have
                answers.
              </h2>

              <div
                className="
                  mt-7
                  space-y-3
                "
              >
                {[
                  {
                    question:
                      "How can I buy an artwork?",

                    answer:
                      "Open the Gallery, select an artwork, add it to the cart and continue through Checkout and Payment.",
                  },

                  {
                    question:
                      "Do I need an account to explore the Gallery?",

                    answer:
                      "No. Visitors can explore artworks, collections and artist profiles.",
                  },

                  {
                    question:
                      "Which payment methods are available?",

                    answer:
                      "Messina Gallery currently supports card, PayPal, Revolut and blockchain payment options.",
                  },

                  {
                    question:
                      "How can I contact support?",

                    answer:
                      "Use the Contact Support form below. For an urgent situation, select Emergency.",
                  },
                ].map(
                  (
                    item
                  ) => (
                    <details
                      key={
                        item.question
                      }
                      className="
                        group
                        bg-[#F6FBFE]
                        dark:bg-[#103650]
                        border
                        border-[#DDEAF3]
                        dark:border-[#82D1FF]/10
                      "
                    >
                      <summary
                        className="
                          cursor-pointer
                          list-none
                          px-5
                          py-5
                          flex
                          justify-between
                          gap-4
                        "
                      >
                        <span
                          className="
                            font-serif
                            text-[18px]
                          "
                        >
                          {
                            item.question
                          }
                        </span>

                        <Icon
                          icon="mdi:plus"
                          width="20"
                          className="
                            text-[#168BE8]
                            group-open:rotate-45
                            transition-transform
                          "
                        />
                      </summary>

                      <p
                        className="
                          px-5
                          pb-5
                          text-sm
                          leading-7
                          text-[#718296]
                          dark:text-[#B9D5E7]
                        "
                      >
                        {
                          item.answer
                        }
                      </p>
                    </details>
                  )
                )}
              </div>
            </section>

            {/* ==================================================
                SUPPORT
            ================================================== */}

            <section
              id="support"
              className="
                scroll-mt-[115px]
                relative
                overflow-hidden
                bg-gradient-to-r
                from-[#082A47]
                via-[#0C416D]
                to-[#17679F]
                text-white
                p-8
                md:p-10
              "
            >
              <div
                className="
                  relative
                  z-10
                  grid
                  grid-cols-1
                  lg:grid-cols-[0.85fr_1.15fr]
                  gap-10
                  items-start
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.22em]
                      text-[#9DD8FF]
                    "
                  >
                    Contact & Support
                  </p>

                  <h2
                    className="
                      mt-4
                      font-serif
                      text-[36px]
                      md:text-[42px]
                    "
                  >
                    How can we help?
                  </h2>

                  <p
                    className="
                      mt-4
                      text-sm
                      leading-7
                      text-white/70
                    "
                  >
                    Send a message
                    directly to the
                    Messina Gallery
                    administration.
                  </p>

                  <div
                    className="
                      mt-8
                      p-5
                      bg-white/10
                      border
                      border-white/10
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-4
                      "
                    >
                      <Icon
                        icon="mdi:phone-alert-outline"
                        width="26"
                        className="
                          text-[#8DD4FF]
                        "
                      />

                      <div>
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.17em]
                            text-[#9DD8FF]
                          "
                        >
                          Emergency
                          contact
                        </p>

                        <a
                          href="tel:+393276036350"
                          className="
                            mt-2
                            inline-block
                            text-[21px]
                            font-semibold
                            text-white
                            hover:text-[#63BEFF]
                          "
                        >
                          +39 327 6036350
                        </a>

                        <p
                          className="
                            mt-1
                            text-[11px]
                            text-white/55
                          "
                        >
                          Messina Gallery
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <SupportForm />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer
        className="
          bg-[#082A47]
          text-white
          border-t
          border-white/10
        "
      >
        <div
          className="
            max-w-[1250px]
            mx-auto
            px-6
            py-10
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <img
              src="/assets/logo.png"
              alt="Messina Gallery"
              className="
                w-[80px]
                h-[70px]
                object-contain
              "
            />

            <p
              className="
                text-[10px]
                text-white/45
              "
            >
              ©{" "}
              {new Date().getFullYear()}{" "}
              Messina Gallery. All
              rights reserved.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              justify-center
              gap-6
              text-[10px]
              text-white/55
            "
          >
            {[
              [
                "About",
                "about",
              ],

              [
                "Terms",
                "terms",
              ],

              [
                "Privacy",
                "privacy",
              ],

              [
                "Shipping",
                "shipping",
              ],

              [
                "FAQs",
                "faq",
              ],

              [
                "Support",
                "support",
              ],
            ].map(
              ([
                label,
                id,
              ]) => (
                <button
                  key={
                    id
                  }
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      id
                    )
                  }
                  className="
                    hover:text-[#63BEFF]
                  "
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutLegalPage;