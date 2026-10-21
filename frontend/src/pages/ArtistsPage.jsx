import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import Navbar from "../components/Navbar";

import api, {
  API_URL,
} from "../api";

function ArtistsPage() {
  const [
    artists,
    setArtists,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ============================================================
  // LOAD ARTISTS
  // ============================================================

  useEffect(() => {
    const loadArtists =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/api/artists"
            );

          setArtists(
            response.data
              ?.artists || []
          );
        } catch (requestError) {
          console.error(
            "ARTISTS PAGE ERROR:",
            requestError
          );

          setError(
            "Unable to load artists."
          );
        } finally {
          setLoading(false);
        }
      };

    loadArtists();
  }, []);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredArtists =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return artists;
      }

      return artists.filter(
        (artist) => {
          const text =
            `
              ${artist.artistName || ""}
              ${artist.firstName || ""}
              ${artist.lastName || ""}
              ${artist.country || ""}
              ${artist.city || ""}
              ${artist.specialty || ""}
              ${artist.artistCode || ""}
            `.toLowerCase();

          return text.includes(
            query
          );
        }
      );
    }, [
      artists,
      search,
    ]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getArtistName = (
    artist
  ) => {
    if (
      artist.artistName
    ) {
      return artist.artistName;
    }

    const fullName =
      `${artist.firstName || ""} ${artist.lastName || ""}`
        .trim();

    return (
      fullName ||
      "Messina Gallery Artist"
    );
  };

  const getArtistImage = (
    artist
  ) => {
    if (
      !artist.profileImage
    ) {
      return "/assets/logo.png";
    }

    if (
      artist.profileImage.startsWith(
        "http"
      )
    ) {
      return artist.profileImage;
    }

    return `${API_URL}${artist.profileImage}`;
  };

  const getLocation = (
    artist
  ) => {
    if (
      artist.city &&
      artist.country
    ) {
      return `${artist.city}, ${artist.country}`;
    }

    return (
      artist.city ||
      artist.country ||
      ""
    );
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
      "
    >
      <Navbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          bg-gradient-to-br
          from-[#061B30]
          via-[#0A416D]
          to-[#1479B9]
          text-white
        "
      >
        <div
          className="
            max-w-[1250px]
            mx-auto
            px-6
            py-16
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.28em]
              text-[#9DD8FF]
            "
          >
            Messina Gallery Artists
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[52px]
              md:text-[68px]
              leading-tight
            "
          >
            Meet the{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              artists.
            </span>
          </h1>

          <p
            className="
              mt-5
              max-w-[620px]
              text-sm
              leading-7
              text-white/70
            "
          >
            Discover the artists
            registered on Messina
            Gallery and explore their
            public portfolios and
            artworks.
          </p>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main
        className="
          max-w-[1250px]
          mx-auto
          px-6
          py-12
        "
      >
        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div
          className="
            max-w-[650px]
            mx-auto
            flex
            items-center
            px-4
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
          "
        >
          <Icon
            icon="mdi:magnify"
            width="21"
            className="
              text-[#168BE8]
              mr-3
            "
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search artists..."
            className="
              w-full
              py-4
              bg-transparent
              outline-none
              text-sm
            "
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
              className="
                text-[#718296]
                hover:text-[#168BE8]
                transition
              "
            >
              <Icon
                icon="mdi:close-circle-outline"
                width="20"
              />
            </button>
          )}
        </div>

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div
            className="
              py-20
              text-center
            "
          >
            <Icon
              icon="mdi:loading"
              width="35"
              className="
                mx-auto
                animate-spin
                text-[#168BE8]
              "
            />
          </div>
        )}

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mt-8
              p-4
              bg-red-50
              dark:bg-red-950/20
              text-red-600
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          filteredArtists.length ===
            0 && (
            <div
              className="
                mt-12
                py-16
                text-center
                bg-white
                dark:bg-[#0B2238]
                border
                border-[#DCE9F3]
                dark:border-white/10
              "
            >
              <Icon
                icon="mdi:account-search-outline"
                width="42"
                className="
                  mx-auto
                  text-[#168BE8]
                "
              />

              <h2
                className="
                  mt-4
                  font-serif
                  text-[31px]
                "
              >
                No artists found.
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-[#718296]
                "
              >
                Try another name,
                country or specialty.
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="
                    mt-5
                    h-11
                    px-5
                    bg-[#168BE8]
                    text-white
                    text-xs
                    font-semibold
                  "
                >
                  Show all artists
                </button>
              )}
            </div>
          )}

        {/* ====================================================
            ARTIST GRID
        ==================================================== */}

        {!loading &&
          !error &&
          filteredArtists.length >
            0 && (
            <div
              className="
                mt-12
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-7
              "
            >
              {filteredArtists.map(
                (artist) => {
                  const artistName =
                    getArtistName(
                      artist
                    );

                  const location =
                    getLocation(
                      artist
                    );

                  return (
                    <Link
                      key={artist._id}
                      to={`/artist/${artist._id}`}
                      className="
                        group
                        bg-white
                        dark:bg-[#0B2238]
                        border
                        border-[#DCE9F3]
                        dark:border-white/10
                        overflow-hidden
                        hover:-translate-y-1
                        hover:shadow-[0_18px_40px_rgba(23,84,126,0.12)]
                        transition-all
                        duration-500
                      "
                    >
                      {/* IMAGE */}

                      <div
                        className="
                          relative
                          h-[310px]
                          overflow-hidden
                          bg-[#DCEAF3]
                        "
                      >
                        <img
                          src={
                            getArtistImage(
                              artist
                            )
                          }
                          alt={artistName}
                          className="
                            w-full
                            h-full
                            object-cover
                            group-hover:scale-105
                            transition-transform
                            duration-700
                          "
                        />

                        <div
                          className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-[#031B31]/40
                            via-transparent
                            to-transparent
                          "
                        />

                        {artist.artistCode && (
                          <span
                            className="
                              absolute
                              top-4
                              left-4
                              px-3
                              py-1.5
                              bg-white/95
                              text-[#0A416D]
                              text-[9px]
                              uppercase
                              tracking-[0.14em]
                              font-semibold
                            "
                          >
                            Verified artist
                          </span>
                        )}
                      </div>

                      {/* INFO */}

                      <div
                        className="
                          p-6
                        "
                      >
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >
                          <div>
                            <h2
                              className="
                                font-serif
                                text-[25px]
                                leading-tight
                              "
                            >
                              {artistName}
                            </h2>

                            <p
                              className="
                                mt-2
                                text-sm
                                text-[#168BE8]
                              "
                            >
                              {artist.specialty ||
                                "Artist"}
                            </p>
                          </div>

                          <Icon
                            icon="mdi:check-decagram"
                            width="18"
                            className="
                              mt-1
                              flex-shrink-0
                              text-[#168BE8]
                            "
                          />
                        </div>

                        {location && (
                          <p
                            className="
                              mt-3
                              flex
                              items-center
                              gap-1.5
                              text-xs
                              text-[#718296]
                              dark:text-[#A9C0D3]
                            "
                          >
                            <Icon
                              icon="mdi:map-marker-outline"
                              width="15"
                            />

                            {location}
                          </p>
                        )}

                        <div
                          className="
                            mt-5
                            pt-4
                            border-t
                            border-[#E3EDF4]
                            dark:border-white/10
                            flex
                            justify-between
                            items-center
                          "
                        >
                          <span
                            className="
                              text-xs
                              text-[#718296]
                              dark:text-[#A9C0D3]
                            "
                          >
                            {Number(
                              artist.artworkCount ||
                                0
                            )}{" "}
                            artwork
                            {Number(
                              artist.artworkCount ||
                                0
                            ) !== 1
                              ? "s"
                              : ""}
                          </span>

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                              text-xs
                              font-semibold
                              text-[#168BE8]
                            "
                          >
                            View portfolio

                            <Icon
                              icon="mdi:arrow-right"
                              width="16"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          )}
      </main>
    </div>
  );
}

export default ArtistsPage;