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

import api from "../api";

import AdminLayout from "../components/admin/AdminLayout";

function AdminArtistsPage() {
  const [
    artists,
    setArtists,
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
    approvalFilter,
    setApprovalFilter,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  // ============================================================
  // LOAD ARTISTS
  // ============================================================

  const loadArtists =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/api/admin/artists"
            );

          setArtists(
            response.data
              ?.artists || []
          );
        } catch (
          requestError
        ) {
          console.error(
            "ADMIN ARTISTS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load artists."
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
          void loadArtists();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadArtists,
  ]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredArtists =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return artists.filter(
          (artist) => {
            const name =
              artist.artistName ||
              `${artist.firstName || ""} ${artist.lastName || ""}`;

            const matchesSearch =
              !query ||
              name
                .toLowerCase()
                .includes(
                  query
                ) ||
              artist.email
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              artist.artistCode
                ?.toLowerCase()
                .includes(
                  query
                );

            const approved =
              artist.artistApproved !==
              false;

            const matchesApproval =
              !approvalFilter ||
              (approvalFilter ===
                "approved" &&
                approved) ||
              (approvalFilter ===
                "pending" &&
                !approved);

            return (
              matchesSearch &&
              matchesApproval
            );
          }
        );
      },
      [
        artists,
        search,
        approvalFilter,
      ]
    );

  // ============================================================
  // APPROVAL
  // ============================================================

  const toggleApproval =
    async (
      artist
    ) => {
      const approved =
        artist.artistApproved ===
        false;

      try {
        setUpdatingId(
          artist._id
        );

        await api.patch(
          `/api/admin/artists/${artist._id}/approval`,
          {
            approved,
          }
        );

        setArtists(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                artist._id
                  ? {
                      ...item,
                      artistApproved:
                        approved,
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
            "Unable to update artist approval."
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
      title="Artists"
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
          Artist management
        </p>

        <h2
          className="
            mt-2
            font-serif
            text-[38px]
            md:text-[44px]
          "
        >
          Artists
        </h2>

        <p
          className="
            mt-3
            max-w-[620px]
            text-sm
            leading-6
            text-[#718296]
            dark:text-[#A9C0D3]
          "
        >
          Review artist accounts,
          their Messina Gallery
          identifiers and their
          approval status.
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
          md:grid-cols-[1fr_200px]
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
            placeholder="Search artist, email or Artist ID..."
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
            approvalFilter
          }
          onChange={(
            event
          ) =>
            setApprovalFilter(
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
            All artists
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="pending">
            Not approved
          </option>
        </select>
      </section>

      {/* CONTENT */}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
        />
      ) : filteredArtists.length ===
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
          {filteredArtists.map(
            (artist) => {
              const approved =
                artist.artistApproved !==
                false;

              const active =
                artist.isActive !==
                false;

              const name =
                artist.artistName ||
                `${artist.firstName || ""} ${artist.lastName || ""}`.trim() ||
                "Artist";

              return (
                <article
                  key={
                    artist._id
                  }
                  className="
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE7EF]
                    dark:border-white/10
                    p-5
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
                        w-14
                        h-14
                        rounded-full
                        flex
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-[#168BE8]
                        to-[#63BEFF]
                        text-white
                        font-serif
                        text-xl
                        flex-shrink-0
                      "
                    >
                      {name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <h3
                        className="
                          font-serif
                          text-[22px]
                          truncate
                        "
                      >
                        {name}
                      </h3>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-[#718296]
                          truncate
                        "
                      >
                        {artist.email}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <InfoBox
                      label="Artist ID"
                      value={
                        artist.artistCode ||
                        "—"
                      }
                    />

                    <InfoBox
                      label="Artworks"
                      value={
                        artist.artworkCount ||
                        0
                      }
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      <StatusBadge
                        active={
                          approved
                        }
                        activeText="Approved"
                        inactiveText="Not approved"
                      />

                      <StatusBadge
                        active={
                          active
                        }
                        activeText="Active"
                        inactiveText="Inactive"
                      />
                    </div>

                    <Link
                      to={`/artist/${artist._id}`}
                      className="
                        text-xs
                        font-semibold
                        text-[#168BE8]
                        hover:underline
                      "
                    >
                      View
                    </Link>
                  </div>

                  <button
                    type="button"
                    disabled={
                      updatingId ===
                      artist._id
                    }
                    onClick={() =>
                      toggleApproval(
                        artist
                      )
                    }
                    className={`
                      mt-5
                      w-full
                      h-11
                      text-xs
                      font-semibold
                      transition
                      disabled:opacity-50

                      ${
                        approved
                          ? `
                            bg-red-50
                            dark:bg-red-950/20
                            text-red-600
                          `
                          : `
                            bg-[#168BE8]
                            text-white
                          `
                      }
                    `}
                  >
                    {updatingId ===
                    artist._id
                      ? "Updating..."
                      : approved
                      ? "Remove approval"
                      : "Approve artist"}
                  </button>
                </article>
              );
            }
          )}
        </section>
      )}
    </AdminLayout>
  );
}

function InfoBox({
  label,
  value,
}) {
  return (
    <div
      className="
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
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-semibold
          truncate
        "
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  active,
  activeText,
  inactiveText,
}) {
  return (
    <span
      className={`
        px-2.5
        py-1
        text-[9px]
        font-semibold

        ${
          active
            ? `
              bg-green-50
              dark:bg-green-950/20
              text-green-600
            `
            : `
              bg-orange-50
              dark:bg-orange-950/20
              text-orange-600
            `
        }
      `}
    >
      {active
        ? activeText
        : inactiveText}
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
        icon="mdi:palette-outline"
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
        No artists found.
      </p>
    </div>
  );
}

export default AdminArtistsPage;