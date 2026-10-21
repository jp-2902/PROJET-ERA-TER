import { useState } from "react";
import { Icon } from "@iconify/react";

function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (
      !cleanEmail.includes("@") ||
      !cleanEmail.includes(".")
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    try {
      let subscribers =
        JSON.parse(
          localStorage.getItem(
            "messina_newsletter_subscribers"
          ) || "[]"
        );

      if (!Array.isArray(subscribers)) {
        subscribers = [];
      }

      const alreadySubscribed =
        subscribers.some(
          (subscriber) =>
            subscriber.email ===
            cleanEmail
        );

      if (alreadySubscribed) {
        setError(
          "This email is already subscribed."
        );

        return;
      }

      const subscriber = {
        id:
          "MG-SUB-" +
          Date.now(),

        email:
          cleanEmail,

        subscribedAt:
          new Date().toISOString(),

        status:
          "Active",
      };

      const updatedSubscribers = [
        subscriber,
        ...subscribers,
      ];

      localStorage.setItem(
        "messina_newsletter_subscribers",
        JSON.stringify(
          updatedSubscribers
        )
      );

      setEmail("");
      setSuccess(true);
    } catch (storageError) {
      console.error(
        "Newsletter subscription error:",
        storageError
      );

      setError(
        "Unable to subscribe. Please try again."
      );
    }
  };

  return (
    <section
      className="
        relative
        overflow-hidden

        bg-gradient-to-r
        from-[#082A47]
        via-[#0C416D]
        to-[#17679F]

        text-white

        border
        border-white/10
      "
    >
      <div
        className="
          absolute
          inset-0

          bg-[radial-gradient(circle_at_80%_30%,rgba(99,190,255,0.22),transparent_42%)]
        "
      />

      <div
        className="
          absolute
          -right-20
          -top-20

          w-[260px]
          h-[260px]

          rounded-full

          border
          border-white/10
        "
      />

      <div
        className="
          relative
          z-10

          p-7
          md:p-10

          grid
          grid-cols-1
          lg:grid-cols-[1fr_0.85fr]

          gap-8
          items-center
        "
      >
        {/* LEFT */}

        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                w-9
                h-[2px]
                bg-[#63BEFF]
              "
            />

            <span
              className="
                text-[9px]
                uppercase
                tracking-[0.23em]

                text-[#9DD8FF]
              "
            >
              Messina Gallery Newsletter
            </span>
          </div>

          <h2
            className="
              mt-4

              max-w-[600px]

              font-serif

              text-[35px]
              md:text-[42px]

              leading-tight
            "
          >
            Let art come{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              to you.
            </span>
          </h2>

          <p
            className="
              mt-4

              max-w-[560px]

              text-sm
              leading-7

              text-white/65
            "
          >
            Discover new artists, curated collections
            and remarkable artworks directly through
            the Messina Gallery newsletter.
          </p>

          <div
            className="
              mt-6

              flex
              flex-wrap
              gap-5

              text-[10px]
              text-white/55
            "
          >
            <span
              className="
                flex
                items-center
                gap-2
              "
            >
              <Icon
                icon="mdi:check-circle-outline"
                width="16"
                className="text-[#63BEFF]"
              />

              New artworks
            </span>

            <span
              className="
                flex
                items-center
                gap-2
              "
            >
              <Icon
                icon="mdi:check-circle-outline"
                width="16"
                className="text-[#63BEFF]"
              />

              Artist stories
            </span>

            <span
              className="
                flex
                items-center
                gap-2
              "
            >
              <Icon
                icon="mdi:check-circle-outline"
                width="16"
                className="text-[#63BEFF]"
              />

              Collections
            </span>
          </div>
        </div>

        {/* RIGHT */}

        <div
          className="
            p-6

            bg-white/10

            backdrop-blur-md

            border
            border-white/10
          "
        >
          <p
            className="
              text-[9px]
              uppercase
              tracking-[0.18em]

              text-[#9DD8FF]
            "
          >
            Join our community
          </p>

          <h3
            className="
              mt-2

              font-serif
              text-[24px]
            "
          >
            Subscribe to our newsletter.
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-5"
          >
            <div
              className="
                flex
                flex-col
                sm:flex-row

                gap-3
              "
            >
              <div
                className="
                  flex-1

                  flex
                  items-center

                  px-4

                  bg-white

                  text-[#10233D]
                "
              >
                <Icon
                  icon="mdi:email-outline"
                  width="19"
                  className="
                    mr-3
                    text-[#168BE8]
                  "
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );

                    setError("");
                    setSuccess(false);
                  }}
                  placeholder="Your email address"
                  className="
                    w-full

                    py-3.5

                    bg-transparent

                    outline-none

                    text-sm

                    placeholder:text-[#8A9AA8]
                  "
                />
              </div>

              <button
                type="submit"
                className="
                  h-[51px]

                  px-6

                  flex
                  items-center
                  justify-center
                  gap-2

                  bg-gradient-to-r
                  from-[#1677E8]
                  to-[#52B6FA]

                  text-white

                  text-[10px]
                  uppercase
                  tracking-[0.15em]
                  font-semibold

                  hover:-translate-y-1

                  transition-all
                "
              >
                Subscribe

                <Icon
                  icon="mdi:arrow-right"
                  width="17"
                />
              </button>
            </div>

            {error && (
              <div
                className="
                  mt-4

                  flex
                  items-center
                  gap-2

                  text-xs
                  text-[#FFCBD4]
                "
              >
                <Icon
                  icon="mdi:alert-circle-outline"
                  width="17"
                />

                {error}
              </div>
            )}

            {success && (
              <div
                className="
                  mt-4

                  p-3

                  bg-white/10

                  flex
                  items-center
                  gap-3

                  text-xs
                  text-[#A8F1D3]
                "
              >
                <Icon
                  icon="mdi:check-circle-outline"
                  width="18"
                />

                Welcome to the Messina Gallery community!
              </div>
            )}

            <p
              className="
                mt-4

                text-[9px]
                leading-5

                text-white/40
              "
            >
              By subscribing, you agree to receive
              Messina Gallery updates. You may unsubscribe
              at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSubscribe;