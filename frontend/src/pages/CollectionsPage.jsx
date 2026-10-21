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

function CollectionsPage() {
  const [
    collections,
    setCollections,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    newsletterEmail,
    setNewsletterEmail,
  ] = useState("");

  const [
    newsletterMessage,
    setNewsletterMessage,
  ] = useState("");

  // ============================================================
  // LOAD COLLECTIONS
  // ============================================================

  useEffect(() => {
    const loadCollections =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const response =
            await api.get(
              "/api/collections"
            );

          setCollections(
            response.data
              ?.collections ||
              []
          );

        } catch (
          requestError
        ) {
          console.error(
            "COLLECTIONS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load collections."
          );

        } finally {
          setLoading(
            false
          );
        }
      };

    loadCollections();
  }, []);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredCollections =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return collections;
        }

        return collections.filter(
          (
            collection
          ) => {
            const text =
              `
                ${collection.name || ""}
                ${collection.description || ""}
                ${collection.artistName || ""}
              `.toLowerCase();

            return text.includes(
              query
            );
          }
        );
      },
      [
        collections,
        search,
      ]
    );

  // ============================================================
  // FEATURED COLLECTION
  // ============================================================

  const featuredCollection =
    collections.length >
    0
      ? collections[0]
      : null;

  // ============================================================
  // IMAGE
  // ============================================================

  const getImageUrl =
    (
      collection
    ) => {
      const image =
        collection
          .coverImage ||
        collection
          .artworks?.[0]
          ?.image ||
        "";

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

  // ============================================================
  // NEWSLETTER
  // ============================================================

  const handleNewsletterSubmit =
    (
      event
    ) => {
      event.preventDefault();

      const email =
        newsletterEmail.trim();

      if (
        !email
      ) {
        setNewsletterMessage(
          "Please enter your email address."
        );

        return;
      }

      setNewsletterMessage(
        "Thank you for joining Messina Gallery."
      );

      setNewsletterEmail(
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
          bg-white
          dark:bg-[#0B2238]
          border-b
          border-[#DCE9F3]
          dark:border-white/10
        "
      >
        <div
          className="
            max-w-[1300px]
            mx-auto
            px-6
            py-16
            text-center
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.25em]
              text-[#168BE8]
            "
          >
            Messina Gallery
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[48px]
              md:text-[62px]
              leading-tight
            "
          >
            Artist{" "}

            <span
              className="
                italic
                text-[#168BE8]
              "
            >
              Collections.
            </span>
          </h1>

          <p
            className="
              mt-5
              max-w-[620px]
              mx-auto
              text-sm
              leading-7
              text-[#718296]
              dark:text-[#A9C0D3]
            "
          >
            Discover collections created
            directly by Messina Gallery
            artists.
          </p>
        </div>
      </section>

      <main
        className="
          max-w-[1300px]
          mx-auto
          px-6
          py-10
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
            gap-3
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
            width="20"
            className="
              text-[#168BE8]
            "
          />

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search a collection or artist..."
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
            >
              <Icon
                icon="mdi:close"
                width="18"
                className="
                  text-[#718296]
                "
              />
            </button>
          )}
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            className="
              mt-7
              p-4
              bg-red-50
              dark:bg-red-950/20
              text-red-600
              dark:text-red-300
              text-sm
            "
          >
            {error}
          </div>
        )}

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div
            className="
              py-24
              text-center
            "
          >
            <Icon
              icon="mdi:loading"
              width="36"
              className="
                mx-auto
                animate-spin
                text-[#168BE8]
              "
            />
          </div>

        ) : (
          <>
            {/* ==================================================
                FEATURED COLLECTION
            ================================================== */}

            {featuredCollection && (
              <section
                className="
                  mt-12
                  bg-white
                  dark:bg-[#0B2238]
                  border
                  border-[#DCE9F3]
                  dark:border-white/10
                  overflow-hidden
                "
              >
                <div
                  className="
                    grid
                    grid-cols-1
                    lg:grid-cols-[1.25fr_0.75fr]
                  "
                >
                  <Link
                    to={`/collection/${featuredCollection._id}`}
                    className="
                      relative
                      min-h-[360px]
                      lg:min-h-[420px]
                      overflow-hidden
                      bg-[#DDECF6]
                      dark:bg-[#102A43]
                    "
                  >
                    {getImageUrl(
                      featuredCollection
                    ) ? (
                      <img
                        src={getImageUrl(
                          featuredCollection
                        )}
                        alt={
                          featuredCollection.name
                        }
                        className="
                          absolute
                          inset-0
                          w-full
                          h-full
                          object-cover
                          hover:scale-105
                          transition-transform
                          duration-700
                        "
                      />
                    ) : (
                      <div
                        className="
                          absolute
                          inset-0
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Icon
                          icon="mdi:view-grid-outline"
                          width="52"
                          className="
                            text-[#168BE8]
                          "
                        />
                      </div>
                    )}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-[#061B30]/45
                        via-transparent
                        to-transparent
                      "
                    />
                  </Link>

                  <div
                    className="
                      p-8
                      md:p-10
                      lg:p-12
                      flex
                      flex-col
                      justify-center
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.22em]
                        text-[#168BE8]
                        font-semibold
                      "
                    >
                      Featured collection
                    </p>

                    <h2
                      className="
                        mt-4
                        font-serif
                        text-[36px]
                        md:text-[44px]
                        leading-tight
                      "
                    >
                      {
                        featuredCollection.name
                      }
                    </h2>

                    <p
                      className="
                        mt-3
                        text-sm
                        text-[#718296]
                        dark:text-[#A9C0D3]
                      "
                    >
                      by{" "}
                      <span
                        className="
                          text-[#168BE8]
                        "
                      >
                        {
                          featuredCollection.artistName
                        }
                      </span>
                    </p>

                    {featuredCollection.description && (
                      <p
                        className="
                          mt-6
                          text-sm
                          leading-7
                          text-[#718296]
                          dark:text-[#A9C0D3]
                          line-clamp-4
                        "
                      >
                        {
                          featuredCollection.description
                        }
                      </p>
                    )}

                    <div
                      className="
                        mt-7
                        flex
                        items-center
                        gap-4
                        text-xs
                        text-[#718296]
                      "
                    >
                      <span>
                        {featuredCollection
                          .artworks
                          ?.length ||
                          0}{" "}
                        artworks
                      </span>

                      <span
                        className="
                          w-1
                          h-1
                          rounded-full
                          bg-[#168BE8]
                        "
                      />

                      <span>
                        Artist collection
                      </span>
                    </div>

                    <Link
                      to={`/collection/${featuredCollection._id}`}
                      className="
                        mt-8
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-semibold
                        text-[#168BE8]
                        hover:gap-4
                        transition-all
                      "
                    >
                      Explore collection

                      <Icon
                        icon="mdi:arrow-right"
                        width="18"
                      />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                COLLECTION HEADER
            ================================================== */}

            <div
              className="
                mt-14
                flex
                flex-col
                sm:flex-row
                sm:items-end
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.22em]
                    text-[#168BE8]
                  "
                >
                  Curated by our artists
                </p>

                <h2
                  className="
                    mt-2
                    font-serif
                    text-[32px]
                    md:text-[38px]
                  "
                >
                  Explore the{" "}

                  <span
                    className="
                      italic
                      text-[#168BE8]
                    "
                  >
                    collections.
                  </span>
                </h2>
              </div>

              <p
                className="
                  text-xs
                  text-[#718296]
                  dark:text-[#A9C0D3]
                "
              >
                {
                  filteredCollections.length
                }{" "}
                {filteredCollections.length ===
                1
                  ? "collection"
                  : "collections"}
              </p>
            </div>

            {/* ==================================================
                EMPTY
            ================================================== */}

            {filteredCollections.length ===
            0 ? (
              <div
                className="
                  mt-10
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
                  icon="mdi:view-grid-outline"
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
                  No collections found.
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    text-[#718296]
                  "
                >
                  Published artist collections
                  will appear here.
                </p>
              </div>

            ) : (
              /* ==================================================
                  COLLECTION GRID
              ================================================== */

              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-7
                "
              >
                {filteredCollections.map(
                  (
                    collection
                  ) => {
                    const cover =
                      getImageUrl(
                        collection
                      );

                    const artistId =
                      collection
                        .artist?._id ||
                      collection.artist;

                    return (
                      <article
                        key={
                          collection._id
                        }
                        className="
                          group
                          bg-white
                          dark:bg-[#0B2238]
                          border
                          border-[#DCE9F3]
                          dark:border-white/10
                          overflow-hidden
                          hover:-translate-y-1
                          hover:shadow-[0_16px_35px_rgba(23,84,126,0.10)]
                          transition-all
                        "
                      >
                        {/* IMAGE */}

                        <Link
                          to={`/collection/${collection._id}`}
                        >
                          <div
                            className="
                              relative
                              h-[330px]
                              overflow-hidden
                              bg-[#DDECF6]
                              dark:bg-[#102A43]
                            "
                          >
                            {cover ? (
                              <img
                                src={
                                  cover
                                }
                                alt={
                                  collection.name
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
                            ) : (
                              <div
                                className="
                                  w-full
                                  h-full
                                  flex
                                  items-center
                                  justify-center
                                "
                              >
                                <Icon
                                  icon="mdi:view-grid-outline"
                                  width="44"
                                  className="
                                    text-[#168BE8]
                                  "
                                />
                              </div>
                            )}

                            <span
                              className="
                                absolute
                                top-4
                                left-4
                                px-3
                                py-2
                                bg-white/95
                                text-[#0A416D]
                                text-[9px]
                                uppercase
                                tracking-[0.14em]
                                font-semibold
                              "
                            >
                              Collection
                            </span>

                            <span
                              className="
                                absolute
                                bottom-4
                                right-4
                                px-3
                                py-2
                                bg-[#071A2B]/85
                                text-white
                                text-[9px]
                                uppercase
                                tracking-[0.12em]
                              "
                            >
                              {collection
                                .artworks
                                ?.length ||
                                0}{" "}
                              artworks
                            </span>
                          </div>
                        </Link>

                        {/* CONTENT */}

                        <div
                          className="
                            p-6
                          "
                        >
                          <p
                            className="
                              text-[9px]
                              uppercase
                              tracking-[0.17em]
                              text-[#168BE8]
                            "
                          >
                            Artist Collection
                          </p>

                          <Link
                            to={`/collection/${collection._id}`}
                          >
                            <h2
                              className="
                                mt-2
                                font-serif
                                text-[28px]
                              "
                            >
                              {
                                collection.name
                              }
                            </h2>
                          </Link>

                          {artistId ? (
                            <Link
                              to={`/artist/${artistId}`}
                              className="
                                mt-2
                                inline-block
                                text-sm
                                text-[#718296]
                                hover:text-[#168BE8]
                              "
                            >
                              by{" "}
                              {
                                collection.artistName
                              }
                            </Link>

                          ) : (
                            <p
                              className="
                                mt-2
                                text-sm
                                text-[#718296]
                              "
                            >
                              by{" "}
                              {
                                collection.artistName
                              }
                            </p>
                          )}

                          {collection.description && (
                            <p
                              className="
                                mt-4
                                text-xs
                                leading-6
                                text-[#718296]
                                dark:text-[#A9C0D3]
                                line-clamp-3
                              "
                            >
                              {
                                collection.description
                              }
                            </p>
                          )}

                          <div
                            className="
                              mt-6
                              pt-5
                              border-t
                              border-[#E5EEF5]
                              dark:border-white/10
                            "
                          >
                            <Link
                              to={`/collection/${collection._id}`}
                              className="
                                inline-flex
                                items-center
                                gap-2
                                text-xs
                                font-semibold
                                text-[#168BE8]
                              "
                            >
                              Explore collection

                              <Icon
                                icon="mdi:arrow-right"
                                width="17"
                              />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ======================================================
          NEWSLETTER
      ====================================================== */}

      <section
        className="
          max-w-[900px]
          mx-auto
          px-6
          pb-16
        "
      >
        <div
          className="
            border-t
            border-[#D5E5F0]
            dark:border-white/10
            pt-12
            text-center
          "
        >
          <p
            className="
              text-[9px]
              uppercase
              tracking-[0.24em]
              text-[#168BE8]
            "
          >
            Newsletter
          </p>

          <h2
            className="
              mt-3
              font-serif
              text-[34px]
              md:text-[40px]
            "
          >
            Stay{" "}

            <span
              className="
                italic
                text-[#168BE8]
              "
            >
              inspired.
            </span>
          </h2>

          <p
            className="
              mt-3
              max-w-[520px]
              mx-auto
              text-sm
              leading-6
              text-[#718296]
              dark:text-[#A9C0D3]
            "
          >
            Receive a quiet selection of
            new collections, artists and
            artworks from Messina Gallery.
          </p>

          <form
            onSubmit={
              handleNewsletterSubmit
            }
            className="
              mt-7
              max-w-[520px]
              mx-auto
              flex
              items-center
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE9F3]
              dark:border-white/10
              overflow-hidden
            "
          >
            <input
              type="email"
              value={
                newsletterEmail
              }
              onChange={(
                event
              ) => {
                setNewsletterEmail(
                  event.target
                    .value
                );

                if (
                  newsletterMessage
                ) {
                  setNewsletterMessage(
                    ""
                  );
                }
              }}
              placeholder="Your email address"
              className="
                flex-1
                min-w-0
                px-4
                py-3.5
                bg-transparent
                outline-none
                text-sm
              "
            />

            <button
              type="submit"
              className="
                px-5
                py-3.5
                bg-[#168BE8]
                text-white
                text-xs
                font-semibold
                hover:bg-[#1179CB]
                transition
              "
            >
              Subscribe
            </button>
          </form>

          {newsletterMessage && (
            <p
              className="
                mt-3
                text-xs
                text-[#718296]
                dark:text-[#A9C0D3]
              "
            >
              {newsletterMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default CollectionsPage;