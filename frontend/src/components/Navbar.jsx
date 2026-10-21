import {
  useEffect,
  useRef,
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

import {
  useCart,
} from "../context/CartContext";

import {
  API_URL,
} from "../api";

function Navbar() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    user,
    isAuthenticated,
    isCollector,
    isArtist,
    isAdmin,
    logout,
  } = useAuth();

  const {
    cartCount,
  } = useCart();

  // ============================================================
  // STATE
  // ============================================================

  const [
    darkMode,
    setDarkMode,
  ] = useState(
    () =>
      localStorage.getItem(
        "theme"
      ) === "dark"
  );

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const profileRef =
    useRef(null);

  // ============================================================
  // THEME
  // ============================================================

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
  }, [darkMode]);

  // ============================================================
  // CLOSE PROFILE MENU OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {
          setProfileOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navLinks = [
    {
      name: "Home",
      path: "/",
    },

    {
      name: "Gallery",
      path: "/products",
    },

    {
      name: "Artists",
      path: "/artists",
    },

    {
      name: "Collections",
      path: "/collections",
    },

    {
      name: "About Us",
      path: "/about",
    },
  ];

  // ============================================================
  // ACTIVE ROUTES
  // ============================================================

  const isActive = (
    path
  ) => {
    const pathname =
      location.pathname;

    if (path === "/") {
      return pathname === "/";
    }

    if (
      path === "/products"
    ) {
      return (
        pathname ===
          "/products" ||
        pathname.startsWith(
          "/artwork/"
        ) ||
        pathname.startsWith(
          "/certificate/"
        )
      );
    }

    if (
      path === "/artists"
    ) {
      return (
        pathname ===
          "/artists" ||
        pathname.startsWith(
          "/artist/"
        )
      );
    }

    if (
      path === "/collections"
    ) {
      return (
        pathname ===
        "/collections"
      );
    }

    if (
      path === "/about"
    ) {
      return [
        "/about",
        "/about-legal",
        "/terms",
        "/privacy",
        "/shipping",
        "/faq",
      ].includes(
        pathname
      );
    }

    return pathname.startsWith(
      path
    );
  };

  // ============================================================
  // PROFILE IMAGE
  // ============================================================

  const profileImage =
    user?.profileImage
      ? user.profileImage.startsWith(
          "http"
        )
        ? user.profileImage
        : `${API_URL}${user.profileImage}`
      : "";

  const initials =
    `${user?.firstName?.[0] || ""}${
      user?.lastName?.[0] || ""
    }`
      .toUpperCase()
      .trim();

  const displayInitials =
    initials || "MG";

  // ============================================================
  // PUBLIC ARTIST ID
  // ============================================================

  const currentUserId =
    user?._id ||
    user?.id ||
    "";

  // ============================================================
  // CLOSE PROFILE MENU
  // ============================================================

  const closeProfileMenu =
    () => {
      setProfileOpen(
        false
      );
    };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout =
    () => {
      logout();

      setProfileOpen(
        false
      );

      setMobileOpen(
        false
      );

      navigate("/");
    };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <header
      className="
        sticky
        top-0
        z-50
        bg-[#061B30]/95
        backdrop-blur-xl
        border-b
        border-white/10
        shadow-[0_8px_30px_rgba(0,20,45,0.16)]
      "
    >
      <div
        className="
          max-w-[1450px]
          mx-auto
          h-[86px]
          px-5
          md:px-8
          flex
          items-center
          justify-between
          gap-5
        "
      >
        {/* ======================================================
            LOGO
        ====================================================== */}

        <Link
          to="/"
          onClick={() => {
            setMobileOpen(
              false
            );

            setProfileOpen(
              false
            );
          }}
          aria-label="Messina Gallery Home"
          className="
            flex
            items-center
            justify-center
            flex-shrink-0
          "
        >
          <img
            src="/assets/logo.png"
            alt="Messina Gallery"
            className="
              w-[92px]
              h-[76px]
              object-contain
            "
          />
        </Link>

        {/* ======================================================
            DESKTOP NAVIGATION
        ====================================================== */}

        <nav
          className="
            hidden
            lg:flex
            items-center
            gap-8
            text-sm
          "
        >
          {navLinks.map(
            (link) => {
              const active =
                isActive(
                  link.path
                );

              return (
                <Link
                  key={
                    link.path
                  }
                  to={
                    link.path
                  }
                  className={`
                    relative
                    py-3
                    transition-all
                    duration-300

                    ${
                      active
                        ? `
                          text-white
                          font-semibold
                        `
                        : `
                          text-white/65
                          hover:text-white
                        `
                    }
                  `}
                >
                  {
                    link.name
                  }

                  {active && (
                    <span
                      className="
                        absolute
                        left-0
                        right-0
                        -bottom-1
                        h-[2px]
                        bg-gradient-to-r
                        from-[#39A9FF]
                        to-[#63BEFF]
                        shadow-[0_0_10px_rgba(99,190,255,0.75)]
                      "
                    />
                  )}
                </Link>
              );
            }
          )}

          {isArtist && (
            <Link
              to="/artist-studio"
              className={`
                font-semibold
                transition

                ${
                  location.pathname.startsWith(
                    "/artist-studio"
                  ) ||
                  location.pathname.startsWith(
                    "/artist-sales"
                  )
                    ? "text-white"
                    : "text-[#63BEFF] hover:text-[#9DD8FF]"
                }
              `}
            >
              Artist Studio
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`
                font-semibold
                transition

                ${
                  location.pathname.startsWith(
                    "/admin"
                  )
                    ? "text-white"
                    : "text-[#63BEFF] hover:text-[#9DD8FF]"
                }
              `}
            >
              Administration
            </Link>
          )}
        </nav>

        {/* ======================================================
            ACTIONS
        ====================================================== */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {/* ====================================================
              DARK MODE
          ==================================================== */}

          <button
            type="button"
            onClick={() =>
              setDarkMode(
                (current) =>
                  !current
              )
            }
            className="
              w-[45px]
              h-[45px]
              rounded-full
              flex
              items-center
              justify-center
              bg-gradient-to-br
              from-[#39A9FF]
              to-[#0879DF]
              text-white
              border
              border-white/30
              shadow-[0_7px_20px_rgba(8,121,223,0.35)]
              hover:scale-110
              transition-all
              duration-300
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
              width="21"
            />
          </button>

          {/* ====================================================
              CART
          ==================================================== */}

          {!isAdmin && (
            <Link
              to="/cart"
              onClick={() => {
                setMobileOpen(
                  false
                );

                setProfileOpen(
                  false
                );
              }}
              aria-label="Shopping cart"
              className="
                relative
                w-11
                h-11
                rounded-full
                flex
                items-center
                justify-center
                bg-white/8
                text-white
                border
                border-white/10
                hover:bg-white/12
                hover:text-[#63BEFF]
                transition-all
                duration-300
              "
            >
              <Icon
                icon="mdi:shopping-outline"
                width="21"
              />

              {cartCount >
                0 && (
                <span
                  className="
                    absolute
                    -top-1
                    -right-1
                    min-w-[20px]
                    h-5
                    px-1
                    rounded-full
                    bg-[#168BE8]
                    text-white
                    text-[10px]
                    font-semibold
                    flex
                    items-center
                    justify-center
                    shadow-[0_0_10px_rgba(22,139,232,0.65)]
                  "
                >
                  {
                    cartCount
                  }
                </span>
              )}
            </Link>
          )}

          {/* ====================================================
              AUTHENTICATED PROFILE
          ==================================================== */}

          {isAuthenticated ? (
            <div
              ref={
                profileRef
              }
              className="
                relative
              "
            >
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (current) =>
                      !current
                  )
                }
                className="
                  h-11
                  pl-2
                  pr-3
                  rounded-full
                  bg-white/8
                  border
                  border-white/10
                  flex
                  items-center
                  gap-2
                  text-white
                  hover:bg-white/12
                  transition
                "
                aria-label="Open profile menu"
                aria-expanded={
                  profileOpen
                }
              >
                <div
                  className="
                    w-8
                    h-8
                    rounded-full
                    overflow-hidden
                    bg-gradient-to-br
                    from-[#63BEFF]
                    to-[#168BE8]
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-semibold
                    shadow-[0_0_10px_rgba(99,190,255,0.35)]
                  "
                >
                  {profileImage ? (
                    <img
                      src={
                        profileImage
                      }
                      alt={
                        user?.firstName ||
                        "Profile"
                      }
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  ) : (
                    displayInitials
                  )}
                </div>

                <span
                  className="
                    hidden
                    md:block
                    text-xs
                  "
                >
                  {
                    user
                      ?.firstName
                  }
                </span>

                <Icon
                  icon={
                    profileOpen
                      ? "mdi:chevron-up"
                      : "mdi:chevron-down"
                  }
                  width="17"
                />
              </button>

              {/* ==================================================
                  PROFILE DROPDOWN
              ================================================== */}

              {profileOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-[280px]
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE9F3]
                    dark:border-white/10
                    shadow-[0_20px_60px_rgba(0,21,45,0.28)]
                    overflow-hidden
                    text-[#10233D]
                    dark:text-white
                  "
                >
                  <div
                    className="
                      p-5
                      bg-[#F3F9FD]
                      dark:bg-[#102A43]
                    "
                  >
                    <p
                      className="
                        font-serif
                        text-[20px]
                      "
                    >
                      {
                        user
                          ?.firstName
                      }{" "}
                      {
                        user
                          ?.lastName
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[#718296]
                        dark:text-[#A9C0D3]
                      "
                    >
                      {isAdmin
                        ? "Administrator"
                        : isArtist
                        ? "Artist"
                        : "Collector"}
                    </p>
                  </div>

                  <div
                    className="
                      p-2
                    "
                  >
                    <MenuLink
                      to="/profile"
                      icon="mdi:account-outline"
                      label="My profile"
                      onClick={
                        closeProfileMenu
                      }
                    />

                    {(isCollector ||
                      isArtist) && (
                      <MenuLink
                        to="/orders"
                        icon="mdi:package-variant-closed"
                        label="My orders"
                        onClick={
                          closeProfileMenu
                        }
                      />
                    )}

                    {isArtist && (
                      <>
                        <MenuLink
                          to="/artist-studio"
                          icon="mdi:palette-outline"
                          label="Artist Studio"
                          onClick={
                            closeProfileMenu
                          }
                        />

                        {currentUserId && (
                          <MenuLink
                            to={`/artist/${currentUserId}`}
                            icon="mdi:eye-outline"
                            label="View public profile"
                            onClick={
                              closeProfileMenu
                            }
                          />
                        )}

                        <MenuLink
                          to="/artist-sales"
                          icon="mdi:chart-line"
                          label="My sales"
                          onClick={
                            closeProfileMenu
                          }
                        />
                      </>
                    )}

                    {isAdmin && (
                      <MenuLink
                        to="/admin"
                        icon="mdi:view-dashboard-outline"
                        label="Administration"
                        onClick={
                          closeProfileMenu
                        }
                      />
                    )}

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="
                        w-full
                        px-4
                        py-3
                        flex
                        items-center
                        gap-3
                        text-sm
                        text-red-500
                        hover:bg-red-50
                        dark:hover:bg-red-950/20
                        transition
                      "
                    >
                      <Icon
                        icon="mdi:logout"
                        width="20"
                      />

                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="
                h-11
                px-5
                bg-gradient-to-r
                from-[#1677E8]
                to-[#52B6FA]
                text-white
                text-xs
                font-semibold
                flex
                items-center
                justify-center
                shadow-[0_6px_18px_rgba(22,139,232,0.28)]
                hover:shadow-[0_8px_25px_rgba(22,139,232,0.42)]
                transition
              "
            >
              Sign in
            </Link>
          )}

          {/* ====================================================
              MOBILE MENU BUTTON
          ==================================================== */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (current) =>
                  !current
              )
            }
            className="
              lg:hidden
              w-11
              h-11
              flex
              items-center
              justify-center
              text-white
              hover:text-[#63BEFF]
              transition
            "
            aria-label="Open navigation menu"
            aria-expanded={
              mobileOpen
            }
          >
            <Icon
              icon={
                mobileOpen
                  ? "mdi:close"
                  : "mdi:menu"
              }
              width="27"
            />
          </button>
        </div>
      </div>

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {mobileOpen && (
        <div
          className="
            lg:hidden
            bg-[#061B30]
            border-t
            border-white/10
            px-6
            py-5
          "
        >
          <nav
            className="
              flex
              flex-col
              gap-1
            "
          >
            {navLinks.map(
              (link) => {
                const active =
                  isActive(
                    link.path
                  );

                return (
                  <Link
                    key={
                      link.path
                    }
                    to={
                      link.path
                    }
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className={`
                      px-3
                      py-3
                      text-sm
                      transition

                      ${
                        active
                          ? `
                            bg-white/5
                            text-[#63BEFF]
                            font-semibold
                          `
                          : `
                            text-white/75
                            hover:text-white
                            hover:bg-white/5
                          `
                      }
                    `}
                  >
                    {
                      link.name
                    }
                  </Link>
                );
              }
            )}

            {isArtist && (
              <>
                <div
                  className="
                    my-2
                    border-t
                    border-white/10
                  "
                />

                <Link
                  to="/artist-studio"
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  className="
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#63BEFF]
                  "
                >
                  Artist Studio
                </Link>

                <Link
                  to="/artist-sales"
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  className="
                    px-3
                    py-3
                    text-sm
                    text-white/75
                  "
                >
                  My sales
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <div
                  className="
                    my-2
                    border-t
                    border-white/10
                  "
                />

                <Link
                  to="/admin"
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  className="
                    px-3
                    py-3
                    text-sm
                    font-semibold
                    text-[#63BEFF]
                  "
                >
                  Administration
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/register"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
                className="
                  mt-3
                  h-11
                  px-4
                  flex
                  items-center
                  justify-center
                  bg-[#168BE8]
                  text-white
                  text-xs
                  font-semibold
                "
              >
                Create account
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// ============================================================
// PROFILE MENU LINK
// ============================================================

function MenuLink({
  to,
  icon,
  label,
  onClick,
}) {
  return (
    <Link
      to={to}
      onClick={
        onClick
      }
      className="
        px-4
        py-3
        flex
        items-center
        gap-3
        text-sm
        hover:bg-[#EDF7FD]
        dark:hover:bg-white/5
        transition
      "
    >
      <Icon
        icon={icon}
        width="20"
        className="
          text-[#168BE8]
          dark:text-[#63BEFF]
        "
      />

      {label}
    </Link>
  );
}

export default Navbar;