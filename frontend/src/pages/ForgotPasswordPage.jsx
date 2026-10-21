import {
  useState,
} from "react";

import {
  Icon,
} from "@iconify/react";

import {
  Link,
} from "react-router-dom";

import api from "../api";

function ForgotPasswordPage() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        setError(
          "Please enter your email address."
        );

        return;
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          cleanEmail
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
            "/api/auth/forgot-password",
            {
              email:
                cleanEmail,
            }
          );

        setSuccess(
          response.data
            ?.message ||
            "If this email belongs to a Messina Gallery account, a reset link will be sent."
        );

      } catch (
        requestError
      ) {
        console.error(
          "FORGOT PASSWORD ERROR:",
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to request a password reset."
        );

      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div
      className="
        min-h-screen

        bg-[#EEF7FD]
        dark:bg-[#071A2B]

        text-[#10233D]
        dark:text-white

        flex
        items-center
        justify-center

        px-5
        py-10
      "
    >
      <div
        className="
          w-full
          max-w-[540px]

          bg-white
          dark:bg-[#0B2940]

          border
          border-[#DCE7EF]
          dark:border-white/10

          p-7
          md:p-10

          shadow-[0_20px_55px_rgba(3,25,45,0.12)]
        "
      >
        {/* LOGO */}

        <div
          className="
            flex
            justify-center
          "
        >
          <Link
            to="/"
          >
            <img
              src="/assets/logo.png"
              alt="Messina Gallery"
              className="
                w-[105px]
                h-[85px]
                object-contain
              "
            />
          </Link>
        </div>

        {/* TITLE */}

        <div
          className="
            mt-5
            text-center
          "
        >
          <div
            className="
              mx-auto

              w-14
              h-14

              rounded-full

              bg-[#EAF6FD]
              dark:bg-[#103650]

              flex
              items-center
              justify-center

              text-[#168BE8]
              dark:text-[#82D1FF]
            "
          >
            <Icon
              icon="mdi:lock-reset"
              width="27"
            />
          </div>

          <p
            className="
              mt-5

              text-[9px]
              uppercase
              tracking-[0.22em]

              text-[#168BE8]
              dark:text-[#82D1FF]
            "
          >
            Account security
          </p>

          <h1
            className="
              mt-3

              font-serif
              text-[37px]
            "
          >
            Forgot your password?
          </h1>

          <p
            className="
              mt-4

              text-sm
              leading-7

              text-[#718296]
              dark:text-[#B9D5E7]
            "
          >
            Enter the email address
            linked to your Messina
            Gallery account. We will
            send you a secure link to
            choose a new password.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="
              mt-6
              p-4

              bg-red-50
              dark:bg-red-950/20

              border
              border-red-200
              dark:border-red-900/40

              flex
              items-start
              gap-3

              text-sm
              text-red-600
              dark:text-red-300
            "
          >
            <Icon
              icon="mdi:alert-circle-outline"
              width="20"
              className="
                flex-shrink-0
              "
            />

            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            className="
              mt-6
              p-4

              bg-green-50
              dark:bg-green-950/20

              border
              border-green-200
              dark:border-green-900/40

              flex
              items-start
              gap-3

              text-sm
              leading-6

              text-green-700
              dark:text-green-300
            "
          >
            <Icon
              icon="mdi:email-check-outline"
              width="21"
              className="
                flex-shrink-0
              "
            />

            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-7
          "
        >
          <label
            htmlFor="forgot-email"
            className="
              block
              mb-2

              text-[9px]
              uppercase
              tracking-[0.17em]

              text-[#5E7385]
              dark:text-[#B9D5E7]
            "
          >
            Email address
          </label>

          <div
            className="
              relative
            "
          >
            <Icon
              icon="mdi:email-outline"
              width="20"
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2

                text-[#7D91A2]
              "
            />

            <input
              id="forgot-email"
              type="email"
              value={
                email
              }
              onChange={(
                event
              ) => {
                setEmail(
                  event.target
                    .value
                );

                setError("");
                setSuccess("");
              }}
              autoComplete="email"
              placeholder="name@example.com"
              className="
                w-full
                h-[56px]

                pl-12
                pr-4

                bg-white
                dark:bg-[#103650]

                border
                border-[#D5E3ED]
                dark:border-white/10

                outline-none

                text-sm

                placeholder:text-[#A1AFBA]

                focus:border-[#168BE8]
                dark:focus:border-[#82D1FF]
              "
            />
          </div>

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

              disabled:opacity-60

              hover:-translate-y-[2px]
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
                  icon="mdi:email-send-outline"
                  width="19"
                />

                Send reset link
              </>
            )}
          </button>
        </form>

        <div
          className="
            mt-7
            pt-6

            border-t
            border-[#DCE7EF]
            dark:border-white/10

            text-center
          "
        >
          <Link
            to="/login"
            className="
              inline-flex
              items-center
              gap-2

              text-xs
              font-semibold

              text-[#168BE8]
              dark:text-[#82D1FF]

              hover:underline
            "
          >
            <Icon
              icon="mdi:arrow-left"
              width="17"
            />

            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;