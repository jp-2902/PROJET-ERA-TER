import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Icon,
} from "@iconify/react";

import api from "../api";

import AdminLayout from "../components/admin/AdminLayout";

const statuses = [
  "Pending",
  "In progress",
  "Resolved",
  "Closed",
];

function AdminSupportPage() {
  const [
    requests,
    setRequests,
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
    priorityFilter,
    setPriorityFilter,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  const [
    sendingReplyId,
    setSendingReplyId,
  ] = useState("");

  const [
    savingNoteId,
    setSavingNoteId,
  ] = useState("");

  const [
    replyDrafts,
    setReplyDrafts,
  ] = useState({});

  const [
    noteDrafts,
    setNoteDrafts,
  ] = useState({});

  // ============================================================
  // LOAD REQUESTS
  // ============================================================

  const loadRequests =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          const response =
            await api.get(
              "/api/support/admin"
            );

          const data =
            response.data
              ?.requests ||
            [];

          setRequests(
            data
          );

          const notes = {};

          data.forEach(
            (
              request
            ) => {
              notes[
                request._id
              ] =
                request.adminNote ||
                "";
            }
          );

          setNoteDrafts(
            notes
          );

        } catch (
          requestError
        ) {
          console.error(
            "ADMIN SUPPORT ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load support requests."
          );

        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadRequests();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadRequests,
  ]);

  // ============================================================
  // FILTERS
  // ============================================================

  const filteredRequests =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return requests.filter(
          (
            request
          ) => {
            const matchesSearch =
              !query ||
              request.reference
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              request.name
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              request.email
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              request.phone
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              request.subject
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              request.message
                ?.toLowerCase()
                .includes(
                  query
                );

            const matchesStatus =
              !statusFilter ||
              request.status ===
                statusFilter;

            const matchesPriority =
              !priorityFilter ||
              request.priority ===
                priorityFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesPriority
            );
          }
        );
      },
      [
        requests,
        search,
        statusFilter,
        priorityFilter,
      ]
    );

  // ============================================================
  // REPLACE REQUEST IN STATE
  // ============================================================

  const replaceRequest =
    (
      updatedRequest
    ) => {
      if (
        !updatedRequest
      ) {
        return;
      }

      setRequests(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item._id ===
              updatedRequest._id
                ? updatedRequest
                : item
          )
      );
    };

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const updateStatus =
    async (
      requestId,
      status
    ) => {
      try {
        setUpdatingId(
          requestId
        );

        const response =
          await api.patch(
            `/api/support/admin/${requestId}`,
            {
              status,
            }
          );

        replaceRequest(
          response.data
            ?.request
        );

      } catch (
        requestError
      ) {
        console.error(
          "UPDATE SUPPORT STATUS ERROR:",
          requestError
        );

        window.alert(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to update support request."
        );

      } finally {
        setUpdatingId(
          ""
        );
      }
    };

  // ============================================================
  // SAVE INTERNAL NOTE
  // ============================================================

  const saveAdminNote =
    async (
      requestId
    ) => {
      try {
        setSavingNoteId(
          requestId
        );

        const response =
          await api.patch(
            `/api/support/admin/${requestId}`,
            {
              adminNote:
                noteDrafts[
                  requestId
                ] ||
                "",
            }
          );

        replaceRequest(
          response.data
            ?.request
        );

        window.alert(
          "Internal note saved."
        );

      } catch (
        requestError
      ) {
        console.error(
          "SAVE ADMIN NOTE ERROR:",
          requestError
        );

        window.alert(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to save internal note."
        );

      } finally {
        setSavingNoteId(
          ""
        );
      }
    };

  // ============================================================
  // SEND REPLY
  // ============================================================

  const sendReply =
    async (
      requestId,
      resolve
    ) => {
      const reply =
        replyDrafts[
          requestId
        ]?.trim();

      if (
        !reply
      ) {
        window.alert(
          "Please write a reply before sending."
        );

        return;
      }

      try {
        setSendingReplyId(
          requestId
        );

        const response =
          await api.post(
            `/api/support/admin/${requestId}/reply`,
            {
              reply,

              resolve,
            }
          );

        replaceRequest(
          response.data
            ?.request
        );

        setReplyDrafts(
          (
            current
          ) => ({
            ...current,

            [requestId]:
              "",
          })
        );

        window.alert(
          resolve
            ? "Reply sent and request resolved."
            : "Reply sent successfully."
        );

      } catch (
        requestError
      ) {
        console.error(
          "SEND SUPPORT REPLY ERROR:",
          requestError
        );

        window.alert(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to send reply."
        );

      } finally {
        setSendingReplyId(
          ""
        );
      }
    };

  // ============================================================
  // COUNTERS
  // ============================================================

  const totalRequests =
    requests.length;

  const urgentRequests =
    requests.filter(
      (
        request
      ) =>
        request.priority ===
        "Urgent"
    ).length;

  const pendingRequests =
    requests.filter(
      (
        request
      ) =>
        request.status ===
        "Pending"
    ).length;

  const resolvedRequests =
    requests.filter(
      (
        request
      ) =>
        request.status ===
        "Resolved"
    ).length;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <AdminLayout
      title="Support"
      eyebrow="Administration"
    >
      {/* ======================================================
          INTRO
      ====================================================== */}

      <section>
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-[#168BE8]
          "
        >
          Customer support
        </p>

        <h2
          className="
            mt-2
            font-serif
            text-[38px]
            md:text-[44px]
          "
        >
          Support Requests
        </h2>

        <p
          className="
            mt-3
            max-w-[700px]
            text-sm
            leading-7
            text-[#718296]
            dark:text-[#A9C0D3]
          "
        >
          Review customer messages,
          reply directly by email and
          manage each support request
          from Messina Gallery.
        </p>
      </section>

      {/* ======================================================
          STATS
      ====================================================== */}

      <section
        className="
          mt-8
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >
        <StatCard
          icon="mdi:headset"
          label="Total requests"
          value={
            totalRequests
          }
        />

        <StatCard
          icon="mdi:alert-octagon-outline"
          label="Urgent"
          value={
            urgentRequests
          }
          danger
        />

        <StatCard
          icon="mdi:clock-outline"
          label="Pending"
          value={
            pendingRequests
          }
        />

        <StatCard
          icon="mdi:check-circle-outline"
          label="Resolved"
          value={
            resolvedRequests
          }
        />
      </section>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <section
        className="
          mt-6
          p-5
          bg-white
          dark:bg-[#0B2238]
          border
          border-[#DCE7EF]
          dark:border-white/10
          grid
          grid-cols-1
          md:grid-cols-[1fr_190px_190px]
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
            placeholder="Search request, email, subject..."
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
            All statuses
          </option>

          {statuses.map(
            (
              status
            ) => (
              <option
                key={
                  status
                }
                value={
                  status
                }
              >
                {status}
              </option>
            )
          )}
        </select>

        <select
          value={
            priorityFilter
          }
          onChange={(
            event
          ) =>
            setPriorityFilter(
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
            All priorities
          </option>

          <option value="Normal">
            Normal
          </option>

          <option value="High">
            High
          </option>

          <option value="Urgent">
            Urgent
          </option>
        </select>
      </section>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div
          className="
            py-20
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

          <p
            className="
              mt-3
              text-sm
              text-[#718296]
            "
          >
            Loading support requests...
          </p>
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading &&
        error && (
          <div
            className="
              mt-6
              p-5
              bg-red-50
              dark:bg-red-950/20
              border
              border-red-200
              dark:border-red-900/40
              text-sm
              text-red-600
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

      {/* ======================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        !error &&
        filteredRequests.length ===
          0 && (
          <div
            className="
              mt-6
              min-h-[260px]
              flex
              flex-col
              items-center
              justify-center
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE7EF]
              dark:border-white/10
              text-center
            "
          >
            <Icon
              icon="mdi:email-search-outline"
              width="40"
              className="
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
              No support requests found.
            </p>
          </div>
        )}

      {/* ======================================================
          REQUESTS
      ====================================================== */}

      {!loading &&
        !error &&
        filteredRequests.length >
          0 && (
          <section
            className="
              mt-6
              space-y-5
            "
          >
            {filteredRequests.map(
              (
                request
              ) => (
                <SupportCard
                  key={
                    request._id
                  }
                  request={
                    request
                  }
                  updating={
                    updatingId ===
                    request._id
                  }
                  sendingReply={
                    sendingReplyId ===
                    request._id
                  }
                  savingNote={
                    savingNoteId ===
                    request._id
                  }
                  updateStatus={
                    updateStatus
                  }
                  replyValue={
                    replyDrafts[
                      request._id
                    ] ||
                    ""
                  }
                  setReplyValue={(
                    value
                  ) =>
                    setReplyDrafts(
                      (
                        current
                      ) => ({
                        ...current,

                        [request._id]:
                          value,
                      })
                    )
                  }
                  noteValue={
                    noteDrafts[
                      request._id
                    ] ??
                    request.adminNote ??
                    ""
                  }
                  setNoteValue={(
                    value
                  ) =>
                    setNoteDrafts(
                      (
                        current
                      ) => ({
                        ...current,

                        [request._id]:
                          value,
                      })
                    )
                  }
                  saveAdminNote={
                    saveAdminNote
                  }
                  sendReply={
                    sendReply
                  }
                />
              )
            )}
          </section>
        )}
    </AdminLayout>
  );
}

// ============================================================
// SUPPORT CARD
// ============================================================

function SupportCard({
  request,
  updating,
  sendingReply,
  savingNote,
  updateStatus,
  replyValue,
  setReplyValue,
  noteValue,
  setNoteValue,
  saveAdminNote,
  sendReply,
}) {
  const isUrgent =
    request.priority ===
    "Urgent";

  const repliedByName =
    request.repliedBy
      ? `${request.repliedBy.firstName || ""} ${request.repliedBy.lastName || ""}`.trim()
      : "";

  return (
    <article
      className={`
        bg-white
        dark:bg-[#0B2238]
        border

        ${
          isUrgent
            ? `
              border-red-300
              dark:border-red-900/50
            `
            : `
              border-[#DCE7EF]
              dark:border-white/10
            `
        }

        overflow-hidden
      `}
    >
      {isUrgent && (
        <div
          className="
            px-5
            py-2
            bg-red-500
            flex
            items-center
            gap-2
            text-white
            text-[9px]
            uppercase
            tracking-[0.16em]
            font-semibold
          "
        >
          <Icon
            icon="mdi:alert-octagon"
            width="16"
          />

          Urgent support request
        </div>
      )}

      <div
        className="
          p-6
        "
      >
        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-start
            xl:justify-between
            gap-6
          "
        >
          {/* LEFT */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <span
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.15em]
                  text-[#168BE8]
                  font-semibold
                "
              >
                {request.reference}
              </span>

              <PriorityBadge
                priority={
                  request.priority
                }
              />

              <StatusBadge
                status={
                  request.status
                }
              />

              {request.replyEmailSent && (
                <span
                  className="
                    px-2.5
                    py-1
                    bg-green-50
                    dark:bg-green-950/20
                    text-green-600
                    text-[9px]
                    font-semibold
                  "
                >
                  Reply sent
                </span>
              )}
            </div>

            <h3
              className="
                mt-4
                font-serif
                text-[26px]
              "
            >
              {request.subject}
            </h3>

            <div
              className="
                mt-4
                grid
                grid-cols-1
                md:grid-cols-2
                gap-3
              "
            >
              <InfoLine
                icon="mdi:account-outline"
                label="Name"
                value={
                  request.name
                }
              />

              <InfoLine
                icon="mdi:email-outline"
                label="Email"
                value={
                  request.email
                }
              />

              <InfoLine
                icon="mdi:phone-outline"
                label="Phone"
                value={
                  request.phone ||
                  "Not provided"
                }
              />

              <InfoLine
                icon="mdi:shape-outline"
                label="Category"
                value={
                  request.category
                }
              />
            </div>

            {/* CUSTOMER MESSAGE */}

            <div
              className="
                mt-5
                p-5
                bg-[#F5F9FC]
                dark:bg-white/5
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
                Customer message
              </p>

              <p
                className="
                  mt-3
                  text-sm
                  leading-7
                  whitespace-pre-line
                  text-[#334A60]
                  dark:text-[#D4E3EF]
                "
              >
                {request.message}
              </p>
            </div>

            {/* LAST ADMIN REPLY */}

            {request.adminReply && (
              <div
                className="
                  mt-5
                  p-5
                  bg-[#EDF8FE]
                  dark:bg-[#168BE8]/10
                  border
                  border-[#D3E9F7]
                  dark:border-[#168BE8]/20
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Icon
                    icon="mdi:email-check-outline"
                    width="18"
                    className="
                      text-[#168BE8]
                    "
                  />

                  <p
                    className="
                      text-[8px]
                      uppercase
                      tracking-[0.15em]
                      text-[#168BE8]
                      font-semibold
                    "
                  >
                    Last reply sent
                  </p>
                </div>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    whitespace-pre-line
                    text-[#334A60]
                    dark:text-[#D4E3EF]
                  "
                >
                  {request.adminReply}
                </p>

                <p
                  className="
                    mt-4
                    text-[10px]
                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  {request.repliedAt
                    ? new Date(
                        request.repliedAt
                      ).toLocaleString(
                        "en-GB"
                      )
                    : ""}

                  {repliedByName
                    ? ` • ${repliedByName}`
                    : ""}
                </p>
              </div>
            )}

            {/* REPLY COMPOSER */}

            <div
              className="
                mt-5
                p-5
                border
                border-[#DCE7EF]
                dark:border-white/10
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Icon
                  icon="mdi:reply-outline"
                  width="20"
                  className="
                    text-[#168BE8]
                  "
                />

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.16em]
                    font-semibold
                    text-[#168BE8]
                  "
                >
                  Reply to customer
                </p>
              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-[#718296]
                  dark:text-[#A9C0D3]
                "
              >
                This message will be sent
                directly to{" "}
                <strong>
                  {request.email}
                </strong>.
              </p>

              <textarea
                rows="6"
                value={
                  replyValue
                }
                onChange={(
                  event
                ) =>
                  setReplyValue(
                    event.target
                      .value
                  )
                }
                placeholder="Write your response..."
                className="
                  mt-4
                  w-full
                  p-4
                  bg-[#F8FBFD]
                  dark:bg-[#102A43]
                  border
                  border-[#D3E1EB]
                  dark:border-white/10
                  outline-none
                  focus:border-[#168BE8]
                  text-sm
                  leading-7
                  resize-y
                "
              />

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  sm:flex-row
                  gap-3
                "
              >
                <button
                  type="button"
                  disabled={
                    sendingReply
                  }
                  onClick={() =>
                    sendReply(
                      request._id,
                      false
                    )
                  }
                  className="
                    h-11
                    px-5
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    bg-[#168BE8]
                    text-white
                    text-xs
                    font-semibold
                    disabled:opacity-50
                  "
                >
                  {sendingReply ? (
                    <Icon
                      icon="mdi:loading"
                      width="17"
                      className="
                        animate-spin
                      "
                    />
                  ) : (
                    <Icon
                      icon="mdi:send-outline"
                      width="17"
                    />
                  )}

                  Send reply
                </button>

                <button
                  type="button"
                  disabled={
                    sendingReply
                  }
                  onClick={() =>
                    sendReply(
                      request._id,
                      true
                    )
                  }
                  className="
                    h-11
                    px-5
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    bg-green-600
                    text-white
                    text-xs
                    font-semibold
                    disabled:opacity-50
                  "
                >
                  <Icon
                    icon="mdi:check-circle-outline"
                    width="17"
                  />

                  Send & resolve
                </button>
              </div>

              {request.replyEmailError && (
                <p
                  className="
                    mt-3
                    text-xs
                    text-red-600
                  "
                >
                  {request.replyEmailError}
                </p>
              )}
            </div>

            {/* INTERNAL NOTE */}

            <div
              className="
                mt-5
                p-5
                bg-[#FFF9E8]
                dark:bg-yellow-950/10
                border
                border-[#F0E2B4]
                dark:border-yellow-900/20
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Icon
                  icon="mdi:notebook-edit-outline"
                  width="18"
                  className="
                    text-[#9C7415]
                  "
                />

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.15em]
                    font-semibold
                    text-[#9C7415]
                  "
                >
                  Internal admin note
                </p>
              </div>

              <p
                className="
                  mt-2
                  text-[11px]
                  text-[#7B6B43]
                  dark:text-[#D6C99F]
                "
              >
                This note is never sent
                to the customer.
              </p>

              <textarea
                rows="3"
                value={
                  noteValue
                }
                onChange={(
                  event
                ) =>
                  setNoteValue(
                    event.target
                      .value
                  )
                }
                placeholder="Private note..."
                className="
                  mt-4
                  w-full
                  p-3
                  bg-white
                  dark:bg-[#102A43]
                  border
                  border-[#E5D7AB]
                  dark:border-white/10
                  outline-none
                  text-sm
                "
              />

              <button
                type="button"
                disabled={
                  savingNote
                }
                onClick={() =>
                  saveAdminNote(
                    request._id
                  )
                }
                className="
                  mt-3
                  h-10
                  px-4
                  bg-[#10233D]
                  text-white
                  text-xs
                  font-semibold
                  disabled:opacity-50
                "
              >
                {savingNote
                  ? "Saving..."
                  : "Save internal note"}
              </button>
            </div>
          </div>

          {/* RIGHT */}

          <div
            className="
              xl:w-[245px]
              flex-shrink-0
            "
          >
            <div
              className="
                p-4
                bg-[#F5F9FC]
                dark:bg-white/5
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
                Request status
              </p>

              <select
                value={
                  request.status
                }
                disabled={
                  updating
                }
                onChange={(
                  event
                ) =>
                  updateStatus(
                    request._id,
                    event.target
                      .value
                  )
                }
                className="
                  mt-3
                  w-full
                  h-11
                  px-3
                  bg-white
                  dark:bg-[#102A43]
                  border
                  border-[#CBD9E5]
                  dark:border-white/10
                  outline-none
                  text-sm
                  disabled:opacity-50
                "
              >
                {statuses.map(
                  (
                    status
                  ) => (
                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {status}
                    </option>
                  )
                )}
              </select>

              {updating && (
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    text-[#168BE8]
                  "
                >
                  <Icon
                    icon="mdi:loading"
                    width="14"
                    className="
                      animate-spin
                    "
                  />

                  Updating...
                </div>
              )}
            </div>

            <div
              className="
                mt-3
                p-4
                border
                border-[#DCE7EF]
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
                Submitted
              </p>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                "
              >
                {request.createdAt
                  ? new Date(
                      request.createdAt
                    ).toLocaleString(
                      "en-GB"
                    )
                  : "—"}
              </p>
            </div>

            {request.resolvedAt && (
              <div
                className="
                  mt-3
                  p-4
                  border
                  border-green-200
                  dark:border-green-900/30
                  bg-green-50
                  dark:bg-green-950/10
                "
              >
                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-[0.15em]
                    text-green-600
                  "
                >
                  Resolved
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                  "
                >
                  {new Date(
                    request.resolvedAt
                  ).toLocaleString(
                    "en-GB"
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
  danger = false,
}) {
  return (
    <div
      className="
        p-5
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
          gap-4
        "
      >
        <div
          className={`
            w-11
            h-11
            rounded-xl
            flex
            items-center
            justify-center

            ${
              danger
                ? `
                  bg-red-50
                  dark:bg-red-950/20
                  text-red-500
                `
                : `
                  bg-[#EAF6FF]
                  dark:bg-[#168BE8]/10
                  text-[#168BE8]
                `
            }
          `}
        >
          <Icon
            icon={
              icon
            }
            width="22"
          />
        </div>

        <p
          className="
            font-serif
            text-[29px]
          "
        >
          {value}
        </p>
      </div>

      <p
        className="
          mt-4
          text-xs
          font-semibold
        "
      >
        {label}
      </p>
    </div>
  );
}

// ============================================================
// PRIORITY BADGE
// ============================================================

function PriorityBadge({
  priority,
}) {
  const className =
    priority ===
    "Urgent"
      ? `
        bg-red-50
        dark:bg-red-950/20
        text-red-600
      `
      : priority ===
        "High"
      ? `
        bg-orange-50
        dark:bg-orange-950/20
        text-orange-600
      `
      : `
        bg-[#EDF7FD]
        dark:bg-[#168BE8]/10
        text-[#168BE8]
      `;

  return (
    <span
      className={`
        px-2.5
        py-1
        text-[9px]
        font-semibold
        ${className}
      `}
    >
      {priority ||
        "Normal"}
    </span>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}) {
  let className =
    "bg-[#F1F4F6] dark:bg-white/5 text-[#718296]";

  if (
    status ===
    "Resolved"
  ) {
    className =
      "bg-green-50 dark:bg-green-950/20 text-green-600";
  }

  if (
    status ===
    "In progress"
  ) {
    className =
      "bg-[#EAF6FF] dark:bg-[#168BE8]/10 text-[#168BE8]";
  }

  if (
    status ===
    "Pending"
  ) {
    className =
      "bg-orange-50 dark:bg-orange-950/20 text-orange-600";
  }

  return (
    <span
      className={`
        px-2.5
        py-1
        text-[9px]
        font-semibold
        ${className}
      `}
    >
      {status}
    </span>
  );
}

// ============================================================
// INFO LINE
// ============================================================

function InfoLine({
  icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <div
        className="
          w-8
          h-8
          flex
          items-center
          justify-center
          bg-[#EAF6FF]
          dark:bg-[#168BE8]/10
          text-[#168BE8]
          flex-shrink-0
        "
      >
        <Icon
          icon={
            icon
          }
          width="17"
        />
      </div>

      <div
        className="
          min-w-0
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
            text-xs
            font-semibold
            break-words
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default AdminSupportPage;