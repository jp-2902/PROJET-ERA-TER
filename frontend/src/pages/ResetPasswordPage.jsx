import {
  useState,
} from "react";

import {
  Icon,
} from "@iconify/react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api";

function ResetPasswordPage() {
  const {
    token,
  } =
    useParams();

  const navigate =
    useNavigate();

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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

      if (!token) {
        setError(
          "The password reset link is invalid."
        );

        return;
      }

      if (
        !newPassword ||
        !confirmPassword
      ) {
        setError(
          "Please enter and confirm your new password."
        );

        return;
      }

      if (
        newPassword.length <
        6
      ) {
        setError(
          "Password must contain at least 6 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            `/api/auth/reset-password/${token}`,
            {
              newPassword,
            }
          );

        setSuccess(
          response.data
            ?.message ||
            "Password successfully reset."
        );

        setNewPassword("");
        setConfirmPassword("");

        window.setTimeout(
          () => {
            navigate(
              "/login",
              {
                replace:
                  true,
              }
            );
          },
          1800
        );

      } catch (
        requestError
      ) {
        console.error(
          "RESET PASSWORD ERROR:",
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to reset your password."
        );

      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // PASSWORD INPUT
  // ============================================================

  const passwordInput = (
    id,
    label,
    value,
    setter,
    visible,
    setVisible
  ) => (
    <div>
      <label
        htmlFor={
          id
        }
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
        {label}
      </label>

      <div
        className="
          relative
        "
      >
        <Icon
          icon="mdi:lock-outline"
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
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          value={
            value
          }
          onChange={(
            event
          ) => {
            setter(
              event.target.value
            );

            setError("");
          }}
          autoComplete="new-password"
          className="
            w-full
            h-[56px]

            pl-12
            pr-12

            bg-white
            dark:bg-[#103650]

            border
            border-[#D5E3ED]
            dark:border-white/10

            outline-none

            text-sm

            focus:border-[#168BE8]
            dark:focus:border-[#82D1FF]
          "
        />

        <button
          type="button"
          onClick={() =>
            setVisible(
              (
                current
              ) =>
                !current
            )
          }
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2

            text-[#718296]

            hover:text-[#168BE8]
          "
        >
          <Icon
            icon={
              visible
                ? "mdi:eye-off-outline"
                : "mdi:eye-outline"
            }
            width="20"
          />
        </button>
      </div>
    </div>
  );

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
              icon="mdi:key-change"
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
            Choose a new password
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
            Enter your new password
            below. The reset link can
            only be used while it is
            still valid.
          </p>
        </div>

        {error && (
          <div
            className="
              mt-6
              p-4

              bg-red-50
              dark:bg-red-950/20

              border
              border-red-200

              text-sm
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
              mt-6
              p-4

              bg-green-50
              dark:bg-green-950/20

              border
              border-green-200

              text-sm
              text-green-700
            "
          >
            {success}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-7
            space-y-5
          "
        >
          {passwordInput(
            "new-password",
            "New password",
            newPassword,
            setNewPassword,
            showPassword,
            setShowPassword
          )}

          {passwordInput(
            "confirm-password",
            "Confirm password",
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            setShowConfirmPassword
          )}

          <button
            type="submit"
            disabled={
              loading ||
              Boolean(
                success
              )
            }
            className="
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

                Updating...
              </>
            ) : (
              <>
                <Icon
                  icon="mdi:check"
                  width="19"
                />

                Change password
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
              text-xs
              font-semibold
              text-[#168BE8]

              hover:underline
            "
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;