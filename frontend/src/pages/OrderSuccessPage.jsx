import {
  Link,
  useLocation,
} from "react-router-dom";

import { Icon } from "@iconify/react";

import Navbar from "../components/Navbar";

function OrderSuccessPage() {
  const location =
    useLocation();

  const order =
    location.state?.order;

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
          max-w-[800px]
          mx-auto
          px-6
          py-16
        "
      >
        <div
          className="
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
            p-10
            text-center
          "
        >
          <div
            className="
              mx-auto
              w-20
              h-20
              rounded-full
              bg-green-50
              dark:bg-green-950/20
              text-green-600
              flex
              items-center
              justify-center
            "
          >
            <Icon
              icon="mdi:check"
              width="40"
            />
          </div>

          <p
            className="
              mt-7
              text-[10px]
              uppercase
              tracking-[0.25em]
              text-[#168BE8]
            "
          >
            Order confirmed
          </p>

          <h1
            className="
              mt-3
              font-serif
              text-[48px]
            "
          >
            Thank you.
          </h1>

          {order && (
            <>
              <p
                className="
                  mt-5
                  text-[#718296]
                "
              >
                Your order has been
                securely recorded in
                Messina Gallery.
              </p>

              <div
                className="
                  mt-7
                  p-5
                  bg-[#EDF8FF]
                  dark:bg-[#102A43]
                "
              >
                <p
                  className="
                    text-xs
                    text-[#718296]
                  "
                >
                  Order number
                </p>

                <p
                  className="
                    mt-2
                    font-serif
                    text-[25px]
                    text-[#168BE8]
                  "
                >
                  {
                    order.orderNumber
                  }
                </p>
              </div>
            </>
          )}

          <div
            className="
              mt-8
              flex
              flex-col
              sm:flex-row
              gap-3
              justify-center
            "
          >
            <Link
              to="/orders"
              className="
                h-12
                px-6
                flex
                items-center
                justify-center
                bg-[#168BE8]
                text-white
              "
            >
              My orders
            </Link>

            <Link
              to="/products"
              className="
                h-12
                px-6
                flex
                items-center
                justify-center
                border
                border-[#168BE8]
                text-[#168BE8]
              "
            >
              Continue exploring
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderSuccessPage;