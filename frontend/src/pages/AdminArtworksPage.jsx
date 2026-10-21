import {
  useCallback,
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

import api, {
  API_URL,
} from "../api";

import AdminLayout from "../components/admin/AdminLayout";

function AdminArtworksPage() {
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
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  // ============================================================
  // LOAD
  // ============================================================

  const loadArtworks =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/api/admin/artworks"
            );

          setArtworks(
            response.data
              ?.artworks || []
          );
        } catch (
          requestError
        ) {
          console.error(
            "ADMIN ARTWORKS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load artworks."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadArtworks();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadArtworks,
  ]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredArtworks =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return artworks.filter(
          (artwork) => {
            const certified =
              artwork.certificate
                ?.authenticated ===
                true &&
              artwork.certificate
                ?.status ===
                "Authenticated";

            const matchesSearch =
              !query ||
              artwork.title
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              artwork.artistName
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              artwork.category
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              artwork.certificate
                ?.certificateId
                ?.toLowerCase()
                .includes(
                  query
                );

            const matchesStatus =
              !statusFilter ||
              (statusFilter ===
                "published" &&
                artwork.published !==
                  false) ||
              (statusFilter ===
                "hidden" &&
                artwork.published ===
                  false) ||
              (statusFilter ===
                "available" &&
                artwork.available &&
                !artwork.sold) ||
              (statusFilter ===
                "sold" &&
                artwork.sold) ||
              (statusFilter ===
                "certified" &&
                certified);

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },
      [
        artworks,
        search,
        statusFilter,
      ]
    );

  // ============================================================
  // PUBLICATION
  // ============================================================

  const togglePublication =
    async (
      artwork
    ) => {
      const nextPublished =
        artwork.published ===
        false;

      try {
        setUpdatingId(
          artwork._id
        );

        await api.patch(
          `/api/admin/artworks/${artwork._id}/publication`,
          {
            published:
              nextPublished,
          }
        );

        setArtworks(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                artwork._id
                  ? {
                      ...item,
                      published:
                        nextPublished,
                    }
                  : item
            )
        );
      } catch (
        requestError
      ) {
        window.alert(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to update artwork publication."
        );
      } finally {
        setUpdatingId("");
      }
    };

  // ============================================================
  // CERTIFICATE REVOCATION
  // ============================================================

  const revokeCertificate =
    async (
      artwork
    ) => {
      const confirmed =
        window.confirm(
          `Revoke the Messina Gallery certificate for "${artwork.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingId(
          artwork._id
        );

        const response =
          await api.patch(
            `/api/admin/artworks/${artwork._id}/certificate/revoke`
          );

        setArtworks(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                artwork._id
                  ? {
                      ...item,
                      certificate:
                        response.data
                          ?.certificate ||
                        {
                          ...item.certificate,
                          authenticated:
                            false,
                          status:
                            "Revoked",
                        },
                    }
                  : item
            )
        );
      } catch (
        requestError
      ) {
        window.alert(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to revoke this certificate."
        );
      } finally {
        setUpdatingId("");
      }
    };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <AdminLayout
      title="Artworks"
      eyebrow="Administration"
    >
      <section>
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-[#168BE8]
          "
        >
          Gallery management
        </p>

        <h2
          className="
            mt-2
            font-serif
            text-[38px]
            md:text-[44px]
          "
        >
          Artworks
        </h2>

        <p
          className="
            mt-3
            max-w-[650px]
            text-sm
            leading-6
            text-[#718296]
            dark:text-[#A9C0D3]
          "
        >
          Review every artwork,
          control its publication
          and manage Messina Gallery
          digital certificates.
        </p>
      </section>

      {/* FILTERS */}

      <section
        className="
          mt-8
          p-5
          bg-white
          dark:bg-[#0B2238]
          border
          border-[#DCE7EF]
          dark:border-white/10
          grid
          grid-cols-1
          md:grid-cols-[1fr_210px]
          gap-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            px-4
            border
            border-[#D3E1EB]
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
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search artwork, artist or certificate..."
            className="
              w-full
              py-3
              bg-transparent
              outline-none
              text-sm
            "
          />
        </div>

        <select
          value={
            statusFilter
          }
          onChange={(
            event
          ) =>
            setStatusFilter(
              event.target
                .value
            )
          }
          className="
            h-[48px]
            px-3
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#D3E1EB]
            dark:border-white/10
            outline-none
            text-sm
          "
        >
          <option value="">
            All artworks
          </option>

          <option value="published">
            Published
          </option>

          <option value="hidden">
            Hidden
          </option>

          <option value="available">
            Available
          </option>

          <option value="sold">
            Sold
          </option>

          <option value="certified">
            Certified
          </option>
        </select>
      </section>

      {/* ARTWORKS */}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
        />
      ) : filteredArtworks.length ===
        0 ? (
        <EmptyState />
      ) : (
        <section
          className="
            mt-6
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-5
          "
        >
          {filteredArtworks.map(
            (artwork) => {
              const published =
                artwork.published !==
                false;

              const certified =
                artwork.certificate
                  ?.authenticated ===
                  true &&
                artwork.certificate
                  ?.status ===
                  "Authenticated";

              const revoked =
                artwork.certificate
                  ?.status ===
                "Revoked";

              return (
                <article
                  key={
                    artwork._id
                  }
                  className="
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE7EF]
                    dark:border-white/10
                    overflow-hidden
                  "
                >
                  <Link
                    to={`/artwork/${artwork._id}`}
                  >
                    <div
                      className="
                        h-[260px]
                        bg-[#EAF1F6]
                        overflow-hidden
                      "
                    >
                      <img
                        src={`${API_URL}${artwork.image}`}
                        alt={
                          artwork.title
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                          hover:scale-105
                          transition-transform
                          duration-500
                        "
                      />
                    </div>
                  </Link>

                  <div className="p-5">
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                    >
                      <div
                        className="
                          min-w-0
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            uppercase
                            tracking-[0.14em]
                            text-[#168BE8]
                          "
                        >
                          {artwork.category ||
                            "Artwork"}
                        </p>

                        <h3
                          className="
                            mt-1
                            font-serif
                            text-[24px]
                            truncate
                          "
                        >
                          {artwork.title}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-[#718296]
                            truncate
                          "
                        >
                          by{" "}
                          {artwork.artistName}
                        </p>
                      </div>

                      <span
                        className="
                          text-sm
                          font-semibold
                          text-[#168BE8]
                          flex-shrink-0
                        "
                      >
                        €
                        {Number(
                          artwork.price ||
                            0
                        ).toLocaleString(
                          "en-US"
                        )}
                      </span>
                    </div>

                    {/* BADGES */}

                    <div
                      className="
                        mt-5
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      <Badge
                        text={
                          published
                            ? "Published"
                            : "Hidden"
                        }
                        type={
                          published
                            ? "success"
                            : "neutral"
                        }
                      />

                      <Badge
                        text={
                          artwork.sold
                            ? "Sold"
                            : artwork.available
                            ? "Available"
                            : "Unavailable"
                        }
                        type={
                          artwork.sold
                            ? "neutral"
                            : artwork.available
                            ? "success"
                            : "warning"
                        }
                      />

                      {certified && (
                        <Badge
                          text="Certified"
                          type="blue"
                        />
                      )}

                      {revoked && (
                        <Badge
                          text="Certificate revoked"
                          type="danger"
                        />
                      )}
                    </div>

                    {/* CERTIFICATE */}

                    {artwork.certificate
                      ?.certificateId && (
                      <div
                        className="
                          mt-4
                          p-3
                          bg-[#F5F9FC]
                          dark:bg-white/5
                        "
                      >
                        <p
                          className="
                            text-[8px]
                            uppercase
                            tracking-[0.13em]
                            text-[#718296]
                          "
                        >
                          Certificate ID
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
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

                    {/* ACTIONS */}

                    <div
                      className="
                        mt-5
                        grid
                        grid-cols-1
                        gap-2
                      "
                    >
                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          artwork._id
                        }
                        onClick={() =>
                          togglePublication(
                            artwork
                          )
                        }
                        className="
                          h-10
                          border
                          border-[#168BE8]
                          text-[#168BE8]
                          text-xs
                          font-semibold
                          disabled:opacity-50
                        "
                      >
                        {published
                          ? "Hide artwork"
                          : "Publish artwork"}
                      </button>

                      {certified && (
                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            artwork._id
                          }
                          onClick={() =>
                            revokeCertificate(
                              artwork
                            )
                          }
                          className="
                            h-10
                            bg-red-50
                            dark:bg-red-950/20
                            text-red-600
                            text-xs
                            font-semibold
                            disabled:opacity-50
                          "
                        >
                          Revoke certificate
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
    </AdminLayout>
  );
}

function Badge({
  text,
  type,
}) {
  const classes = {
    success:
      "bg-green-50 dark:bg-green-950/20 text-green-600",

    warning:
      "bg-orange-50 dark:bg-orange-950/20 text-orange-600",

    danger:
      "bg-red-50 dark:bg-red-950/20 text-red-600",

    blue:
      "bg-[#EAF6FF] dark:bg-[#168BE8]/10 text-[#168BE8]",

    neutral:
      "bg-[#F1F4F6] dark:bg-white/5 text-[#718296]",
  };

  return (
    <span
      className={`
        px-2.5
        py-1
        text-[9px]
        font-semibold

        ${
          classes[type] ||
          classes.neutral
        }
      `}
    >
      {text}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="py-20 text-center">
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
  );
}

function ErrorState({
  message,
}) {
  return (
    <div
      className="
        mt-6
        p-5
        bg-red-50
        dark:bg-red-950/20
        text-red-600
      "
    >
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="
        mt-6
        py-20
        bg-white
        dark:bg-[#0B2238]
        border
        border-[#DCE7EF]
        dark:border-white/10
        text-center
      "
    >
      <Icon
        icon="mdi:image-search-outline"
        width="38"
        className="
          mx-auto
          text-[#168BE8]
        "
      />

      <p
        className="
          mt-3
          text-sm
          text-[#718296]
        "
      >
        No artworks found.
      </p>
    </div>
  );
}

export default AdminArtworksPage;