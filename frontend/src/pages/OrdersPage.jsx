import {
  useEffect,
  useState,
} from "react";

import { Icon } from "@iconify/react";

import Navbar from "../components/Navbar";

import api, {
  API_URL,
} from "../api";

function OrdersPage() {
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
    selectedOrder,
    setSelectedOrder,
  ] = useState(null);

  useEffect(() => {
    const load =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              "/api/orders/mine"
            );

          setOrders(
            response.data?.orders ||
              []
          );
        } catch (requestError) {
          setError(
            requestError.response?.data
              ?.message ||
              "Unable to load orders."
          );
        } finally {
          setLoading(false);
        }
      };

    load();
  }, []);

  const formatPrice = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );

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
            max-w-[1250px]
            mx-auto
            px-6
            py-15
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.27em]
              text-[#9DD8FF]
            "
          >
            Personal purchases
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[52px]
              md:text-[68px]
            "
          >
            My{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              orders.
            </span>
          </h1>
        </div>
      </section>

      <main
        className="
          max-w-[1250px]
          mx-auto
          px-6
          py-12
        "
      >
        {loading ? (
          <Icon
            icon="mdi:loading"
            width="34"
            className="
              mx-auto
              animate-spin
              text-[#168BE8]
            "
          />
        ) : error ? (
          <div
            className="
              p-4
              bg-red-50
              text-red-600
            "
          >
            {error}
          </div>
        ) : orders.length ===
          0 ? (
          <div
            className="
              py-16
              bg-white
              dark:bg-[#0B2238]
              text-center
            "
          >
            <Icon
              icon="mdi:package-variant"
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
              No orders yet.
            </h2>
          </div>
        ) : (
          <div
            className="
              space-y-5
            "
          >
            {orders.map(
              (order) => (
                <article
                  key={
                    order._id
                  }
                  className="
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE9F3]
                    dark:border-white/10
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder ===
                          order._id
                          ? null
                          : order._id
                      )
                    }
                    className="
                      w-full
                      p-6
                      flex
                      flex-col
                      md:flex-row
                      md:items-center
                      md:justify-between
                      gap-5
                      text-left
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[9px]
                          uppercase
                          tracking-[0.16em]
                          text-[#168BE8]
                        "
                      >
                        Order
                      </p>

                      <h2
                        className="
                          mt-1
                          font-serif
                          text-[24px]
                        "
                      >
                        {
                          order.orderNumber
                        }
                      </h2>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-[#718296]
                        "
                      >
                        {new Date(
                          order.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        gap-8
                        items-center
                      "
                    >
                      <div>
                        <p
                          className="
                            text-xs
                            text-[#718296]
                          "
                        >
                          Status
                        </p>

                        <p
                          className="
                            mt-1
                            text-[#168BE8]
                            font-semibold
                          "
                        >
                          {
                            order.status
                          }
                        </p>
                      </div>

                      <div>
                        <p
                          className="
                            text-xs
                            text-[#718296]
                          "
                        >
                          Total
                        </p>

                        <p
                          className="
                            mt-1
                            font-serif
                            text-[24px]
                          "
                        >
                          €
                          {formatPrice(
                            order.total
                          )}
                        </p>
                      </div>

                      <Icon
                        icon={
                          selectedOrder ===
                          order._id
                            ? "mdi:chevron-up"
                            : "mdi:chevron-down"
                        }
                      />
                    </div>
                  </button>

                  {selectedOrder ===
                    order._id && (
                    <div
                      className="
                        p-6
                        border-t
                        border-[#DCE9F3]
                        dark:border-white/10
                      "
                    >
                      {order.items.map(
                        (item) => (
                          <div
                            key={
                              item.artwork
                            }
                            className="
                              py-4
                              flex
                              items-center
                              gap-4
                            "
                          >
                            <img
                              src={
                                `${API_URL}${item.image}`
                              }
                              alt={
                                item.title
                              }
                              className="
                                w-20
                                h-20
                                object-cover
                              "
                            />

                            <div
                              className="
                                flex-1
                              "
                            >
                              <h3
                                className="
                                  font-serif
                                  text-[20px]
                                "
                              >
                                {
                                  item.title
                                }
                              </h3>

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-[#718296]
                                "
                              >
                                by{" "}
                                {
                                  item.artistName
                                }
                              </p>
                            </div>

                            <span>
                              €
                              {formatPrice(
                                item.price
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default OrdersPage;