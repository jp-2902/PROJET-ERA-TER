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

import {
  useCart,
} from "../context/CartContext";

import api, {
  API_URL,
} from "../api";

function ArtworkDetailsPage() {
  const {
    id,
  } = useParams();

  const {
    addToCart,
    isInCart,
  } = useCart();

  const [
    artwork,
    setArtwork,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    zoom,
    setZoom,
  ] = useState(1);

  // ============================================================
  // LOAD ARTWORK
  // ============================================================

  useEffect(() => {
    const loadArtwork =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/api/artworks/${id}`
            );

          setArtwork(
            response.data
              ?.artwork ||
              null
          );

          setZoom(1);
        } catch (requestError) {
          console.error(
            "ARTWORK DETAILS ERROR:",
            requestError
          );

          setError(
            requestError.response
              ?.data
              ?.message ||
              "Artwork not found."
          );
        } finally {
          setLoading(false);
        }
      };

    loadArtwork();
  }, [id]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
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
            min-h-[600px]
            flex
            items-center
            justify-center
          "
        >
          <Icon
            icon="mdi:loading"
            width="38"
            className="
              animate-spin
              text-[#168BE8]
            "
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    error ||
    !artwork
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
            min-h-[600px]
            flex
            items-center
            justify-center
            px-6
          "
        >
          <div
            className="
              text-center
            "
          >
            <Icon
              icon="mdi:image-off-outline"
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
              Artwork unavailable
            </h1>

            <p
              className="
                mt-3
                text-[#718296]
              "
            >
              {error}
            </p>

            <Link
              to="/products"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                px-6
                h-12
                bg-[#168BE8]
                text-white
                text-sm
                font-semibold
              "
            >
              <Icon
                icon="mdi:arrow-left"
                width="17"
              />

              Return to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // HELPERS
  // ============================================================

  const artistId =
    artwork.artist?._id ||
    artwork.artist;

  const artworkImage =
    artwork.image?.startsWith(
      "http"
    )
      ? artwork.image
      : `${API_URL}${artwork.image}`;

  const cartItem = {
    id:
      artwork._id,

    _id:
      artwork._id,

    title:
      artwork.title,

    artist:
      artwork.artistName,

    artistId,

    price:
      Number(
        artwork.price
      ),

    image:
      artworkImage,

    category:
      artwork.category,

    isOriginal:
      artwork.isOriginal,

    allowMultiple: false,
  };

  const alreadyInCart =
    isInCart(
      artwork._id
    );

  const formatPrice = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );

  const isCertified =
    artwork?.certificate
      ?.authenticated ===
      true &&
    artwork?.certificate
      ?.status ===
      "Authenticated";

  const isSold =
    artwork.sold === true;

  const isAvailable =
    artwork.available ===
      true &&
    artwork.sold !==
      true;

  const canAddToCart =
    isAvailable &&
    !alreadyInCart;

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

      <main
        className="
          max-w-[1350px]
          mx-auto
          px-6
          py-12
        "
      >
        {/* ====================================================
            BACK
        ==================================================== */}

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
          <Icon
            icon="mdi:arrow-left"
            width="18"
          />

          Back to Gallery
        </Link>

        <div
          className="
            mt-8
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-10
          "
        >
          {/* ==================================================
              IMAGE
          ================================================== */}

          <section>
            <div
              className="
                relative
                h-[620px]
                bg-[#DDECF6]
                dark:bg-[#0B2238]
                overflow-hidden
                flex
                items-center
                justify-center
              "
            >
              <img
                src={
                  artworkImage
                }
                alt={
                  artwork.title
                }
                style={{
                  transform:
                    `scale(${zoom})`,
                }}
                className="
                  w-full
                  h-full
                  object-contain
                  transition-transform
                  duration-300
                "
              />

              {isCertified && (
                <div
                  className="
                    absolute
                    top-5
                    left-5
                    px-4
                    py-2.5
                    flex
                    items-center
                    gap-2
                    bg-[#0B5D91]/95
                    text-white
                    text-[9px]
                    uppercase
                    tracking-[0.14em]
                    font-semibold
                  "
                >
                  <Icon
                    icon="mdi:certificate"
                    width="17"
                  />

                  Certified
                </div>
              )}

              {isSold && (
                <div
                  className="
                    absolute
                    top-5
                    right-5
                    px-4
                    py-2.5
                    bg-[#10233D]/90
                    text-white
                    text-[9px]
                    uppercase
                    tracking-[0.14em]
                    font-semibold
                  "
                >
                  Sold
                </div>
              )}
            </div>

            {/* ZOOM */}

            <div
              className="
                mt-4
                flex
                items-center
                gap-3
              "
            >
              <button
                type="button"
                onClick={() =>
                  setZoom(
                    (current) =>
                      Math.min(
                        2.5,
                        current +
                          0.25
                      )
                  )
                }
                className="
                  w-11
                  h-11
                  flex
                  items-center
                  justify-center
                  border
                  border-[#CAD8E5]
                  dark:border-white/10
                  bg-white
                  dark:bg-[#0B2238]
                "
                aria-label="Zoom in"
              >
                <Icon
                  icon="mdi:plus"
                  width="19"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setZoom(
                    (current) =>
                      Math.max(
                        1,
                        current -
                          0.25
                      )
                  )
                }
                className="
                  w-11
                  h-11
                  flex
                  items-center
                  justify-center
                  border
                  border-[#CAD8E5]
                  dark:border-white/10
                  bg-white
                  dark:bg-[#0B2238]
                "
                aria-label="Zoom out"
              >
                <Icon
                  icon="mdi:minus"
                  width="19"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setZoom(1)
                }
                className="
                  px-5
                  h-11
                  border
                  border-[#CAD8E5]
                  dark:border-white/10
                  bg-white
                  dark:bg-[#0B2238]
                  text-xs
                  font-semibold
                "
              >
                Reset
              </button>

              <span
                className="
                  ml-auto
                  text-xs
                  text-[#718296]
                  dark:text-[#A9C0D3]
                "
              >
                {Math.round(
                  zoom * 100
                )}
                %
              </span>
            </div>
          </section>

          {/* ==================================================
              INFORMATION
          ================================================== */}

          <section
            className="
              lg:pt-5
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
              {artwork.category}
            </p>

            <h1
              className="
                mt-4
                font-serif
                text-[48px]
                md:text-[60px]
                leading-[1]
              "
            >
              {artwork.title}
            </h1>

            {/* ARTIST */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-2
                text-[17px]
                text-[#718296]
              "
            >
              <span>
                by
              </span>

              {artistId ? (
                <Link
                  to={`/artist/${artistId}`}
                  className="
                    font-semibold
                    text-[#10233D]
                    dark:text-white
                    hover:text-[#168BE8]
                    transition
                  "
                >
                  {artwork.artistName}
                </Link>
              ) : (
                <strong
                  className="
                    text-[#10233D]
                    dark:text-white
                  "
                >
                  {artwork.artistName}
                </strong>
              )}

              <Icon
                icon="mdi:check-decagram"
                width="17"
                className="
                  text-[#168BE8]
                "
              />
            </div>

            {/* PRICE */}

            <p
              className="
                mt-7
                font-serif
                text-[38px]
                text-[#168BE8]
              "
            >
              €
              {formatPrice(
                artwork.price
              )}
            </p>

            {/* STATUS */}

            <div
              className="
                mt-7
                flex
                flex-wrap
                gap-3
              "
            >
              {artwork.isOriginal && (
                <span
                  className="
                    px-4
                    py-2
                    bg-[#EAF6FF]
                    dark:bg-[#168BE8]/10
                    text-[#168BE8]
                    text-xs
                    font-semibold
                  "
                >
                  Original artwork
                </span>
              )}

              {isSold ? (
                <span
                  className="
                    px-4
                    py-2
                    bg-[#F1F3F5]
                    dark:bg-white/5
                    text-[#5D6975]
                    dark:text-[#B8C3CD]
                    text-xs
                    font-semibold
                  "
                >
                  Sold
                </span>
              ) : isAvailable ? (
                <span
                  className="
                    px-4
                    py-2
                    bg-green-50
                    dark:bg-green-950/20
                    text-green-700
                    dark:text-green-300
                    text-xs
                    font-semibold
                  "
                >
                  Available
                </span>
              ) : (
                <span
                  className="
                    px-4
                    py-2
                    bg-orange-50
                    dark:bg-orange-950/20
                    text-orange-700
                    dark:text-orange-300
                    text-xs
                    font-semibold
                  "
                >
                  Unavailable
                </span>
              )}

              {isCertified && (
                <span
                  className="
                    px-4
                    py-2
                    bg-[#EAF8F0]
                    dark:bg-[#103D2B]
                    text-[#14743A]
                    dark:text-[#8BE6AE]
                    text-xs
                    font-semibold
                    inline-flex
                    items-center
                    gap-2
                  "
                >
                  <Icon
                    icon="mdi:certificate"
                    width="17"
                  />

                  Certified by Messina Gallery
                </span>
              )}
            </div>

            {/* DESCRIPTION */}

            <p
              className="
                mt-8
                text-sm
                leading-8
                text-[#62788B]
                dark:text-[#A9C0D3]
              "
            >
              {artwork.description}
            </p>

            {/* ==================================================
                DIGITAL CERTIFICATE
            ================================================== */}

            {artwork.isOriginal && (
              <section
                className="
                  mt-8
                  p-5
                  bg-gradient-to-r
                  from-[#EDF8FE]
                  to-[#F7FCFF]
                  dark:from-[#103650]
                  dark:to-[#154765]
                  border
                  border-[#CEE5F3]
                  dark:border-[#82D1FF]/15
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-4
                  "
                >
                  <div
                    className="
                      w-11
                      h-11
                      rounded-full
                      flex
                      items-center
                      justify-center
                      bg-gradient-to-br
                      from-[#1677E8]
                      to-[#63BEFF]
                      text-white
                      flex-shrink-0
                    "
                  >
                    <Icon
                      icon={
                        isCertified
                          ? "mdi:certificate"
                          : "mdi:certificate-outline"
                      }
                      width="22"
                    />
                  </div>

                  <div
                    className="
                      flex-1
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.18em]
                        text-[#168BE8]
                        dark:text-[#82D1FF]
                      "
                    >
                      Messina Gallery Digital Certificate
                    </p>

                    <h2
                      className="
                        mt-1
                        font-serif
                        text-[21px]
                      "
                    >
                      {isCertified
                        ? "Certified artwork"
                        : "Not yet authenticated"}
                    </h2>

                    {isCertified ? (
                      <>
                        <p
                          className="
                            mt-3
                            text-[11px]
                            leading-6
                            text-[#718296]
                            dark:text-[#B9D5E7]
                          "
                        >
                          This digital certificate confirms that
                          Messina Gallery registered this artwork and
                          associated it with a unique certificate
                          identifier and SHA-256 fingerprint for
                          verification.
                        </p>

                        {artwork
                          .certificate
                          ?.certificateId && (
                          <div
                            className="
                              mt-4
                              p-3
                              bg-white/70
                              dark:bg-white/5
                              border
                              border-[#DCEAF3]
                              dark:border-white/10
                            "
                          >
                            <p
                              className="
                                text-[8px]
                                uppercase
                                tracking-[0.15em]
                                text-[#718296]
                              "
                            >
                              Certificate ID
                            </p>

                            <p
                              className="
                                mt-1
                                text-sm
                                font-semibold
                                text-[#168BE8]
                                break-all
                              "
                            >
                              {
                                artwork
                                  .certificate
                                  .certificateId
                              }
                            </p>
                          </div>
                        )}

                        {artwork
                          .certificate
                          ?.certificateId && (
                          <Link
                            to={`/certificate/${artwork.certificate.certificateId}`}
                            className="
                              mt-4
                              min-h-[46px]
                              px-5
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              bg-[#168BE8]
                              text-white
                              text-[10px]
                              uppercase
                              tracking-[0.14em]
                              font-semibold
                              hover:bg-[#1179CB]
                              transition
                            "
                          >
                            <Icon
                              icon="mdi:certificate-outline"
                              width="18"
                            />

                            View Certificate
                          </Link>
                        )}
                      </>
                    ) : (
                      <p
                        className="
                          mt-3
                          text-[11px]
                          leading-6
                          text-[#718296]
                          dark:text-[#B9D5E7]
                        "
                      >
                        This original artwork does not currently have
                        an active Messina Gallery digital certificate.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                STORY
            ================================================== */}

            {artwork.story && (
              <section
                className="
                  mt-8
                  pt-7
                  border-t
                  border-[#DCE9F3]
                  dark:border-white/10
                "
              >
                <h2
                  className="
                    font-serif
                    text-[27px]
                  "
                >
                  The story
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  {artwork.story}
                </p>
              </section>
            )}

            {/* ==================================================
                INSPIRATION
            ================================================== */}

            {artwork.inspiration && (
              <section
                className="
                  mt-7
                "
              >
                <h2
                  className="
                    font-serif
                    text-[27px]
                  "
                >
                  Inspiration
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  {
                    artwork.inspiration
                  }
                </p>
              </section>
            )}

            {/* ==================================================
                DETAILS
            ================================================== */}

            <div
              className="
                mt-8
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
                text-sm
              "
            >
              {artwork.year && (
                <div
                  className="
                    p-4
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE9F3]
                    dark:border-white/10
                  "
                >
                  <p
                    className="
                      text-xs
                      text-[#718296]
                    "
                  >
                    Year
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold
                    "
                  >
                    {artwork.year}
                  </p>
                </div>
              )}

              {artwork.dimensions && (
                <div
                  className="
                    p-4
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE9F3]
                    dark:border-white/10
                  "
                >
                  <p
                    className="
                      text-xs
                      text-[#718296]
                    "
                  >
                    Dimensions
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold
                    "
                  >
                    {
                      artwork.dimensions
                    }
                  </p>
                </div>
              )}

              {artwork.country && (
                <div
                  className="
                    p-4
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE9F3]
                    dark:border-white/10
                  "
                >
                  <p
                    className="
                      text-xs
                      text-[#718296]
                    "
                  >
                    Origin
                  </p>

                  <p
                    className="
                      mt-1
                      font-semibold
                    "
                  >
                    {artwork.country}
                  </p>
                </div>
              )}

              <div
                className="
                  p-4
                  bg-white
                  dark:bg-[#0B2238]
                  border
                  border-[#DCE9F3]
                  dark:border-white/10
                "
              >
                <p
                  className="
                    text-xs
                    text-[#718296]
                  "
                >
                  Type
                </p>

                <p
                  className="
                    mt-1
                    font-semibold
                  "
                >
                  {artwork.isOriginal
                    ? "Original artwork"
                    : "Artwork"}
                </p>
              </div>
            </div>

            {/* ==================================================
                CART
            ================================================== */}

            <button
              type="button"
              disabled={
                !canAddToCart
              }
              onClick={() =>
                addToCart(
                  cartItem
                )
              }
              className="
                mt-9
                w-full
                h-[58px]
                bg-gradient-to-r
                from-[#1677E8]
                to-[#52B6FA]
                text-white
                font-semibold
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition
              "
            >
              {alreadyInCart
                ? "Artwork already in cart"
                : isSold
                ? "Artwork sold"
                : !isAvailable
                ? "Artwork unavailable"
                : "Add artwork to cart"}
            </button>

            {!isAvailable &&
              !isSold && (
                <p
                  className="
                    mt-3
                    text-center
                    text-xs
                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  This artwork is currently not available for purchase.
                </p>
              )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ArtworkDetailsPage;