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

function AdminUsersPage() {
  const [
    users,
    setUsers,
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
    roleFilter,
    setRoleFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState("");

  // ============================================================
  // LOAD USERS
  // ============================================================

  const loadUsers =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/api/admin/users"
            );

          setUsers(
            response.data
              ?.users || []
          );
        } catch (
          requestError
        ) {
          console.error(
            "ADMIN USERS ERROR:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load users."
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
          void loadUsers();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadUsers,
  ]);

  // ============================================================
  // FILTERS
  // ============================================================

  const filteredUsers =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return users.filter(
          (user) => {
            const name =
              `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

            const artistName =
              user.artistName
                ?.toLowerCase() ||
              "";

            const email =
              user.email
                ?.toLowerCase() ||
              "";

            const matchesSearch =
              !query ||
              name.includes(
                query
              ) ||
              artistName.includes(
                query
              ) ||
              email.includes(
                query
              );

            const matchesRole =
              !roleFilter ||
              user.role ===
                roleFilter;

            const active =
              user.isActive !==
              false;

            const matchesStatus =
              !statusFilter ||
              (statusFilter ===
                "active" &&
                active) ||
              (statusFilter ===
                "inactive" &&
                !active);

            return (
              matchesSearch &&
              matchesRole &&
              matchesStatus
            );
          }
        );
      },
      [
        users,
        search,
        roleFilter,
        statusFilter,
      ]
    );

  // ============================================================
  // STATUS
  // ============================================================

  const toggleUser =
    async (
      user
    ) => {
      const nextStatus =
        user.isActive ===
        false;

      try {
        setUpdatingId(
          user._id
        );

        await api.patch(
          `/api/admin/users/${user._id}/status`,
          {
            isActive:
              nextStatus,
          }
        );

        setUsers(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                user._id
                  ? {
                      ...item,
                      isActive:
                        nextStatus,
                    }
                  : item
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
            "Unable to update this user."
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
      title="Users"
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
          Community management
        </p>

        <h2
          className="
            mt-2
            font-serif
            text-[38px]
            md:text-[44px]
          "
        >
          Users
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-[#718296]
            dark:text-[#A9C0D3]
          "
        >
          Manage collectors,
          artists and administrator
          accounts registered on
          Messina Gallery.
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
            placeholder="Search users..."
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
            roleFilter
          }
          onChange={(
            event
          ) =>
            setRoleFilter(
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
            All roles
          </option>

          <option value="user">
            Collectors
          </option>

          <option value="artist">
            Artists
          </option>

          <option value="admin">
            Administrators
          </option>
        </select>

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

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>
      </section>

      {/* USERS */}

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
        ) : filteredUsers.length ===
          0 ? (
          <EmptyState />
        ) : (
          <table
            className="
              w-full
              min-w-[900px]
            "
          >
            <thead>
              <tr
                className="
                  text-left
                  bg-[#F5F9FC]
                  dark:bg-white/5
                "
              >
                <th className="p-4 text-xs">
                  Account
                </th>

                <th className="p-4 text-xs">
                  Role
                </th>

                <th className="p-4 text-xs">
                  Status
                </th>

                <th className="p-4 text-xs">
                  Joined
                </th>

                <th className="p-4 text-xs text-right">
                  Management
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map(
                (user) => {
                  const active =
                    user.isActive !==
                    false;

                  const name =
                    user.artistName ||
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "User";

                  return (
                    <tr
                      key={
                        user._id
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
                          {name}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-[#718296]
                          "
                        >
                          {user.email}
                        </p>
                      </td>

                      <td className="p-4">
                        <span
                          className="
                            inline-flex
                            px-3
                            py-1.5
                            bg-[#EDF7FD]
                            dark:bg-white/5
                            text-[9px]
                            uppercase
                            tracking-[0.12em]
                            text-[#168BE8]
                            font-semibold
                          "
                        >
                          {user.role ===
                          "user"
                            ? "Collector"
                            : user.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            text-xs
                            font-semibold

                            ${
                              active
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          `}
                        >
                          <span
                            className={`
                              w-2
                              h-2
                              rounded-full

                              ${
                                active
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }
                            `}
                          />

                          {active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td
                        className="
                          p-4
                          text-xs
                          text-[#718296]
                        "
                      >
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              "en-GB"
                            )
                          : "—"}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            user._id
                          }
                          onClick={() =>
                            toggleUser(
                              user
                            )
                          }
                          className={`
                            h-10
                            px-4
                            text-xs
                            font-semibold
                            transition
                            disabled:opacity-50

                            ${
                              active
                                ? `
                                  bg-red-50
                                  dark:bg-red-950/20
                                  text-red-600
                                `
                                : `
                                  bg-green-50
                                  dark:bg-green-950/20
                                  text-green-700
                                `
                            }
                          `}
                        >
                          {updatingId ===
                          user._id
                            ? "Updating..."
                            : active
                            ? "Deactivate"
                            : "Activate"}
                        </button>
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

function EmptyState() {
  return (
    <div
      className="
        py-20
        text-center
      "
    >
      <Icon
        icon="mdi:account-search-outline"
        width="38"
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
        No users found.
      </p>
    </div>
  );
}

export default AdminUsersPage;