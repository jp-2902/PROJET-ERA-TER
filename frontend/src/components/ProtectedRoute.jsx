import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import {
  useAuth,
} from "../context/AuthContext";

function ProtectedRoute({
  children,
  roles = [],
}) {
  const {
    isAuthenticated,
    loading,
    role,
  } = useAuth();

  const location =
    useLocation();

  // ============================================================
  // AUTH LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-[#F5FAFE]
          dark:bg-[#071A2B]
        "
      >
        <div
          className="
            text-center
          "
        >
          <Icon
            icon="mdi:loading"
            width="38"
            className="
              mx-auto
              animate-spin
              text-[#168BE8]
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-[#6F8293]
              dark:text-[#A9C0D3]
            "
          >
            Loading your space...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // LOGIN REQUIRED
  // ============================================================

  if (
    !isAuthenticated
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  // ============================================================
  // ROLE REQUIRED
  // ============================================================

  if (
    roles.length >
      0 &&
    !roles.includes(
      role
    )
  ) {
    if (
      role ===
      "admin"
    ) {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    if (
      role ===
      "artist"
    ) {
      return (
        <Navigate
          to="/artist-studio"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/profile"
        replace
      />
    );
  }

  // ============================================================
  // ACCESS GRANTED
  // ============================================================

  return children;
}

export default ProtectedRoute;