import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import Navbar from "../components/Navbar";

import {
  useCart,
} from "../context/CartContext";

import api, {
  API_URL,
} from "../api";

function ProductsPage() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    addToCart,
    isInCart,
  } = useCart();

  const [
    artworks,
    setArtworks,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ============================================================
  // URL FILTERS
  // ============================================================

  const search =
    searchParams.get(
      "search"
    ) || "";

  const category =
    searchParams.get(
      "category"
    ) || "All";

  // ============================================================
  // LOAD ARTWORKS
  // ============================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const response =
            await api.get(
              "/api/artworks"
            );

          setArtworks(
            response.data
              ?.artworks ||
              []
          );

        } catch (
          requestError
        ) {
          console.error(
            "Gallery error:",
            requestError
          );

          setError(
            "Unable to load the Gallery."
          );

        } finally {
          setLoading(
            false
          );
        }
      };

    load();
  }, []);

  // ============================================================
  // CATEGORIES
  // ============================================================

  const categories =
    useMemo(
      () => {
        const values =
          artworks
            .map(
              (
                artwork
              ) =>
                artwork.category
            )
            .filter(
              Boolean
            );

        return [
          "All",
          ...new Set(
            values
          ),
        ];
      },
      [
        artworks,
      ]
    );

  // ============================================================
  // FILTER
  // ============================================================

  const filtered =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return artworks.filter(
          (
            artwork
          ) => {
            const matchesCategory =
              category ===
                "All" ||
              artwork.category ===
                category;

            const text =
              `
                ${artwork.title || ""}
                ${artwork.artistName || ""}
                ${artwork.description || ""}
                ${artwork.category || ""}
              `.toLowerCase();

            const matchesSearch =
              !query ||
              text.includes(
                query
              );

            return (
              matchesCategory &&
              matchesSearch
            );
          }
        );
      },
      [
        artworks,
        search,
        category,
      ]
    );

  // ============================================================
  // UPDATE FILTERS
  // ============================================================

  const updateFilters =
    (
      nextSearch,
      nextCategory
    ) => {
      const params =
        new URLSearchParams();

      const cleanSearch =
        nextSearch.trim();

      if (
        cleanSearch
      ) {
        params.set(
          "search",
          cleanSearch
        );
      }

      if (
        nextCategory &&
        nextCategory !==
          "All"
      ) {
        params.set(
          "category",
          nextCategory
        );
      }

      setSearchParams(
        params
      );
    };

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters =
    () => {
      setSearchParams(
        {}
      );
    };

  // ============================================================
  // CART
  // ============================================================

  const normalizeForCart =
    (
      artwork
    ) => ({
      id:
        artwork._id,

      _id:
        artwork._id,

      title:
        artwork.title,

      artist:
        artwork.artistName,

      artistId:
        artwork.artist?._id ||
        artwork.artist,

      price:
        Number(
          artwork.price
        ),

      image:
        `${API_URL}${artwork.image}`,

      category:
        artwork.category,

      isOriginal:
        artwork.isOriginal,

      allowMultiple:
        false,
    });

  // ============================================================
  // HELPERS
  // ============================================================

  const formatPrice =
    (
      value
    ) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-US"
      );

  const isAuthenticated =
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
      artwork?.sold ===
      true;

  const isAvailable =
    (
      artwork
    ) =>
      artwork?.available ===
        true &&
      artwork?.sold !==
        true;

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
            max-w-[1300px]
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
            Messina Gallery
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[52px]
              md:text-[70px]
            "
          >
            Discover{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              art.
            </span>
          </h1>

          <p
            className="
              mt-5
              max-w-[650px]
              text-sm
              leading-7
              text-white/70
            "
          >
            Explore original works
            published by artists
            registered on Messina
            Gallery. Sold artworks
            remain visible as part of
            each artist&apos;s public
            portfolio.
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

        <section
          className="
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
            p-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              border
              border-[#CAD8E5]
              dark:border-white/10
              px-4
            "
          >
            <Icon
              icon="mdi:magnify"
              width="21"
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
                updateFilters(
                  event.target
                    .value,

                  category
                )
              }
              placeholder="Search artwork, artist or category..."
              className="
                w-full
                py-4
                bg-transparent
                outline-none
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  updateFilters(
                    "",
                    category
                  )
                }
                aria-label="Clear search"
                className="
                  text-[#718296]
                  hover:text-[#168BE8]
                "
              >
                <Icon
                  icon="mdi:close-circle-outline"
                  width="20"
                />
              </button>
            )}
          </div>

          {/* CATEGORIES */}

          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-2
            "
          >
            {categories.map(
              (
                item
              ) => (
                <button
                  key={
                    item
                  }
                  type="button"
                  onClick={() =>
                    updateFilters(
                      search,
                      item
                    )
                  }
                  className={`
                    px-4
                    py-2.5
                    text-xs
                    border
                    transition

                    ${
                      category ===
                      item
                        ? `
                          bg-[#168BE8]
                          border-[#168BE8]
                          text-white
                        `
                        : `
                          bg-[#EDF6FC]
                          dark:bg-white/5
                          border-transparent
                          text-[#45657E]
                          dark:text-[#A9C0D3]
                          hover:border-[#168BE8]
                          hover:text-[#168BE8]
                        `
                    }
                  `}
                >
                  {
                    item
                  }
                </button>
              )
            )}
          </div>

          {(search ||
            category !==
              "All") && (
            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <p
                className="
                  text-xs
                  text-[#718296]
                  dark:text-[#A9C0D3]
                "
              >
                {
                  filtered.length
                }{" "}
                result
                {filtered.length !==
                1
                  ? "s"
                  : ""}
              </p>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="
                  text-xs
                  font-semibold
                  text-[#168BE8]
                  hover:underline
                "
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

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
              width="35"
              className="
                mx-auto
                animate-spin
                text-[#168BE8]
              "
            />
          </div>

        ) : filtered.length ===
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
              icon="mdi:image-search-outline"
              width="46"
              className="
                mx-auto
                text-[#168BE8]
              "
            />

            <h2
              className="
                mt-5
                font-serif
                text-[34px]
              "
            >
              No artworks found.
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-[#718296]
              "
            >
              Try another category or
              search term.
            </p>

            <button
              type="button"
              onClick={
                resetFilters
              }
              className="
                mt-6
                h-11
                px-5
                bg-[#168BE8]
                text-white
                text-xs
                font-semibold
              "
            >
              View all artworks
            </button>
          </div>

        ) : (
          <div
            className="
              mt-10
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-7
            "
          >
            {filtered.map(
              (
                artwork
              ) => {
                const cartItem =
                  normalizeForCart(
                    artwork
                  );

                const alreadyInCart =
                  isInCart(
                    artwork._id
                  );

                const authenticated =
                  isAuthenticated(
                    artwork
                  );

                const sold =
                  isSold(
                    artwork
                  );

                const available =
                  isAvailable(
                    artwork
                  );

                const artistId =
                  artwork.artist
                    ?._id ||
                  artwork.artist;

                const canBuy =
                  available &&
                  !alreadyInCart;

                return (
                  <article
                    key={
                      artwork._id
                    }
                    className={`
                      group
                      bg-white
                      dark:bg-[#0B2238]
                      border
                      border-[#DCE9F3]
                      dark:border-white/10
                      overflow-hidden
                      transition-all

                      ${
                        sold
                          ? ""
                          : `
                            hover:-translate-y-1
                            hover:shadow-[0_18px_40px_rgba(23,84,126,0.10)]
                          `
                      }
                    `}
                  >
                    {/* IMAGE */}

                    <Link
                      to={`/artwork/${artwork._id}`}
                    >
                      <div
                        className="
                          h-[390px]
                          overflow-hidden
                          relative
                        "
                      >
                        <img
                          src={`${API_URL}${artwork.image}`}
                          alt={
                            artwork.title
                          }
                          className={`
                            w-full
                            h-full
                            object-cover
                            transition-transform
                            duration-700

                            ${
                              sold
                                ? "grayscale-[15%]"
                                : "group-hover:scale-105"
                            }
                          `}
                        />

                        {/* ORIGINAL */}

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
                              tracking-[0.15em]
                              font-semibold
                            "
                          >
                            Original
                          </span>
                        )}

                        {/* SOLD */}

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
                                border
                                border-white/30
                                text-white
                                text-[12px]
                                uppercase
                                tracking-[0.28em]
                                font-semibold
                              "
                            >
                              Sold
                            </span>
                          </div>
                        )}

                        {/* CERTIFIED */}

                        {authenticated && (
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
                              tracking-[0.13em]
                              font-semibold
                            "
                          >
                            <Icon
                              icon="mdi:certificate"
                              width="16"
                            />

                            Certified
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* CONTENT */}

                    <div
                      className="
                        p-6
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
                            tracking-[0.17em]
                            text-[#168BE8]
                          "
                        >
                          {
                            artwork.category
                          }
                        </p>

                        {sold ? (
                          <span
                            className="
                              px-2.5
                              py-1
                              bg-[#F1F3F5]
                              dark:bg-white/5
                              text-[#596977]
                              dark:text-[#C6D0D8]
                              text-[9px]
                              uppercase
                              tracking-[0.12em]
                              font-semibold
                            "
                          >
                            Sold
                          </span>
                        ) : available ? (
                          <span
                            className="
                              px-2.5
                              py-1
                              bg-green-50
                              dark:bg-green-950/20
                              text-green-700
                              dark:text-green-300
                              text-[9px]
                              uppercase
                              tracking-[0.12em]
                              font-semibold
                            "
                          >
                            Available
                          </span>
                        ) : (
                          <span
                            className="
                              px-2.5
                              py-1
                              bg-orange-50
                              dark:bg-orange-950/20
                              text-orange-700
                              dark:text-orange-300
                              text-[9px]
                              uppercase
                              tracking-[0.12em]
                              font-semibold
                            "
                          >
                            Unavailable
                          </span>
                        )}
                      </div>

                      {/* TITLE */}

                      <Link
                        to={`/artwork/${artwork._id}`}
                      >
                        <h2
                          className="
                            mt-2
                            font-serif
                            text-[27px]
                          "
                        >
                          {
                            artwork.title
                          }
                        </h2>
                      </Link>

                      {/* ARTIST */}

                      {artistId ? (
                        <Link
                          to={`/artist/${artistId}`}
                          className="
                            mt-2
                            inline-block
                            text-sm
                            text-[#718296]
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
                            text-sm
                            text-[#718296]
                          "
                        >
                          by{" "}
                          {
                            artwork.artistName
                          }
                        </p>
                      )}

                      {/* SOLD MESSAGE */}

                      {sold && (
                        <div
                          className="
                            mt-4
                            p-3
                            flex
                            items-start
                            gap-2
                            bg-[#F5F7F8]
                            dark:bg-white/5
                            text-[#617282]
                            dark:text-[#B8C7D2]
                          "
                        >
                          <Icon
                            icon="mdi:check-circle-outline"
                            width="18"
                            className="
                              shrink-0
                              mt-0.5
                            "
                          />

                          <p
                            className="
                              text-[11px]
                              leading-5
                            "
                          >
                            This original
                            artwork has been
                            sold and is no
                            longer available
                            for purchase.
                          </p>
                        </div>
                      )}

                      {/* CERTIFICATE */}

                      {authenticated &&
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
                              border
                              border-[#D7EAF6]
                              dark:border-white/10
                              text-[10px]
                              font-semibold
                              text-[#0B5D91]
                              dark:text-[#82D1FF]
                              hover:border-[#168BE8]
                              transition
                            "
                          >
                            <Icon
                              icon="mdi:check-decagram"
                              width="17"
                            />

                            Certified by
                            Messina Gallery
                          </Link>
                        )}

                      {/* PRICE + CART */}

                      <div
                        className="
                          mt-6
                          pt-5
                          border-t
                          border-[#E5EEF5]
                          dark:border-white/10
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <span
                          className="
                            font-serif
                            text-[25px]
                            text-[#168BE8]
                          "
                        >
                          €
                          {formatPrice(
                            artwork.price
                          )}
                        </span>

                        <button
                          type="button"
                          disabled={
                            !canBuy
                          }
                          onClick={() => {
                            if (
                              !canBuy
                            ) {
                              return;
                            }

                            addToCart(
                              cartItem
                            );
                          }}
                          className={`
                            h-11
                            px-4
                            text-xs
                            font-semibold
                            transition
                            disabled:cursor-not-allowed

                            ${
                              sold
                                ? `
                                  bg-[#E6EAED]
                                  dark:bg-white/5
                                  text-[#677887]
                                  dark:text-[#AEBBC5]
                                `
                                : !available
                                ? `
                                  bg-orange-100
                                  dark:bg-orange-950/20
                                  text-orange-700
                                  dark:text-orange-300
                                `
                                : `
                                  bg-[#168BE8]
                                  text-white
                                  disabled:opacity-50
                                `
                            }
                          `}
                        >
                          {sold
                            ? "Sold"
                            : !available
                            ? "Unavailable"
                            : alreadyInCart
                            ? "In cart"
                            : "Add to cart"}
                        </button>
                      </div>
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

export default ProductsPage;