import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import Navbar from "../components/Navbar";

import api, {
  API_URL,
} from "../api";

// ============================================================
// CATEGORIES
// ============================================================

const categories = [
  {
    name: "Photography",
    icon: "mdi:camera-outline",
    text: "Captured moments and stories",
  },

  {
    name: "Sculpture",
    icon: "mdi:human-male",
    text: "Form, matter and expression",
  },

  {
    name: "Painting",
    icon: "mdi:palette-outline",
    text: "Colour, emotion and vision",
  },

  {
    name: "Mixed Media",
    icon: "mdi:layers-outline",
    text: "Creative artistic fusion",
  },
];

// ============================================================
// HOME
// ============================================================

function Home() {
  const navigate =
    useNavigate();

  const [
    artworks,
    setArtworks,
  ] = useState([]);

  const [
    artists,
    setArtists,
  ] = useState([]);

  const [
    loadingArtworks,
    setLoadingArtworks,
  ] = useState(true);

  const [
    loadingArtists,
    setLoadingArtists,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    favorites,
    setFavorites,
  ] = useState([]);

  // ============================================================
  // LOAD ARTWORKS
  // ============================================================

  useEffect(() => {
    const loadArtworks =
      async () => {
        try {
          const response =
            await api.get(
              "/api/artworks"
            );

          setArtworks(
            response.data
              ?.artworks ||
              []
          );
        } catch (error) {
          console.error(
            "HOME ARTWORKS ERROR:",
            error
          );
        } finally {
          setLoadingArtworks(
            false
          );
        }
      };

    loadArtworks();
  }, []);

  // ============================================================
  // LOAD ARTISTS
  // ============================================================

  useEffect(() => {
    const loadArtists =
      async () => {
        try {
          const response =
            await api.get(
              "/api/artists"
            );

          setArtists(
            response.data
              ?.artists ||
              []
          );
        } catch (error) {
          console.error(
            "HOME ARTISTS ERROR:",
            error
          );
        } finally {
          setLoadingArtists(
            false
          );
        }
      };

    loadArtists();
  }, []);

  // ============================================================
  // FEATURED DATA
  // ============================================================

  const featuredArtworks =
    useMemo(
      () =>
        artworks.slice(
          0,
          4
        ),
      [artworks]
    );

  const featuredArtists =
    useMemo(
      () =>
        artists.slice(
          0,
          5
        ),
      [artists]
    );

  // ============================================================
  // HELPERS
  // ============================================================

  const getImageUrl = (
    image
  ) => {
    if (!image) {
      return "/assets/logo.png";
    }

    if (
      image.startsWith(
        "http"
      )
    ) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  const formatPrice = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );

  const isAuthenticated =
    (artwork) =>
      artwork?.certificate
        ?.authenticated ===
        true &&
      artwork?.certificate
        ?.status ===
        "Authenticated";

  const toggleFavorite = (
    artworkId
  ) => {
    setFavorites(
      (current) =>
        current.includes(
          artworkId
        )
          ? current.filter(
              (item) =>
                item !==
                artworkId
            )
          : [
              ...current,
              artworkId,
            ]
    );
  };

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    const value =
      search.trim();

    if (!value) {
      navigate(
        "/products"
      );

      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(
        value
      )}`
    );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#F7FBFF]
        dark:bg-[#061727]
        text-[#10233D]
        dark:text-white
      "
    >
      <Navbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          min-h-[650px]
          overflow-hidden
          flex
          items-center
        "
      >
        <img
          src="/assets/art1.jpg"
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
            from-[#02192F]/98
            via-[#063B70]/88
            to-[#05294A]/40
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_70%_30%,rgba(57,169,255,0.18),transparent_40%)]
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
          <div
            className="
              max-w-[670px]
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
                mb-6
              "
            >
              <span
                className="
                  w-12
                  h-[3px]
                  rounded-full
                  bg-[#168BE8]
                "
              />

              <span
                className="
                  text-[11px]
                  uppercase
                  tracking-[0.34em]
                  text-[#55B8FF]
                  font-semibold
                "
              >
                Welcome to
              </span>
            </div>

            <h1
              className="
                font-serif
                text-[55px]
                md:text-[72px]
                xl:text-[82px]
                leading-[0.98]
                text-white
              "
            >
              Messina{" "}

              <span
                className="
                  italic
                  text-[#168BE8]
                "
              >
                Gallery
              </span>

              <span
                className="
                  text-[#F5C542]
                "
              >
                .
              </span>
            </h1>

            <h2
              className="
                mt-7
                text-[22px]
                md:text-[26px]
                font-light
                text-[#D9EBF8]
              "
            >
              Discover. Collect. Connect.
            </h2>

            <p
              className="
                mt-5
                max-w-[560px]
                text-[15px]
                md:text-[16px]
                leading-7
                text-white/75
              "
            >
              Explore unique artworks from talented artists
              around the world. Discover their stories,
              support creativity and build a collection
              that speaks to you.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                sm:flex-row
                gap-3
              "
            >
              <Link
                to="/products"
                className="
                  h-[54px]
                  px-7
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  bg-gradient-to-r
                  from-[#1677E8]
                  to-[#229BF4]
                  text-white
                  text-sm
                  font-semibold
                  shadow-[0_10px_30px_rgba(22,119,232,0.28)]
                  hover:-translate-y-1
                  transition-all
                "
              >
                Explore Gallery

                <Icon
                  icon="mdi:arrow-right"
                  width="19"
                />
              </Link>

              <Link
                to="/artists"
                className="
                  h-[54px]
                  px-7
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  border
                  border-white/35
                  bg-white/5
                  text-white
                  text-sm
                  font-semibold
                  backdrop-blur-sm
                  hover:bg-white
                  hover:text-[#0A3964]
                  transition
                "
              >
                Discover Artists

                <Icon
                  icon="mdi:account-group-outline"
                  width="20"
                />
              </Link>
            </div>

            {/* SEARCH */}

            <form
              onSubmit={
                handleSearch
              }
              className="
                mt-8
                max-w-[570px]
                h-[54px]
                flex
                items-center
                bg-white/95
                shadow-xl
              "
            >
              <Icon
                icon="mdi:magnify"
                width="21"
                className="
                  ml-5
                  text-[#168BE8]
                "
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search artworks, artists or categories..."
                className="
                  flex-1
                  min-w-0
                  px-4
                  bg-transparent
                  outline-none
                  text-sm
                  text-[#10233D]
                  placeholder:text-[#8292A2]
                "
              />

              <button
                type="submit"
                className="
                  h-full
                  px-6
                  bg-[#168BE8]
                  text-white
                  text-xs
                  font-semibold
                  hover:bg-[#1179CB]
                  transition
                "
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <section
        className="
          relative
          z-20
          max-w-[1320px]
          mx-auto
          -mt-7
          px-5
        "
      >
        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            bg-white
            dark:bg-[#0D253A]
            shadow-[0_15px_45px_rgba(14,58,103,0.12)]
            border
            border-[#E1ECF4]
            dark:border-white/10
            overflow-hidden
          "
        >
          {categories.map(
            (
              category,
              index
            ) => (
              <Link
                key={
                  category.name
                }
                to={`/products?category=${encodeURIComponent(
                  category.name
                )}`}
                className={`
                  group
                  flex
                  items-center
                  gap-4
                  px-5
                  py-6
                  hover:bg-[#F0F8FE]
                  dark:hover:bg-white/5
                  transition

                  ${
                    index <
                    categories.length -
                      1
                      ? "lg:border-r lg:border-[#E1EAF1] lg:dark:border-white/10"
                      : ""
                  }
                `}
              >
                <div
                  className="
                    w-11
                    h-11
                    rounded-full
                    bg-[#EAF6FF]
                    dark:bg-[#123C5C]
                    text-[#168BE8]
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    group-hover:scale-105
                    transition
                  "
                >
                  <Icon
                    icon={
                      category.icon
                    }
                    width="22"
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[#10233D]
                      dark:text-white
                    "
                  >
                    {
                      category.name
                    }
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      text-[#778797]
                      dark:text-[#8FA9BD]
                    "
                  >
                    {
                      category.text
                    }
                  </p>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      {/* ======================================================
          FEATURED ARTWORKS
      ====================================================== */}

      <section
        className="
          max-w-[1320px]
          mx-auto
          px-5
          py-20
        "
      >
        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-end
            justify-between
            gap-5
            mb-9
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-[#168BE8]
                font-semibold
              "
            >
              Featured artworks
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-[39px]
                md:text-[48px]
              "
            >
              Selected{" "}

              <span
                className="
                  italic
                  text-[#168BE8]
                "
              >
                for you.
              </span>
            </h2>
          </div>

          <Link
            to="/products"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-[#168BE8]
            "
          >
            View all artworks

            <Icon
              icon="mdi:arrow-right"
              width="18"
            />
          </Link>
        </div>

        {loadingArtworks ? (
          <div
            className="
              py-16
              text-center
            "
          >
            <Icon
              icon="mdi:loading"
              width="34"
              className="
                mx-auto
                animate-spin
                text-[#168BE8]
              "
            />
          </div>
        ) : featuredArtworks.length >
          0 ? (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-6
            "
          >
            {featuredArtworks.map(
              (artwork) => {
                const authenticated =
                  isAuthenticated(
                    artwork
                  );

                const artistId =
                  artwork.artist
                    ?._id ||
                  artwork.artist;

                const favorite =
                  favorites.includes(
                    artwork._id
                  );

                return (
                  <article
                    key={
                      artwork._id
                    }
                    className="
                      group
                      bg-white
                      dark:bg-[#0D253A]
                      border
                      border-[#DFEAF2]
                      dark:border-white/10
                      overflow-hidden
                      hover:-translate-y-1
                      hover:shadow-[0_20px_45px_rgba(14,58,103,0.14)]
                      transition-all
                    "
                  >
                    <div
                      className="
                        relative
                        h-[300px]
                        overflow-hidden
                        bg-[#EAF3F9]
                      "
                    >
                      <Link
                        to={`/artwork/${artwork._id}`}
                        className="
                          block
                          w-full
                          h-full
                        "
                      >
                        <img
                          src={getImageUrl(
                            artwork.image
                          )}
                          alt={
                            artwork.title
                          }
                          className="
                            w-full
                            h-full
                            object-cover
                            group-hover:scale-105
                            transition-transform
                            duration-700
                          "
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(
                            artwork._id
                          )
                        }
                        className="
                          absolute
                          top-4
                          right-4
                          w-10
                          h-10
                          rounded-full
                          bg-white/95
                          shadow-md
                          flex
                          items-center
                          justify-center
                          hover:scale-105
                          transition
                        "
                        aria-label={
                          favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Icon
                          icon={
                            favorite
                              ? "mdi:heart"
                              : "mdi:heart-outline"
                          }
                          width="20"
                          className={
                            favorite
                              ? "text-[#168BE8]"
                              : "text-[#10233D]"
                          }
                        />
                      </button>

                      <span
                        className="
                          absolute
                          left-4
                          bottom-4
                          px-3
                          py-1.5
                          bg-[#071E35]/80
                          backdrop-blur-sm
                          text-white
                          text-[9px]
                          uppercase
                          tracking-[0.15em]
                        "
                      >
                        {
                          artwork.category
                        }
                      </span>

                      {authenticated && (
                        <span
                          className="
                            absolute
                            top-4
                            left-4
                            px-3
                            py-1.5
                            flex
                            items-center
                            gap-1.5
                            bg-[#0B5D91]/95
                            text-white
                            text-[9px]
                            uppercase
                            tracking-[0.12em]
                            font-semibold
                          "
                        >
                          <Icon
                            icon="mdi:certificate"
                            width="14"
                          />

                          Certified
                        </span>
                      )}
                    </div>

                    <div
                      className="
                        p-5
                      "
                    >
                      <Link
                        to={`/artwork/${artwork._id}`}
                      >
                        <h3
                          className="
                            font-serif
                            text-[21px]
                            text-[#10233D]
                            dark:text-white
                          "
                        >
                          {
                            artwork.title
                          }
                        </h3>
                      </Link>

                      {artistId ? (
                        <Link
                          to={`/artist/${artistId}`}
                          className="
                            mt-2
                            inline-block
                            text-xs
                            text-[#778797]
                            dark:text-[#91A7B9]
                            hover:text-[#168BE8]
                            transition
                          "
                        >
                          by{" "}
                          {
                            artwork.artistName
                          }
                        </Link>
                      ) : (
                        <p
                          className="
                            mt-2
                            text-xs
                            text-[#778797]
                            dark:text-[#91A7B9]
                          "
                        >
                          by{" "}
                          {
                            artwork.artistName
                          }
                        </p>
                      )}

                      <div
                        className="
                          mt-5
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <span
                          className="
                            font-semibold
                            text-[#10233D]
                            dark:text-white
                          "
                        >
                          €
                          {formatPrice(
                            artwork.price
                          )}
                        </span>

                        <Link
                          to={`/artwork/${artwork._id}`}
                          className="
                            w-9
                            h-9
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-[#168BE8]
                            border
                            border-[#C9E1F2]
                            dark:border-white/15
                            hover:bg-[#168BE8]
                            hover:text-white
                            transition
                          "
                        >
                          <Icon
                            icon="mdi:arrow-right"
                            width="18"
                          />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div
            className="
              py-14
              text-center
              text-sm
              text-[#718296]
            "
          >
            No artworks available yet.
          </div>
        )}
      </section>

      {/* ======================================================
          ARTISTS
      ====================================================== */}

      <section
        className="
          bg-gradient-to-r
          from-[#EDF8FF]
          via-[#F7FBFF]
          to-[#EAF6FF]
          dark:from-[#081C2E]
          dark:via-[#0A2237]
          dark:to-[#071B2D]
        "
      >
        <div
          className="
            max-w-[1320px]
            mx-auto
            px-5
            py-16
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-end
              justify-between
              gap-5
              mb-9
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-[#168BE8]
                  font-semibold
                "
              >
                Meet our artists
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[38px]
                  md:text-[44px]
                "
              >
                The people behind the{" "}

                <span
                  className="
                    italic
                    text-[#168BE8]
                  "
                >
                  artworks.
                </span>
              </h2>
            </div>

            <Link
              to="/artists"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-[#168BE8]
              "
            >
              View all artists

              <Icon
                icon="mdi:arrow-right"
                width="18"
              />
            </Link>
          </div>

          {loadingArtists ? (
            <div
              className="
                py-14
                text-center
              "
            >
              <Icon
                icon="mdi:loading"
                width="32"
                className="
                  mx-auto
                  animate-spin
                  text-[#168BE8]
                "
              />
            </div>
          ) : featuredArtists.length >
            0 ? (
            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-3
                xl:grid-cols-5
                gap-6
              "
            >
              {featuredArtists.map(
                (artist) => (
                  <Link
                    key={
                      artist._id
                    }
                    to={`/artist/${artist._id}`}
                    className="
                      group
                      text-center
                      p-4
                      hover:bg-white
                      dark:hover:bg-white/5
                      transition
                    "
                  >
                    <div
                      className="
                        mx-auto
                        w-[105px]
                        h-[105px]
                        rounded-full
                        overflow-hidden
                        bg-gradient-to-br
                        from-[#168BE8]
                        to-[#72C8FF]
                        border-[5px]
                        border-white
                        dark:border-[#17344B]
                        shadow-[0_10px_30px_rgba(22,119,232,0.16)]
                      "
                    >
                      <img
                        src={getImageUrl(
                          artist.profileImage
                        )}
                        alt={
                          artist.artistName ||
                          "Artist"
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />
                    </div>

                    <p
                      className="
                        mt-4
                        text-sm
                        font-semibold
                        text-[#10233D]
                        dark:text-white
                      "
                    >
                      {artist.artistName ||
                        `${artist.firstName || ""} ${artist.lastName || ""}`}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[#168BE8]
                      "
                    >
                      {artist.specialty ||
                        "Artist"}
                    </p>

                    {(artist.city ||
                      artist.country) && (
                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-[#7F8D9B]
                          dark:text-[#91A7B9]
                        "
                      >
                        {artist.city}

                        {artist.city &&
                        artist.country
                          ? ", "
                          : ""}

                        {
                          artist.country
                        }
                      </p>
                    )}
                  </Link>
                )
              )}
            </div>
          ) : (
            <div
              className="
                py-14
                text-center
                text-sm
                text-[#718296]
              "
            >
              No artists available yet.
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          CTA
      ====================================================== */}

      <section
        className="
          bg-[#061B30]
          text-white
        "
      >
        <div
          className="
            max-w-[1000px]
            mx-auto
            px-6
            py-16
            text-center
          "
        >
          <img
            src="/assets/logo.png"
            alt="Messina Gallery"
            className="
              w-[110px]
              h-[90px]
              object-contain
              mx-auto
            "
          />

          <h2
            className="
              mt-3
              font-serif
              text-[40px]
              md:text-[50px]
            "
          >
            Art deserves to be{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              discovered.
            </span>
          </h2>

          <p
            className="
              mt-5
              max-w-[600px]
              mx-auto
              text-sm
              leading-7
              text-white/65
            "
          >
            Join Messina Gallery to
            discover artists, stories
            and original creations.
          </p>

          <div
            className="
              mt-8
              flex
              flex-col
              sm:flex-row
              justify-center
              gap-3
            "
          >
            <Link
              to="/register"
              className="
                h-[52px]
                px-7
                inline-flex
                items-center
                justify-center
                gap-2
                bg-[#168BE8]
                text-white
                font-semibold
                hover:bg-[#229BF4]
                transition
              "
            >
              Create account

              <Icon
                icon="mdi:arrow-right"
                width="18"
              />
            </Link>

            <Link
              to="/login"
              className="
                h-[52px]
                px-7
                inline-flex
                items-center
                justify-center
                border
                border-white/30
                text-white
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
    </div>
  );
}

export default Home;