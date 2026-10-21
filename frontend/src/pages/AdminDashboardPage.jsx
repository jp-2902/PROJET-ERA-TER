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

import {
  useAuth,
} from "../context/AuthContext";

import AdminLayout from "../components/admin/AdminLayout";

// ============================================================
// HELPERS
// ============================================================

const formatNumber = (
  value
) =>
  Number(
    value || 0
  ).toLocaleString(
    "en-US"
  );

const formatPrice = (
  value
) =>
  new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "EUR",

      maximumFractionDigits:
        2,
    }
  ).format(
    Number(
      value || 0
    )
  );

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
};

const formatInputDate = (
  date
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

const getDefaultStartDate =
  () => {
    const now =
      new Date();

    return formatInputDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );
  };

const getDefaultEndDate =
  () =>
    formatInputDate(
      new Date()
    );

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

// ============================================================
// PAGE
// ============================================================

function AdminDashboardPage() {
  const {
    user,
  } = useAuth();

  const [
    data,
    setData,
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
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    rankings,
    setRankings,
  ] = useState(null);

  const [
    rankingsLoading,
    setRankingsLoading,
  ] = useState(false);

  const [
    analyticsLoading,
    setAnalyticsLoading,
  ] = useState(false);

  const [
    startDate,
    setStartDate,
  ] = useState(
    getDefaultStartDate
  );

  const [
    endDate,
    setEndDate,
  ] = useState(
    getDefaultEndDate
  );

  // ============================================================
  // LOAD
  // ============================================================

  const loadDashboard =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/api/admin/dashboard"
            );

          setData(
            response.data
          );
        } catch (
          requestError
        ) {
          console.error(
            "ADMIN DASHBOARD ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load the administration dashboard."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  const loadAnalytics =
    useCallback(
      async (
        selectedStartDate =
          startDate,

        selectedEndDate =
          endDate
      ) => {
        try {
          setAnalyticsLoading(
            true
          );

          setError("");

          const response =
            await api.get(
              "/api/admin/analytics",
              {
                params: {
                  startDate:
                    selectedStartDate,

                  endDate:
                    selectedEndDate,
                },
              }
            );

          setAnalytics(
            response.data
          );

        } catch (
          requestError
        ) {
          console.error(
            "ADMIN ANALYTICS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load analytics."
          );

        } finally {
          setAnalyticsLoading(
            false
          );
        }
      },
      [
        startDate,
        endDate,
      ]
    );

  const loadRankings =
    useCallback(
      async (
        selectedStartDate =
          startDate,

        selectedEndDate =
          endDate
      ) => {
        try {
          setRankingsLoading(
            true
          );

          const response =
            await api.get(
              "/api/admin/analytics/rankings",
              {
                params: {
                  startDate:
                    selectedStartDate,

                  endDate:
                    selectedEndDate,
                },
              }
            );

          setRankings(
            response.data
          );

        } catch (
          requestError
        ) {
          console.error(
            "ADMIN RANKINGS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load rankings."
          );

        } finally {
          setRankingsLoading(
            false
          );
        }
      },
      [
        startDate,
        endDate,
      ]
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadDashboard();

          void loadAnalytics(
            startDate,
            endDate
          );
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadDashboard,
    loadAnalytics,
    loadRankings,
    startDate,
    endDate,
  ]);

  // ============================================================
  // DATA
  // ============================================================

  const stats =
    useMemo(
      () =>
        data?.stats ||
        {},
      [
        data?.stats,
      ]
    );

  const recentUsers =
    data?.recent
      ?.users || [];

  const recentArtworks =
    data?.recent
      ?.artworks || [];

  const recentOrders =
    data?.recent
      ?.orders || [];

  const statCards =
    useMemo(
      () => [
        {
          label:
            "Users",

          value:
            formatNumber(
              stats.totalUsers
            ),

          helper:
            `${formatNumber(
              stats.totalCollectors
            )} collectors`,

          icon:
            "mdi:account-group-outline",

          to:
            "/admin/users",
        },

        {
          label:
            "Artists",

          value:
            formatNumber(
              stats.totalArtists
            ),

          helper:
            `${formatNumber(
              stats.activeArtists
            )} active`,

          icon:
            "mdi:palette-outline",

          to:
            "/admin/artists",
        },

        {
          label:
            "Artworks",

          value:
            formatNumber(
              stats.totalArtworks
            ),

          helper:
            `${formatNumber(
              stats.availableArtworks
            )} available`,

          icon:
            "mdi:image-multiple-outline",

          to:
            "/admin/artworks",
        },

        {
          label:
            "Orders",

          value:
            formatNumber(
              stats.totalOrders
            ),

          helper:
            `${formatNumber(
              stats.paidOrders
            )} paid`,

          icon:
            "mdi:package-variant-closed",

          to:
            "/admin/orders",
        },

        {
          label:
            "Revenue",

          value:
            formatPrice(
              stats.totalRevenue
            ),

          helper:
            "Paid orders",

          icon:
            "mdi:cash-multiple",

          to:
            "/admin/orders",
        },

        {
          label:
            "Certificates",

          value:
            formatNumber(
              stats.certifiedArtworks
            ),

          helper:
            "Authenticated",

          icon:
            "mdi:certificate-outline",

          to:
            "/admin/artworks",
        },
      ],
      [
        stats,
      ]
    );

  const periodAnalytics =
    analytics?.analytics ||
    {};

  const rankingData =
    rankings?.rankings ||
    {};

  const artworksByCategory =
    rankingData
      .artworksByCategory ||
    [];

  const salesByCategory =
    rankingData
      .salesByCategory ||
    [];

  const topArtists =
    rankingData
      .topArtists ||
    [];

  const periodCards = [
    {
      label:
        "Connections",

      value:
        formatNumber(
          periodAnalytics.connections
        ),

      icon:
        "mdi:login",
    },

    {
      label:
        "New accounts",

      value:
        formatNumber(
          periodAnalytics.newAccounts
        ),

      icon:
        "mdi:account-plus-outline",
    },

    {
      label:
        "Collectors",

      value:
        formatNumber(
          periodAnalytics.newCollectors
        ),

      icon:
        "mdi:account-heart-outline",
    },

    {
      label:
        "Artists",

      value:
        formatNumber(
          periodAnalytics.newArtists
        ),

      icon:
        "mdi:palette-outline",
    },

    {
      label:
        "Artworks added",

      value:
        formatNumber(
          periodAnalytics.artworksAdded
        ),

      icon:
        "mdi:image-plus-outline",
    },

    {
      label:
        "Sales",

      value:
        formatNumber(
          periodAnalytics.paidOrders
        ),

      icon:
        "mdi:cart-check",
    },

    {
      label:
        "Revenue",

      value:
        formatPrice(
          periodAnalytics.totalRevenue
        ),

      icon:
        "mdi:cash-multiple",
    },
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <AdminLayout
        title="Dashboard"
        eyebrow="Administration"
      >
        <div
          className="
            min-h-[520px]
            flex
            flex-col
            items-center
            justify-center
          "
        >
          <Icon
            icon="mdi:loading"
            width="40"
            className="
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
            Loading administration...
          </p>
        </div>
      </AdminLayout>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <AdminLayout
      title="Dashboard"
      eyebrow="Administration"
    >
      {/* INTRO */}

      <section
        className="
          flex
          flex-col
          md:flex-row
          md:items-end
          md:justify-between
          gap-5
        "
      >
        <div>
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.22em]
              text-[#168BE8]
            "
          >
            Overview
          </p>

          <h2
            className="
              mt-2
              font-serif
              text-[39px]
              md:text-[46px]
            "
          >
            Welcome back,{" "}

            <span
              className="
                italic
                text-[#168BE8]
              "
            >
              {user?.firstName ||
                "Admin"}.
            </span>
          </h2>

          <p
            className="
              mt-3
              max-w-[620px]
              text-sm
              leading-7
              text-[#718296]
              dark:text-[#A9C0D3]
            "
          >
            Monitor users,
            artists, artworks,
            certificates and
            orders from one
            central administration
            space.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            text-[#718296]
          "
        >
          <Icon
            icon="mdi:calendar-outline"
            width="17"
          />

          {new Date().toLocaleDateString(
            "en-GB",
            {
              weekday:
                "long",

              day:
                "2-digit",

              month:
                "long",

              year:
                "numeric",
            }
          )}
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div
          className="
            mt-7
            p-4
            flex
            items-center
            gap-3
            bg-red-50
            dark:bg-red-950/20
            border
            border-red-200
            dark:border-red-900/40
            text-red-600
            dark:text-red-300
            text-sm
          "
        >
          <Icon
            icon="mdi:alert-circle-outline"
            width="20"
          />

          {error}
        </div>
      )}

      {/* PERIOD ANALYTICS */}

      <section
        className="
          mt-9
          p-6
          md:p-7
          bg-white
          dark:bg-[#0B2238]
          border
          border-[#DCE7EF]
          dark:border-white/10
        "
      >
        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-end
            xl:justify-between
            gap-6
          "
        >
          <div>
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.22em]
                text-[#168BE8]
              "
            >
              Period analytics
            </p>

            <h3
              className="
                mt-2
                font-serif
                text-[28px]
              "
            >
              Analyse activity
              between two dates.
            </h3>
          </div>

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-end
              gap-3
            "
          >
            <label
              className="
                text-xs
                font-semibold
              "
            >
              <span
                className="
                  block
                  mb-2
                "
              >
                Start date
              </span>

              <input
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target.value
                  )
                }
                className="
                  h-11
                  px-3
                  border
                  border-[#D5E3ED]
                  dark:border-white/10
                  bg-white
                  dark:bg-[#071B2D]
                  outline-none
                "
              />
            </label>

            <label
              className="
                text-xs
                font-semibold
              "
            >
              <span
                className="
                  block
                  mb-2
                "
              >
                End date
              </span>

              <input
                type="date"
                value={
                  endDate
                }
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target.value
                  )
                }
                className="
                  h-11
                  px-3
                  border
                  border-[#D5E3ED]
                  dark:border-white/10
                  bg-white
                  dark:bg-[#071B2D]
                  outline-none
                "
              />
            </label>

            <button
              type="button"
              onClick={() => {
                void loadAnalytics(
                  startDate,
                  endDate
                );

                void loadRankings(
                  startDate,
                  endDate
                );
              }}
              disabled={
                analyticsLoading
              }
              className="
                h-11
                px-5
                bg-[#168BE8]
                text-white
                text-xs
                font-bold
                disabled:opacity-60
              "
            >
              {analyticsLoading
                ? "Loading..."
                : "Apply"}
            </button>
          </div>
        </div>

        <div
          className="
            mt-7
            grid
            grid-cols-2
            md:grid-cols-3
            xl:grid-cols-7
            gap-3
          "
        >
          {periodCards.map(
            (card) => (
              <div
                key={
                  card.label
                }
                className="
                  min-h-[125px]
                  p-4
                  bg-[#F7FBFE]
                  dark:bg-[#071B2D]
                  border
                  border-[#E1EBF2]
                  dark:border-white/10
                "
              >
                <Icon
                  icon={
                    card.icon
                  }
                  width="20"
                  className="
                    text-[#168BE8]
                  "
                />

                <p
                  className="
                    mt-4
                    font-serif
                    text-[23px]
                  "
                >
                  {card.value}
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    uppercase
                    tracking-[0.08em]
                    text-[#74889A]
                  "
                >
                  {card.label}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* CATEGORY & SALES RANKINGS */}

      <section
        className="
          mt-8
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-5
        "
      >
        {/* ARTWORKS BY CATEGORY */}

        <div
          className="
            p-6
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE7EF]
            dark:border-white/10
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
            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.2em]
                  text-[#168BE8]
                "
              >
                Artwork ranking
              </p>

              <h3
                className="
                  mt-2
                  font-serif
                  text-[24px]
                "
              >
                Artworks by category
              </h3>
            </div>

            <Icon
              icon="mdi:image-multiple-outline"
              width="27"
              className="
                text-[#168BE8]
              "
            />
          </div>

          <div
            className="
              mt-6
              space-y-3
            "
          >
            {rankingsLoading ? (
              <p
                className="
                  text-sm
                  text-[#74889A]
                "
              >
                Loading...
              </p>
            ) : artworksByCategory.length ===
              0 ? (
              <p
                className="
                  text-sm
                  text-[#74889A]
                "
              >
                No artworks for this period.
              </p>
            ) : (
              artworksByCategory.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.category
                    }
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      py-3
                      border-b
                      border-[#E8EFF4]
                      dark:border-white/10
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          text-xs
                          font-bold
                          text-[#168BE8]
                        "
                      >
                        #{index + 1}
                      </span>

                      <span
                        className="
                          text-sm
                          font-semibold
                        "
                      >
                        {item.category}
                      </span>
                    </div>

                    <span
                      className="
                        font-serif
                        text-[20px]
                      "
                    >
                      {formatNumber(
                        item.count
                      )}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* SALES BY CATEGORY */}

        <div
          className="
            p-6
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE7EF]
            dark:border-white/10
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
            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.2em]
                  text-[#168BE8]
                "
              >
                Sales ranking
              </p>

              <h3
                className="
                  mt-2
                  font-serif
                  text-[24px]
                "
              >
                Sales by category
              </h3>
            </div>

            <Icon
              icon="mdi:chart-bar"
              width="27"
              className="
                text-[#168BE8]
              "
            />
          </div>

          <div
            className="
              mt-6
              space-y-3
            "
          >
            {rankingsLoading ? (
              <p
                className="
                  text-sm
                  text-[#74889A]
                "
              >
                Loading...
              </p>
            ) : salesByCategory.length ===
              0 ? (
              <p
                className="
                  text-sm
                  text-[#74889A]
                "
              >
                No sales for this period.
              </p>
            ) : (
              salesByCategory.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.category
                    }
                    className="
                      py-3
                      border-b
                      border-[#E8EFF4]
                      dark:border-white/10
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <span
                          className="
                            text-xs
                            font-bold
                            text-[#168BE8]
                          "
                        >
                          #{index + 1}
                        </span>

                        <span
                          className="
                            text-sm
                            font-semibold
                          "
                        >
                          {item.category}
                        </span>
                      </div>

                      <span
                        className="
                          font-serif
                          text-[20px]
                        "
                      >
                        {formatNumber(
                          item.sales
                        )}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1
                        ml-8
                        text-xs
                        text-[#74889A]
                      "
                    >
                      Revenue:{" "}
                      {formatPrice(
                        item.revenue
                      )}
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>

        {/* TOP ARTISTS */}

        <div
          className="
            p-6
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE7EF]
            dark:border-white/10
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
            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.2em]
                  text-[#168BE8]
                "
              >
                Artist ranking
              </p>

              <h3
                className="
                  mt-2
                  font-serif
                  text-[24px]
                "
              >
                Top artists
              </h3>
            </div>

            <Icon
              icon="mdi:palette-outline"
              width="27"
              className="
                text-[#168BE8]
              "
            />
          </div>

          <div
            className="
              mt-6
              space-y-3
            "
          >
            {rankingsLoading ? (
              <p
                className="
                  text-sm
                  text-[#74889A]
                "
              >
                Loading...
              </p>
            ) : topArtists.length ===
              0 ? (
              <p
                className="
                  text-sm
                  text-[#74889A]
                "
              >
                No artist sales for this period.
              </p>
            ) : (
              topArtists.map(
                (
                  artist,
                  index
                ) => (
                  <div
                    key={
                      artist.artistId ||
                      `${artist.artistName}-${index}`
                    }
                    className="
                      py-3
                      border-b
                      border-[#E8EFF4]
                      dark:border-white/10
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          min-w-0
                        "
                      >
                        <span
                          className="
                            text-xs
                            font-bold
                            text-[#168BE8]
                          "
                        >
                          #{index + 1}
                        </span>

                        <span
                          className="
                            text-sm
                            font-semibold
                            truncate
                          "
                        >
                          {artist.artistName}
                        </span>
                      </div>

                      <span
                        className="
                          font-serif
                          text-[18px]
                          whitespace-nowrap
                        "
                      >
                        {formatPrice(
                          artist.revenue
                        )}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1
                        ml-8
                        text-xs
                        text-[#74889A]
                      "
                    >
                      {formatNumber(
                        artist.sales
                      )}{" "}
                      sale(s)
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </section>

      {/* STATS */}

      <section
        className="
          mt-9
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-6
          gap-4
        "
      >
        {statCards.map(
          (card) => (
            <Link
              key={
                card.label
              }
              to={
                card.to
              }
              className="
                group
                min-h-[165px]
                p-5
                bg-white
                dark:bg-[#0B2238]
                border
                border-[#DCE7EF]
                dark:border-white/10
                hover:-translate-y-1
                hover:shadow-[0_15px_35px_rgba(17,69,110,0.09)]
                transition-all
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >
                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-[#EAF6FF]
                    dark:bg-[#168BE8]/10
                    text-[#168BE8]
                  "
                >
                  <Icon
                    icon={
                      card.icon
                    }
                    width="22"
                  />
                </div>

                <Icon
                  icon="mdi:arrow-top-right"
                  width="18"
                  className="
                    text-[#A1B1BE]
                    group-hover:text-[#168BE8]
                  "
                />
              </div>

              <p
                className="
                  mt-5
                  font-serif
                  text-[27px]
                "
              >
                {card.value}
              </p>

              <div
                className="
                  mt-2
                  flex
                  items-end
                  justify-between
                  gap-2
                "
              >
                <p
                  className="
                    text-xs
                    font-semibold
                  "
                >
                  {card.label}
                </p>

                <p
                  className="
                    text-[9px]
                    text-[#8293A2]
                    text-right
                  "
                >
                  {card.helper}
                </p>
              </div>
            </Link>
          )
        )}
      </section>

      {/* QUICK ACTIONS */}

      <section
        className="
          mt-9
          p-6
          md:p-7
          bg-gradient-to-r
          from-[#061B30]
          via-[#0A416D]
          to-[#116BA7]
          text-white
        "
      >
        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >
          <div>
            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.22em]
                text-[#91D5FF]
              "
            >
              Quick management
            </p>

            <h3
              className="
                mt-2
                font-serif
                text-[29px]
              "
            >
              Manage the platform.
            </h3>
          </div>

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-4
              gap-3
            "
          >
            <QuickAction
              to="/admin/users"
              icon="mdi:account-group-outline"
              label="Users"
            />

            <QuickAction
              to="/admin/artists"
              icon="mdi:palette-outline"
              label="Artists"
            />

            <QuickAction
              to="/admin/artworks"
              icon="mdi:image-multiple-outline"
              label="Artworks"
            />

            <QuickAction
              to="/admin/orders"
              icon="mdi:package-variant-closed"
              label="Orders"
            />
          </div>
        </div>
      </section>

      {/* RECENT */}

      <div
        className="
          mt-9
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
      >
        <section
          className="
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE7EF]
            dark:border-white/10
          "
        >
          <SectionHeader
            eyebrow="Commerce"
            title="Recent orders"
            to="/admin/orders"
          />

          {recentOrders.length >
          0 ? (
            recentOrders.map(
              (order) => (
                <RecentOrder
                  key={
                    order._id
                  }
                  order={
                    order
                  }
                />
              )
            )
          ) : (
            <EmptySection
              icon="mdi:package-variant"
              message="No orders yet."
            />
          )}
        </section>

        <section
          className="
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE7EF]
            dark:border-white/10
          "
        >
          <SectionHeader
            eyebrow="Community"
            title="New members"
            to="/admin/users"
          />

          {recentUsers.length >
          0 ? (
            recentUsers.map(
              (member) => (
                <RecentUser
                  key={
                    member._id
                  }
                  member={
                    member
                  }
                />
              )
            )
          ) : (
            <EmptySection
              icon="mdi:account-group-outline"
              message="No users yet."
            />
          )}
        </section>
      </div>

      {/* ARTWORKS */}

      <section
        className="
          mt-6
          bg-white
          dark:bg-[#0B2238]
          border
          border-[#DCE7EF]
          dark:border-white/10
        "
      >
        <SectionHeader
          eyebrow="Gallery"
          title="Recent artworks"
          to="/admin/artworks"
        />

        {recentArtworks.length >
        0 ? (
          <div
            className="
              p-6
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              2xl:grid-cols-5
              gap-4
            "
          >
            {recentArtworks.map(
              (artwork) => (
                <Link
                  key={
                    artwork._id
                  }
                  to={`/artwork/${artwork._id}`}
                  className="
                    group
                    border
                    border-[#DFE8EF]
                    dark:border-white/10
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-[180px]
                      overflow-hidden
                      bg-[#E9F1F6]
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
                        duration-500
                      "
                    />
                  </div>

                  <div className="p-4">
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.14em]
                        text-[#168BE8]
                      "
                    >
                      {artwork.category}
                    </p>

                    <h3
                      className="
                        mt-1
                        font-serif
                        text-[19px]
                        truncate
                      "
                    >
                      {artwork.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-[11px]
                        text-[#718296]
                        truncate
                      "
                    >
                      by{" "}
                      {artwork.artistName}
                    </p>

                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-semibold
                          text-[#168BE8]
                        "
                      >
                        {formatPrice(
                          artwork.price
                        )}
                      </span>

                      <span
                        className="
                          text-[9px]
                          uppercase
                          tracking-[0.11em]
                          text-[#718296]
                        "
                      >
                        {artwork.sold
                          ? "Sold"
                          : artwork.available
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        ) : (
          <EmptySection
            icon="mdi:image-multiple-outline"
            message="No artworks yet."
          />
        )}
      </section>
    </AdminLayout>
  );
}

// ============================================================
// QUICK ACTION
// ============================================================

function QuickAction({
  to,
  icon,
  label,
}) {
  return (
    <Link
      to={to}
      className="
        min-w-[125px]
        min-h-[74px]
        px-4
        flex
        flex-col
        items-center
        justify-center
        gap-2
        bg-white/10
        border
        border-white/10
        hover:bg-white
        hover:text-[#0A416D]
        transition
      "
    >
      <Icon
        icon={icon}
        width="21"
      />

      <span
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.12em]
        "
      >
        {label}
      </span>
    </Link>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  eyebrow,
  title,
  to,
}) {
  return (
    <div
      className="
        px-6
        py-5
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <div>
        <p
          className="
            text-[8px]
            uppercase
            tracking-[0.18em]
            text-[#168BE8]
          "
        >
          {eyebrow}
        </p>

        <h3
          className="
            mt-1
            font-serif
            text-[23px]
          "
        >
          {title}
        </h3>
      </div>

      <Link
        to={to}
        className="
          inline-flex
          items-center
          gap-2
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-[#168BE8]
        "
      >
        View all

        <Icon
          icon="mdi:arrow-right"
          width="16"
        />
      </Link>
    </div>
  );
}

// ============================================================
// RECENT ORDER
// ============================================================

function RecentOrder({
  order,
}) {
  const buyerName =
    order.buyer?.firstName ||
    order.buyerName ||
    "Customer";

  return (
    <div
      className="
        px-6
        py-4
        flex
        items-center
        gap-4
        border-t
        border-[#E7EEF4]
        dark:border-white/10
      "
    >
      <div
        className="
          w-10
          h-10
          flex
          items-center
          justify-center
          bg-[#EAF6FF]
          dark:bg-[#168BE8]/10
          text-[#168BE8]
        "
      >
        <Icon
          icon="mdi:package-variant-closed"
          width="20"
        />
      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <p
          className="
            text-sm
            font-semibold
            truncate
          "
        >
          {order.orderNumber ||
            `#${String(
              order._id
            ).slice(
              -6
            )}`}
        </p>

        <p
          className="
            mt-1
            text-[11px]
            text-[#718296]
          "
        >
          {buyerName}
          {" • "}
          {formatDate(
            order.createdAt
          )}
        </p>
      </div>

      <div className="text-right">
        <p
          className="
            text-sm
            font-semibold
            text-[#168BE8]
          "
        >
          {formatPrice(
            order.total
          )}
        </p>

        <p
          className="
            mt-1
            text-[9px]
            uppercase
            text-[#718296]
          "
        >
          {order.paymentStatus ||
            order.status}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// RECENT USER
// ============================================================

function RecentUser({
  member,
}) {
  const name =
    member.artistName ||
    `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
    "Member";

  return (
    <div
      className="
        px-6
        py-4
        flex
        items-center
        gap-4
        border-t
        border-[#E7EEF4]
        dark:border-white/10
      "
    >
      <div
        className="
          w-10
          h-10
          rounded-full
          flex
          items-center
          justify-center
          bg-gradient-to-br
          from-[#168BE8]
          to-[#63BEFF]
          text-white
          text-xs
          font-semibold
        "
      >
        {name
          .charAt(0)
          .toUpperCase()}
      </div>

      <div
        className="
          flex-1
          min-w-0
        "
      >
        <p
          className="
            text-sm
            font-semibold
            truncate
          "
        >
          {name}
        </p>

        <p
          className="
            mt-1
            text-[11px]
            text-[#718296]
            truncate
          "
        >
          {member.email}
        </p>
      </div>

      <span
        className="
          px-2.5
          py-1
          bg-[#EDF7FD]
          dark:bg-white/5
          text-[9px]
          uppercase
          text-[#168BE8]
        "
      >
        {member.role ===
        "user"
          ? "Collector"
          : member.role}
      </span>
    </div>
  );
}

// ============================================================
// EMPTY
// ============================================================

function EmptySection({
  icon,
  message,
}) {
  return (
    <div
      className="
        min-h-[180px]
        flex
        flex-col
        items-center
        justify-center
        border-t
        border-[#E7EEF4]
        dark:border-white/10
      "
    >
      <Icon
        icon={icon}
        width="31"
        className="
          text-[#168BE8]
        "
      />

      <p
        className="
          mt-3
          text-xs
          text-[#718296]
        "
      >
        {message}
      </p>
    </div>
  );
}

export default AdminDashboardPage;