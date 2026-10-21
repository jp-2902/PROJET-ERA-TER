import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  Icon,
} from "@iconify/react";

import Navbar from "../components/Navbar";

import api, {
  API_URL,
} from "../api";

function CertificatePage() {
  const {
    certificateId,
  } = useParams();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState(null);

  // ============================================================
  // LOAD CERTIFICATE
  // ============================================================

  useEffect(() => {
    const loadCertificate =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/api/artworks/certificate/${certificateId}`
            );

          setData(
            response.data
          );
        } catch (err) {
          setError(
            err.response?.data
              ?.message ||
              "Certificate not found."
          );
        } finally {
          setLoading(false);
        }
      };

    loadCertificate();
  }, [certificateId]);

  // ============================================================
  // DATA
  // ============================================================

  const artwork =
    data?.artwork || null;

  const certificate =
    data?.certificate || null;

  const valid =
    data?.valid === true;

  // ============================================================
  // IMAGE
  // ============================================================

  const artworkImage =
    artwork?.image
      ? artwork.image.startsWith(
          "http"
        )
        ? artwork.image
        : `${API_URL}${artwork.image}`
      : "/assets/logo.png";

  const qrCodeImage =
    certificate?.qrCodePath
      ? certificate.qrCodePath.startsWith(
          "http"
        )
        ? certificate.qrCodePath
        : `${API_URL}${certificate.qrCodePath}`
      : "";

  // ============================================================
  // DATE
  // ============================================================

  const formatDate =
    (value) => {
      if (!value) {
        return "Not available";
      }

      return new Date(
        value
      ).toLocaleString(
        "en-GB",
        {
          dateStyle:
            "long",

          timeStyle:
            "short",
        }
      );
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-[#F3F9FD]
          dark:bg-[#071A2B]
        "
      >
        <Navbar />

        <div
          className="
            min-h-[650px]
            flex
            items-center
            justify-center
          "
        >
          <div
            className="
              text-center
            "
          >
            <Icon
              icon="mdi:loading"
              width="42"
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
                text-[#718296]
              "
            >
              Verifying certificate...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    error ||
    !data ||
    !artwork ||
    !certificate
  ) {
    return (
      <div
        className="
          min-h-screen
          bg-[#F3F9FD]
          dark:bg-[#071A2B]
          text-[#10233D]
          dark:text-white
        "
      >
        <Navbar />

        <div
          className="
            min-h-[650px]
            flex
            items-center
            justify-center
            px-6
          "
        >
          <div
            className="
              max-w-[600px]
              w-full
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
                w-20
                h-20
                mx-auto
                rounded-full
                flex
                items-center
                justify-center
                bg-[#FFF0F0]
                text-[#C53E3E]
              "
            >
              <Icon
                icon="mdi:certificate-outline"
                width="40"
              />
            </div>

            <h1
              className="
                mt-6
                font-serif
                text-[38px]
              "
            >
              Certificate unavailable
            </h1>

            <p
              className="
                mt-4
                text-sm
                leading-7
                text-[#718296]
                dark:text-[#A9C0D3]
              "
            >
              {error ||
                "This certificate could not be verified."}
            </p>

            <Link
              to="/"
              className="
                mt-8
                min-h-12
                px-6
                inline-flex
                items-center
                justify-center
                gap-2
                bg-[#168BE8]
                text-white
                text-sm
                font-semibold
              "
            >
              <Icon
                icon="mdi:home-outline"
                width="18"
              />

              Return home
            </Link>
          </div>
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
        bg-[#F3F9FD]
        dark:bg-[#071A2B]
        text-[#10233D]
        dark:text-white
      "
    >
      <Navbar />

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          bg-gradient-to-br
          from-[#061B30]
          via-[#0B416C]
          to-[#1479B9]
          text-white
        "
      >
        <div
          className="
            max-w-[1180px]
            mx-auto
            px-6
            py-16
            md:py-20
          "
        >
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-8
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.28em]
                  text-[#9DD8FF]
                "
              >
                Messina Gallery
              </p>

              <h1
                className="
                  mt-4
                  font-serif
                  text-[44px]
                  md:text-[64px]
                  leading-tight
                "
              >
                Digital Certificate
              </h1>

              <p
                className="
                  mt-4
                  max-w-[650px]
                  text-sm
                  md:text-base
                  leading-7
                  text-white/70
                "
              >
                Public verification record for an artwork
                registered and authenticated by Messina Gallery.
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                bg-white/10
                border
                border-white/15
                px-5
                py-4
              "
            >
              <Icon
                icon={
                  valid
                    ? "mdi:shield-check"
                    : "mdi:shield-alert-outline"
                }
                width="30"
                className={
                  valid
                    ? "text-[#72D6FF]"
                    : "text-[#FFB2B2]"
                }
              />

              <div>
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.18em]
                    text-white/60
                  "
                >
                  Verification status
                </p>

                <p
                  className="
                    mt-1
                    font-semibold
                  "
                >
                  {valid
                    ? "Certificate verified"
                    : "Certificate invalid"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main
        className="
          max-w-[1180px]
          mx-auto
          px-6
          py-12
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1fr_380px]
            gap-8
          "
        >
          {/* ==================================================
              ARTWORK
          ================================================== */}

          <div
            className="
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE9F3]
              dark:border-white/10
              overflow-hidden
            "
          >
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-[320px_1fr]
              "
            >
              <div
                className="
                  min-h-[360px]
                  bg-[#EAF3F8]
                  dark:bg-[#061828]
                "
              >
                <img
                  src={
                    artworkImage
                  }
                  alt={
                    artwork.title
                  }
                  className="
                    w-full
                    h-full
                    min-h-[360px]
                    object-cover
                  "
                />
              </div>

              <div
                className="
                  p-7
                  md:p-9
                "
              >
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.18em]
                    text-[#168BE8]
                  "
                >
                  Certified artwork
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[38px]
                    leading-tight
                  "
                >
                  {
                    artwork.title
                  }
                </h2>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  {
                    artwork.description
                  }
                </p>

                <div
                  className="
                    mt-7
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-5
                  "
                >
                  <CertificateDetail
                    label="Artist"
                    value={
                      artwork.artistName
                    }
                  />

                  <CertificateDetail
                    label="Artist ID"
                    value={
                      artwork.artistCode
                    }
                  />

                  <CertificateDetail
                    label="Category"
                    value={
                      artwork.category
                    }
                  />

                  <CertificateDetail
                    label="Year"
                    value={
                      artwork.year
                    }
                  />

                  <CertificateDetail
                    label="Dimensions"
                    value={
                      artwork.dimensions
                    }
                  />

                  <CertificateDetail
                    label="Country"
                    value={
                      artwork.country
                    }
                  />
                </div>

                {artwork._id && (
                  <Link
                    to={`/artwork/${artwork._id}`}
                    className="
                      mt-8
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-[#168BE8]
                      hover:underline
                    "
                  >
                    <Icon
                      icon="mdi:image-outline"
                      width="18"
                    />

                    View artwork
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
              CERTIFICATE CARD
          ================================================== */}

          <aside
            className="
              bg-white
              dark:bg-[#0B2238]
              border
              border-[#DCE9F3]
              dark:border-white/10
              p-7
              h-fit
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-[0.18em]
                    text-[#168BE8]
                  "
                >
                  Authentication record
                </p>

                <h2
                  className="
                    mt-2
                    font-serif
                    text-[28px]
                  "
                >
                  Certificate
                </h2>
              </div>

              <Icon
                icon="mdi:certificate"
                width="34"
                className="text-[#168BE8]"
              />
            </div>

            <div
              className="
                mt-7
                space-y-6
              "
            >
              <CertificateDetail
                label="Certificate ID"
                value={
                  certificate.certificateId
                }
              />

              <CertificateDetail
                label="Status"
                value={
                  certificate.status
                }
              />

              <CertificateDetail
                label="Certified at"
                value={
                  formatDate(
                    certificate.certifiedAt
                  )
                }
              />
            </div>

            {/* SHA256 */}

            <div
              className="
                mt-7
                p-4
                bg-[#F2F9FE]
                dark:bg-white/5
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-[0.15em]
                  text-[#8A9BAA]
                "
              >
                SHA-256 fingerprint
              </p>

              <p
                className="
                  mt-3
                  break-all
                  font-mono
                  text-[11px]
                  leading-5
                  text-[#37556E]
                  dark:text-[#BFD3E1]
                "
              >
                {
                  certificate.sha256
                }
              </p>
            </div>

            {/* QR CODE */}

            {qrCodeImage && (
              <div
                className="
                  mt-7
                  text-center
                "
              >
                <div
                  className="
                    inline-block
                    bg-white
                    border
                    border-[#DCE9F3]
                    p-3
                  "
                >
                  <img
                    src={
                      qrCodeImage
                    }
                    alt="Certificate QR Code"
                    className="
                      w-[180px]
                      h-[180px]
                      object-contain
                    "
                  />
                </div>

                <p
                  className="
                    mt-3
                    text-xs
                    text-[#718296]
                    dark:text-[#A9C0D3]
                  "
                >
                  Scan this QR code to verify this certificate.
                </p>
              </div>
            )}

            {/* VALIDITY */}

            <div
              className={`
                mt-7
                px-4
                py-4
                flex
                items-start
                gap-3
                ${
                  valid
                    ? "bg-[#EAF8F0] text-[#14743A]"
                    : "bg-[#FFF0F0] text-[#B83232]"
                }
              `}
            >
              <Icon
                icon={
                  valid
                    ? "mdi:check-decagram"
                    : "mdi:alert-circle-outline"
                }
                width="22"
                className="shrink-0"
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                  "
                >
                  {valid
                    ? "Valid certificate"
                    : "Invalid certificate"}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    opacity-80
                  "
                >
                  {valid
                    ? "This certificate exists in the Messina Gallery registry."
                    : "This certificate is not currently marked as authenticated."}
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* ====================================================
            NOTE
        ==================================================== */}

        <section
          className="
            mt-8
            bg-[#EAF6FF]
            dark:bg-[#0B2238]
            border
            border-[#D3EAF9]
            dark:border-white/10
            px-6
            py-5
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <Icon
              icon="mdi:information-outline"
              width="22"
              className="
                shrink-0
                mt-0.5
                text-[#168BE8]
              "
            />

            <p
              className="
                text-xs
                leading-6
                text-[#587184]
                dark:text-[#A9C0D3]
              "
            >
              This digital certificate confirms that Messina Gallery registered this artwork and associated it with a unique certificate identifier and SHA-256 fingerprint for verification.

            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

// ============================================================
// CERTIFICATE DETAIL
// ============================================================

function CertificateDetail({
  label,
  value,
}) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return (
    <div>
      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.15em]
          text-[#8A9BAA]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-medium
          break-words
        "
      >
        {value}
      </p>
    </div>
  );
}

export default CertificatePage;