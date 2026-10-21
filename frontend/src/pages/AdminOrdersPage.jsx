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

const orderStatuses = [
  "Preparing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const paymentStatuses = [
  "Pending",
  "Paid",
  "Failed",
  "Refunded",
];

function AdminOrdersPage() {
  const [
    orders,
    setOrders,
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
    paymentFilter,
    setPaymentFilter,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  // ============================================================
  // LOAD ORDERS
  // ============================================================

  const loadOrders =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/api/admin/orders"
            );

          setOrders(
            response.data
              ?.orders || []
          );
        } catch (
          requestError
        ) {
          console.error(
            "ADMIN ORDERS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load orders."
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
          void loadOrders();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadOrders,
  ]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredOrders =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return orders.filter(
          (order) => {
            const buyerName =
              order.buyerName ||
              `${order.buyer?.firstName || ""} ${order.buyer?.lastName || ""}`;

            const buyerEmail =
              order.buyerEmail ||
              order.buyer?.email ||
              "";

            const matchesSearch =
              !query ||
              order.orderNumber
                ?.toLowerCase()
                .includes(
                  query
                ) ||
              buyerName
                .toLowerCase()
                .includes(
                  query
                ) ||
              buyerEmail
                .toLowerCase()
                .includes(
                  query
                );

            const matchesStatus =
              !statusFilter ||
              order.status ===
                statusFilter;

            const matchesPayment =
              !paymentFilter ||
              order.paymentStatus ===
                paymentFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesPayment
            );
          }
        );
      },
      [
        orders,
        search,
        statusFilter,
        paymentFilter,
      ]
    );

  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================

  const updateStatus =
    async (
      orderId,
      status
    ) => {
      try {
        setUpdatingId(
          orderId
        );

        await api.patch(
          `/api/admin/orders/${orderId}/status`,
          {
            status,
          }
        );

        setOrders(
          (current) =>
            current.map(
              (order) =>
                order._id ===
                orderId
                  ? {
                      ...order,
                      status,
                    }
                  : order
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
            "Unable to update order status."
        );
      } finally {
        setUpdatingId("");
      }
    };

  // ============================================================
  // UPDATE PAYMENT STATUS
  // ============================================================

  const updatePaymentStatus =
    async (
      orderId,
      paymentStatus
    ) => {
      try {
        setUpdatingId(
          orderId
        );

        await api.patch(
          `/api/admin/orders/${orderId}/payment-status`,
          {
            paymentStatus,
          }
        );

        setOrders(
          (current) =>
            current.map(
              (order) =>
                order._id ===
                orderId
                  ? {
                      ...order,
                      paymentStatus,
                    }
                  : order
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
            "Unable to update payment status."
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
      title="Orders"
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
          Commerce management
        </p>

        <h2
          className="
            mt-2
            font-serif
            text-[38px]
            md:text-[44px]
          "
        >
          Orders
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
          Review purchases,
          payment status and the
          progress of every order
          placed on Messina Gallery.
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
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search order or customer..."
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

          {orderStatuses.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}
        </select>

        <select
          value={
            paymentFilter
          }
          onChange={(
            event
          ) =>
            setPaymentFilter(
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
            All payments
          </option>

          {paymentStatuses.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            )
          )}
        </select>
      </section>

      {/* TABLE */}

      <section
        className="
          mt-6
          bg-white
          dark:bg-[#0B2238]
          border
          border-[#DCE7EF]
          dark:border-white/10
          overflow-x-auto
        "
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
          />
        ) : filteredOrders.length ===
          0 ? (
          <EmptyState
            icon="mdi:package-variant"
            message="No orders found."
          />
        ) : (
          <table
            className="
              w-full
              min-w-[1150px]
            "
          >
            <thead>
              <tr
                className="
                  bg-[#F5F9FC]
                  dark:bg-white/5
                  text-left
                "
              >
                <th className="p-4 text-xs">
                  Order
                </th>

                <th className="p-4 text-xs">
                  Customer
                </th>

                <th className="p-4 text-xs">
                  Total
                </th>

                <th className="p-4 text-xs">
                  Payment
                </th>

                <th className="p-4 text-xs">
                  Order status
                </th>

                <th className="p-4 text-xs">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(
                (order) => {
                  const buyerName =
                    order.buyerName ||
                    `${order.buyer?.firstName || ""} ${order.buyer?.lastName || ""}`.trim() ||
                    "Customer";

                  const buyerEmail =
                    order.buyerEmail ||
                    order.buyer
                      ?.email ||
                    "";

                  return (
                    <tr
                      key={
                        order._id
                      }
                      className="
                        border-t
                        border-[#E5EDF3]
                        dark:border-white/10
                      "
                    >
                      <td className="p-4">
                        <p
                          className="
                            text-sm
                            font-semibold
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
                            text-[10px]
                            text-[#718296]
                          "
                        >
                          {order.paymentMethod ||
                            "Payment"}
                        </p>
                      </td>

                      <td className="p-4">
                        <p
                          className="
                            text-sm
                          "
                        >
                          {buyerName}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-[#718296]
                          "
                        >
                          {buyerEmail}
                        </p>
                      </td>

                      <td
                        className="
                          p-4
                          text-sm
                          font-semibold
                          text-[#168BE8]
                        "
                      >
                        €
                        {Number(
                          order.total ||
                            0
                        ).toLocaleString(
                          "en-US"
                        )}
                      </td>

                      <td className="p-4">
                        <select
                          value={
                            order.paymentStatus ||
                            "Pending"
                          }
                          disabled={
                            updatingId ===
                            order._id
                          }
                          onChange={(
                            event
                          ) =>
                            updatePaymentStatus(
                              order._id,
                              event
                                .target
                                .value
                            )
                          }
                          className="
                            h-10
                            px-3
                            bg-white
                            dark:bg-[#102A43]
                            border
                            border-[#CAD8E5]
                            dark:border-white/10
                            text-xs
                            outline-none
                            disabled:opacity-50
                          "
                        >
                          {paymentStatuses.map(
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
                                {
                                  status
                                }
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="p-4">
                        <select
                          value={
                            order.status ||
                            "Preparing"
                          }
                          disabled={
                            updatingId ===
                            order._id
                          }
                          onChange={(
                            event
                          ) =>
                            updateStatus(
                              order._id,
                              event
                                .target
                                .value
                            )
                          }
                          className="
                            h-10
                            px-3
                            bg-white
                            dark:bg-[#102A43]
                            border
                            border-[#CAD8E5]
                            dark:border-white/10
                            text-xs
                            outline-none
                            disabled:opacity-50
                          "
                        >
                          {orderStatuses.map(
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
                                {
                                  status
                                }
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td
                        className="
                          p-4
                          text-xs
                          text-[#718296]
                        "
                      >
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-GB"
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </section>
    </AdminLayout>
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
        p-6
        text-sm
        text-red-600
      "
    >
      {message}
    </div>
  );
}

function EmptyState({
  icon,
  message,
}) {
  return (
    <div
      className="
        py-20
        text-center
      "
    >
      <Icon
        icon={icon}
        width="36"
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
        {message}
      </p>
    </div>
  );
}

export default AdminOrdersPage;