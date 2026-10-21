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

const categories = [
  "Painting",
  "Sculpture",
  "Photography",
  "Mixed Media",
  "Drawing",
  "Digital Art",
  "Other",
];

function ArtistStudioPage() {
  const {
    user,
  } = useAuth();

  const [
    artworks,
    setArtworks,
  ] = useState([]);

  const [
    collections,
    setCollections,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    creatingCollection,
    setCreatingCollection,
  ] = useState(false);

  const [
    certificateLoadingId,
    setCertificateLoadingId,
  ] = useState("");

  const [
    collectionAction,
    setCollectionAction,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    image,
    setImage,
  ] = useState(null);

  const [
    preview,
    setPreview,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    title: "",
    description: "",
    story: "",
    inspiration: "",
    category:
      "Painting",
    price: "",
    year: "",
    dimensions: "",
    country: "",
    isOriginal:
      true,
  });

  const [
    collectionForm,
    setCollectionForm,
  ] = useState({
    name: "",
    description: "",
    published:
      true,
  });

  // ============================================================
  // LOAD ARTWORKS
  // ============================================================

  const loadArtworks =
    async () => {
      const response =
        await api.get(
          "/api/artworks/mine"
        );

      setArtworks(
        response.data
          ?.artworks ||
          []
      );
    };

  // ============================================================
  // LOAD COLLECTIONS
  // ============================================================

  const loadCollections =
    async () => {
      const response =
        await api.get(
          "/api/collections/mine/all"
        );

      setCollections(
        response.data
          ?.collections ||
          []
      );
    };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const load =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");

          await Promise.all([
            loadArtworks(),
            loadCollections(),
          ]);

        } catch (
          requestError
        ) {
          console.error(
            "Artist Studio load error:",
            requestError
          );

          setError(
            requestError
              .response
              ?.data
              ?.message ||
              "Unable to load Artist Studio."
          );

        } finally {
          setLoading(
            false
          );
        }
      };

    const timer =
      window.setTimeout(
        () => {
          void load();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  // ============================================================
  // ARTWORK FORM
  // ============================================================

  const handleChange =
    (
      event
    ) => {
      const {
        name,
        value,
      } =
        event.target;

      setForm(
        (
          current
        ) => ({
          ...current,

          [name]:
            value,
        })
      );
    };

  // ============================================================
  // ARTWORK IMAGE
  // ============================================================

  const handleImageChange =
    (
      event
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(
          file.type
        )
      ) {
        setError(
          "Image must be JPG, PNG or WEBP."
        );

        return;
      }

      setImage(
        file
      );

      if (
        preview
      ) {
        URL.revokeObjectURL(
          preview
        );
      }

      setPreview(
        URL.createObjectURL(
          file
        )
      );
    };

  // ============================================================
  // CREATE ARTWORK
  // ============================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.title.trim() ||
        !form.description.trim() ||
        !form.price ||
        !image
      ) {
        setError(
          "Title, description, price and image are required."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        const formData =
          new FormData();

        Object.entries(
          form
        ).forEach(
          ([
            key,
            value,
          ]) => {
            formData.append(
              key,
              typeof value ===
                "boolean"
                ? String(
                    value
                  )
                : value
            );
          }
        );

        formData.append(
          "image",
          image
        );

        await api.post(
          "/api/artworks",
          formData
        );

        setForm({
          title: "",
          description: "",
          story: "",
          inspiration: "",
          category:
            "Painting",
          price: "",
          year: "",
          dimensions: "",
          country: "",
          isOriginal:
            true,
        });

        setImage(
          null
        );

        if (
          preview
        ) {
          URL.revokeObjectURL(
            preview
          );
        }

        setPreview("");

        await loadArtworks();

        setSuccess(
          "Artwork published successfully."
        );

      } catch (
        requestError
      ) {
        const errorData =
          requestError
            .response
            ?.data;

        console.error(
          "Artwork publication error:",
          errorData ||
          requestError
        );

        if (
          errorData?.code ===
          "EXACT_ARTWORK_DUPLICATE"
        ) {
          const matchedTitle =
            errorData
              ?.matchedArtwork
              ?.title;

          setError(
            matchedTitle
              ? `Exact duplicate detected by SHA-256. This image is already registered as "${matchedTitle}".`
              : "Exact duplicate detected by SHA-256. This image already exists in Messina Gallery."
          );

        } else if (
          errorData?.code ===
          "VISUAL_ARTWORK_DUPLICATE"
        ) {
          const score =
            errorData
              ?.similarityScore;

          const matchedTitle =
            errorData
              ?.matchedArtwork
              ?.title;

          const scoreText =
            typeof score ===
              "number"
              ? `${score}%`
              : "a high percentage";

          setError(
            matchedTitle
              ? `AI duplicate detected: ${scoreText} visual similarity with "${matchedTitle}". The artwork has been rejected.`
              : `AI duplicate detected: ${scoreText} visual similarity with an existing artwork. The artwork has been rejected.`
          );

        } else {
          setError(
            errorData
              ?.message ||
              "Unable to publish artwork."
          );
        }

      } finally {
        setSubmitting(
          false
        );
      }
    };

  // ============================================================
  // CREATE COLLECTION
  // ============================================================

  const createCollection =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !collectionForm
          .name
          .trim()
      ) {
        setError(
          "Collection name is required."
        );

        return;
      }

      try {
        setCreatingCollection(
          true
        );

        setError("");
        setSuccess("");

        await api.post(
          "/api/collections",
          collectionForm
        );

        setCollectionForm({
          name: "",
          description: "",
          published:
            true,
        });

        await loadCollections();

        setSuccess(
          "Collection created successfully."
        );

      } catch (
        requestError
      ) {
        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to create collection."
        );

      } finally {
        setCreatingCollection(
          false
        );
      }
    };

  // ============================================================
  // ADD ARTWORK TO COLLECTION
  // ============================================================

  const addArtworkToCollection =
    async (
      collectionId,
      artworkId
    ) => {
      if (
        !collectionId ||
        !artworkId
      ) {
        return;
      }

      try {
        setCollectionAction(
          `${collectionId}-${artworkId}`
        );

        setError("");

        await api.post(
          `/api/collections/${collectionId}/artworks/${artworkId}`
        );

        await loadCollections();

        setSuccess(
          "Artwork added to collection."
        );

      } catch (
        requestError
      ) {
        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to add artwork to collection."
        );

      } finally {
        setCollectionAction(
          ""
        );
      }
    };

  // ============================================================
  // REMOVE ARTWORK FROM COLLECTION
  // ============================================================

  const removeArtworkFromCollection =
    async (
      collectionId,
      artworkId
    ) => {
      try {
        setCollectionAction(
          `${collectionId}-${artworkId}`
        );

        await api.delete(
          `/api/collections/${collectionId}/artworks/${artworkId}`
        );

        await loadCollections();

        setSuccess(
          "Artwork removed from collection."
        );

      } catch (
        requestError
      ) {
        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to remove artwork."
        );

      } finally {
        setCollectionAction(
          ""
        );
      }
    };

  // ============================================================
  // TOGGLE COLLECTION PUBLICATION
  // ============================================================

  const toggleCollection =
    async (
      collection
    ) => {
      try {
        await api.put(
          `/api/collections/${collection._id}`,
          {
            published:
              !collection.published,
          }
        );

        await loadCollections();

        setSuccess(
          collection.published
            ? "Collection hidden from the public page."
            : "Collection published successfully."
        );

      } catch (
        requestError
      ) {
        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to update collection."
        );
      }
    };

  // ============================================================
  // DELETE COLLECTION
  // ============================================================

  const deleteCollection =
    async (
      collection
    ) => {
      const confirmed =
        window.confirm(
          `Delete collection "${collection.name}"?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        await api.delete(
          `/api/collections/${collection._id}`
        );

        await loadCollections();

        setSuccess(
          "Collection deleted."
        );

      } catch (
        requestError
      ) {
        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to delete collection."
        );
      }
    };

  // ============================================================
  // CERTIFICATE
  // ============================================================

  const createCertificate =
    async (
      artwork
    ) => {
      try {
        setCertificateLoadingId(
          artwork._id
        );

        const response =
          await api.post(
            `/api/artworks/${artwork._id}/certificate`
          );

        const updatedArtwork =
          response.data
            ?.artwork;

        if (
          updatedArtwork
        ) {
          setArtworks(
            (
              current
            ) =>
              current.map(
                (
                  item
                ) =>
                  item._id ===
                  artwork._id
                    ? updatedArtwork
                    : item
              )
          );
        }

        setSuccess(
          "Digital certificate created successfully."
        );

      } catch (
        requestError
      ) {
        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to create certificate."
        );

      } finally {
        setCertificateLoadingId(
          ""
        );
      }
    };

  // ============================================================
  // DELETE ARTWORK
  // ============================================================

  const deleteArtwork =
    async (
      artworkId
    ) => {
      const confirmed =
        window.confirm(
          "Do you really want to remove this artwork?"
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        await api.delete(
          `/api/artworks/${artworkId}`
        );

        await Promise.all([
          loadArtworks(),
          loadCollections(),
        ]);

        setSuccess(
          "Artwork removed successfully."
        );

      } catch (
        requestError
      ) {
        setError(
          requestError
            .response
            ?.data
            ?.message ||
            "Unable to remove artwork."
        );
      }
    };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatPrice =
    (
      value
    ) =>
      Number(
        value || 0
      ).toLocaleString(
        "en-US"
      );

  const isCertified =
    (
      artwork
    ) =>
      artwork
        ?.certificate
        ?.authenticated ===
        true &&
      artwork
        ?.certificate
        ?.status ===
        "Authenticated";

  const artworkInCollection =
    (
      collection,
      artworkId
    ) =>
      collection
        .artworks
        ?.some(
          (
            item
          ) =>
            String(
              item?._id ||
              item
            ) ===
            String(
              artworkId
            )
        );

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
    dark:focus:border-[#63BEFF]
    transition
  `;

  // ============================================================
  // LOADING
  // ============================================================

  if (
    loading
  ) {
    return (
      <div className="min-h-screen bg-[#EEF7FD] dark:bg-[#071A2B]">
        <Navbar />

        <div className="min-h-[600px] flex items-center justify-center">
          <Icon
            icon="mdi:loading"
            width="38"
            className="animate-spin text-[#168BE8]"
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

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

      {/* HERO */}

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
            max-w-[1300px]
            mx-auto
            px-6
            py-14
          "
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#9DD8FF]">
            Artist private area
          </p>

          <h1 className="mt-4 font-serif text-[50px] md:text-[68px]">
            Artist{" "}
            <span className="italic text-[#63BEFF]">
              Studio.
            </span>
          </h1>

          <p className="mt-5 max-w-[720px] text-sm leading-7 text-white/70">
            Publish artworks, create your own collections and
            manage your Messina Gallery Digital Certificates.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/artist-sales"
              className="
                h-11 px-5
                inline-flex items-center gap-2
                bg-white text-[#0A416D]
                text-sm font-semibold
              "
            >
              <Icon
                icon="mdi:chart-line"
                width="19"
              />

              My sales
            </Link>

            <Link
              to="/collections"
              className="
                h-11 px-5
                inline-flex items-center gap-2
                bg-white/10
                border border-white/20
                text-white text-sm
              "
            >
              <Icon
                icon="mdi:view-grid-outline"
                width="19"
              />

              Public collections
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-[1300px] mx-auto px-6 py-12">

        {/* ACCOUNT */}

        <section
          className="
            p-5
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
          "
        >
          <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
            Connected artist
          </p>

          <h2 className="mt-2 font-serif text-[28px]">
            {user?.artistName ||
              `${user?.firstName || ""} ${user?.lastName || ""}`}
          </h2>

          <div className="mt-3 flex flex-wrap gap-5 text-xs text-[#718296]">
            <span>
              {artworks.length} artworks
            </span>

            <span>
              {collections.length} collections
            </span>

            <span>
              {user?.artistCode}
            </span>
          </div>
        </section>

        {/* MESSAGES */}

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 text-green-700">
            {success}
          </div>
        )}

        {/* ====================================================
            COLLECTION CREATION
        ==================================================== */}

        <section
          className="
            mt-8
            p-7
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                w-12 h-12
                rounded-full
                bg-[#EAF6FF]
                dark:bg-[#168BE8]/10
                flex items-center justify-center
                text-[#168BE8]
              "
            >
              <Icon
                icon="mdi:view-grid-plus-outline"
                width="24"
              />
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
                Artist collections
              </p>

              <h2 className="mt-1 font-serif text-[31px]">
                Create a collection
              </h2>
            </div>
          </div>

          <form
            onSubmit={
              createCollection
            }
            className="
              mt-7
              grid
              grid-cols-1
              lg:grid-cols-[1fr_1.5fr_auto]
              gap-4
            "
          >
            <input
              value={
                collectionForm.name
              }
              onChange={(
                event
              ) =>
                setCollectionForm(
                  (
                    current
                  ) => ({
                    ...current,

                    name:
                      event
                        .target
                        .value,
                  })
                )
              }
              placeholder="Collection name *"
              className={
                inputClass
              }
            />

            <input
              value={
                collectionForm.description
              }
              onChange={(
                event
              ) =>
                setCollectionForm(
                  (
                    current
                  ) => ({
                    ...current,

                    description:
                      event
                        .target
                        .value,
                  })
                )
              }
              placeholder="Short description"
              className={
                inputClass
              }
            />

            <button
              type="submit"
              disabled={
                creatingCollection
              }
              className="
                min-h-[50px]
                px-6
                bg-[#168BE8]
                text-white
                text-sm
                font-semibold
                disabled:opacity-50
              "
            >
              {creatingCollection
                ? "Creating..."
                : "Create collection"}
            </button>
          </form>

          <label className="mt-4 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={
                collectionForm.published
              }
              onChange={(
                event
              ) =>
                setCollectionForm(
                  (
                    current
                  ) => ({
                    ...current,

                    published:
                      event
                        .target
                        .checked,
                  })
                )
              }
              className="accent-[#168BE8]"
            />

            Publish immediately on the Collections page
          </label>
        </section>

        {/* ====================================================
            MY COLLECTIONS
        ==================================================== */}

        <section className="mt-10">
          <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
            My universe
          </p>

          <h2 className="mt-2 font-serif text-[38px]">
            My collections
          </h2>

          {collections.length ===
          0 ? (
            <div className="mt-6 p-12 bg-white dark:bg-[#0B2238] text-center">
              <Icon
                icon="mdi:view-grid-outline"
                width="40"
                className="mx-auto text-[#168BE8]"
              />

              <p className="mt-4 text-sm text-[#718296]">
                Create your first collection.
              </p>
            </div>

          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {collections.map(
                (
                  collection
                ) => (
                  <article
                    key={
                      collection._id
                    }
                    className="
                      bg-white
                      dark:bg-[#0B2238]
                      border
                      border-[#DCE9F3]
                      dark:border-white/10
                      overflow-hidden
                    "
                  >
                    {collection.coverImage ? (
                      <img
                        src={`${API_URL}${collection.coverImage}`}
                        alt={
                          collection.name
                        }
                        className="w-full h-[240px] object-cover"
                      />
                    ) : (
                      <div
                        className="
                          h-[180px]
                          bg-gradient-to-br
                          from-[#0A416D]
                          to-[#168BE8]
                          flex items-center justify-center
                          text-white
                        "
                      >
                        <Icon
                          icon="mdi:view-grid-outline"
                          width="48"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.18em] text-[#168BE8]">
                            {collection.published
                              ? "Public collection"
                              : "Private collection"}
                          </p>

                          <h3 className="mt-2 font-serif text-[28px]">
                            {collection.name}
                          </h3>
                        </div>

                        <span className="text-xs text-[#718296]">
                          {collection.artworks?.length || 0} works
                        </span>
                      </div>

                      {collection.description && (
                        <p className="mt-3 text-sm leading-6 text-[#718296]">
                          {collection.description}
                        </p>
                      )}

                      {/* ARTWORKS */}

                      <div className="mt-5 space-y-2">
                        {collection.artworks?.map(
                          (
                            artwork
                          ) => (
                            <div
                              key={
                                artwork._id
                              }
                              className="
                                flex
                                items-center
                                gap-3
                                p-2
                                bg-[#F4F9FC]
                                dark:bg-white/5
                              "
                            >
                              <img
                                src={`${API_URL}${artwork.image}`}
                                alt={
                                  artwork.title
                                }
                                className="w-12 h-12 object-cover"
                              />

                              <span className="flex-1 text-xs font-semibold truncate">
                                {artwork.title}
                              </span>

                              <button
                                type="button"
                                disabled={
                                  collectionAction ===
                                  `${collection._id}-${artwork._id}`
                                }
                                onClick={() =>
                                  removeArtworkFromCollection(
                                    collection._id,
                                    artwork._id
                                  )
                                }
                                className="text-red-500"
                              >
                                <Icon
                                  icon="mdi:close"
                                  width="17"
                                />
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      {/* ADD ARTWORK */}

                      <div className="mt-5">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-[#718296]">
                          Add artwork
                        </p>

                        <select
                          defaultValue=""
                          onChange={(
                            event
                          ) => {
                            const artworkId =
                              event.target
                                .value;

                            if (
                              artworkId
                            ) {
                              void addArtworkToCollection(
                                collection._id,
                                artworkId
                              );

                              event.target.value =
                                "";
                            }
                          }}
                          className={`${inputClass} mt-2`}
                        >
                          <option value="">
                            Select one of your artworks
                          </option>

                          {artworks
                            .filter(
                              (
                                artwork
                              ) =>
                                !artworkInCollection(
                                  collection,
                                  artwork._id
                                )
                            )
                            .map(
                              (
                                artwork
                              ) => (
                                <option
                                  key={
                                    artwork._id
                                  }
                                  value={
                                    artwork._id
                                  }
                                >
                                  {artwork.title}
                                </option>
                              )
                            )}
                        </select>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleCollection(
                              collection
                            )
                          }
                          className="
                            h-10
                            px-4
                            border
                            border-[#168BE8]
                            text-[#168BE8]
                            text-xs
                            font-semibold
                          "
                        >
                          {collection.published
                            ? "Hide from public"
                            : "Publish collection"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteCollection(
                              collection
                            )
                          }
                          className="
                            h-10
                            px-4
                            bg-red-50
                            text-red-600
                            text-xs
                            font-semibold
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        {/* ====================================================
            CREATE ARTWORK
        ==================================================== */}

        <section
          className="
            mt-12
            bg-white
            dark:bg-[#0B2238]
            border
            border-[#DCE9F3]
            dark:border-white/10
            p-7
          "
        >
          <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
            New artwork
          </p>

          <h2 className="mt-2 font-serif text-[31px]">
            Publish an artwork
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-7"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                name="title"
                value={
                  form.title
                }
                onChange={
                  handleChange
                }
                placeholder="Artwork title *"
                className={
                  inputClass
                }
              />

              <select
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              >
                {categories.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item
                      }
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              <input
                type="number"
                min="0"
                name="price"
                value={
                  form.price
                }
                onChange={
                  handleChange
                }
                placeholder="Price (€) *"
                className={
                  inputClass
                }
              />

              <input
                type="number"
                name="year"
                value={
                  form.year
                }
                onChange={
                  handleChange
                }
                placeholder="Year"
                className={
                  inputClass
                }
              />

              <input
                name="dimensions"
                value={
                  form.dimensions
                }
                onChange={
                  handleChange
                }
                placeholder="Dimensions"
                className={
                  inputClass
                }
              />

              <input
                name="country"
                value={
                  form.country
                }
                onChange={
                  handleChange
                }
                placeholder="Country"
                className={
                  inputClass
                }
              />
            </div>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              rows="4"
              placeholder="Description *"
              className={`${inputClass} mt-5`}
            />

            <textarea
              name="story"
              value={
                form.story
              }
              onChange={
                handleChange
              }
              rows="3"
              placeholder="Story"
              className={`${inputClass} mt-5`}
            />

            <textarea
              name="inspiration"
              value={
                form.inspiration
              }
              onChange={
                handleChange
              }
              rows="3"
              placeholder="Inspiration"
              className={`${inputClass} mt-5`}
            />

            <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5">
              <label
                className="
                  min-h-[180px]
                  border
                  border-dashed
                  border-[#9DC7E4]
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  overflow-hidden
                "
              >
                {preview ? (
                  <img
                    src={
                      preview
                    }
                    alt="Preview"
                    className="w-full h-[230px] object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Icon
                      icon="mdi:image-plus-outline"
                      width="32"
                      className="mx-auto text-[#168BE8]"
                    />

                    <p className="mt-3 text-sm">
                      Select artwork image
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />
              </label>

              {image && (
                <div className="md:col-span-2 text-sm">
                  <span className="font-semibold">
                    Selected file:
                  </span>{" "}
                  {image.name}
                </div>
              )}

              <div className="p-5 bg-[#F3FAFF] dark:bg-[#102A43]">
                <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
                  Authenticity
                </p>

                <label className="mt-5 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      form.isOriginal
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,

                          isOriginal:
                            event
                              .target
                              .checked,
                        })
                      )
                    }
                    className="accent-[#168BE8]"
                  />

                  Original artwork
                </label>

                <p className="mt-4 text-xs leading-6 text-[#718296]">
                  Original artworks can receive a Messina Gallery
                  Digital Certificate with SHA-256 fingerprint
                  and public QR verification.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                submitting
              }
              className="
                mt-7
                h-[55px]
                px-8
                bg-gradient-to-r
                from-[#1677E8]
                to-[#52B6FA]
                text-white
                font-semibold
                disabled:opacity-50
              "
            >
              {submitting
                ? "Publishing..."
                : "Publish artwork"}
            </button>
          </form>
        </section>

        {/* ====================================================
            ARTWORKS
        ==================================================== */}

        <section className="mt-12">
          <p className="text-[9px] uppercase tracking-[0.20em] text-[#168BE8]">
            Portfolio
          </p>

          <h2 className="mt-2 font-serif text-[38px]">
            My artworks
          </h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map(
              (
                artwork
              ) => {
                const certified =
                  isCertified(
                    artwork
                  );

                return (
                  <article
                    key={
                      artwork._id
                    }
                    className="
                      bg-white
                      dark:bg-[#0B2238]
                      border
                      border-[#DCE9F3]
                      dark:border-white/10
                      overflow-hidden
                    "
                  >
                    <img
                      src={`${API_URL}${artwork.image}`}
                      alt={
                        artwork.title
                      }
                      className="w-full h-[300px] object-cover"
                    />

                    <div className="p-5">
                      <div className="flex justify-between gap-3">
                        <span className="text-[9px] uppercase text-[#168BE8]">
                          {artwork.category}
                        </span>

                        <span className="text-[9px] uppercase">
                          {artwork.sold
                            ? "Sold"
                            : "Available"}
                        </span>
                      </div>

                      <h3 className="mt-2 font-serif text-[25px]">
                        {artwork.title}
                      </h3>

                      <p className="mt-3 text-[22px] font-serif text-[#168BE8]">
                        €
                        {formatPrice(
                          artwork.price
                        )}
                      </p>

                      {artwork.isOriginal && (
                        <div className="mt-4 p-4 bg-[#F4FAFE] dark:bg-white/5">
                          {certified ? (
                            <>
                              <div className="flex items-center gap-2 text-green-700">
                                <Icon
                                  icon="mdi:check-decagram"
                                  width="18"
                                />

                                <span className="text-xs font-semibold">
                                  Certified
                                </span>
                              </div>

                              <Link
                                to={`/c/${artwork.certificate.certificateId}`}
                                className="
                                  mt-3
                                  inline-flex
                                  text-xs
                                  font-semibold
                                  text-[#168BE8]
                                "
                              >
                                View public certificate
                              </Link>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                certificateLoadingId ===
                                artwork._id
                              }
                              onClick={() =>
                                createCertificate(
                                  artwork
                                )
                              }
                              className="
                                w-full
                                h-10
                                bg-[#168BE8]
                                text-white
                                text-xs
                                font-semibold
                              "
                            >
                              {certificateLoadingId ===
                              artwork._id
                                ? "Creating..."
                                : "Create certificate"}
                            </button>
                          )}
                        </div>
                      )}

                      <div className="mt-5 flex justify-between">
                        <Link
                          to={`/artwork/${artwork._id}`}
                          className="text-xs text-[#168BE8] font-semibold"
                        >
                          View
                        </Link>

                        {!artwork.sold &&
                          !certified && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteArtwork(
                                  artwork._id
                                )
                              }
                              className="text-xs text-red-500"
                            >
                              Remove
                            </button>
                          )}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ArtistStudioPage;