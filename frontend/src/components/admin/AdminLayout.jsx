import {
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import {
  useAuth,
} from "../../context/AuthContext";

// ============================================================
// ADMIN NAVIGATION
// ============================================================

const adminLinks = [
  {
    label:
      "Dashboard",

    path:
      "/admin",

    icon:
      "mdi:view-dashboard-outline",

    end:
      true,
  },

  {
    label:
      "Users",

    path:
      "/admin/users",

    icon:
      "mdi:account-group-outline",
  },

  {
    label:
      "Artists",

    path:
      "/admin/artists",

    icon:
      "mdi:palette-outline",
  },

  {
    label:
      "Artworks",

    path:
      "/admin/artworks",

    icon:
      "mdi:image-multiple-outline",
  },

  {
    label:
      "Orders",

    path:
      "/admin/orders",

    icon:
      "mdi:package-variant-closed",
  },

  {
    label:
      "Support",

    path:
      "/admin/support",

    icon:
      "mdi:headset",
  },
];

// ============================================================
// ADMIN LAYOUT
// ============================================================

function AdminLayout({
  title,
  eyebrow =
    "Messina Gallery",
  children,
}) {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  // ==========================================================
  // ADMIN NAME
  // ==========================================================

  const adminName =
    `${
      user?.firstName ||
      ""
    } ${
      user?.lastName ||
      ""
    }`
      .trim() ||
    "Administrator";

  const adminInitial =
    user?.firstName
      ?.charAt(0)
      ?.toUpperCase() ||
    "A";

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    () => {
      logout();

      setMobileMenuOpen(
        false
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  // ==========================================================
  // CLOSE MOBILE
  // ==========================================================

  const closeMobileMenu =
    () => {
      setMobileMenuOpen(
        false
      );
    };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="
        min-h-screen

        bg-[#F4F8FC]
        dark:bg-[#071A2B]

        text-[#10233D]
        dark:text-white
      "
    >
      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className="
          hidden
          lg:flex

          fixed
          left-0
          top-0
          bottom-0

          w-[270px]

          bg-gradient-to-b
          from-[#061B30]
          via-[#072943]
          to-[#061B30]

          text-white

          border-r
          border-white/10

          flex-col

          z-50
        "
      >
        {/* LOGO */}

        <div
          className="
            h-[110px]

            px-6

            flex
            items-center

            border-b
            border-white/10
          "
        >
          <Link
            to="/admin"
            className="
              w-full

              flex
              items-center
              gap-3
            "
          >
            <img
              src="/assets/logo.png"
              alt="Messina Gallery"
              className="
                w-[64px]
                h-[64px]

                object-contain

                flex-shrink-0
              "
            />

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  font-serif

                  text-[17px]

                  tracking-[0.08em]
                "
              >
                MESSINA
              </p>

              <p
                className="
                  mt-1

                  text-[8px]

                  uppercase
                  tracking-[0.25em]

                  text-[#75C8FF]
                "
              >
                Administration
              </p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}

        <nav
          className="
            flex-1

            px-4
            py-7

            space-y-2
          "
        >
          {adminLinks.map(
            (
              item
            ) => (
              <AdminNavLink
                key={
                  item.path
                }
                {...item}
              />
            )
          )}

          <div
            className="
              my-5

              border-t
              border-white/10
            "
          />

          <Link
            to="/"
            className="
              min-h-[50px]

              px-4

              flex
              items-center
              gap-3

              text-sm

              text-white/60

              hover:text-white
              hover:bg-white/5

              transition
            "
          >
            <Icon
              icon="mdi:storefront-outline"
              width="20"
            />

            View Gallery
          </Link>
        </nav>

        {/* PROFILE */}

        <div
          className="
            p-5

            border-t
            border-white/10
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-10
                h-10

                rounded-full

                flex
                items-center
                justify-center

                bg-gradient-to-br
                from-[#168BE8]
                to-[#63BEFF]

                text-white

                text-sm
                font-semibold

                flex-shrink-0
              "
            >
              {adminInitial}
            </div>

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  text-sm
                  font-semibold

                  truncate
                "
              >
                {adminName}
              </p>

              <p
                className="
                  mt-0.5

                  text-[9px]

                  uppercase
                  tracking-[0.15em]

                  text-[#75C8FF]
                "
              >
                Administrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              mt-5

              w-full
              h-11

              flex
              items-center
              justify-center
              gap-2

              border
              border-white/10

              text-xs

              text-white/70

              hover:bg-white/5
              hover:text-white

              transition
            "
          >
            <Icon
              icon="mdi:logout"
              width="18"
            />

            Sign out
          </button>
        </div>
      </aside>

      {/* ======================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="
            lg:hidden

            fixed
            inset-0

            z-[70]

            bg-black/45
            backdrop-blur-sm
          "
          onClick={
            closeMobileMenu
          }
          aria-hidden="true"
        />
      )}

      {/* ======================================================
          MOBILE SIDEBAR
      ====================================================== */}

      <aside
        className={`
          lg:hidden

          fixed
          left-0
          top-0
          bottom-0

          z-[80]

          w-[285px]

          bg-gradient-to-b
          from-[#061B30]
          via-[#072943]
          to-[#061B30]

          text-white

          flex
          flex-col

          transition-transform
          duration-300

          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* MOBILE LOGO */}

        <div
          className="
            h-[95px]

            px-5

            flex
            items-center
            justify-between

            border-b
            border-white/10
          "
        >
          <Link
            to="/admin"
            onClick={
              closeMobileMenu
            }
            className="
              flex
              items-center
              gap-2
            "
          >
            <img
              src="/assets/logo.png"
              alt="Messina Gallery"
              className="
                w-[58px]
                h-[58px]

                object-contain
              "
            />

            <div>
              <p
                className="
                  font-serif

                  text-[16px]
                "
              >
                MESSINA
              </p>

              <p
                className="
                  text-[8px]

                  uppercase
                  tracking-[0.18em]

                  text-[#75C8FF]
                "
              >
                Administration
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={
              closeMobileMenu
            }
            className="
              w-10
              h-10

              flex
              items-center
              justify-center

              text-white/70

              hover:text-white
            "
            aria-label="Close menu"
          >
            <Icon
              icon="mdi:close"
              width="25"
            />
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        <nav
          className="
            flex-1

            px-4
            py-6

            space-y-2
          "
        >
          {adminLinks.map(
            (
              item
            ) => (
              <AdminNavLink
                key={
                  item.path
                }
                {...item}
                onClick={
                  closeMobileMenu
                }
              />
            )
          )}

          <div
            className="
              my-5

              border-t
              border-white/10
            "
          />

          <Link
            to="/"
            onClick={
              closeMobileMenu
            }
            className="
              min-h-[50px]

              px-4

              flex
              items-center
              gap-3

              text-sm

              text-white/60

              hover:text-white
              hover:bg-white/5
            "
          >
            <Icon
              icon="mdi:storefront-outline"
              width="20"
            />

            View Gallery
          </Link>
        </nav>

        {/* MOBILE PROFILE */}

        <div
          className="
            p-5

            border-t
            border-white/10
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-10
                h-10

                rounded-full

                flex
                items-center
                justify-center

                bg-[#168BE8]

                font-semibold
              "
            >
              {adminInitial}
            </div>

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  text-sm
                  font-semibold

                  truncate
                "
              >
                {adminName}
              </p>

              <p
                className="
                  text-[9px]

                  uppercase
                  tracking-[0.14em]

                  text-[#75C8FF]
                "
              >
                Administrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              mt-5

              w-full
              h-11

              flex
              items-center
              justify-center
              gap-2

              border
              border-white/10

              text-xs

              text-white/70
            "
          >
            <Icon
              icon="mdi:logout"
              width="18"
            />

            Sign out
          </button>
        </div>
      </aside>

      {/* ======================================================
          MAIN AREA
      ====================================================== */}

      <div
        className="
          min-h-screen

          lg:ml-[270px]
        "
      >
        {/* ====================================================
            TOP HEADER
        ==================================================== */}

        <header
          className="
            sticky
            top-0

            z-40

            min-h-[88px]

            px-5
            md:px-8

            flex
            items-center
            justify-between
            gap-4

            bg-white/95
            dark:bg-[#0B2238]/95

            backdrop-blur-xl

            border-b
            border-[#DCE7EF]
            dark:border-white/10
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  true
                )
              }
              className="
                lg:hidden

                w-11
                h-11

                flex
                items-center
                justify-center

                bg-[#EDF7FD]
                dark:bg-white/5

                text-[#168BE8]
              "
              aria-label="Open administration menu"
            >
              <Icon
                icon="mdi:menu"
                width="25"
              />
            </button>

            {/* TITLE */}

            <div>
              <p
                className="
                  text-[8px]
                  sm:text-[9px]

                  uppercase
                  tracking-[0.20em]

                  text-[#168BE8]
                "
              >
                {eyebrow}
              </p>

              <h1
                className="
                  mt-1

                  font-serif

                  text-[23px]
                  sm:text-[29px]
                "
              >
                {title}
              </h1>
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <Link
              to="/"
              className="
                hidden
                md:inline-flex

                h-11

                px-4

                items-center
                justify-center
                gap-2

                border
                border-[#D3E1EB]
                dark:border-white/10

                text-xs

                hover:border-[#168BE8]
                hover:text-[#168BE8]

                transition
              "
            >
              <Icon
                icon="mdi:open-in-new"
                width="17"
              />

              View website
            </Link>

            <div
              className="
                h-11

                px-3
                sm:px-4

                flex
                items-center
                gap-3

                bg-[#EEF7FD]
                dark:bg-white/5
              "
            >
              <div
                className="
                  w-7
                  h-7

                  rounded-full

                  flex
                  items-center
                  justify-center

                  bg-[#168BE8]

                  text-white

                  text-[10px]
                  font-semibold
                "
              >
                {adminInitial}
              </div>

              <span
                className="
                  hidden
                  sm:block

                  max-w-[160px]

                  text-xs
                  font-semibold

                  truncate
                "
              >
                {adminName}
              </span>
            </div>
          </div>
        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main
          className="
            px-5
            md:px-8
            xl:px-10

            py-8
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN NAV LINK
// ============================================================

function AdminNavLink({
  path,
  label,
  icon,
  end = false,
  onClick,
}) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={
        onClick
      }
      className={({
        isActive,
      }) => `
        min-h-[50px]

        px-4

        flex
        items-center
        gap-3

        text-sm

        transition-all
        duration-200

        ${
          isActive
            ? `
              bg-[#168BE8]

              text-white

              shadow-[0_8px_20px_rgba(22,139,232,0.22)]
            `
            : `
              text-white/65

              hover:text-white
              hover:bg-white/5
            `
        }
      `}
    >
      <Icon
        icon={icon}
        width="20"
      />

      <span>
        {label}
      </span>
    </NavLink>
  );
}

export default AdminLayout;