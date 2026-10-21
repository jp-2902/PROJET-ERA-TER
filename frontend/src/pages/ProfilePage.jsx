import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import Navbar from "../components/Navbar";

import {
  useAuth,
} from "../context/AuthContext";

import api, {
  API_URL,
} from "../api";

function ProfilePage() {
  const {
    user,
    isCollector,
    isArtist,
    isAdmin,
    updateUser,
    refreshUser,
    logout,
  } =
    useAuth();

  const [
    personal,
    setPersonal,
  ] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    city: "",
    address: "",
  });

  const [
    artistForm,
    setArtistForm,
  ] = useState({
    artistName: "",
    bio: "",
    specialty: "",
    artisticOrigin: "",
    artisticPerception: "",
    inspiration: "",
    birthPlace: "",
    birthCountry: "",
    startYear: "",
    website: "",
    instagram: "",
  });

  const [
    photo,
    setPhoto,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!user) {
        return;
      }
  
      setPersonal({
        firstName:
          user.firstName || "",
  
        lastName:
          user.lastName || "",
  
        phone:
          user.phone || "",
  
        country:
          user.country || "",
  
        city:
          user.city || "",
  
        address:
          user.address || "",
      });
  
      setArtistForm({
        artistName:
          user.artistName || "",
  
        bio:
          user.bio || "",
  
        specialty:
          user.specialty || "",
  
        artisticOrigin:
          user.artisticOrigin ||
          "",
  
        artisticPerception:
          user.artisticPerception ||
          "",
  
        inspiration:
          user.inspiration || "",
  
        birthPlace:
          user.birthPlace || "",
  
        birthCountry:
          user.birthCountry || "",
  
        startYear:
          user.startYear || "",
  
        website:
          user.website || "",
  
        instagram:
          user.instagram || "",
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [user]);

  const profileImage =
    user?.profileImage
      ? user.profileImage.startsWith(
          "http"
        )
        ? user.profileImage
        : `${API_URL}${user.profileImage}`
      : "";

  const savePersonal =
    async (event) => {
      event.preventDefault();

      setSaving(true);
      setMessage("");
      setError("");

      try {
        const response =
          await api.put(
            "/api/auth/profile",
            personal
          );

        if (
          response.data?.user
        ) {
          updateUser(
            response.data.user
          );
        }

        setMessage(
          "Personal information updated successfully."
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to update your profile."
        );
      } finally {
        setSaving(false);
      }
    };

  const saveArtist =
    async (event) => {
      event.preventDefault();

      setSaving(true);
      setMessage("");
      setError("");

      try {
        const formData =
          new FormData();

        Object.entries(
          artistForm
        ).forEach(
          ([
            key,
            value,
          ]) => {
            formData.append(
              key,
              value
            );
          }
        );

        if (photo) {
          formData.append(
            "profilePhoto",
            photo
          );
        }

        await api.put(
          "/api/artists/me",
          formData
        );

        await refreshUser();

        setMessage(
          "Your public artist profile has been updated."
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to update your artist profile."
        );
      } finally {
        setSaving(false);
      }
    };

  const inputClass = `
    w-full
    px-4
    py-3.5
    bg-white
    dark:bg-[#102A43]
    border
    border-[#CAD8E5]
    dark:border-white/10
    outline-none
    focus:border-[#168BE8]
  `;

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
            Personal area
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[50px]
              md:text-[66px]
            "
          >
            My{" "}

            <span
              className="
                italic
                text-[#63BEFF]
              "
            >
              account.
            </span>
          </h1>

          <p
            className="
              mt-4
              text-white/70
            "
          >
            {isAdmin
              ? "Administrator account"
              : isArtist
              ? "Artist account"
              : "Collector account"}
          </p>
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
            lg:grid-cols-[300px_1fr]
            gap-8
          "
        >
          <aside
            className="
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE9F3]
              dark:border-white/10
              p-6
              h-fit
            "
          >
            <div
              className="
                w-24
                h-24
                mx-auto
                rounded-full
                overflow-hidden
                bg-[#168BE8]
                text-white
                flex
                items-center
                justify-center
                text-[28px]
              "
            >
              {profileImage ? (
                <img
                  src={
                    profileImage
                  }
                  alt=""
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />
              ) : (
                <>
                  {
                    user?.firstName?.[0]
                  }
                  {
                    user?.lastName?.[0]
                  }
                </>
              )}
            </div>

            <h2
              className="
                mt-5
                text-center
                font-serif
                text-[25px]
              "
            >
              {user?.firstName}{" "}
              {user?.lastName}
            </h2>

            <p
              className="
                mt-2
                text-center
                text-xs
                text-[#168BE8]
              "
            >
              {isAdmin
                ? "Administrator"
                : isArtist
                ? user?.artistCode ||
                  "Artist"
                : "Collector"}
            </p>

            <div
              className="
                mt-7
                space-y-2
              "
            >
              {(isCollector ||
                isArtist) && (
                <SideLink
                  path="/orders"
                  icon="mdi:package-variant-closed"
                  text="My orders"
                />
              )}

              {isArtist && (
                <>
                  <SideLink
                    path="/artist-studio"
                    icon="mdi:palette-outline"
                    text="Artist Studio"
                  />

                  <SideLink
                    path={`/artist/${user?._id || user?.id}`}
                    icon="mdi:eye-outline"
                    text="View public profile"
                  />

                  <SideLink
                    path="/artist-sales"
                    icon="mdi:chart-line"
                    text="My sales"
                  />
                </>
              )}

              {isAdmin && (
                <SideLink
                  path="/admin"
                  icon="mdi:view-dashboard-outline"
                  text="Administration"
                />
              )}
            </div>

            <button
              type="button"
              onClick={
                logout
              }
              className="
                mt-7
                w-full
                h-11
                border
                border-red-200
                text-red-500
              "
            >
              Sign out
            </button>
          </aside>

          <div
            className="
              space-y-8
            "
          >
            {message && (
              <div className="p-4 bg-green-50 text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600">
                {error}
              </div>
            )}

            {!isAdmin && (
              <form
                onSubmit={
                  savePersonal
                }
                className="
                  bg-white
                  dark:bg-[#0B2238]
                  border
                  border-[#DCE9F3]
                  dark:border-white/10
                  p-7
                "
              >
                <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
                  Account
                </p>

                <h2 className="mt-2 font-serif text-[32px]">
                  Personal information
                </h2>

                <div
                  className="
                    mt-7
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-5
                  "
                >
                  {Object.entries(
                    personal
                  ).map(
                    ([
                      key,
                      value,
                    ]) => (
                      <input
                        key={key}
                        value={
                          value
                        }
                        onChange={(e) =>
                          setPersonal(
                            (
                              current
                            ) => ({
                              ...current,
                              [key]:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        placeholder={
                          key
                        }
                        className={
                          inputClass
                        }
                      />
                    )
                  )}
                </div>

                <button
                  disabled={
                    saving
                  }
                  className="
                    mt-7
                    h-12
                    px-7
                    bg-[#168BE8]
                    text-white
                  "
                >
                  Save personal information
                </button>
              </form>
            )}

            {isArtist && (
              <form
                onSubmit={
                  saveArtist
                }
                className="
                  bg-white
                  dark:bg-[#0B2238]
                  border
                  border-[#DCE9F3]
                  dark:border-white/10
                  p-7
                "
              >
                <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
                  Public presence
                </p>

                <h2 className="mt-2 font-serif text-[32px]">
                  Artist public profile
                </h2>

                <p className="mt-3 text-sm text-[#718296]">
                  Everything saved
                  here appears on your
                  public artist page.
                </p>

                <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    value={
                      artistForm.artistName
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          artistName:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Artist name"
                    className={
                      inputClass
                    }
                  />

                  <input
                    value={
                      artistForm.specialty
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          specialty:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Specialty"
                    className={
                      inputClass
                    }
                  />

                  <input
                    value={
                      artistForm.artisticOrigin
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          artisticOrigin:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Artistic origin"
                    className={
                      inputClass
                    }
                  />

                  <input
                    type="number"
                    value={
                      artistForm.startYear
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          startYear:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Active since"
                    className={
                      inputClass
                    }
                  />

                  <input
                    value={
                      artistForm.website
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          website:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Website"
                    className={
                      inputClass
                    }
                  />

                  <input
                    value={
                      artistForm.instagram
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          instagram:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Instagram"
                    className={
                      inputClass
                    }
                  />

                  <input
                    value={
                      artistForm.birthPlace
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          birthPlace:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Birth place"
                    className={
                      inputClass
                    }
                  />

                  <input
                    value={
                      artistForm.birthCountry
                    }
                    onChange={(e) =>
                      setArtistForm(
                        (
                          current
                        ) => ({
                          ...current,
                          birthCountry:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Birth country"
                    className={
                      inputClass
                    }
                  />
                </div>

                <textarea
                  value={
                    artistForm.bio
                  }
                  onChange={(e) =>
                    setArtistForm(
                      (
                        current
                      ) => ({
                        ...current,
                        bio:
                          e
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Biography"
                  rows="5"
                  className={`${inputClass} mt-5 resize-none`}
                />

                <textarea
                  value={
                    artistForm.artisticPerception
                  }
                  onChange={(e) =>
                    setArtistForm(
                      (
                        current
                      ) => ({
                        ...current,
                        artisticPerception:
                          e
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Your artistic perception"
                  rows="4"
                  className={`${inputClass} mt-5 resize-none`}
                />

                <textarea
                  value={
                    artistForm.inspiration
                  }
                  onChange={(e) =>
                    setArtistForm(
                      (
                        current
                      ) => ({
                        ...current,
                        inspiration:
                          e
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Your inspiration"
                  rows="4"
                  className={`${inputClass} mt-5 resize-none`}
                />

                <label className="mt-5 block">
                  <span className="text-xs text-[#718296]">
                    Public profile photo
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      setPhoto(
                        e.target
                          .files?.[0] ||
                          null
                      )
                    }
                    className="mt-2 block"
                  />
                </label>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    disabled={
                      saving
                    }
                    className="
                      h-12
                      px-7
                      bg-[#168BE8]
                      text-white
                    "
                  >
                    Save public profile
                  </button>

                  <Link
                    to={`/artist/${user?._id || user?.id}`}
                    className="
                      h-12
                      px-7
                      border
                      border-[#168BE8]
                      text-[#168BE8]
                      flex
                      items-center
                    "
                  >
                    View what the public sees
                  </Link>
                </div>
              </form>
            )}

            {isAdmin && (
              <div
                className="
                  bg-white
                  dark:bg-[#0B2238]
                  border
                  border-[#DCE9F3]
                  dark:border-white/10
                  p-8
                "
              >
                <Icon
                  icon="mdi:shield-crown-outline"
                  width="40"
                  className="text-[#168BE8]"
                />

                <h2 className="mt-5 font-serif text-[34px]">
                  Administrator account
                </h2>

                <p className="mt-4 text-[#718296]">
                  User, Artist,
                  Artwork and Order
                  management is
                  available from your
                  administration
                  dashboard.
                </p>

                <Link
                  to="/admin"
                  className="
                    mt-7
                    inline-flex
                    h-12
                    px-7
                    items-center
                    bg-[#168BE8]
                    text-white
                  "
                >
                  Open Admin Area
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SideLink({
  path,
  icon,
  text,
}) {
  return (
    <Link
      to={path}
      className="
        h-11
        px-4
        flex
        items-center
        gap-3
        bg-[#F3F9FD]
        dark:bg-white/5
        text-sm
      "
    >
      <Icon
        icon={icon}
        width="19"
        className="text-[#168BE8]"
      />

      {text}
    </Link>
  );
}

export default ProfilePage;