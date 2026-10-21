import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Icon } from "@iconify/react";

import Navbar from "../components/Navbar";

import {
  useCart,
} from "../context/CartContext";

// ============================================================
// CART PAGE
// ============================================================

function CartPage() {
  const navigate =
    useNavigate();

  const {
    cartItems,

    removeFromCart,
    increaseQuantity,
    decreaseQuantity,

    clearCart,

    cartCount,
    cartSubtotal,
    shipping,
    cartTotal,

    isCartEmpty,
  } = useCart();

  // ============================================================
  // FORMAT PRICE
  // ============================================================

  const formatPrice = (value) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );
  };

  // ============================================================
  // CHECKOUT
  // ============================================================

  const handleCheckout = () => {
    if (isCartEmpty) {
      return;
    }

    navigate(
      "/checkout"
    );
  };

  // ============================================================
  // JSX
  // ============================================================

  return (
    <div
      className="
        min-h-screen

        bg-[#EEF7FD]
        dark:bg-[#071A2B]

        text-[#10233D]
        dark:text-white

        transition-colors
        duration-500
      "
    >
      {/* ========================================================
          GLOBAL NAVBAR
      ======================================================== */}

      <Navbar />

      {/* ========================================================
          HERO
      ======================================================== */}

      <section
        className="
          relative
          overflow-hidden

          bg-gradient-to-r
          from-[#061B30]
          via-[#0A3A61]
          to-[#17679F]

          text-white
        "
      >
        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_80%_20%,rgba(99,190,255,0.28),transparent_38%)]
          "
        />

        <div
          className="
            relative
            z-10

            max-w-[1250px]
            mx-auto

            px-6
            py-16
            md:py-20
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
                w-10
                h-[2px]

                bg-[#63BEFF]
              "
            />

            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.28em]

                text-[#9DD8FF]
              "
            >
              Your selection
            </span>
          </div>

          <div
            className="
              mt-5

              flex
              flex-col
              lg:flex-row

              lg:items-end
              lg:justify-between

              gap-7
            "
          >
            <div>
              <h1
                className="
                  font-serif

                  text-[48px]
                  md:text-[66px]

                  leading-[1.02]
                "
              >
                Your{" "}

                <span
                  className="
                    italic
                    text-[#63BEFF]
                  "
                >
                  cart.
                </span>
              </h1>

              <p
                className="
                  mt-5

                  max-w-[610px]

                  text-sm
                  leading-7

                  text-white/70
                "
              >
                Review the artworks you have selected
                before continuing to checkout.
              </p>
            </div>

            {!isCartEmpty && (
              <div
                className="
                  flex
                  items-center
                  gap-3

                  text-white/70
                "
              >
                <div
                  className="
                    w-12
                    h-12

                    rounded-full

                    bg-white/10

                    border
                    border-white/10

                    flex
                    items-center
                    justify-center
                  "
                >
                  <Icon
                    icon="mdi:cart-outline"
                    width="23"
                  />
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.20em]

                      text-[#9DD8FF]
                    "
                  >
                    Selected
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-white
                    "
                  >
                    {cartCount}{" "}
                    {cartCount === 1
                      ? "artwork"
                      : "artworks"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          EMPTY CART
      ======================================================== */}

      {isCartEmpty ? (
        <main
          className="
            max-w-[1250px]
            mx-auto

            px-6
            py-20
          "
        >
          <div
            className="
              max-w-[700px]
              mx-auto

              bg-white
              dark:bg-[#0B2238]

              border
              border-[#DCE9F3]
              dark:border-white/10

              px-8
              py-16

              text-center

              shadow-[0_20px_55px_rgba(26,78,120,0.08)]
            "
          >
            <div
              className="
                mx-auto

                w-24
                h-24

                rounded-full

                bg-gradient-to-br
                from-[#E4F4FF]
                to-[#F7FCFF]

                dark:from-[#102A43]
                dark:to-[#143451]

                flex
                items-center
                justify-center

                text-[#168BE8]
                dark:text-[#63BEFF]
              "
            >
              <Icon
                icon="mdi:cart-outline"
                width="42"
              />
            </div>

            <p
              className="
                mt-8

                text-[9px]
                uppercase
                tracking-[0.25em]

                text-[#168BE8]
                dark:text-[#63BEFF]
              "
            >
              Your collection starts here
            </p>

            <h2
              className="
                mt-3

                font-serif

                text-[36px]
                md:text-[44px]
              "
            >
              Your cart is empty.
            </h2>

            <p
              className="
                mt-4

                max-w-[500px]
                mx-auto

                text-sm
                leading-7

                text-[#718296]
                dark:text-[#A9C0D3]
              "
            >
              Explore Messina Gallery and discover
              artworks that deserve a place in your
              collection.
            </p>

            <Link
              to="/products"
              className="
                mt-8

                h-[55px]
                px-8

                inline-flex
                items-center
                justify-center
                gap-3

                bg-gradient-to-r
                from-[#1677E8]
                via-[#2F80ED]
                to-[#52B6FA]

                text-white

                text-[10px]
                uppercase
                tracking-[0.18em]
                font-semibold

                shadow-[0_10px_25px_rgba(22,119,232,0.22)]

                hover:-translate-y-1

                transition-all
              "
            >
              Explore Gallery

              <Icon
                icon="mdi:arrow-right"
                width="18"
              />
            </Link>
          </div>
        </main>
      ) : (
        /* ======================================================
           CART WITH ITEMS
        ====================================================== */

        <main
          className="
            max-w-[1250px]
            mx-auto

            px-6
            py-12
            md:py-16
          "
        >
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-[1fr_390px]

              gap-8
              xl:gap-10

              items-start
            "
          >
            {/* ==================================================
                LEFT — ARTWORKS
            ================================================== */}

            <section>
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row

                  sm:items-center
                  sm:justify-between

                  gap-4

                  mb-6
                "
              >
                <div>
                  <span
                    className="
                      text-[9px]
                      uppercase
                      tracking-[0.22em]

                      text-[#168BE8]
                      dark:text-[#63BEFF]
                    "
                  >
                    Selected artworks
                  </span>

                  <h2
                    className="
                      mt-2

                      font-serif
                      text-[31px]
                    "
                  >
                    Your collection
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={clearCart}
                  className="
                    inline-flex
                    items-center
                    gap-2

                    text-[10px]
                    uppercase
                    tracking-[0.15em]

                    text-[#718296]
                    dark:text-[#A9C0D3]

                    hover:text-[#D94D68]

                    transition-colors
                  "
                >
                  <Icon
                    icon="mdi:delete-sweep-outline"
                    width="18"
                  />

                  Clear cart
                </button>
              </div>

              <div
                className="
                  space-y-5
                "
              >
                {cartItems.map(
                  (item) => {
                    const quantity =
                      Number(
                        item.quantity
                      ) || 1;

                    const price =
                      Number(
                        item.price
                      ) || 0;

                    const itemTotal =
                      price *
                      quantity;

                    const uniqueArtwork =
                      item.isOriginal !==
                        false &&
                      item.allowMultiple !==
                        true;

                    return (
                      <article
                        key={item.id}
                        className="
                          group

                          bg-white
                          dark:bg-[#0B2238]

                          border
                          border-[#DCE9F3]
                          dark:border-white/10

                          p-5

                          shadow-[0_12px_35px_rgba(26,78,120,0.06)]

                          hover:shadow-[0_18px_45px_rgba(26,78,120,0.12)]

                          transition-all
                          duration-300
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row

                            gap-5
                          "
                        >
                          {/* IMAGE */}

                          <Link
                            to={`/artwork/${item.id}`}
                            className="
                              block

                              w-full
                              sm:w-[180px]

                              h-[220px]
                              sm:h-[180px]

                              overflow-hidden

                              bg-[#EAF3F9]
                              dark:bg-[#102A43]

                              flex-shrink-0
                            "
                          >
                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.title ||
                                  "Artwork"
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
                            ) : (
                              <div
                                className="
                                  w-full
                                  h-full

                                  flex
                                  items-center
                                  justify-center

                                  text-[#168BE8]
                                "
                              >
                                <Icon
                                  icon="mdi:image-outline"
                                  width="42"
                                />
                              </div>
                            )}
                          </Link>

                          {/* INFORMATION */}

                          <div
                            className="
                              flex-1

                              flex
                              flex-col
                            "
                          >
                            <div
                              className="
                                flex
                                items-start
                                justify-between

                                gap-5
                              "
                            >
                              <div>
                                <p
                                  className="
                                    text-[9px]
                                    uppercase
                                    tracking-[0.18em]

                                    text-[#168BE8]
                                    dark:text-[#63BEFF]
                                  "
                                >
                                  {item.category ||
                                    "Original artwork"}
                                </p>

                                <Link
                                  to={`/artwork/${item.id}`}
                                >
                                  <h3
                                    className="
                                      mt-2

                                      font-serif

                                      text-[27px]
                                      leading-tight

                                      hover:text-[#168BE8]
                                      dark:hover:text-[#63BEFF]

                                      transition-colors
                                    "
                                  >
                                    {item.title ||
                                      "Untitled artwork"}
                                  </h3>
                                </Link>

                                <p
                                  className="
                                    mt-2

                                    text-sm

                                    text-[#718296]
                                    dark:text-[#A9C0D3]
                                  "
                                >
                                  by{" "}
                                  <span
                                    className="
                                      text-[#10233D]
                                      dark:text-white

                                      font-medium
                                    "
                                  >
                                    {item.artist ||
                                      "Messina Gallery Artist"}
                                  </span>
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeFromCart(
                                    item.id
                                  )
                                }
                                aria-label="Remove artwork"
                                className="
                                  w-10
                                  h-10

                                  rounded-full

                                  flex
                                  items-center
                                  justify-center

                                  text-[#8294A4]

                                  bg-[#F3F8FC]
                                  dark:bg-white/5

                                  hover:bg-[#FFF0F3]
                                  dark:hover:bg-[#3A1D29]

                                  hover:text-[#D94D68]

                                  transition-all
                                "
                              >
                                <Icon
                                  icon="mdi:close"
                                  width="20"
                                />
                              </button>
                            </div>

                            {/* DETAILS */}

                            <div
                              className="
                                mt-5

                                flex
                                flex-wrap

                                gap-x-5
                                gap-y-2

                                text-[11px]

                                text-[#7D8C99]
                                dark:text-[#92A9BC]
                              "
                            >
                              {item.year && (
                                <span
                                  className="
                                    flex
                                    items-center
                                    gap-1.5
                                  "
                                >
                                  <Icon
                                    icon="mdi:calendar-blank-outline"
                                    width="15"
                                  />

                                  {
                                    item.year
                                  }
                                </span>
                              )}

                              {item.country && (
                                <span
                                  className="
                                    flex
                                    items-center
                                    gap-1.5
                                  "
                                >
                                  <Icon
                                    icon="mdi:map-marker-outline"
                                    width="15"
                                  />

                                  {
                                    item.country
                                  }
                                </span>
                              )}

                              {item.dimensions && (
                                <span
                                  className="
                                    flex
                                    items-center
                                    gap-1.5
                                  "
                                >
                                  <Icon
                                    icon="mdi:ruler-square"
                                    width="15"
                                  />

                                  {
                                    item.dimensions
                                  }
                                </span>
                              )}
                            </div>

                            <div
                              className="
                                mt-auto
                                pt-5

                                flex
                                flex-col
                                md:flex-row

                                md:items-end
                                md:justify-between

                                gap-5
                              "
                            >
                              {/* QUANTITY */}

                              <div>
                                <p
                                  className="
                                    text-[9px]
                                    uppercase
                                    tracking-[0.17em]

                                    text-[#8A9AA7]
                                  "
                                >
                                  Quantity
                                </p>

                                {uniqueArtwork ? (
                                  <div
                                    className="
                                      mt-2

                                      inline-flex
                                      items-center
                                      gap-2

                                      h-10
                                      px-4

                                      bg-[#EAF6FF]
                                      dark:bg-[#168BE8]/10

                                      border
                                      border-[#C5E3F7]
                                      dark:border-[#168BE8]/20

                                      text-[11px]

                                      text-[#168BE8]
                                      dark:text-[#63BEFF]
                                    "
                                  >
                                    <Icon
                                      icon="mdi:certificate-outline"
                                      width="17"
                                    />

                                    Unique original · 1
                                  </div>
                                ) : (
                                  <div
                                    className="
                                      mt-2

                                      inline-flex
                                      items-center

                                      border
                                      border-[#D3E1EB]
                                      dark:border-white/10
                                    "
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        decreaseQuantity(
                                          item.id
                                        )
                                      }
                                      disabled={
                                        quantity <=
                                        1
                                      }
                                      className="
                                        w-10
                                        h-10

                                        flex
                                        items-center
                                        justify-center

                                        hover:bg-[#EDF7FD]
                                        dark:hover:bg-white/5

                                        disabled:opacity-30

                                        transition
                                      "
                                    >
                                      <Icon
                                        icon="mdi:minus"
                                        width="16"
                                      />
                                    </button>

                                    <span
                                      className="
                                        min-w-[42px]

                                        text-center
                                        text-sm
                                        font-semibold
                                      "
                                    >
                                      {
                                        quantity
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        increaseQuantity(
                                          item.id
                                        )
                                      }
                                      className="
                                        w-10
                                        h-10

                                        flex
                                        items-center
                                        justify-center

                                        hover:bg-[#EDF7FD]
                                        dark:hover:bg-white/5

                                        transition
                                      "
                                    >
                                      <Icon
                                        icon="mdi:plus"
                                        width="16"
                                      />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* PRICE */}

                              <div
                                className="
                                  md:text-right
                                "
                              >
                                <p
                                  className="
                                    text-[9px]
                                    uppercase
                                    tracking-[0.17em]

                                    text-[#8A9AA7]
                                  "
                                >
                                  Price
                                </p>

                                <p
                                  className="
                                    mt-1

                                    font-serif
                                    text-[28px]

                                    text-[#10233D]
                                    dark:text-white
                                  "
                                >
                                  €
                                  {formatPrice(
                                    itemTotal
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>

              {/* CONTINUE SHOPPING */}

              <Link
                to="/products"
                className="
                  mt-7

                  inline-flex
                  items-center
                  gap-2

                  text-[10px]
                  uppercase
                  tracking-[0.15em]

                  text-[#168BE8]
                  dark:text-[#63BEFF]

                  font-semibold

                  hover:gap-4

                  transition-all
                "
              >
                <Icon
                  icon="mdi:arrow-left"
                  width="17"
                />

                Continue exploring
              </Link>
            </section>

            {/* ==================================================
                RIGHT — SUMMARY
            ================================================== */}

            <aside
              className="
                lg:sticky
                lg:top-[110px]

                bg-white
                dark:bg-[#0B2238]

                border
                border-[#DCE9F3]
                dark:border-white/10

                shadow-[0_18px_45px_rgba(26,78,120,0.08)]

                overflow-hidden
              "
            >
              {/* SUMMARY HEADER */}

              <div
                className="
                  p-7

                  bg-gradient-to-r
                  from-[#E8F5FD]
                  to-[#F8FCFF]

                  dark:from-[#102A43]
                  dark:to-[#143451]

                  border-b
                  border-[#DCE9F3]
                  dark:border-white/10
                "
              >
                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.22em]

                    text-[#168BE8]
                    dark:text-[#63BEFF]
                  "
                >
                  Order summary
                </span>

                <h2
                  className="
                    mt-3

                    font-serif
                    text-[30px]
                  "
                >
                  Your selection
                </h2>
              </div>

              <div
                className="
                  p-7
                "
              >
                {/* COUNT */}

                <div
                  className="
                    flex
                    items-center
                    justify-between

                    pb-5

                    border-b
                    border-[#E5EEF5]
                    dark:border-white/10
                  "
                >
                  <span
                    className="
                      text-sm

                      text-[#718296]
                      dark:text-[#A9C0D3]
                    "
                  >
                    {cartCount === 1
                      ? "1 artwork"
                      : `${cartCount} artworks`}
                  </span>

                  <Icon
                    icon="mdi:palette-outline"
                    width="20"
                    className="
                      text-[#168BE8]
                      dark:text-[#63BEFF]
                    "
                  />
                </div>

                {/* SUBTOTAL */}

                <div
                  className="
                    mt-6

                    flex
                    items-center
                    justify-between

                    gap-5
                  "
                >
                  <span
                    className="
                      text-sm

                      text-[#718296]
                      dark:text-[#A9C0D3]
                    "
                  >
                    Subtotal
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    €
                    {formatPrice(
                      cartSubtotal
                    )}
                  </span>
                </div>

                {/* SHIPPING */}

                <div
                  className="
                    mt-4

                    flex
                    items-center
                    justify-between

                    gap-5
                  "
                >
                  <span
                    className="
                      text-sm

                      text-[#718296]
                      dark:text-[#A9C0D3]
                    "
                  >
                    Shipping
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                    "
                  >
                    €
                    {formatPrice(
                      shipping
                    )}
                  </span>
                </div>

                {/* SHIPPING NOTE */}

                <div
                  className="
                    mt-6

                    p-4

                    bg-[#F2F9FE]
                    dark:bg-[#102A43]

                    border
                    border-[#D5EAF7]
                    dark:border-white/10

                    flex
                    gap-3
                  "
                >
                  <Icon
                    icon="mdi:truck-delivery-outline"
                    width="20"
                    className="
                      flex-shrink-0

                      text-[#168BE8]
                      dark:text-[#63BEFF]
                    "
                  />

                  <p
                    className="
                      text-[11px]
                      leading-5

                      text-[#718296]
                      dark:text-[#A9C0D3]
                    "
                  >
                    Shipping is currently estimated
                    at €40. Final delivery options can
                    later be calculated according to
                    destination and artwork size.
                  </p>
                </div>

                {/* TOTAL */}

                <div
                  className="
                    mt-7
                    pt-6

                    border-t
                    border-[#DCE9F3]
                    dark:border-white/10

                    flex
                    items-end
                    justify-between

                    gap-5
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-[0.20em]

                        text-[#8A9AA7]
                      "
                    >
                      Total
                    </p>

                    <p
                      className="
                        mt-1

                        text-[11px]

                        text-[#718296]
                        dark:text-[#A9C0D3]
                      "
                    >
                      Including shipping
                    </p>
                  </div>

                  <p
                    className="
                      font-serif
                      text-[34px]

                      text-[#168BE8]
                      dark:text-[#63BEFF]
                    "
                  >
                    €
                    {formatPrice(
                      cartTotal
                    )}
                  </p>
                </div>

                {/* CHECKOUT */}

                <button
                  type="button"
                  onClick={
                    handleCheckout
                  }
                  className="
                    mt-8

                    w-full
                    h-[58px]

                    flex
                    items-center
                    justify-center
                    gap-3

                    bg-gradient-to-r
                    from-[#1677E8]
                    via-[#2F80ED]
                    to-[#52B6FA]

                    text-white

                    text-[10px]
                    uppercase
                    tracking-[0.18em]
                    font-semibold

                    shadow-[0_10px_25px_rgba(22,119,232,0.24)]

                    hover:-translate-y-1

                    transition-all
                  "
                >
                  Proceed to checkout

                  <Icon
                    icon="mdi:arrow-right"
                    width="18"
                  />
                </button>

                {/* SECURITY */}

                <div
                  className="
                    mt-5

                    flex
                    items-center
                    justify-center
                    gap-2

                    text-[10px]

                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  <Icon
                    icon="mdi:shield-check-outline"
                    width="16"
                    className="
                      text-[#168BE8]
                      dark:text-[#63BEFF]
                    "
                  />

                  Secure checkout
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer
        className="
          mt-8

          bg-[#061B30]

          border-t
          border-white/10

          text-white
        "
      >
        <div
          className="
            max-w-[1250px]
            mx-auto

            px-6
            py-8

            flex
            flex-col
            sm:flex-row

            items-center
            justify-between

            gap-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <img
              src="/assets/logo.png"
              alt="Messina Gallery"
              className="
                w-[75px]
                h-[65px]

                object-contain
              "
            />

            <p
              className="
                text-[10px]
                text-white/45
              "
            >
              ©{" "}
              {new Date().getFullYear()}{" "}
              Messina Gallery.
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-5

              text-[10px]
              text-white/45
            "
          >
            <Link
              to="/terms"
              className="
                hover:text-[#63BEFF]
                transition
              "
            >
              Terms
            </Link>

            <Link
              to="/privacy"
              className="
                hover:text-[#63BEFF]
                transition
              "
            >
              Privacy
            </Link>

            <Link
              to="/shipping"
              className="
                hover:text-[#63BEFF]
                transition
              "
            >
              Shipping
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CartPage;