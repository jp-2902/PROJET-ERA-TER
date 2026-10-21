import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import Navbar from "../components/Navbar";

import api, {
  API_URL,
} from "../api";

function CollectionDetailsPage() {
  const {
    id,
  } = useParams();

  const [
    collection,
    setCollection,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ============================================================
  // LOAD COLLECTION
  // ============================================================

  useEffect(() => {
    const loadCollection =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const response =
            await api.get(
              `/api/collections/${id}`
            );

          setCollection(
            response.data
              ?.collection ||
              null
          );

        } catch (
          requestError
        ) {
          console.error(
            "COLLECTION DETAILS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Collection not found."
          );

        } finally {
          setLoading(
            false
          );
        }
      };

    loadCollection();
  }, [
    id,
  ]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getImageUrl =
    (
      image
    ) => {
      if (
        !image
      ) {
        return "";
      }

      return image.startsWith(
        "http"
      )
        ? image
        : `${API_URL}${image}`;
    };

  const formatPrice =
    (
      value
    ) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-US"
      );

  const isCertified =
    (
      artwork
    ) =>
      artwork
        ?.certificate
        ?.authenticated ===
        true &&
      artwork
        ?.certificate
        ?.status ===
        "Authenticated";

  const isSold =
    (
      artwork
    ) =>
      artwork
        ?.sold ===
        true;

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading
  ) {
    return (
      <div
        className="
          min-h-screen
          bg-[#EEF7FD]
          dark:bg-[#071A2B]
        "
      >
        <Navbar />

        <div
          className="
            min-h-[650px]
            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              text-center
            "
          >
            <Icon
              icon="mdi:loading"
              width="40"
              className="
                mx-auto
                animate-spin
                text-[#168BE8]
              "
            />

            <p
              className="
                mt-4
                text-sm
                text-[#718296]
              "
            >
              Loading collection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    error ||
    !collection
  ) {
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

        <div
          className="
            min-h-[650px]
            flex
            items-center
            justify-center
            px-6
          "
        >
          <div
            className="
              max-w-[600px]
              w-full
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE9F3]
              dark:border-white/10
              p-10
              text-center
            "
          >
            <Icon
              icon="mdi:view-grid-remove-outline"
              width="50"
              className="
                mx-auto
                text-[#168BE8]
              "
            />

            <h1
              className="
                mt-5
                font-serif
                text-[38px]
              "
            >
              Collection unavailable
            </h1>

            <p
              className="
                mt-3
                text-sm
                text-[#718296]
              "
            >
              {error}
            </p>

            <Link
              to="/collections"
              className="
                mt-7
                h-12
                px-6
                inline-flex
                items-center
                gap-2
                bg-[#168BE8]
                text-white
                text-sm
                font-semibold
              "
            >
              <Icon
                icon="mdi:arrow-left"
                width="18"
              />

              Back to collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DATA
  // ============================================================

  const artworks =
    collection.artworks ||
    [];

  const artist =
    collection.artist ||
    null;

  const artistId =
    artist?._id ||
    artist;

  const coverImage =
    getImageUrl(
      collection
        .coverImage ||
      artworks?.[0]
        ?.image ||
      ""
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
      "
    >
      <Navbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          min-h-[520px]
          overflow-hidden
          bg-[#061B30]
          text-white
        "
      >
        {coverImage && (
          <img
            src={
              coverImage
            }
            alt={
              collection.name
            }
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              opacity-55
            "
          />
        )}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#041726]/95
            via-[#062A47]/75
            to-[#0A416D]/40
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
            min-h-[520px]
            flex
            items-end
          "
        >
          <div
            className="
              max-w-[760px]
            "
          >
            <Link
              to="/collections"
              className="
                inline-flex
                items-center
                gap-2
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-[#9DD8FF]
              "
            >
              <Icon
                icon="mdi:arrow-left"
                width="17"
              />

              Collections
            </Link>

            <p
              className="
                mt-8
                text-[10px]
                uppercase
                tracking-[0.28em]
                text-[#9DD8FF]
              "
            >
              Artist Collection
            </p>

            <h1
              className="
                mt-4
                font-serif
                text-[54px]
                md:text-[76px]
                leading-[0.95]
              "
            >
              {
                collection.name
              }
            </h1>

            {collection.description && (
              <p
                className="
                  mt-6
                  max-w-[650px]
                  text-sm
                  md:text-base
                  leading-7
                  text-white/75
                "
              >
                {
                  collection.description
                }
              </p>
            )}

            <div
              className="
                mt-8
                flex
                flex-wrap
                gap-4
                items-center
              "
            >
              {artistId && (
                <Link
                  to={`/artist/${artistId}`}
                  className="
                    inline-flex
                    items-center
                    gap-3
                  "
                >
                  {artist
                    ?.profileImage && (
                    <img
                      src={
                        getImageUrl(
                          artist.profileImage
                        )
                      }
                      alt={
                        collection.artistName
                      }
                      className="
                        w-11
                        h-11
                        rounded-full
                        object-cover
                        border
                        border-white/30
                      "
                    />
                  )}

                  <div>
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.15em]
                        text-white/50
                      "
                    >
                      Artist
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      {
                        collection.artistName
                      }
                    </p>
                  </div>
                </Link>
              )}

              <div
                className="
                  h-10
                  w-px
                  bg-white/20
                  hidden
                  sm:block
                "
              />

              <div>
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.15em]
                    text-white/50
                  "
                >
                  Artworks
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-semibold
                  "
                >
                  {
                    artworks.length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          COLLECTION INTRO
      ====================================================== */}

      <section
        className="
          max-w-[1250px]
          mx-auto
          px-6
          py-12
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[0.8fr_1.2fr]
            gap-8
            items-start
          "
        >
          <div>
            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.20em]
                text-[#168BE8]
              "
            >
              Artistic universe
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-[40px]
                leading-tight
              "
            >
              A collection by{" "}

              <span
                className="
                  italic
                  text-[#168BE8]
                "
              >
                {
                  collection.artistName
                }
              </span>
            </h2>
          </div>

          <div>
            <p
              className="
                text-sm
                leading-7
                text-[#718296]
                dark:text-[#A9C0D3]
              "
            >
              This collection brings together
              artworks selected and organised
              directly by the artist as part
              of a coherent artistic vision.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          ARTWORKS
      ====================================================== */}

      <main
        className="
          max-w-[1250px]
          mx-auto
          px-6
          pb-16
        "
      >
        {artworks.length ===
        0 ? (
          <div
            className="
              py-20
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE9F3]
              dark:border-white/10
              text-center
            "
          >
            <Icon
              icon="mdi:image-multiple-outline"
              width="44"
              className="
                mx-auto
                text-[#168BE8]
              "
            />

            <h2
              className="
                mt-5
                font-serif
                text-[30px]
              "
            >
              No artworks yet
            </h2>

            <p
              className="
                mt-3
                text-sm
                text-[#718296]
              "
            >
              This collection does not
              contain any published
              artwork yet.
            </p>
          </div>

        ) : (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-7
            "
          >
            {artworks.map(
              (
                artwork
              ) => {
                const sold =
                  isSold(
                    artwork
                  );

                const certified =
                  isCertified(
                    artwork
                  );

                return (
                  <article
                    key={
                      artwork._id
                    }
                    className="
                      group
                      bg-white
                      dark:bg-[#0B2238]
                      border
                      border-[#DCE9F3]
                      dark:border-white/10
                      overflow-hidden
                    "
                  >
                    <Link
                      to={`/artwork/${artwork._id}`}
                    >
                      <div
                        className="
                          relative
                          h-[380px]
                          overflow-hidden
                        "
                      >
                        <img
                          src={
                            getImageUrl(
                              artwork.image
                            )
                          }
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

                        {artwork.isOriginal && (
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
                            Original
                          </span>
                        )}

                        {certified && (
                          <span
                            className="
                              absolute
                              top-4
                              right-4
                              px-3
                              py-2
                              flex
                              items-center
                              gap-2
                              bg-[#0B5D91]/95
                              text-white
                              text-[9px]
                              uppercase
                              tracking-[0.12em]
                            "
                          >
                            <Icon
                              icon="mdi:certificate"
                              width="15"
                            />

                            Certified
                          </span>
                        )}

                        {sold && (
                          <div
                            className="
                              absolute
                              inset-0
                              flex
                              items-center
                              justify-center
                              bg-[#071A2B]/20
                            "
                          >
                            <span
                              className="
                                px-7
                                py-3
                                bg-[#071A2B]/90
                                text-white
                                text-[11px]
                                uppercase
                                tracking-[0.25em]
                                font-semibold
                              "
                            >
                              Sold
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div
                      className="
                        p-5
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.15em]
                            text-[#168BE8]
                          "
                        >
                          {
                            artwork.category
                          }
                        </p>

                        <span
                          className={`
                            text-[9px]
                            uppercase
                            tracking-[0.12em]
                            font-semibold

                            ${
                              sold
                                ? "text-[#718296]"
                                : "text-green-600"
                            }
                          `}
                        >
                          {sold
                            ? "Sold"
                            : "Available"}
                        </span>
                      </div>

                      <Link
                        to={`/artwork/${artwork._id}`}
                      >
                        <h3
                          className="
                            mt-2
                            font-serif
                            text-[25px]
                          "
                        >
                          {
                            artwork.title
                          }
                        </h3>
                      </Link>

                      <p
                        className="
                          mt-3
                          font-serif
                          text-[23px]
                          text-[#168BE8]
                        "
                      >
                        €
                        {formatPrice(
                          artwork.price
                        )}
                      </p>

                      {certified &&
                        artwork
                          .certificate
                          ?.certificateId && (
                          <Link
                            to={`/c/${artwork.certificate.certificateId}`}
                            className="
                              mt-4
                              p-3
                              flex
                              items-center
                              gap-2
                              bg-[#EDF8FE]
                              dark:bg-white/5
                              text-[10px]
                              font-semibold
                              text-[#0B5D91]
                              dark:text-[#82D1FF]
                            "
                          >
                            <Icon
                              icon="mdi:check-decagram"
                              width="16"
                            />

                            Verify certificate
                          </Link>
                        )}

                      <Link
                        to={`/artwork/${artwork._id}`}
                        className="
                          mt-5
                          h-10
                          px-4
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          border
                          border-[#168BE8]
                          text-[#168BE8]
                          text-xs
                          font-semibold
                        "
                      >
                        View artwork

                        <Icon
                          icon="mdi:arrow-right"
                          width="16"
                        />
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CollectionDetailsPage;