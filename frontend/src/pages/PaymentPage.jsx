import {
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

import api from "../api";

import {
  connectWallet,
  isMetaMaskAvailable,
  sendBlockchainPayment,
} from "../services/blockchainService";

// ============================================================
// BLOCKCHAIN CONFIGURATION
// ============================================================

// Pour la démonstration universitaire,
// le paiement blockchain utilise une très petite
// quantité de Sepolia ETH.
//
// Le prix réel de la commande reste enregistré en euros
// dans MESSINA GALLERY.
const BLOCKCHAIN_TEST_AMOUNT_ETH =
  "0.0001";

function PaymentPage() {
  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();

  const {
    cartItems,
    cartSubtotal,
    shipping,
    cartTotal,
    clearCart,
    isCartEmpty,
  } = useCart();

  const userId =
    user?._id ||
    user?.id ||
    null;

  const shippingKey =
    useMemo(
      () =>
        userId
          ? `messina_shipping_${userId}`
          : null,

      [userId]
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("card");

  const [
    cardName,
    setCardName,
  ] = useState("");

  const [
    cardNumber,
    setCardNumber,
  ] = useState("");

  const [
    expiry,
    setExpiry,
  ] = useState("");

  const [
    cvv,
    setCvv,
  ] = useState("");

  // ============================================================
  // BLOCKCHAIN STATES
  // ============================================================

  const [
    walletAddress,
    setWalletAddress,
  ] = useState("");

  const [
    walletBalance,
    setWalletBalance,
  ] = useState("");

  const [
    walletChainId,
    setWalletChainId,
  ] = useState(null);

  const [
    walletNetwork,
    setWalletNetwork,
  ] = useState("");

  const [
    walletConnecting,
    setWalletConnecting,
  ] = useState(false);

  const [
    blockchainStatus,
    setBlockchainStatus,
  ] = useState("");

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const paymentMethods = [
    {
      id: "card",
      label: "Card",
      icon:
        "mdi:credit-card-outline",
    },

    {
      id: "paypal",
      label: "PayPal",
      icon:
        "mdi:paypal",
    },

    {
      id: "revolut",
      label: "Revolut",
      icon:
        "mdi:bank-outline",
    },

    {
      id: "blockchain",
      label: "Blockchain",
      icon:
        "mdi:ethereum",
    },
  ];

  // ============================================================
  // CONNECT METAMASK
  // ============================================================

  const handleConnectWallet =
    async () => {
      setError("");
      setBlockchainStatus("");

      if (
        !isMetaMaskAvailable()
      ) {
        setError(
          "MetaMask is not detected. Please open Messina Gallery in Chrome with the MetaMask extension installed."
        );

        return;
      }

      try {
        setWalletConnecting(
          true
        );

        setBlockchainStatus(
          "Connecting to MetaMask..."
        );

        const wallet =
          await connectWallet();

        setWalletAddress(
          wallet.address
        );

        setWalletBalance(
          wallet.balance
        );

        setWalletChainId(
          wallet.chainId
        );

        setWalletNetwork(
          wallet.network ||
            "Sepolia"
        );

        setBlockchainStatus(
          "Wallet connected successfully."
        );
      } catch (
        walletError
      ) {
        console.error(
          "MetaMask connection error:",
          walletError
        );

        setBlockchainStatus(
          ""
        );

        setError(
          walletError.message ||
            "Unable to connect MetaMask."
        );
      } finally {
        setWalletConnecting(
          false
        );
      }
    };

  // ============================================================
  // PAYMENT
  // ============================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setBlockchainStatus(
        ""
      );

      if (!userId) {
        setError(
          "Authentication required."
        );

        return;
      }

      if (isCartEmpty) {
        setError(
          "Your cart is empty."
        );

        return;
      }

      // ========================================================
      // CARD VALIDATION
      // ========================================================

      if (
        paymentMethod ===
        "card"
      ) {
        if (
          !cardName.trim()
        ) {
          setError(
            "Please enter the cardholder name."
          );

          return;
        }

        if (
          cardNumber
            .replace(
              /\s/g,
              ""
            )
            .length !== 16
        ) {
          setError(
            "Please enter a valid card number."
          );

          return;
        }

        if (
          expiry.length !==
          5
        ) {
          setError(
            "Please enter a valid expiry date."
          );

          return;
        }

        if (
          cvv.length < 3
        ) {
          setError(
            "Please enter a valid CVV."
          );

          return;
        }
      }

      // ========================================================
      // BLOCKCHAIN VALIDATION
      // ========================================================

      if (
        paymentMethod ===
        "blockchain"
      ) {
        if (
          !isMetaMaskAvailable()
        ) {
          setError(
            "MetaMask is not detected."
          );

          return;
        }

        if (
          !walletAddress
        ) {
          setError(
            "Please connect your MetaMask wallet before continuing."
          );

          return;
        }
      }

      // ========================================================
      // TERMS
      // ========================================================

      if (
        !acceptedTerms
      ) {
        setError(
          "Please accept the Terms of Service and Privacy Policy."
        );

        return;
      }

      // ========================================================
      // SHIPPING
      // ========================================================

      let shippingInformation;

      try {
        shippingInformation =
          JSON.parse(
            localStorage.getItem(
              shippingKey
            ) || "{}"
          );
      } catch {
        shippingInformation =
          {};
      }

      if (
        !shippingInformation.address
      ) {
        setError(
          "Shipping information is missing. Return to Checkout."
        );

        return;
      }

      try {
        setLoading(true);

        const artworkIds =
          cartItems.map(
            (item) =>
              item._id ||
              item.id
          );

        // ======================================================
        // REAL BLOCKCHAIN PAYMENT
        // ======================================================

        let blockchainData;

        if (
          paymentMethod ===
          "blockchain"
        ) {
          const recipientAddress =
            import.meta.env
              .VITE_BLOCKCHAIN_RECEIVER_ADDRESS;

          if (
            !recipientAddress
          ) {
            throw new Error(
              "Blockchain receiver address is not configured."
            );
          }

          setBlockchainStatus(
            "Please confirm the transaction in MetaMask..."
          );

          const transaction =
            await sendBlockchainPayment(
              {
                recipient:
                  recipientAddress,

                amountEth:
                  BLOCKCHAIN_TEST_AMOUNT_ETH,
              }
            );

          setBlockchainStatus(
            "Transaction confirmed on the Sepolia blockchain."
          );

          blockchainData = {
            walletAddress:
              transaction.sender,

            sender:
              transaction.sender,

            recipient:
              transaction.recipient,

            transactionHash:
              transaction.transactionHash,

            network:
              "sepolia",

            chainId:
              transaction.chainId,

            blockNumber:
              transaction.blockNumber,

            amountEth:
              transaction.amountEth,

            status:
              transaction.status,
          };
        }

        // ======================================================
        // SAVE ORDER IN MONGODB
        // ======================================================

        const response =
          await api.post(
            "/api/orders",

            {
              artworkIds,

              paymentMethod,

              shippingInformation,

              blockchain:
                blockchainData,
            }
          );

        const order =
          response.data
            ?.order;

        clearCart();

        navigate(
          "/order-success",

          {
            state: {
              order,

              blockchain:
                blockchainData,
            },
          }
        );
      } catch (
        requestError
      ) {
        console.error(
          "Payment error:",
          requestError
        );

        setBlockchainStatus(
          ""
        );

        setError(
          requestError.response?.data
            ?.message ||
            requestError.message ||
            "Unable to complete the order."
        );
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // PRICE FORMAT
  // ============================================================

  const formatPrice = (
    value
  ) =>
    Number(
      value || 0
    ).toLocaleString(
      "en-US"
    );

  // ============================================================
  // WALLET SHORT ADDRESS
  // ============================================================

  const shortWalletAddress =
    walletAddress
      ? `${walletAddress.slice(
          0,
          8
        )}...${walletAddress.slice(
          -6
        )}`
      : "";

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

      {/* ====================================================== */}
      {/* HERO */}
      {/* ====================================================== */}

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
            Secure purchase
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[50px]
              md:text-[66px]
            "
          >
            Complete{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              payment.
            </span>
          </h1>
        </div>
      </section>

      {/* ====================================================== */}
      {/* PAYMENT FORM */}
      {/* ====================================================== */}

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
          lg:grid-cols-[1fr_380px]
          gap-8
        "
      >
        <section
          className="
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
            p-7
          "
        >
          <h2
            className="
              font-serif
              text-[32px]
            "
          >
            Payment method
          </h2>

          {/* ================================================== */}
          {/* METHODS */}
          {/* ================================================== */}

          <div
            className="
              mt-7
              grid
              grid-cols-2
              md:grid-cols-4
              gap-3
            "
          >
            {paymentMethods.map(
              (method) => (
                <button
                  key={
                    method.id
                  }
                  type="button"
                  onClick={() => {
                    setPaymentMethod(
                      method.id
                    );

                    setError("");

                    setBlockchainStatus(
                      ""
                    );
                  }}
                  className={`
                    min-h-[100px]
                    border
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    transition

                    ${
                      paymentMethod ===
                      method.id
                        ? "border-[#168BE8] bg-[#EDF8FF] dark:bg-[#168BE8]/10"
                        : "border-[#DCE9F3] dark:border-white/10"
                    }
                  `}
                >
                  <Icon
                    icon={
                      method.icon
                    }
                    width="26"
                    className="
                      text-[#168BE8]
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-semibold
                    "
                  >
                    {
                      method.label
                    }
                  </span>
                </button>
              )
            )}
          </div>

          {/* ================================================== */}
          {/* CARD */}
          {/* ================================================== */}

          {paymentMethod ===
            "card" && (
            <div
              className="
                mt-7
                space-y-4
              "
            >
              <input
                value={
                  cardName
                }
                onChange={(e) =>
                  setCardName(
                    e.target.value
                  )
                }
                placeholder="Cardholder name"
                className="
                  w-full
                  p-4
                  border
                  border-[#CAD8E5]
                  dark:border-white/10
                  dark:bg-[#102A43]
                  outline-none
                "
              />

              <input
                value={
                  cardNumber
                }
                onChange={(e) => {
                  const digits =
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        16
                      );

                  setCardNumber(
                    digits
                      .match(
                        /.{1,4}/g
                      )
                      ?.join(" ") ||
                      ""
                  );
                }}
                placeholder="1234 5678 9012 3456"
                className="
                  w-full
                  p-4
                  border
                  border-[#CAD8E5]
                  dark:border-white/10
                  dark:bg-[#102A43]
                  outline-none
                "
              />

              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >
                <input
                  value={expiry}
                  onChange={(e) => {
                    let value =
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          4
                        );

                    if (
                      value.length >
                      2
                    ) {
                      value =
                        `${value.slice(
                          0,
                          2
                        )}/${value.slice(
                          2
                        )}`;
                    }

                    setExpiry(
                      value
                    );
                  }}
                  placeholder="MM/YY"
                  className="
                    p-4
                    border
                    border-[#CAD8E5]
                    dark:border-white/10
                    dark:bg-[#102A43]
                  "
                />

                <input
                  value={cvv}
                  onChange={(e) =>
                    setCvv(
                      e.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          4
                        )
                    )
                  }
                  placeholder="CVV"
                  className="
                    p-4
                    border
                    border-[#CAD8E5]
                    dark:border-white/10
                    dark:bg-[#102A43]
                  "
                />
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* PAYPAL */}
          {/* ================================================== */}

          {paymentMethod ===
            "paypal" && (
            <div
              className="
                mt-7
                p-5
                bg-[#EDF8FF]
                dark:bg-[#168BE8]/10
              "
            >
              PayPal payment is
              simulated for the current
              project version.
            </div>
          )}

          {/* ================================================== */}
          {/* REVOLUT */}
          {/* ================================================== */}

          {paymentMethod ===
            "revolut" && (
            <div
              className="
                mt-7
                p-5
                bg-[#EDF8FF]
                dark:bg-[#168BE8]/10
              "
            >
              Revolut payment is
              simulated for the current
              project version.
            </div>
          )}

          {/* ================================================== */}
          {/* BLOCKCHAIN */}
          {/* ================================================== */}

          {paymentMethod ===
            "blockchain" && (
            <div
              className="
                mt-7
                border
                border-[#B8DDF8]
                dark:border-[#168BE8]/30
                bg-[#F2FAFF]
                dark:bg-[#071A2B]
                p-6
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
                    w-12
                    h-12
                    shrink-0
                    flex
                    items-center
                    justify-center
                    bg-[#168BE8]
                    text-white
                    rounded-full
                  "
                >
                  <Icon
                    icon="mdi:ethereum"
                    width="27"
                  />
                </div>

                <div>
                  <h3
                    className="
                      font-serif
                      text-[25px]
                    "
                  >
                    Ethereum
                    Blockchain
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-[#718296]
                      dark:text-[#A8BAC8]
                    "
                  >
                    Secure blockchain
                    payment using MetaMask
                    and the Ethereum
                    Sepolia test network.
                  </p>
                </div>
              </div>

              {/* NOT CONNECTED */}

              {!walletAddress && (
                <button
                  type="button"
                  onClick={
                    handleConnectWallet
                  }
                  disabled={
                    walletConnecting
                  }
                  className="
                    mt-6
                    w-full
                    min-h-[54px]
                    flex
                    items-center
                    justify-center
                    gap-3
                    bg-[#10233D]
                    dark:bg-[#168BE8]
                    text-white
                    font-semibold
                    disabled:opacity-50
                  "
                >
                  {walletConnecting ? (
                    <>
                      <Icon
                        icon="mdi:loading"
                        className="
                          animate-spin
                        "
                        width="20"
                      />

                      Connecting...
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="mdi:wallet-outline"
                        width="21"
                      />

                      Connect MetaMask
                    </>
                  )}
                </button>
              )}

              {/* CONNECTED */}

              {walletAddress && (
                <div
                  className="
                    mt-6
                    space-y-4
                  "
                >
                  <div
                    className="
                      p-4
                      bg-white
                      dark:bg-[#0B2238]
                      border
                      border-[#D8E8F4]
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
                      <span
                        className="
                          text-xs
                          text-[#718296]
                        "
                      >
                        Wallet
                      </span>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          text-xs
                          text-green-600
                          dark:text-green-400
                        "
                      >
                        <span
                          className="
                            w-2
                            h-2
                            rounded-full
                            bg-green-500
                          "
                        />

                        Connected
                      </span>
                    </div>

                    <p
                      className="
                        mt-2
                        font-mono
                        text-sm
                        font-semibold
                        break-all
                      "
                    >
                      {
                        shortWalletAddress
                      }
                    </p>
                  </div>

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <div
                      className="
                        p-4
                        bg-white
                        dark:bg-[#0B2238]
                        border
                        border-[#D8E8F4]
                        dark:border-white/10
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.15em]
                          text-[#718296]
                        "
                      >
                        Network
                      </p>

                      <p
                        className="
                          mt-2
                          text-sm
                          font-semibold
                        "
                      >
                        Sepolia
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-[#718296]
                        "
                      >
                        Chain ID{" "}
                        {
                          walletChainId
                        }
                      </p>
                    </div>

                    <div
                      className="
                        p-4
                        bg-white
                        dark:bg-[#0B2238]
                        border
                        border-[#D8E8F4]
                        dark:border-white/10
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.15em]
                          text-[#718296]
                        "
                      >
                        Balance
                      </p>

                      <p
                        className="
                          mt-2
                          text-sm
                          font-semibold
                        "
                      >
                        {Number(
                          walletBalance ||
                            0
                        ).toFixed(
                          5
                        )}{" "}
                        ETH
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      p-4
                      bg-[#E7F5FF]
                      dark:bg-[#168BE8]/10
                    "
                  >
                    <p
                      className="
                        text-xs
                        text-[#496579]
                        dark:text-[#BBD5E8]
                      "
                    >
                      Blockchain demo
                      amount
                    </p>

                    <p
                      className="
                        mt-1
                        text-[21px]
                        font-semibold
                        text-[#168BE8]
                      "
                    >
                      {
                        BLOCKCHAIN_TEST_AMOUNT_ETH
                      }{" "}
                      Sepolia ETH
                    </p>

                    <p
                      className="
                        mt-2
                        text-[11px]
                        leading-5
                        text-[#718296]
                        dark:text-[#9DB1C1]
                      "
                    >
                      Your order total
                      remains €
                      {formatPrice(
                        cartTotal
                      )}
                      . The ETH amount is
                      intentionally small
                      because Sepolia is a
                      test blockchain used
                      for the university
                      demonstration.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleConnectWallet
                    }
                    disabled={
                      walletConnecting
                    }
                    className="
                      text-xs
                      font-semibold
                      text-[#168BE8]
                    "
                  >
                    Refresh wallet
                    connection
                  </button>

                  <input
                    type="hidden"
                    value={
                      walletNetwork
                    }
                    readOnly
                  />
                </div>
              )}

              {blockchainStatus && (
                <div
                  className="
                    mt-5
                    p-4
                    flex
                    items-center
                    gap-3
                    bg-green-50
                    dark:bg-green-950/20
                    text-green-700
                    dark:text-green-300
                    text-sm
                  "
                >
                  <Icon
                    icon="mdi:check-circle-outline"
                    width="21"
                  />

                  {
                    blockchainStatus
                  }
                </div>
              )}
            </div>
          )}

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {error && (
            <div
              className="
                mt-6
                p-4
                flex
                gap-3
                bg-red-50
                dark:bg-red-950/20
                text-red-600
                dark:text-red-300
              "
            >
              <Icon
                icon="mdi:alert-circle-outline"
                width="21"
                className="
                  shrink-0
                "
              />

              <span>
                {error}
              </span>
            </div>
          )}

          {/* ================================================== */}
          {/* TERMS */}
          {/* ================================================== */}

          <label
            className="
              mt-7
              flex
              gap-3
              text-xs
            "
          >
            <input
              type="checkbox"
              checked={
                acceptedTerms
              }
              onChange={(e) =>
                setAcceptedTerms(
                  e.target.checked
                )
              }
              className="
                accent-[#168BE8]
              "
            />

            <span>
              I agree to the{" "}

              <Link
                to="/terms"
                className="
                  text-[#168BE8]
                "
              >
                Terms
              </Link>{" "}

              and{" "}

              <Link
                to="/privacy"
                className="
                  text-[#168BE8]
                "
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </section>

        {/* ==================================================== */}
        {/* ORDER SUMMARY */}
        {/* ==================================================== */}

        <aside
          className="
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
            p-6
            h-fit
            lg:sticky
            lg:top-[110px]
          "
        >
          <p
            className="
              text-xs
              text-[#718296]
            "
          >
            Connected as
          </p>

          <p
            className="
              mt-1
              font-semibold
            "
          >
            {user?.firstName}{" "}
            {user?.lastName}
          </p>

          <div
            className="
              mt-7
              space-y-3
            "
          >
            <div
              className="
                flex
                justify-between
              "
            >
              <span>
                Subtotal
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
              "
            >
              <strong>
                Total
              </strong>

              <strong
                className="
                  text-[#168BE8]
                  text-[25px]
                "
              >
                €
                {formatPrice(
                  cartTotal
                )}
              </strong>
            </div>
          </div>

          {/* BLOCKCHAIN NOTICE */}

          {paymentMethod ===
            "blockchain" && (
            <div
              className="
                mt-5
                p-4
                bg-[#F0F8FE]
                dark:bg-[#071A2B]
                text-xs
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[#168BE8]
                  font-semibold
                "
              >
                <Icon
                  icon="mdi:ethereum"
                  width="18"
                />

                Blockchain payment
              </div>

              <p
                className="
                  mt-2
                  text-[#718296]
                  dark:text-[#A8BAC8]
                "
              >
                {
                  BLOCKCHAIN_TEST_AMOUNT_ETH
                }{" "}
                Sepolia ETH
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              isCartEmpty
            }
            className="
              mt-7
              w-full
              min-h-[56px]
              bg-gradient-to-r
              from-[#1677E8]
              to-[#52B6FA]
              text-white
              flex
              items-center
              justify-center
              gap-2
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <Icon
                  icon="mdi:loading"
                  className="
                    animate-spin
                  "
                />

                {paymentMethod ===
                "blockchain"
                  ? "Confirming blockchain..."
                  : "Processing..."}
              </>
            ) : (
              <>
                <Icon
                  icon={
                    paymentMethod ===
                    "blockchain"
                      ? "mdi:ethereum"
                      : "mdi:lock-check-outline"
                  }
                />

                {paymentMethod ===
                "blockchain"
                  ? "Pay with blockchain"
                  : "Complete payment"}
              </>
            )}
          </button>

          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
              text-[10px]
              uppercase
              tracking-[0.14em]
              text-[#8797A6]
            "
          >
            <Icon
              icon="mdi:shield-check-outline"
              width="15"
            />

            Secure checkout
          </div>
        </aside>
      </form>
    </div>
  );
}

export default PaymentPage;