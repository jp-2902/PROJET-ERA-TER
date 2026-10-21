import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { Icon } from "@iconify/react";

import Navbar from "../components/Navbar";

import api, {
  API_URL,
} from "../api";

function ArtistSalesPage() {
  const [
    sales,
    setSales,
  ] = useState([]);

  const [
    revenue,
    setRevenue,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const load =
      async () => {
        try {
          const response =
            await api.get(
              "/api/orders/artist-sales"
            );

          setSales(
            response.data?.sales ||
              []
          );

          setRevenue(
            response.data?.revenue ||
              0
          );

        } catch (requestError) {
          setError(
            requestError.response?.data
              ?.message ||
              "Unable to load artist sales."
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
            Artist business
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
              sales.
            </span>
          </h1>

          <Link
            to="/artist-studio"
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              text-sm
              text-white
            "
          >
            <Icon
              icon="mdi:arrow-left"
            />

            Back to Artist Studio
          </Link>
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
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >
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
            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.20em]
                text-[#168BE8]
              "
            >
              Artworks sold
            </p>

            <p
              className="
                mt-3
                font-serif
                text-[42px]
              "
            >
              {sales.length}
            </p>
          </div>

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
            <p
              className="
                text-[9px]
                uppercase
                tracking-[0.20em]
                text-[#168BE8]
              "
            >
              Gross revenue
            </p>

            <p
              className="
                mt-3
                font-serif
                text-[42px]
                text-[#168BE8]
              "
            >
              €
              {formatPrice(
                revenue
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div
            className="
              py-20
              text-center
            "
          >
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
        ) : error ? (
          <div
            className="
              mt-8
              p-4
              bg-red-50
              text-red-600
            "
          >
            {error}
          </div>
        ) : sales.length ===
          0 ? (
          <div
            className="
              mt-8
              py-16
              bg-white
              dark:bg-[#0B2238]
              text-center
            "
          >
            <Icon
              icon="mdi:chart-box-outline"
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
                text-[34px]
              "
            >
              No sales yet.
            </h2>
          </div>
        ) : (
          <div
            className="
              mt-8
              space-y-4
            "
          >
            {sales.map(
              (sale) => (
                <article
                  key={`${sale.orderId}-${sale.artwork.id}`}
                  className="
                    bg-white
                    dark:bg-[#0B2238]
                    border
                    border-[#DCE9F3]
                    dark:border-white/10
                    p-5
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    gap-5
                  "
                >
                  <img
                    src={
                      `${API_URL}${sale.artwork.image}`
                    }
                    alt={
                      sale.artwork.title
                    }
                    className="
                      w-full
                      md:w-24
                      h-24
                      object-cover
                    "
                  />

                  <div
                    className="
                      flex-1
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
                      {
                        sale.orderNumber
                      }
                    </p>

                    <h2
                      className="
                        mt-1
                        font-serif
                        text-[24px]
                      "
                    >
                      {
                        sale.artwork.title
                      }
                    </h2>

                    <p
                      className="
                        mt-2
                        text-xs
                        text-[#718296]
                      "
                    >
                      Buyer:{" "}
                      {
                        sale.buyer
                          ?.firstName
                      }{" "}
                      {
                        sale.buyer
                          ?.lastName
                      }
                    </p>
                  </div>

                  <div
                    className="
                      md:text-right
                    "
                  >
                    <p
                      className="
                        text-[25px]
                        font-serif
                        text-[#168BE8]
                      "
                    >
                      €
                      {formatPrice(
                        sale.artwork
                          .price
                      )}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[#718296]
                      "
                    >
                      {new Date(
                        sale.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ArtistSalesPage;