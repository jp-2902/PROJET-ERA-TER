import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

const AboutPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const differences = [
    {
      icon: "mdi:medal-outline",
      title: "Curated Excellence",
      text: "Every artwork is carefully selected for its quality, originality and artistic value.",
    },
    {
      icon: "mdi:shield-check-outline",
      title: "Trusted Platform",
      text: "A secure environment designed for artists, collectors and art lovers.",
    },
    {
      icon: "mdi:account-group-outline",
      title: "Artist Support",
      text: "We give artists visibility, tools and opportunities to share their work worldwide.",
    },
    {
      icon: "mdi:web",
      title: "Global Community",
      text: "A community where artists and collectors connect across borders through art.",
    },
  ];

  const stats = [
    { value: "1,200+", label: "Artworks" },
    { value: "350+", label: "Artists" },
    { value: "28+", label: "Countries" },
    { value: "5,000+", label: "Collectors" },
    { value: "100%", label: "Passion" },
  ];

  return (
    <div
      className="
        min-h-screen
        bg-[#F8FBFE]
        dark:bg-[#07182A]
        text-[#10233D]
        dark:text-white
        transition-colors
        duration-500
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          fixed
          top-0
          left-0
          right-0
          z-50
          bg-[#061B30]/95
          backdrop-blur-xl
          border-b
          border-white/10
        "
      >
        <div
          className="
            max-w-[1450px]
            mx-auto
            h-[86px]
            px-5
            md:px-10
            flex
            items-center
            justify-between
          "
        >
          {/* LOGO */}

          <Link to="/" className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="Messina Gallery"
              className="
                w-[95px]
                h-[78px]
                object-contain
              "
            />
          </Link>

          {/* NAVIGATION */}

          <nav
            className="
              hidden
              lg:flex
              items-center
              gap-10
              text-[14px]
              text-white/80
            "
          >
            <Link
              to="/"
              className="hover:text-[#39A9FF] transition"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="hover:text-[#39A9FF] transition"
            >
              Gallery
            </Link>

            <Link
              to="/artists"
              className="hover:text-[#39A9FF] transition"
            >
              Artists
            </Link>

            <Link
              to="/collections"
              className="hover:text-[#39A9FF] transition"
            >
              Collections
            </Link>

            <Link
              to="/about"
              className="
                relative
                text-white
                font-medium

                after:absolute
                after:left-0
                after:-bottom-3
                after:w-full
                after:h-[2px]
                after:bg-[#168BE8]
              "
            >
              About Us
            </Link>
          </nav>

          {/* ACTIONS */}

          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                text-white
                hover:bg-white/10
                hover:text-[#39A9FF]
                transition
              "
            >
              <Icon icon="mdi:magnify" width="23" />
            </Link>

            <Link
              to="/cart"
              className="
                relative
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                text-white
                hover:bg-white/10
                hover:text-[#39A9FF]
                transition
              "
            >
              <Icon icon="mdi:cart-outline" width="23" />

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  w-5
                  h-5
                  rounded-full
                  bg-[#168BE8]
                  text-white
                  text-[10px]
                  flex
                  items-center
                  justify-center
                "
              >
                0
              </span>
            </Link>

            {/* DARK MODE */}

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
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

            <Link
              to="/login"
              className="
                hidden
                sm:flex
                w-[45px]
                h-[45px]
                rounded-full
                items-center
                justify-center
                bg-white
                text-[#168BE8]
                hover:bg-[#EAF5FD]
                hover:scale-105
                transition
              "
            >
              <Icon
                icon="mdi:account-outline"
                width="23"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          min-h-[650px]
          pt-[86px]
          overflow-hidden
          flex
          items-center
        "
      >
        <img
          src="/assets/art1.jpeg"
          alt="Messina Gallery"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#02172B]/98
            via-[#063B70]/92
            to-[#062A4C]/58
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_70%_30%,rgba(57,169,255,0.18),transparent_42%)]
          "
        />

        <div
          className="
            relative
            z-10
            max-w-[1450px]
            mx-auto
            w-full
            px-6
            md:px-10
            py-20
          "
        >
          <div className="max-w-[620px]">

            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[3px] bg-[#168BE8]" />

              <span
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.34em]
                  text-[#55B8FF]
                  font-semibold
                "
              >
                About us
              </span>
            </div>

            <h1
              className="
                font-serif
                text-[56px]
                md:text-[72px]
                leading-[0.98]
                text-white
              "
            >
              About

              <br />

              <span className="italic text-[#39A9FF]">
                Messina Gallery
              </span>

              <span className="text-white">
                .
              </span>
            </h1>

            <p
              className="
                mt-7
                max-w-[570px]
                text-[16px]
                leading-8
                text-white/80
              "
            >
              Messina Gallery is more than an art platform.
              We are a community of art lovers, collectors and
              artists united by a passion for creativity,
              beauty and authenticity.
            </p>

            <div
              className="
                mt-10
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-6
              "
            >
              <div className="flex items-center gap-3">
                <Icon
                  icon="mdi:shield-check-outline"
                  width="27"
                  className="text-[#39A9FF]"
                />

                <div>
                  <p className="text-sm text-white">
                    Authenticity
                  </p>
                  <p className="text-[10px] text-white/50 mt-1">
                    Verified artworks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon
                  icon="mdi:account-group-outline"
                  width="27"
                  className="text-[#39A9FF]"
                />

                <div>
                  <p className="text-sm text-white">
                    Community
                  </p>
                  <p className="text-[10px] text-white/50 mt-1">
                    Artists & collectors
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon
                  icon="mdi:web"
                  width="27"
                  className="text-[#39A9FF]"
                />

                <div>
                  <p className="text-sm text-white">
                    Worldwide
                  </p>
                  <p className="text-[10px] text-white/50 mt-1">
                    Art without borders
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          OUR STORY
      ====================================================== */}

      <section
        className="
          py-24
          bg-white
          dark:bg-[#0A1C2B]
        "
      >
        <div
          className="
            max-w-[1320px]
            mx-auto
            px-6

            grid
            grid-cols-1
            lg:grid-cols-[1fr_1fr_320px]
            gap-12
            items-center
          "
        >
          {/* IMAGE */}

          <div
            className="
              p-3
              border
              border-[#B8DDF5]
              dark:border-[#168BE8]/30
              rounded-xl
            "
          >
            <img
              src="/assets/art2.jpeg"
              alt="Messina Gallery story"
              className="
                w-full
                h-[420px]
                object-cover
                rounded-lg
              "
            />
          </div>

          {/* STORY */}

          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-[2px] bg-[#168BE8]" />

              <span
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.28em]
                  text-[#168BE8]
                  font-semibold
                "
              >
                Our story
              </span>
            </div>

            <h2
              className="
                font-serif
                text-[42px]
                leading-tight
                text-[#10233D]
                dark:text-white
              "
            >
              A passion for art,

              <br />

              <span className="italic text-[#168BE8]">
                a vision for the future.
              </span>
            </h2>

            <p
              className="
                mt-6
                text-sm
                leading-7
                text-[#6F7782]
                dark:text-[#9BB0C1]
              "
            >
              Messina Gallery was created with the belief that
              art has the power to inspire, transform and connect
              people across cultures.
            </p>

            <p
              className="
                mt-4
                text-sm
                leading-7
                text-[#6F7782]
                dark:text-[#9BB0C1]
              "
            >
              Our platform connects exceptional artists with
              collectors and art lovers around the world while
              giving every creation the space and story it deserves.
            </p>

            <p
              className="
                mt-4
                text-sm
                leading-7
                text-[#6F7782]
                dark:text-[#9BB0C1]
              "
            >
              We celebrate diversity in art and support creators
              at every stage of their journey.
            </p>

            <div className="mt-8 flex items-center gap-5">
              <span className="w-16 h-[1px] bg-[#168BE8]" />

              <span
                className="
                  font-serif
                  italic
                  text-[20px]
                  text-[#168BE8]
                "
              >
                The Messina Gallery Team
              </span>
            </div>
          </div>

          {/* MISSION */}

          <div
            className="
              bg-gradient-to-br
              from-[#F2F9FE]
              to-[#EAF5FD]

              dark:from-[#102A40]
              dark:to-[#0C2235]

              p-9
              min-h-[360px]

              flex
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.26em]
                font-semibold
                text-[#168BE8]
              "
            >
              Our mission
            </span>

            <Icon
              icon="mdi:bank-outline"
              width="52"
              className="mt-7 text-[#168BE8]"
            />

            <p
              className="
                mt-7
                text-sm
                leading-7
                text-[#586C7D]
                dark:text-[#A6BDCF]
              "
            >
              To make original art accessible to everyone,
              support artists and build lasting connections
              through trust, passion and excellence.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          DIFFERENCES
      ====================================================== */}

      <section
        className="
          py-20
          bg-[#F5FAFE]
          dark:bg-[#071521]
        "
      >
        <div className="max-w-[1320px] mx-auto px-6">

          <div className="flex items-center justify-center gap-3 mb-12">
            <span className="w-10 h-[2px] bg-[#168BE8]" />

            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.28em]
                text-[#168BE8]
                font-semibold
              "
            >
              What makes us different
            </span>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-8
            "
          >
            {differences.map((item) => (
              <div
                key={item.title}
                className="
                  p-6

                  bg-white
                  dark:bg-[#0D253A]

                  border
                  border-[#DCEAF4]
                  dark:border-white/10

                  hover:-translate-y-1
                  hover:shadow-[0_15px_35px_rgba(22,119,232,0.10)]

                  transition-all
                  duration-300
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-[#EAF6FF]
                    dark:bg-[#123C5C]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Icon
                    icon={item.icon}
                    width="27"
                    className="text-[#168BE8]"
                  />
                </div>

                <h3
                  className="
                    mt-5
                    text-sm
                    font-semibold
                    text-[#10233D]
                    dark:text-white
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-3
                    text-xs
                    leading-6
                    text-[#6F7782]
                    dark:text-[#9BB0C1]
                  "
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section
        className="
          py-14

          bg-gradient-to-r
          from-[#EAF5FD]
          via-[#F8FBFE]
          to-[#EAF5FD]

          dark:from-[#0B2235]
          dark:via-[#0D2538]
          dark:to-[#081E30]
        "
      >
        <div className="max-w-[1200px] mx-auto px-6">

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="w-8 h-[2px] bg-[#168BE8]" />

            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.28em]
                font-semibold
                text-[#168BE8]
              "
            >
              By the numbers
            </span>

            <span className="w-8 h-[2px] bg-[#168BE8]" />
          </div>

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-5
            "
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`
                  text-center
                  py-4

                  ${
                    index < stats.length - 1
                      ? "md:border-r md:border-[#C9DDEB] md:dark:border-white/10"
                      : ""
                  }
                `}
              >
                <p
                  className="
                    font-serif
                    text-[38px]
                    text-[#10233D]
                    dark:text-white
                  "
                >
                  {stat.value}
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-[#6F7782]
                    dark:text-[#9BB0C1]
                  "
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTORS / ARTISTS
      ====================================================== */}

      <section
        className="
          py-20
          bg-white
          dark:bg-[#081A29]
        "
      >
        <div
          className="
            max-w-[1250px]
            mx-auto
            px-6

            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >
          {/* COLLECTORS */}

          <div
            className="
              relative
              min-h-[350px]
              overflow-hidden
            "
          >
            <img
              src="/assets/art3.jpeg"
              alt="Collectors"
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />

            <div
              className="
                absolute
                inset-0

                bg-gradient-to-r
                from-[#02172B]/98
                via-[#063B70]/92
                to-[#063B70]/45
              "
            />

            <div
              className="
                relative
                z-10
                p-10
                max-w-[430px]
              "
            >
              <span
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.25em]
                  text-[#55B8FF]
                  font-semibold
                "
              >
                For collectors
              </span>

              <div className="mt-5 w-10 h-[2px] bg-[#168BE8]" />

              <p
                className="
                  mt-7
                  text-[18px]
                  leading-8
                  text-white
                "
              >
                Discover unique artworks and build a collection
                that reflects your taste, your story and your world.
              </p>

              <Link
                to="/products"
                className="
                  mt-8
                  inline-flex
                  items-center
                  gap-3

                  text-sm
                  font-semibold
                  text-[#39A9FF]

                  hover:gap-5
                  transition-all
                "
              >
                Explore the Gallery

                <Icon
                  icon="mdi:arrow-right"
                  width="20"
                />
              </Link>
            </div>
          </div>

          {/* ARTISTS */}

          <div
            className="
              relative
              min-h-[350px]
              overflow-hidden
            "
          >
            <img
              src="/assets/art4.jpeg"
              alt="Artists"
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />

            <div
              className="
                absolute
                inset-0

                bg-gradient-to-r
                from-[#02172B]/98
                via-[#063B70]/92
                to-[#063B70]/45
              "
            />

            <div
              className="
                relative
                z-10
                p-10
                max-w-[430px]
              "
            >
              <span
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.25em]
                  text-[#55B8FF]
                  font-semibold
                "
              >
                For artists
              </span>

              <div className="mt-5 w-10 h-[2px] bg-[#168BE8]" />

              <p
                className="
                  mt-7
                  text-[18px]
                  leading-8
                  text-white
                "
              >
                Join our global community and share your art
                with collectors who value creativity,
                originality and authenticity.
              </p>

              <Link
                to="/register"
                className="
                  mt-8
                  inline-flex
                  items-center
                  gap-3

                  text-sm
                  font-semibold
                  text-[#39A9FF]

                  hover:gap-5
                  transition-all
                "
              >
                Join as an Artist

                <Icon
                  icon="mdi:arrow-right"
                  width="20"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section
        className="
          relative
          py-16
          bg-[#061B30]
          overflow-hidden
          text-white
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_50%_20%,rgba(57,169,255,0.14),transparent_50%)]
          "
        />

        <div
          className="
            relative
            z-10

            max-w-[1200px]
            mx-auto
            px-6

            flex
            flex-col
            lg:flex-row

            items-center
            justify-between
            gap-8
          "
        >
          <div className="flex items-center gap-7">

            <img
              src="/assets/logo.png"
              alt="Messina Gallery"
              className="
                w-[110px]
                h-[110px]
                object-contain
              "
            />

            <div
              className="
                hidden
                sm:block
                w-[1px]
                h-14
                bg-[#168BE8]
              "
            />

            <h2
              className="
                font-serif
                text-[34px]
                md:text-[42px]
              "
            >
              Be part of{" "}

              <span className="italic text-[#39A9FF]">
                our art community.
              </span>
            </h2>
          </div>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-4
            "
          >
            <Link
              to="/register"
              className="
                h-[54px]
                px-8
                flex
                items-center
                justify-center
                gap-3

                bg-gradient-to-r
                from-[#1677E8]
                to-[#269AF1]

                text-white
                text-xs
                uppercase
                tracking-[0.16em]

                hover:-translate-y-1
                transition-all
              "
            >
              Create an account

              <Icon
                icon="mdi:arrow-right"
                width="18"
              />
            </Link>

            <Link
              to="/login"
              className="
                h-[54px]
                px-8

                flex
                items-center
                justify-center

                border
                border-white/50

                text-xs
                uppercase
                tracking-[0.16em]

                hover:bg-white
                hover:text-[#061B30]

                transition
              "
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className="
          bg-[#03111D]
          text-white
          border-t
          border-[#168BE8]/20
        "
      >
        <div
          className="
            max-w-[1320px]
            mx-auto
            px-6
            py-12
          "
        >
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-5
              gap-10
            "
          >
            {/* BRAND */}

            <div>
              <img
                src="/assets/logo.png"
                alt="Messina Gallery"
                className="
                  w-[120px]
                  h-[120px]
                  object-contain
                "
              />

              <p
                className="
                  mt-4
                  text-xs
                  text-white/50
                  leading-6
                "
              >
                © {new Date().getFullYear()} Messina Gallery.
                <br />
                All rights reserved.
              </p>
            </div>

            {/* EXPLORE */}

            <div>
              <h3
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-[#39A9FF]
                  mb-5
                "
              >
                Explore
              </h3>

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  text-sm
                  text-white/60
                "
              >
                <Link to="/products" className="hover:text-[#39A9FF]">
                  Gallery
                </Link>

                <Link to="/artists" className="hover:text-[#39A9FF]">
                  Artists
                </Link>

                <Link to="/collections" className="hover:text-[#39A9FF]">
                  Collections
                </Link>

                <Link to="/about" className="hover:text-[#39A9FF]">
                  About Us
                </Link>
              </div>
            </div>

            {/* ACCOUNT */}

            <div>
              <h3
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-[#39A9FF]
                  mb-5
                "
              >
                Account
              </h3>

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  text-sm
                  text-white/60
                "
              >
                <Link to="/login" className="hover:text-[#39A9FF]">
                  Sign In
                </Link>

                <Link to="/register" className="hover:text-[#39A9FF]">
                  Create Account
                </Link>

                <Link to="/cart" className="hover:text-[#39A9FF]">
                  Cart
                </Link>

                <Link to="/favorites" className="hover:text-[#39A9FF]">
                  My Favorites
                </Link>
              </div>
            </div>

            {/* INFORMATION */}

            <div>
              <h3
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-[#39A9FF]
                  mb-5
                "
              >
                Information
              </h3>

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  text-sm
                  text-white/60
                "
              >
                <Link to="/terms" className="hover:text-[#39A9FF]">
                  Terms of Service
                </Link>

                <Link to="/privacy" className="hover:text-[#39A9FF]">
                  Privacy Policy
                </Link>

                <Link to="/shipping" className="hover:text-[#39A9FF]">
                  Shipping & Returns
                </Link>

                <Link to="/faq" className="hover:text-[#39A9FF]">
                  FAQs
                </Link>
              </div>
            </div>

            {/* SOCIAL */}

            <div>
              <h3
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-[#39A9FF]
                  mb-5
                "
              >
                Follow us
              </h3>

              <div className="flex gap-3">
                {[
                  "mdi:instagram",
                  "mdi:facebook",
                  "mdi:twitter",
                  "mdi:pinterest",
                ].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="
                      w-10
                      h-10
                      rounded-full

                      border
                      border-white/30

                      flex
                      items-center
                      justify-center

                      hover:bg-[#168BE8]
                      hover:border-[#168BE8]

                      transition
                    "
                  >
                    <Icon
                      icon={icon}
                      width="19"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AboutPage;