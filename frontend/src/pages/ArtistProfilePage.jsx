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
  useAuth,
} from "../context/AuthContext";

import api, {
  API_URL,
} from "../api";

function ArtistProfilePage() {
  const { id } =
    useParams();

  const {
    user,
    isArtist,
  } =
    useAuth();

  const [
    artist,
    setArtist,
  ] = useState(null);

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

  const [
    authenticatingArtworkId,
    setAuthenticatingArtworkId,
  ] = useState(null);

  const [
    authenticationMessage,
    setAuthenticationMessage,
  ] = useState({});

  // ============================================================
  // LOAD ARTIST
  // ============================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/api/artists/${id}`
            );

          setArtist(
            response.data
              ?.artist || null
          );

          setArtworks(
            response.data
              ?.artworks || []
          );
        } catch (err) {
          setError(
            err.response?.data
              ?.message ||
              "Artist not found."
          );
        } finally {
          setLoading(false);
        }
      };

    load();
  }, [id]);

  // ============================================================
  // OWNER
  // ============================================================

  const isOwner =
    isArtist &&
    String(
      user?._id ||
        user?.id
    ) === String(id);

  // ============================================================
  // PROFILE IMAGE
  // ============================================================

  const profileImage =
    artist?.profileImage
      ? artist.profileImage.startsWith(
          "http"
        )
        ? artist.profileImage
        : `${API_URL}${artist.profileImage}`
      : "/assets/logo.png";

  // ============================================================
  // ARTWORK IMAGE
  // ============================================================

  const artworkImage =
    (artwork) =>
      artwork.image?.startsWith(
        "http"
      )
        ? artwork.image
        : `${API_URL}${artwork.image}`;

  // ============================================================
  // QR CODE IMAGE
  // ============================================================

  const qrCodeImage =
    (artwork) => {
      const qrPath =
        artwork?.certificate
          ?.qrCodePath;

      if (!qrPath) {
        return "";
      }

      return qrPath.startsWith(
        "http"
      )
        ? qrPath
        : `${API_URL}${qrPath}`;
    };

  // ============================================================
  // PRICE
  // ============================================================

  const formatPrice =
    (value) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-US"
      );

  // ============================================================
  // DIGITAL CERTIFICATE STATUS
  // ============================================================

  const isAuthenticated =
    (artwork) =>
      artwork?.certificate
        ?.authenticated ===
        true ||
      artwork?.certificate
        ?.status ===
        "Authenticated";

  const isAuthenticationPending =
    (artwork) =>
      artwork?.certificate
        ?.status ===
      "Pending";

  const isAuthenticationFailed =
    (artwork) =>
      artwork?.certificate
        ?.status ===
      "Failed";

  // ============================================================
  // AUTHENTICATE ARTWORK
  // ============================================================

  const handleAuthentication =
    async (artworkId) => {
      try {
        setAuthenticatingArtworkId(
          artworkId
        );

        setAuthenticationMessage(
          (current) => ({
            ...current,

            [artworkId]: {
              type: "loading",

              text:
                "Generating Certificate ID, SHA-256 fingerprint and QR code...",
            },
          })
        );

        const response =
          await api.post(
            `/api/artworks/${artworkId}/certificate`
          );

        const updatedArtwork =
          response.data?.artwork;

        if (updatedArtwork) {
          setArtworks(
            (current) =>
              current.map(
                (artwork) =>
                  artwork._id ===
                  artworkId
                    ? updatedArtwork
                    : artwork
              )
          );
        }

        setAuthenticationMessage(
          (current) => ({
            ...current,

            [artworkId]: {
              type: "success",

              text:
                "Artwork authenticated successfully by Messina Gallery.",
            },
          })
        );
      } catch (err) {
        const message =
          err.response?.data
            ?.message ||
          err.response?.data
            ?.error ||
          err.message ||
          "Unable to authenticate artwork.";

        setAuthenticationMessage(
          (current) => ({
            ...current,

            [artworkId]: {
              type: "error",
              text: message,
            },
          })
        );
      } finally {
        setAuthenticatingArtworkId(
          null
        );
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF7FD] dark:bg-[#071A2B]">
        <Navbar />

        <div className="min-h-[600px] flex items-center justify-center">
          <Icon
            icon="mdi:loading"
            width="38"
            className="animate-spin text-[#168BE8]"
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
    !artist
  ) {
    return (
      <div className="min-h-screen bg-[#EEF7FD] dark:bg-[#071A2B] text-[#10233D] dark:text-white">
        <Navbar />

        <div className="min-h-[600px] flex items-center justify-center px-6 text-center">
          <div>
            <Icon
              icon="mdi:account-off-outline"
              width="48"
              className="mx-auto text-[#168BE8]"
            />

            <h1 className="mt-5 font-serif text-[40px]">
              Artist unavailable
            </h1>

            <p className="mt-3 text-[#718296]">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#F3F9FD]
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
          overflow-hidden
          bg-gradient-to-br
          from-[#061B30]
          via-[#0B416C]
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
            md:py-20
          "
        >
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-[240px_1fr]
              gap-10
              items-center
            "
          >
            <div
              className="
                w-[220px]
                h-[220px]
                mx-auto
                md:mx-0
                rounded-full
                overflow-hidden
                border-[6px]
                border-white/20
                shadow-2xl
                bg-white/10
              "
            >
              <img
                src={profileImage}
                alt={
                  artist.artistName
                }
                className="
                  w-full
                  h-full
                  object-cover
                "
              />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.28em]
                  text-[#9DD8FF]
                "
              >
                Artist profile
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-3
                "
              >
                <h1
                  className="
                    font-serif
                    text-[48px]
                    md:text-[68px]
                    leading-none
                  "
                >
                  {
                    artist.artistName
                  }
                </h1>

                <Icon
                  icon="mdi:check-decagram"
                  width="29"
                  className="text-[#63BEFF]"
                />
              </div>

              <p
                className="
                  mt-5
                  text-[17px]
                  text-[#65C6FF]
                "
              >
                {
                  artist.specialty ||
                  "Artist"
                }
              </p>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-5
                  text-sm
                  text-white/65
                "
              >
                <span>
                  <Icon
                    icon="mdi:map-marker-outline"
                    className="inline mr-2"
                  />

                  {artist.city}

                  {artist.city &&
                  artist.country
                    ? ", "
                    : ""}

                  {
                    artist.country
                  }
                </span>

                <span>
                  <Icon
                    icon="mdi:image-multiple-outline"
                    className="inline mr-2"
                  />

                  {
                    artworks.length
                  }{" "}
                  artworks
                </span>
              </div>

              <div
                className="
                  mt-7
                  flex
                  flex-wrap
                  gap-3
                "
              >
                {artist.artistCode && (
                  <span
                    className="
                      px-4
                      py-3
                      bg-white/10
                      border
                      border-white/15
                      text-xs
                    "
                  >
                    {
                      artist.artistCode
                    }
                  </span>
                )}

                {isOwner && (
                  <>
                    <Link
                      to="/profile"
                      className="
                        px-5
                        py-3
                        bg-white
                        text-[#0A416D]
                        text-xs
                        font-semibold
                      "
                    >
                      Edit public profile
                    </Link>

                    <Link
                      to="/artist-studio"
                      className="
                        px-5
                        py-3
                        bg-[#168BE8]
                        text-white
                        text-xs
                        font-semibold
                      "
                    >
                      Artist Studio
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
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
            lg:grid-cols-[1fr_350px]
            gap-8
          "
        >
          <div className="space-y-7">
            <section
              className="
                bg-white
                dark:bg-[#0B2238]
                border
                border-[#DCE9F3]
                dark:border-white/10
                p-8
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.22em]
                  text-[#168BE8]
                "
              >
                Biography
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                "
              >
                About the artist
              </h2>

              <p
                className="
                  mt-5
                  text-sm
                  leading-8
                  text-[#6F8293]
                  dark:text-[#A9C0D3]
                "
              >
                {artist.bio ||
                  "The artist has not added a biography yet."}
              </p>
            </section>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-6
              "
            >
              <InfoCard
                icon="mdi:eye-outline"
                title="Artistic perception"
                text={
                  artist.artisticPerception ||
                  "Not provided yet."
                }
              />

              <InfoCard
                icon="mdi:lightbulb-outline"
                title="Inspiration"
                text={
                  artist.inspiration ||
                  "Not provided yet."
                }
              />
            </div>
          </div>

          <aside
            className="
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE9F3]
              dark:border-white/10
              p-7
              h-fit
            "
          >
            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.20em]
                text-[#168BE8]
              "
            >
              Artist information
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-[28px]
              "
            >
              Profile details
            </h2>

            <div className="mt-7 space-y-5">
              <Detail
                label="Specialty"
                value={
                  artist.specialty
                }
              />

              <Detail
                label="Artistic origin"
                value={
                  artist.artisticOrigin
                }
              />

              <Detail
                label="Location"
                value={`${artist.city || ""}${
                  artist.city &&
                  artist.country
                    ? ", "
                    : ""
                }${artist.country || ""}`}
              />

              <Detail
                label="Artist ID"
                value={
                  artist.artistCode
                }
              />

              <Detail
                label="Active since"
                value={
                  artist.startYear
                }
              />
            </div>

            {artist.website && (
              <a
                href={
                  artist.website
                }
                target="_blank"
                rel="noreferrer"
                className="
                  mt-7
                  h-12
                  flex
                  items-center
                  justify-center
                  gap-2
                  border
                  border-[#168BE8]
                  text-[#168BE8]
                  text-sm
                "
              >
                Website
              </a>
            )}
          </aside>
        </div>

        {/* ====================================================
            PORTFOLIO
        ==================================================== */}

        <section className="mt-16">
          <p
            className="
              text-[9px]
              uppercase
              tracking-[0.22em]
              text-[#168BE8]
            "
          >
            Portfolio
          </p>

          <h2
            className="
              mt-3
              font-serif
              text-[40px]
            "
          >
            Artworks by{" "}

            <span
              className="
                italic
                text-[#168BE8]
              "
            >
              {
                artist.artistName
              }
            </span>
          </h2>

          {artworks.length ===
          0 ? (
            <div
              className="
                mt-8
                py-14
                bg-white
                dark:bg-[#0B2238]
                text-center
              "
            >
              <p className="text-[#718296]">
                No artworks published yet.
              </p>
            </div>
          ) : (
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
              {artworks.map(
                (artwork) => {
                  const authenticated =
                    isAuthenticated(
                      artwork
                    );

                  const authenticationPending =
                    isAuthenticationPending(
                      artwork
                    );

                  const authenticationFailed =
                    isAuthenticationFailed(
                      artwork
                    );

                  const isAuthenticating =
                    authenticatingArtworkId ===
                    artwork._id;

                  const authMessage =
                    authenticationMessage[
                      artwork._id
                    ];

                  return (
                    <article
                      key={
                        artwork._id
                      }
                      className="
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
                        className="block group"
                      >
                        <div
                          className="
                            relative
                            h-[340px]
                            overflow-hidden
                          "
                        >
                          <img
                            src={
                              artworkImage(
                                artwork
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

                          {authenticated && (
                            <div
                              className="
                                absolute
                                top-4
                                right-4
                                flex
                                items-center
                                gap-2
                                bg-white/95
                                text-[#0B5D91]
                                border
                                border-[#168BE8]/30
                                px-3
                                py-2
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.12em]
                              "
                            >
                              <Icon
                                icon="mdi:certificate-outline"
                                width="18"
                              />

                              Authenticated
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-5">
                        <Link
                          to={`/artwork/${artwork._id}`}
                        >
                          <p
                            className="
                              text-[9px]
                              uppercase
                              tracking-[0.16em]
                              text-[#168BE8]
                            "
                          >
                            {
                              artwork.category
                            }
                          </p>

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

                          <p
                            className="
                              mt-3
                              font-serif
                              text-[22px]
                              text-[#168BE8]
                            "
                          >
                            €
                            {formatPrice(
                              artwork.price
                            )}
                          </p>
                        </Link>

                        {artwork.isOriginal && (
                          <div
                            className="
                              mt-5
                              pt-5
                              border-t
                              border-[#E2EDF5]
                              dark:border-white/10
                            "
                          >
                            <p
                              className="
                                text-[9px]
                                uppercase
                                tracking-[0.16em]
                                text-[#168BE8]
                              "
                            >
                              Messina Gallery Certificate
                            </p>

                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <Icon
                                icon={
                                  authenticated
                                    ? "mdi:certificate"
                                    : authenticationPending ||
                                        isAuthenticating
                                      ? "mdi:progress-clock"
                                      : authenticationFailed
                                        ? "mdi:alert-circle-outline"
                                        : "mdi:certificate-outline"
                                }
                                width="20"
                                className={
                                  authenticated
                                    ? "text-[#168BE8]"
                                    : authenticationFailed
                                      ? "text-red-500"
                                      : "text-[#8193A2]"
                                }
                              />

                              <span
                                className="
                                  text-xs
                                  font-semibold
                                "
                              >
                                {authenticated
                                  ? "Authenticated by Messina Gallery"
                                  : authenticationPending ||
                                      isAuthenticating
                                    ? "Authentication pending"
                                    : authenticationFailed
                                      ? "Authentication failed"
                                      : "Not authenticated"}
                              </span>
                            </div>

                            {authenticated &&
                              artwork
                                .certificate
                                ?.certificateId && (
                                <div
                                  className="
                                    mt-4
                                    p-4
                                    bg-[#F2F9FE]
                                    dark:bg-white/5
                                  "
                                >
                                  <p
                                    className="
                                      text-[9px]
                                      uppercase
                                      tracking-[0.14em]
                                      text-[#8A9BAA]
                                    "
                                  >
                                    Certificate ID
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      font-bold
                                      text-[#168BE8]
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

                            {authenticated &&
                              artwork
                                .certificate
                                ?.qrCodePath && (
                                <div
                                  className="
                                    mt-4
                                    flex
                                    items-center
                                    gap-4
                                  "
                                >
                                  <img
                                    src={
                                      qrCodeImage(
                                        artwork
                                      )
                                    }
                                    alt="Certificate QR Code"
                                    className="
                                      w-[90px]
                                      h-[90px]
                                      object-contain
                                      bg-white
                                      p-1
                                      border
                                      border-[#DCE9F3]
                                    "
                                  />

                                  <div>
                                    <p
                                      className="
                                        text-xs
                                        font-semibold
                                      "
                                    >
                                      Scan to verify
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        text-[10px]
                                        leading-4
                                        text-[#8193A2]
                                      "
                                    >
                                      Public certificate verification
                                    </p>
                                  </div>
                                </div>
                              )}

                            {authenticated &&
                              artwork
                                .certificate
                                ?.certificateId && (
                                <Link
                                  to={`/certificate/${artwork.certificate.certificateId}`}
                                  className="
                                    mt-4
                                    min-h-11
                                    px-4
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    border
                                    border-[#168BE8]
                                    text-[#168BE8]
                                    text-xs
                                    font-semibold
                                    hover:bg-[#168BE8]
                                    hover:text-white
                                    transition-colors
                                  "
                                >
                                  <Icon
                                    icon="mdi:certificate-outline"
                                    width="18"
                                  />

                                  View Certificate
                                </Link>
                              )}

                            {isOwner &&
                              !authenticated && (
                                <button
                                  type="button"
                                  disabled={
                                    isAuthenticating ||
                                    authenticationPending
                                  }
                                  onClick={() =>
                                    handleAuthentication(
                                      artwork._id
                                    )
                                  }
                                  className="
                                    mt-5
                                    w-full
                                    min-h-12
                                    px-5
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    bg-[#0B5D91]
                                    hover:bg-[#084C78]
                                    disabled:bg-[#9DB6C8]
                                    disabled:cursor-not-allowed
                                    text-white
                                    text-xs
                                    font-semibold
                                    transition-colors
                                  "
                                >
                                  {isAuthenticating ? (
                                    <>
                                      <Icon
                                        icon="mdi:loading"
                                        width="18"
                                        className="animate-spin"
                                      />

                                      Authenticating...
                                    </>
                                  ) : (
                                    <>
                                      <Icon
                                        icon="mdi:certificate-outline"
                                        width="19"
                                      />

                                      Authenticate Artwork
                                    </>
                                  )}
                                </button>
                              )}

                            {authMessage && (
                              <MessageBox
                                message={
                                  authMessage
                                }
                              />
                            )}
                          </div>
                        )}

                        {!artwork.isOriginal &&
                          isOwner && (
                            <div
                              className="
                                mt-5
                                pt-5
                                border-t
                                border-[#E2EDF5]
                                dark:border-white/10
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  text-xs
                                  text-[#8193A2]
                                "
                              >
                                <Icon
                                  icon="mdi:information-outline"
                                  width="18"
                                />

                                Only original artworks can be authenticated.
                              </div>
                            </div>
                          )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ============================================================
// MESSAGE BOX
// ============================================================

function MessageBox({
  message,
}) {
  return (
    <div
      className={`
        mt-4
        px-4
        py-3
        text-xs
        leading-5
        ${
          message.type ===
          "success"
            ? "bg-[#E9F8EF] text-[#14743A]"
            : message.type ===
                "error"
              ? "bg-[#FFF0F0] text-[#B83232]"
              : "bg-[#EEF7FD] text-[#0D639E]"
        }
      `}
    >
      {
        message.text
      }
    </div>
  );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  icon,
  title,
  text,
}) {
  return (
    <div
      className="
        bg-white
        dark:bg-[#0B2238]
        border
        border-[#DCE9F3]
        dark:border-white/10
        p-7
      "
    >
      <div
        className="
          w-12
          h-12
          rounded-full
          bg-[#EAF6FF]
          dark:bg-[#168BE8]/10
          flex
          items-center
          justify-center
          text-[#168BE8]
        "
      >
        <Icon
          icon={icon}
          width="25"
        />
      </div>

      <h3
        className="
          mt-5
          font-serif
          text-[25px]
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-4
          text-sm
          leading-7
          text-[#6F8293]
          dark:text-[#A9C0D3]
        "
      >
        {text}
      </p>
    </div>
  );
}

// ============================================================
// DETAIL
// ============================================================

function Detail({
  label,
  value,
}) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.16em]
          text-[#8A9BAA]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
        "
      >
        {value}
      </p>
    </div>
  );
}

export default ArtistProfilePage;