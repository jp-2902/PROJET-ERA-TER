/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "./AuthContext";

const CartContext =
  createContext(null);

// ============================================================
// HELPERS
// ============================================================

const getUserIdentifier = (
  user
) => {
  return (
    user?._id ||
    user?.id ||
    null
  );
};

const getCartStorageKey = (
  user
) => {
  const userId =
    getUserIdentifier(user);

  if (!userId) {
    return "messina_cart_guest";
  }

  return `messina_cart_${userId}`;
};

const readCart = (
  storageKey
) => {
  try {
    const savedCart =
      localStorage.getItem(
        storageKey
      );

    if (!savedCart) {
      return [];
    }

    const parsed =
      JSON.parse(savedCart);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Unable to read cart:",
      error
    );

    return [];
  }
};

// ============================================================
// PROVIDER
// ============================================================

export function CartProvider({
  children,
}) {
  const {
    user,
  } = useAuth();

  const userStorageKey =
    useMemo(
      () =>
        getCartStorageKey(
          user
        ),
      [user]
    );

  const [
    activeStorageKey,
    setActiveStorageKey,
  ] = useState(
    userStorageKey
  );

  const [
    cartItems,
    setCartItems,
  ] = useState(() =>
    readCart(
      userStorageKey
    )
  );

  // ============================================================
  // CHANGE CART WHEN ACCOUNT CHANGES
  // ============================================================

  useEffect(() => {
    if (
      activeStorageKey ===
      userStorageKey
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      const nextCart =
        readCart(
          userStorageKey
        );

      setActiveStorageKey(
        userStorageKey
      );

      setCartItems(
        nextCart
      );
    }, 0);

    return () =>
      clearTimeout(timer);
  }, [
    userStorageKey,
    activeStorageKey,
  ]);

  // ============================================================
  // SAVE CURRENT USER CART
  // ============================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        activeStorageKey,
        JSON.stringify(
          cartItems
        )
      );
    } catch (error) {
      console.error(
        "Unable to save cart:",
        error
      );
    }
  }, [
    cartItems,
    activeStorageKey,
  ]);

  // ============================================================
  // ADD
  // ============================================================

  const addToCart = (
    artwork
  ) => {
    if (
      !artwork ||
      artwork.id ===
        undefined ||
      artwork.id === null
    ) {
      console.error(
        "Invalid artwork."
      );

      return;
    }

    setCartItems(
      (currentItems) => {
        const existing =
          currentItems.find(
            (item) =>
              String(
                item.id
              ) ===
              String(
                artwork.id
              )
          );

        if (existing) {
          return currentItems;
        }

        return [
          ...currentItems,

          {
            ...artwork,

            quantity: 1,

            isOriginal:
              artwork.isOriginal !==
              false,

            allowMultiple:
              artwork.allowMultiple ===
              true,
          },
        ];
      }
    );
  };

  // ============================================================
  // REMOVE
  // ============================================================

  const removeFromCart = (
    id
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            String(
              item.id
            ) !==
            String(id)
        )
    );
  };

  // ============================================================
  // IS IN CART
  // ============================================================

  const isInCart = (
    id
  ) => {
    return cartItems.some(
      (item) =>
        String(item.id) ===
        String(id)
    );
  };

  // ============================================================
  // GET ITEM
  // ============================================================

  const getCartItem = (
    id
  ) => {
    return cartItems.find(
      (item) =>
        String(item.id) ===
        String(id)
    );
  };

  // ============================================================
  // INCREASE
  // ============================================================

  const increaseQuantity = (
    id
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              String(
                item.id
              ) !==
              String(id)
            ) {
              return item;
            }

            if (
              item.isOriginal !==
                false &&
              item.allowMultiple !==
                true
            ) {
              return {
                ...item,
                quantity: 1,
              };
            }

            const stock =
              Number(
                item.stock ||
                  99
              );

            return {
              ...item,

              quantity:
                Math.min(
                  Number(
                    item.quantity ||
                      1
                  ) + 1,
                  stock
                ),
            };
          }
        )
    );
  };

  // ============================================================
  // DECREASE
  // ============================================================

  const decreaseQuantity = (
    id
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              String(
                item.id
              ) !==
              String(id)
            ) {
              return item;
            }

            return {
              ...item,

              quantity:
                Math.max(
                  1,
                  Number(
                    item.quantity ||
                      1
                  ) - 1
                ),
            };
          }
        )
    );
  };

  // ============================================================
  // CLEAR
  // ============================================================

  const clearCart = () => {
    setCartItems([]);
  };

  // ============================================================
  // TOTALS
  // ============================================================

  const cartCount =
    useMemo(() => {
      return cartItems.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.quantity ||
              1
          ),
        0
      );
    }, [cartItems]);

  const cartSubtotal =
    useMemo(() => {
      return cartItems.reduce(
        (
          total,
          item
        ) => {
          const price =
            Number(
              item.price ||
                0
            );

          const quantity =
            Number(
              item.quantity ||
                1
            );

          return (
            total +
            price *
              quantity
          );
        },
        0
      );
    }, [cartItems]);

  const shipping =
    cartItems.length > 0
      ? 40
      : 0;

  const cartTotal =
    cartSubtotal +
    shipping;

  const isCartEmpty =
    cartItems.length === 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,

        addToCart,
        removeFromCart,

        increaseQuantity,
        decreaseQuantity,

        clearCart,

        isInCart,
        getCartItem,

        cartCount,
        cartSubtotal,
        shipping,
        cartTotal,

        isCartEmpty,

        cartStorageKey:
          activeStorageKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useCart() {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider."
    );
  }

  return context;
}

export default CartContext;