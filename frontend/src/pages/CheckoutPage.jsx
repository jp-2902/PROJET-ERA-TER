import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Icon } from "@iconify/react";

import Navbar from "../components/Navbar";

import {
  useCart,
} from "../context/CartContext";

import {
  useAuth,
} from "../context/AuthContext";

function CheckoutPage() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const {
    cartItems,
    cartCount,
    cartSubtotal,
    shipping,
    cartTotal,
    isCartEmpty,
  } = useCart();

  const userId =
    user?._id ||
    user?.id ||
    null;

  const shippingStorageKey =
    useMemo(() => {
      if (!userId) {
        return null;
      }

      return `messina_shipping_${userId}`;
    }, [userId]);

  const [
    form,
    setForm,
  ] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
  });

  const [
    error,
    setError,
  ] = useState("");

  // ============================================================
  // LOAD USER + SAVED SHIPPING
  // ============================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!user) {
        return;
      }
  
      let savedShipping =
        {};
  
      if (
        shippingStorageKey
      ) {
        try {
          savedShipping =
            JSON.parse(
              localStorage.getItem(
                shippingStorageKey
              ) || "{}"
            );
        } catch {
          savedShipping =
            {};
        }
      }
  
      setForm({
        firstName:
          savedShipping.firstName ||
          user.firstName ||
          "",
  
        lastName:
          savedShipping.lastName ||
          user.lastName ||
          "",
  
        email:
          savedShipping.email ||
          user.email ||
          "",
  
        phone:
          savedShipping.phone ||
          user.phone ||
          "",
  
        country:
          savedShipping.country ||
          user.country ||
          "",
  
        city:
          savedShipping.city ||
          user.city ||
          "",
  
        address:
          savedShipping.address ||
          user.address ||
          "",
  
        postalCode:
          savedShipping.postalCode ||
          "",
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    user,
    shippingStorageKey,
  ]);

  // ============================================================
  // CHANGE
  // ============================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } =
      event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!userId) {
      setError(
        "You must be signed in to continue."
      );

      return;
    }

    if (isCartEmpty) {
      setError(
        "Your cart is empty."
      );

      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "country",
      "city",
      "address",
      "postalCode",
    ];

    const incomplete =
      requiredFields.some(
        (field) =>
          !String(
            form[field] ||
              ""
          ).trim()
      );

    if (incomplete) {
      setError(
        "Please complete all shipping fields."
      );

      return;
    }

    const shippingData =
      {
        ...form,

        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email
            .trim()
            .toLowerCase(),

        phone:
          form.phone.trim(),

        country:
          form.country.trim(),

        city:
          form.city.trim(),

        address:
          form.address.trim(),

        postalCode:
          form.postalCode.trim(),

        userId,
      };

    localStorage.setItem(
      shippingStorageKey,
      JSON.stringify(
        shippingData
      )
    );

    navigate(
      "/payment"
    );
  };

  const formatPrice = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );
  };

  const labelClass = `
    block
    mb-2
    text-[10px]
    uppercase
    tracking-[0.20em]
    font-semibold
    text-[#183B56]
    dark:text-[#BDD0E0]
  `;

  const inputClass = `
    w-full
    px-4
    py-3.5
    bg-white
    dark:bg-[#102A43]
    border
    border-[#CAD8E5]
    dark:border-white/15
    outline-none
    text-sm
    focus:border-[#168BE8]
    dark:focus:border-[#63BEFF]
    transition-all
  `;

  return (
    <div
      className="
        min-h-screen
        bg-[#F2F8FC]
        dark:bg-[#071A2B]
        text-[#10233D]
        dark:text-white
      "
    >
      <Navbar />

      {/* HERO */}

      <section
        className="
          relative
          overflow-hidden
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
            py-14
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
            Secure checkout
          </p>

          <h1
            className="
              mt-5
              font-serif
              text-[48px]
              md:text-[64px]
            "
          >
            Shipping{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              information.
            </span>
          </h1>

          <p
            className="
              mt-4
              max-w-[620px]
              text-sm
              leading-7
              text-white/70
            "
          >
            This delivery information
            belongs only to your
            connected Messina Gallery
            account.
          </p>
        </div>
      </section>

      <form
        onSubmit={
          handleSubmit
        }
        className="
          max-w-[1250px]
          mx-auto
          px-6
          py-12
          grid
          grid-cols-1
          lg:grid-cols-[1fr_390px]
          gap-8
          items-start
        "
      >
        {/* FORM */}

        <section
          className="
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
            p-7
            md:p-8
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
              mb-7
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-full
                bg-[#E8F5FD]
                dark:bg-[#143451]
                flex
                items-center
                justify-center
                text-[#168BE8]
              "
            >
              <Icon
                icon="mdi:truck-delivery-outline"
                width="25"
              />
            </div>

            <div>
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.20em]
                  text-[#168BE8]
                "
              >
                Personal delivery
              </p>

              <h2
                className="
                  mt-1
                  font-serif
                  text-[30px]
                "
              >
                Delivery details
              </h2>
            </div>
          </div>

          {user && (
            <div
              className="
                mb-7
                p-4
                bg-[#EDF8FF]
                dark:bg-[#168BE8]/10
                border
                border-[#C5E4F7]
                dark:border-[#168BE8]/20
                flex
                gap-3
              "
            >
              <Icon
                icon="mdi:account-lock-outline"
                width="21"
                className="
                  text-[#168BE8]
                  flex-shrink-0
                "
              />

              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                  "
                >
                  Personal checkout
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  Connected as{" "}
                  {user.firstName}{" "}
                  {user.lastName}.
                  These delivery details
                  are isolated from other
                  accounts.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              className="
                mb-6
                p-4
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
              {error}
            </div>
          )}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-5
            "
          >
            <div>
              <label
                className={
                  labelClass
                }
              >
                First name *
              </label>

              <input
                name="firstName"
                value={
                  form.firstName
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={
                  labelClass
                }
              >
                Last name *
              </label>

              <input
                name="lastName"
                value={
                  form.lastName
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={
                  labelClass
                }
              >
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={
                  labelClass
                }
              >
                Phone *
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={
                  labelClass
                }
              >
                Country *
              </label>

              <input
                name="country"
                value={
                  form.country
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div>
              <label
                className={
                  labelClass
                }
              >
                City *
              </label>

              <input
                name="city"
                value={
                  form.city
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div
              className="
                sm:col-span-2
              "
            >
              <label
                className={
                  labelClass
                }
              >
                Address *
              </label>

              <input
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>

            <div
              className="
                sm:col-span-2
              "
            >
              <label
                className={
                  labelClass
                }
              >
                Postal code *
              </label>

              <input
                name="postalCode"
                value={
                  form.postalCode
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </div>
          </div>

          <div
            className="
              mt-8
              flex
              flex-col
              sm:flex-row
              justify-between
              gap-3
            "
          >
            <Link
              to="/cart"
              className="
                h-[52px]
                px-6
                inline-flex
                items-center
                justify-center
                gap-2
                border
                border-[#CAD8E5]
                dark:border-white/15
              "
            >
              <Icon
                icon="mdi:arrow-left"
                width="18"
              />

              Back to cart
            </Link>

            <button
              type="submit"
              className="
                h-[52px]
                px-7
                inline-flex
                items-center
                justify-center
                gap-3
                bg-gradient-to-r
                from-[#1677E8]
                to-[#52B6FA]
                text-white
                text-sm
                font-semibold
              "
            >
              Continue to payment

              <Icon
                icon="mdi:arrow-right"
                width="18"
              />
            </button>
          </div>
        </section>

        {/* SUMMARY */}

        <aside
          className="
            sticky
            top-[110px]
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
            p-6
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
            Your order
          </p>

          <h2
            className="
              mt-2
              font-serif
              text-[28px]
            "
          >
            Order summary
          </h2>

          <div
            className="
              mt-6
              space-y-4
            "
          >
            {cartItems.map(
              (item) => (
                <div
                  key={item.id}
                  className="
                    flex
                    gap-3
                  "
                >
                  <img
                    src={
                      item.image
                    }
                    alt={
                      item.title
                    }
                    className="
                      w-16
                      h-16
                      object-cover
                    "
                  />

                  <div
                    className="
                      min-w-0
                    "
                  >
                    <p
                      className="
                        font-serif
                        truncate
                      "
                    >
                      {item.title}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[#168BE8]
                      "
                    >
                      €
                      {formatPrice(
                        item.price
                      )}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          <div
            className="
              mt-6
              pt-5
              border-t
              border-[#E5EEF5]
              dark:border-white/10
              space-y-3
              text-sm
            "
          >
            <div
              className="
                flex
                justify-between
              "
            >
              <span>
                {cartCount} artwork
                {cartCount !== 1
                  ? "s"
                  : ""}
              </span>

              <span>
                €
                {formatPrice(
                  cartSubtotal
                )}
              </span>
            </div>

            <div
              className="
                flex
                justify-between
              "
            >
              <span>
                Shipping
              </span>

              <span>
                €
                {formatPrice(
                  shipping
                )}
              </span>
            </div>

            <div
              className="
                pt-4
                border-t
                flex
                justify-between
                items-end
              "
            >
              <strong>
                Total
              </strong>

              <span
                className="
                  font-serif
                  text-[30px]
                  text-[#168BE8]
                "
              >
                €
                {formatPrice(
                  cartTotal
                )}
              </span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default CheckoutPage;