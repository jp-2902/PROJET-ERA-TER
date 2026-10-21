/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api";

const AuthContext =
  createContext(null);

// ============================================================
// NORMALIZE ROLE
// backend "user" = frontend "collector"
// ============================================================

const normalizeRole = (
  role
) => {
  if (
    role === "user"
  ) {
    return "collector";
  }

  return role || "";
};

// ============================================================
// NORMALIZE USER
// ============================================================

const normalizeUser = (
  user
) => {
  if (!user) {
    return null;
  }

  return {
    ...user,

    normalizedRole:
      normalizeRole(
        user.role
      ),
  };
};

// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    token,
    setToken,
  ] = useState(
    () =>
      localStorage.getItem(
        "token"
      ) || ""
  );

  const [
    loading,
    setLoading,
  ] = useState(
    () =>
      Boolean(
        localStorage.getItem(
          "token"
        )
      )
  );

  // ==========================================================
  // CLEAR AUTH
  // ==========================================================

  const clearAuth =
    useCallback(() => {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      setToken("");
      setUser(null);
      setLoading(false);
    }, []);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout =
    useCallback(() => {
      clearAuth();
    }, [
      clearAuth,
    ]);

  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  const loadCurrentUser =
    useCallback(
      async (
        currentToken
      ) => {
        if (
          !currentToken
        ) {
          return null;
        }

        try {
          setLoading(true);

          const response =
            await api.get(
              "/api/auth/me",
              {
                headers: {
                  Authorization:
                    `Bearer ${currentToken}`,
                },
              }
            );

          const currentUser =
            normalizeUser(
              response.data
                ?.user
            );

          if (
            !currentUser
          ) {
            throw new Error(
              "User not found."
            );
          }

          setUser(
            currentUser
          );

          localStorage.setItem(
            "user",
            JSON.stringify(
              currentUser
            )
          );

          return currentUser;

        } catch (
          error
        ) {
          console.error(
            "Unable to load current user:",
            error
          );

          clearAuth();

          return null;

        } finally {
          setLoading(false);
        }
      },
      [
        clearAuth,
      ]
    );

  // ==========================================================
  // INITIAL AUTH
  // ==========================================================

  useEffect(() => {
    const savedToken =
      localStorage.getItem(
        "token"
      );

    if (
      !savedToken
    ) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          void loadCurrentUser(
            savedToken
          );
        },
        0
      );

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    loadCurrentUser,
  ]);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login =
    useCallback(
      async (
        email,
        password,
        selectedRole
      ) => {
        const normalizedSelectedRole =
          normalizeRole(
            selectedRole
          );

        let backendRole =
          normalizedSelectedRole;

        if (
          normalizedSelectedRole ===
          "collector"
        ) {
          backendRole =
            "user";
        }

        const response =
          await api.post(
            "/api/auth/login",
            {
              email,
              password,
              role:
                backendRole,
            }
          );

        const newToken =
          response.data
            ?.token;

        const loggedUser =
          normalizeUser(
            response.data
              ?.user
          );

        if (
          !newToken ||
          !loggedUser
        ) {
          throw new Error(
            "Invalid login response."
          );
        }

        // ====================================================
        // VERIFY SELECTED ROLE
        // ====================================================

        if (
          normalizedSelectedRole &&
          loggedUser.normalizedRole !==
            normalizedSelectedRole
        ) {
          throw new Error(
            `This account is registered as ${loggedUser.normalizedRole || "another role"}, not ${normalizedSelectedRole}.`
          );
        }

        localStorage.setItem(
          "token",
          newToken
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            loggedUser
          )
        );

        setToken(
          newToken
        );

        setUser(
          loggedUser
        );

        setLoading(false);

        return {
          token:
            newToken,

          user:
            loggedUser,

          role:
            loggedUser.normalizedRole,
        };
      },
      []
    );

  // ==========================================================
  // UPDATE USER LOCALLY
  // ==========================================================

  const updateUser =
    useCallback(
      (
        updatedUser
      ) => {
        if (
          !updatedUser
        ) {
          return;
        }

        const normalizedUser =
          normalizeUser(
            updatedUser
          );

        setUser(
          normalizedUser
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            normalizedUser
          )
        );
      },
      []
    );

  // ==========================================================
  // REFRESH USER
  // ==========================================================

  const refreshUser =
    useCallback(
      async () => {
        const currentToken =
          localStorage.getItem(
            "token"
          );

        if (
          !currentToken
        ) {
          return null;
        }

        return loadCurrentUser(
          currentToken
        );
      },
      [
        loadCurrentUser,
      ]
    );

  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  const getAuthHeaders =
    useCallback(() => {
      const currentToken =
        localStorage.getItem(
          "token"
        );

      if (
        !currentToken
      ) {
        return {};
      }

      return {
        Authorization:
          `Bearer ${currentToken}`,
      };
    }, []);

  // ==========================================================
  // ROLES
  // ==========================================================

  const role =
    normalizeRole(
      user?.role
    );

  const isAuthenticated =
    Boolean(
      token &&
      user
    );

  const isCollector =
    role ===
    "collector";

  const isArtist =
    role ===
    "artist";

  const isAdmin =
    role ===
    "admin";

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value =
    useMemo(
      () => ({
        user,
        token,

        loading,
        loadingAuth:
          loading,

        isAuthenticated,

        role,

        isCollector,
        isArtist,
        isAdmin,

        login,
        logout,

        updateUser,
        refreshUser,
        loadCurrentUser,

        getAuthHeaders,
      }),
      [
        user,
        token,
        loading,

        isAuthenticated,

        role,

        isCollector,
        isArtist,
        isAdmin,

        login,
        logout,

        updateUser,
        refreshUser,
        loadCurrentUser,

        getAuthHeaders,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// AUTH HOOK
// ============================================================

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (
    !context
  ) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}

export default AuthContext;