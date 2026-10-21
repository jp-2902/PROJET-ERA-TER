import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import {
  useAuth,
} from "../context/AuthContext";

// ============================================================
// ARTWORKS
// ============================================================

const artworks = [
  "/assets/art1.jpg",
  "/assets/art2.jpg",
  "/assets/art3.jpg",
  "/assets/art4.jpg",
];

// ============================================================
// SAFE REDIRECT
// ============================================================

const getSafeDestination = (
  value
) => {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  if (
    !value.startsWith(
      "/"
    )
  ) {
    return "";
  }

  if (
    value.startsWith(
      "//"
    )
  ) {
    return "";
  }

  return value;
};

// ============================================================
// DEFAULT DESTINATION BY ROLE
// ============================================================

const getDefaultDestination =
  (role) => {
    if (
      role ===
      "admin"
    ) {
      return "/admin";
    }

    if (
      role ===
      "artist"
    ) {
      return "/artist-studio";
    }

    return "/profile";
  };

// ============================================================
// LOGIN PAGE
// ============================================================

function LoginPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
    user,
    role:
      authenticatedRole,
    isAuthenticated,
    loadingAuth,
  } = useAuth();

  // ==========================================================
  // FORM
  // ==========================================================

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    role,
    setRole,
  ] = useState(
    "user"
  );

  // ==========================================================
  // UI
  // ==========================================================

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    currentArtwork,
    setCurrentArtwork,
  ] = useState(0);

  const [
    darkMode,
    setDarkMode,
  ] = useState(
    () =>
      localStorage.getItem(
        "theme"
      ) ===
      "dark"
  );

  // ==========================================================
  // REQUESTED DESTINATION
  // ==========================================================

  const requestedDestination =
    getSafeDestination(
      location.state?.from
    );

  // ==========================================================
  // DARK MODE
  // ==========================================================

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "light"
      );
    }
  }, [
    darkMode,
  ]);

  // ==========================================================
  // ARTWORK SLIDER
  // ==========================================================

  useEffect(() => {
    const intervalId =
      window.setInterval(
        () => {
          setCurrentArtwork(
            (
              previous
            ) =>
              (
                previous +
                1
              ) %
              artworks.length
          );
        },
        5000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, []);

  // ==========================================================
  // ALREADY AUTHENTICATED
  // ==========================================================

  useEffect(() => {
    if (
      loadingAuth ||
      !isAuthenticated ||
      !user
    ) {
      return undefined;
    }

    const destination =
      requestedDestination ||
      getDefaultDestination(
        authenticatedRole
      );

    const timeoutId =
      window.setTimeout(
        () => {
          navigate(
            destination,
            {
              replace: true,
            }
          );
        },
        0
      );

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    loadingAuth,
    isAuthenticated,
    user,
    authenticatedRole,
    requestedDestination,
    navigate,
  ]);

  // ==========================================================
  // SELECT ROLE
  // ==========================================================

  const selectRole = (
    selectedRole
  ) => {
    setRole(
      selectedRole
    );

    setError("");
  };

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");

      if (
        !email.trim() ||
        !password
      ) {
        setError(
          "Please enter your email and password."
        );

        return;
      }

      setLoading(true);

      try {
        const result =
          await login(
            email
              .trim()
              .toLowerCase(),

            password,

            role
          );

        const loggedUser =
          result?.user;

        const backendRole =
          loggedUser?.role;

        const normalizedRole =
          loggedUser
            ?.normalizedRole ||
          (
            backendRole ===
            "user"
              ? "collector"
              : backendRole
          );

        if (
          normalizedRole ===
          "admin"
        ) {
          navigate(
            "/admin",
            {
              replace: true,
            }
          );

          return;
        }

        if (
          requestedDestination
        ) {
          navigate(
            requestedDestination,
            {
              replace: true,
            }
          );

          return;
        }

        navigate(
          getDefaultDestination(
            normalizedRole
          ),
          {
            replace: true,
          }
        );
      } catch (
        requestError
      ) {
        console.error(
          "LOGIN ERROR:",
          requestError
        );

        setError(
          requestError
            .response
            ?.data
            ?.message ||
          requestError
            .message ||
          "Unable to sign in. Please check your credentials and selected account type."
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // ROLE BUTTON CLASS
  // ==========================================================

  const getRoleButtonClass =
    (
      selectedRole
    ) => `
      h-[56px]

      flex
      items-center
      justify-center
      gap-2

      px-3

      text-[11px]
      sm:text-xs

      font-semibold

      transition-all
      duration-300

      ${
        role ===
        selectedRole
          ? `
            bg-gradient-to-r
            from-[#1677E8]
            to-[#269AF1]

            text-white

            shadow-[0_6px_18px_rgba(22,119,232,0.20)]
          `
          : `
            bg-white
            dark:bg-transparent

            text-[#10233D]
            dark:text-[#D9E9F6]

            hover:bg-[#EEF7FE]
            dark:hover:bg-white/5
          `
      }
    `;

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="
        min-h-screen

        bg-[#EAF5FD]
        dark:bg-[#07182A]

        flex
        items-center
        justify-center

        px-4
        py-7

        transition-colors
        duration-500
      "
    >
      <div
        className="
          relative

          w-full
          max-w-[1180px]

          min-h-[720px]

          grid
          grid-cols-1
          lg:grid-cols-2

          overflow-hidden

          shadow-[0_30px_90px_rgba(14,58,103,0.22)]

          bg-white
          dark:bg-[#0B1F33]
        "
      >
        {/* ====================================================
            LEFT SIDE
        ==================================================== */}

        <section
          className="
            relative

            hidden
            lg:flex

            overflow-hidden

            min-h-[720px]

            text-white
          "
        >
          <div
            className="
              absolute
              inset-0
            "
          >
            {artworks.map(
              (
                image,
                index
              ) => (
                <img
                  key={
                    image
                  }
                  src={
                    image
                  }
                  alt={`Messina Gallery artwork ${
                    index + 1
                  }`}
                  className={`
                    absolute
                    inset-0

                    w-full
                    h-full

                    object-cover

                    transition-opacity
                    duration-[1600ms]
                    ease-in-out

                    ${
                      currentArtwork ===
                      index
                        ? "opacity-100"
                        : "opacity-0"
                    }
                  `}
                />
              )
            )}
          </div>

          <div
            className="
              absolute
              inset-0

              bg-gradient-to-br
              from-[#063A70]/95
              via-[#07549A]/88
              to-[#021D3A]/95
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-[radial-gradient(circle_at_45%_10%,rgba(74,168,232,0.30),transparent_42%)]
            "
          />

          <div
            className="
              relative
              z-10

              w-full
              min-h-[720px]

              flex
              flex-col

              px-12
              pt-4
              pb-10
            "
          >
            <div
              className="
                w-full
                h-[270px]

                flex
                items-center
                justify-center
              "
            >
              <Link
                to="/"
                aria-label="Messina Gallery Home"
              >
                <img
                  src="/assets/logo.png"
                  alt="Messina Gallery"
                  className="
                    w-[270px]
                    h-[270px]

                    object-contain
                  "
                />
              </Link>
            </div>

            <div
              className="
                mt-2
                max-w-[430px]
              "
            >
              <p
                className="
                  text-[10px]

                  uppercase
                  tracking-[0.34em]

                  text-[#9DD8FF]
                "
              >
                Messina Gallery
              </p>

              <h1
                className="
                  mt-4

                  font-serif

                  text-[46px]
                  leading-[1.08]
                "
              >
                Where art meets{" "}

                <span
                  className="
                    italic
                    text-[#63BEFF]
                  "
                >
                  emotion.
                </span>
              </h1>

              <div
                className="
                  mt-8
                  space-y-7
                "
              >
                <p
                  className="
                    max-w-[370px]

                    text-sm
                    leading-7

                    text-white/82
                  "
                >
                  Share your creations
                  and your vision with
                  an Artist account.
                </p>

                <p
                  className="
                    max-w-[370px]

                    text-sm
                    leading-7

                    text-white/82
                  "
                >
                  Discover, collect and
                  purchase unique artworks
                  with a Collector account.
                </p>
              </div>
            </div>

            <div
              className="
                mt-auto

                flex
                items-center
                gap-2
              "
            >
              {artworks.map(
                (
                  _,
                  index
                ) => (
                  <button
                    key={
                      index
                    }
                    type="button"
                    onClick={() =>
                      setCurrentArtwork(
                        index
                      )
                    }
                    aria-label={`Show artwork ${
                      index + 1
                    }`}
                    className={`
                      transition-all
                      duration-300

                      ${
                        currentArtwork ===
                        index
                          ? `
                            w-8
                            h-[5px]

                            rounded-full

                            bg-[#63BEFF]
                          `
                          : `
                            w-2
                            h-2

                            rounded-full

                            bg-white/45

                            hover:bg-white/80
                          `
                      }
                    `}
                  />
                )
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <section
          className="
            min-h-[720px]

            flex
            flex-col

            bg-[#FCFDFE]
            dark:bg-[#0B1F33]
          "
        >
          <header
            className="
              px-7
              sm:px-10
              lg:px-12

              pt-7

              flex
              items-center
              justify-between
            "
          >
            <Link
              to="/"
              className="
                lg:hidden
              "
            >
              <img
                src="/assets/logo.png"
                alt="Messina Gallery"
                className="
                  w-[84px]
                  h-[84px]

                  object-contain
                "
              />
            </Link>

            <div
              className="
                ml-auto

                flex
                items-center
                gap-5
              "
            >
              <Link
                to="/"
                className="
                  text-xs

                  text-[#10233D]
                  dark:text-white

                  hover:text-[#168BE8]

                  transition
                "
              >
                Home
              </Link>

              <Link
                to="/products"
                className="
                  text-xs

                  text-[#10233D]
                  dark:text-white

                  hover:text-[#168BE8]

                  transition
                "
              >
                Gallery
              </Link>

              <button
                type="button"
                onClick={() =>
                  setDarkMode(
                    (
                      current
                    ) =>
                      !current
                  )
                }
                className="
                  w-11
                  h-11

                  rounded-full

                  flex
                  items-center
                  justify-center

                  bg-gradient-to-br
                  from-[#39A9FF]
                  to-[#0879DF]

                  text-white

                  shadow-[0_7px_20px_rgba(8,121,223,0.28)]

                  hover:scale-105

                  transition
                "
                aria-label={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                <Icon
                  icon={
                    darkMode
                      ? "mdi:white-balance-sunny"
                      : "mdi:weather-night"
                  }
                  width="20"
                />
              </button>
            </div>
          </header>

          <div
            className="
              flex-1

              flex
              items-center
            "
          >
            <div
              className="
                w-full
                max-w-[500px]

                mx-auto

                px-7
                sm:px-10
                lg:px-12

                py-8
              "
            >
              <p
                className="
                  text-[10px]

                  uppercase
                  tracking-[0.27em]

                  text-[#168BE8]
                "
              >
                Welcome back
              </p>

              <h2
                className="
                  mt-3

                  font-serif

                  text-[46px]
                  leading-tight

                  text-[#10233D]
                  dark:text-white
                "
              >
                Sign in to{" "}

                <span
                  className="
                    italic

                    text-[#168BE8]
                  "
                >
                  Messina.
                </span>
              </h2>

              <p
                className="
                  mt-4

                  max-w-[380px]

                  text-sm
                  leading-6

                  text-[#718296]
                  dark:text-[#A9C0D3]
                "
              >
                Choose the space that
                fits you.
              </p>

              {requestedDestination && (
                <div
                  className="
                    mt-5

                    p-3

                    flex
                    items-center
                    gap-3

                    bg-[#EDF7FD]
                    dark:bg-white/5

                    border
                    border-[#D9EAF6]
                    dark:border-white/10
                  "
                >
                  <Icon
                    icon="mdi:information-outline"
                    width="19"
                    className="
                      flex-shrink-0

                      text-[#168BE8]
                    "
                  />

                  <p
                    className="
                      text-[11px]

                      text-[#718296]
                      dark:text-[#A9C0D3]
                    "
                  >
                    Sign in to
                    continue where
                    you left off.
                  </p>
                </div>
              )}

              <div
                className="
                  mt-6
                "
              >
                <label
                  className="
                    block

                    mb-3

                    text-[10px]
                    font-semibold

                    uppercase
                    tracking-[0.23em]

                    text-[#10233D]
                    dark:text-[#BDD0E0]
                  "
                >
                  Account type
                </label>

                <div
                  className="
                    grid
                    grid-cols-3

                    border
                    border-[#CCD7E2]
                    dark:border-white/15

                    overflow-hidden
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      selectRole(
                        "user"
                      )
                    }
                    className={
                      getRoleButtonClass(
                        "user"
                      )
                    }
                  >
                    <Icon
                      icon="mdi:account-outline"
                      width="18"
                    />

                    Collector
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectRole(
                        "artist"
                      )
                    }
                    className={
                      getRoleButtonClass(
                        "artist"
                      )
                    }
                  >
                    <Icon
                      icon="mdi:palette-outline"
                      width="18"
                    />

                    Artist
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      selectRole(
                        "admin"
                      )
                    }
                    className={
                      getRoleButtonClass(
                        "admin"
                      )
                    }
                  >
                    <Icon
                      icon="mdi:shield-account-outline"
                      width="18"
                    />

                    Admin
                  </button>
                </div>

                <div
                  className="
                    mt-3
                    min-h-[28px]

                    flex
                    items-center
                  "
                >
                  {role ===
                  "admin" ? (
                    <p
                      className="
                        flex
                        items-center
                        gap-2

                        text-[10px]

                        text-[#168BE8]
                      "
                    >
                      <Icon
                        icon="mdi:shield-lock-outline"
                        width="15"
                      />

                      Authorized
                      administrator
                      access only.
                    </p>
                  ) : role ===
                    "artist" ? (
                    <p
                      className="
                        text-[10px]

                        text-[#718296]
                        dark:text-[#9FB5C7]
                      "
                    >
                      Share and manage
                      your artworks.
                    </p>
                  ) : (
                    <p
                      className="
                        text-[10px]

                        text-[#718296]
                        dark:text-[#9FB5C7]
                      "
                    >
                      Discover, collect
                      and purchase art.
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div
                  className="
                    mt-4

                    p-3

                    flex
                    items-start
                    gap-3

                    bg-red-50
                    dark:bg-red-950/20

                    border
                    border-red-200
                    dark:border-red-900/40

                    text-red-600
                    dark:text-red-300

                    text-xs
                  "
                >
                  <Icon
                    icon="mdi:alert-circle-outline"
                    width="18"
                    className="
                      mt-0.5
                      flex-shrink-0
                    "
                  />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  mt-6
                "
              >
                <div
                  className="
                    mb-6
                  "
                >
                  <label
                    htmlFor="email"
                    className="
                      block

                      mb-3

                      text-[10px]
                      font-semibold

                      uppercase
                      tracking-[0.23em]

                      text-[#10233D]
                      dark:text-[#BDD0E0]
                    "
                  >
                    Email address
                  </label>

                  <div
                    className="
                      flex
                      items-center

                      border-b
                      border-[#C9D8E4]
                      dark:border-white/20

                      focus-within:border-[#168BE8]
                      dark:focus-within:border-[#4BB5FF]

                      transition-colors
                    "
                  >
                    <Icon
                      icon="mdi:email-outline"
                      width="21"
                      className="
                        mr-4

                        text-[#10233D]
                        dark:text-[#8EABC3]
                      "
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      value={
                        email
                      }
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target
                            .value
                        )
                      }
                      className="
                        w-full

                        bg-transparent

                        py-4

                        text-[14px]

                        text-[#10233D]
                        dark:text-white

                        placeholder:text-[#98A3AE]
                        dark:placeholder:text-[#71869A]

                        outline-none
                      "
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="
                      block

                      mb-3

                      text-[10px]
                      font-semibold

                      uppercase
                      tracking-[0.23em]

                      text-[#10233D]
                      dark:text-[#BDD0E0]
                    "
                  >
                    Password
                  </label>

                  <div
                    className="
                      flex
                      items-center

                      border-b
                      border-[#C9D8E4]
                      dark:border-white/20

                      focus-within:border-[#168BE8]
                      dark:focus-within:border-[#4BB5FF]

                      transition-colors
                    "
                  >
                    <Icon
                      icon="mdi:lock-outline"
                      width="21"
                      className="
                        mr-4

                        text-[#10233D]
                        dark:text-[#8EABC3]
                      "
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      className="
                        w-full

                        bg-transparent

                        py-4

                        text-[14px]

                        text-[#10233D]
                        dark:text-white

                        placeholder:text-[#98A3AE]
                        dark:placeholder:text-[#71869A]

                        outline-none
                      "
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      className="
                        ml-3

                        text-[#718296]
                        dark:text-[#8EABC3]

                        hover:text-[#168BE8]

                        transition
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <Icon
                        icon={
                          showPassword
                            ? "mdi:eye-off-outline"
                            : "mdi:eye-outline"
                        }
                        width="21"
                      />
                    </button>
                  </div>
                </div>

                <div
                  className="
                    mt-4

                    flex
                    justify-end
                  "
                >
                  <Link
                    to="/forgot-password"
                    className="
                      text-[11px]

                      text-[#168BE8]

                      hover:underline
                    "
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="
                    mt-7

                    w-full
                    h-[56px]

                    flex
                    items-center
                    justify-center
                    gap-4

                    bg-gradient-to-r
                    from-[#1677E8]
                    via-[#168BE8]
                    to-[#269AF1]

                    text-white

                    shadow-[0_10px_25px_rgba(22,119,232,0.22)]

                    transition-all
                    duration-300

                    hover:shadow-[0_14px_30px_rgba(22,119,232,0.32)]
                    hover:-translate-y-[1px]

                    active:translate-y-0

                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {loading ? (
                    <>
                      <Icon
                        icon="mdi:loading"
                        width="21"
                        className="
                          animate-spin
                        "
                      />

                      <span
                        className="
                          text-xs

                          uppercase
                          tracking-[0.25em]
                        "
                      >
                        Signing in
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="
                          text-xs
                          font-medium

                          uppercase
                          tracking-[0.28em]
                        "
                      >
                        Sign in
                      </span>

                      <Icon
                        icon="mdi:arrow-right"
                        width="20"
                      />
                    </>
                  )}
                </button>
              </form>

              <div
                className="
                  mt-7
                  min-h-[38px]

                  flex
                  items-center
                "
              >
                {role ===
                "admin" ? (
                  <div
                    className="
                      w-full

                      flex
                      items-center
                      justify-center
                      gap-2

                      text-[10px]

                      uppercase
                      tracking-[0.15em]

                      text-[#718296]
                      dark:text-[#9FB5C7]
                    "
                  >
                    <Icon
                      icon="mdi:shield-check-outline"
                      width="17"
                      className="
                        text-[#168BE8]
                      "
                    />

                    Secure administration
                    access
                  </div>
                ) : (
                  <div
                    className="
                      w-full

                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <p
                      className="
                        text-xs

                        text-[#6F7782]
                        dark:text-[#96AABC]
                      "
                    >
                      New to Messina
                      Gallery?
                    </p>

                    <Link
                      to="/register"
                      state={
                        requestedDestination
                          ? {
                              from:
                                requestedDestination,
                            }
                          : undefined
                      }
                      className="
                        flex
                        items-center
                        gap-2

                        text-xs
                        font-semibold

                        uppercase
                        tracking-[0.14em]

                        text-[#168BE8]
                        dark:text-[#4BB5FF]

                        hover:gap-3

                        transition-all
                        duration-300
                      "
                    >
                      Create account

                      <Icon
                        icon="mdi:arrow-right"
                        width="18"
                      />
                    </Link>
                  </div>
                )}
              </div>

              <div
                className="
                  mt-7

                  flex
                  justify-center
                  items-center
                  gap-4
                "
              >
                <span
                  className="
                    w-10
                    h-[2px]

                    bg-[#168BE8]
                  "
                />

                <span
                  className="
                    text-[9px]

                    uppercase
                    tracking-[0.35em]

                    text-[#7D8995]
                    dark:text-[#71869A]
                  "
                >
                  Messina Gallery
                </span>

                <span
                  className="
                    w-10
                    h-[2px]

                    bg-[#168BE8]
                  "
                />
              </div>
            </div>
          </div>

          <footer
            className="
              px-7
              sm:px-10
              lg:px-12

              pb-6

              flex
              justify-between
              items-center

              text-[9px]

              text-[#8A96A2]
              dark:text-[#667D91]
            "
          >
            <span>
              ©{" "}
              {new Date().getFullYear()}{" "}
              Messina Gallery. All
              rights reserved.
            </span>

            <span
              className="
                hidden
                sm:block
              "
            >
              Fine Art Platform
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;