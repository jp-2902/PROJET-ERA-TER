import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import { API_URL } from "../api";

const artworks = [
  "/assets/art1.jpg",
  "/assets/art2.jpg",
  "/assets/art3.jpg",
  "/assets/art4.jpg",
];

const lettersPattern = "[A-Za-zÀ-ÖØ-öø-ÿ' -]+";
const phonePattern = "[0-9+() .-]{7,20}";

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const RequiredMark = () => (
  <span className="ml-1 text-[#168BE8]">*</span>
);

const RegisterPage = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Artist only
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");

  // Date of birth fields
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [birthPlace, setBirthPlace] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [artistCode, setArtistCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentArtwork, setCurrentArtwork] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentArtwork((previous) => (previous + 1) % artworks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleLettersOnly = (setter) => (event) => {
    const value = event.target.value;

    if (/^[A-Za-zÀ-ÖØ-öø-ÿ' -]*$/.test(value)) {
      setter(value);
    }
  };

  const handlePhoneChange = (event) => {
    const value = event.target.value;

    if (/^[0-9+() .-]*$/.test(value)) {
      setPhone(value);
    }
  };

  const handleBirthDayChange = (event) => {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = value.slice(0, 2);
    }

    if (value !== "" && Number(value) > 31) {
      value = "31";
    }

    setBirthDay(value);
  };

  const handleBirthYearChange = (event) => {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    setBirthYear(value);
  };

  const buildBirthDate = () => {
    if (!birthDay || !birthMonth || !birthYear) {
      return "";
    }

    const day = birthDay.padStart(2, "0");

    return `${birthYear}-${birthMonth}-${day}`;
  };

  const isValidBirthDate = () => {
    const birthDate = buildBirthDate();

    if (!birthDate) {
      return false;
    }

    const year = Number(birthYear);
    const month = Number(birthMonth);
    const day = Number(birthDay);

    if (year < 1900 || year > currentYear) {
      return false;
    }

    const date = new Date(year, month - 1, day);

    const isRealDate =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    if (!isRealDate) {
      return false;
    }

    const today = new Date();

    today.setHours(23, 59, 59, 999);

    return date <= today;
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError("Profile photo must be JPG, PNG or WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5 MB.");
      return;
    }

    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }

    setProfilePhoto(file);
    setProfilePreview(URL.createObjectURL(file));
    setError("");
  };

  const validate = () => {
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
    const phoneRegex = /^[0-9+() .-]{7,20}$/;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !country ||
      !city ||
      !address ||
      !password ||
      !confirmPassword
    ) {
      return "Please fill in all required fields marked with * .";
    }

    if (!nameRegex.test(firstName.trim())) {
      return "First name must contain letters only.";
    }

    if (!nameRegex.test(lastName.trim())) {
      return "Last name must contain letters only.";
    }

    if (!nameRegex.test(country.trim())) {
      return "Country must contain letters only.";
    }

    if (!nameRegex.test(city.trim())) {
      return "City must contain letters only.";
    }

    if (!phoneRegex.test(phone.trim())) {
      return "Please enter a valid phone number, for example +33 6 12 34 56 78.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (role === "artist") {
      if (
        !artistName ||
        !bio ||
        !specialty ||
        !birthDay ||
        !birthMonth ||
        !birthYear ||
        !birthPlace ||
        !birthCountry
      ) {
        return "Please complete all required artist fields marked with * .";
      }

      if (!nameRegex.test(birthPlace.trim())) {
        return "Place of birth must contain letters only.";
      }

      if (!nameRegex.test(birthCountry.trim())) {
        return "Country of birth must contain letters only.";
      }

      if (!isValidBirthDate()) {
        return "Please enter a valid date of birth.";
      }
    }

    if (!acceptedTerms) {
      return "You must agree to the Terms of Service and Privacy Policy.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setArtistCode("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("role", role);
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phone", phone.trim());
      formData.append("country", country.trim());
      formData.append("city", city.trim());
      formData.append("address", address.trim());
      formData.append("password", password);
      formData.append("termsAccepted", acceptedTerms ? "true" : "false");
      formData.append("acceptedTerms", acceptedTerms ? "true" : "false");

      if (role === "artist") {
        formData.append("artistName", artistName.trim());
        formData.append("bio", bio.trim());
        formData.append("specialty", specialty.trim());

        formData.append("birthDate", buildBirthDate());

        formData.append("birthPlace", birthPlace.trim());
        formData.append("birthCountry", birthCountry.trim());

        if (profilePhoto) {
          formData.append("profilePhoto", profilePhoto);
        }
      }

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const generatedArtistCode =
        response.data?.artistCode ||
        response.data?.user?.artistCode ||
        "";

      if (role === "artist" && generatedArtistCode) {
        setArtistCode(generatedArtistCode);
        setSuccess("Artist account created successfully.");

        setTimeout(() => {
          navigate("/login");
        }, 4000);
      } else {
        setSuccess("Account created successfully.");

        setTimeout(() => {
          navigate("/login");
        }, 1800);
      }
    } catch (requestError) {
      console.error("Registration error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full bg-transparent py-3 text-sm
    text-[#10233D] dark:text-white
    placeholder:text-[#98A3AE] dark:placeholder:text-[#71869A]
    outline-none
  `;

  const labelClass = `
    block mb-2 text-[10px] font-semibold uppercase tracking-[0.22em]
    text-[#10233D] dark:text-[#BDD0E0]
  `;

  const inputWrapperClass = `
    flex items-center px-4 border border-[#CAD8E5] dark:border-white/15
    rounded-[4px] bg-white/70 dark:bg-white/[0.03]
    focus-within:border-[#168BE8] dark:focus-within:border-[#4BB5FF]
    transition-all duration-300
  `;

  const birthFieldClass = `
    w-full h-[48px] px-3
    bg-white/70 dark:bg-white/[0.03]
    border border-[#CAD8E5] dark:border-white/15
    rounded-[4px]
    text-[#10233D] dark:text-white
    text-sm
    outline-none
    focus:border-[#168BE8] dark:focus:border-[#4BB5FF]
    transition-all duration-300
  `;

  return (
    <div className="min-h-screen bg-[#EAF5FD] dark:bg-[#07182A] flex items-center justify-center px-4 py-7 transition-colors duration-500">
      <div className="relative w-full max-w-[1220px] min-h-[820px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-[#0B1F33] overflow-hidden shadow-[0_30px_90px_rgba(14,58,103,0.22)]">

        {/* LEFT */}
        <section className="relative hidden lg:flex min-h-[820px] overflow-hidden text-white">
          <div className="absolute inset-0">
            {artworks.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Messina Gallery artwork ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out ${
                  currentArtwork === index
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-[#063A70]/95 via-[#07549A]/88 to-[#021D3A]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(74,168,232,0.35),transparent_45%)]" />

          <div className="relative z-10 w-full min-h-[820px] flex flex-col px-12 pt-3 pb-10">
            <div className="w-full h-[390px] flex items-center justify-center">
              <Link
                to="/"
                className="flex items-center justify-center group"
              >
                <img
                  src="/assets/logo.png"
                  alt="Messina Gallery"
                  className="w-[370px] h-[370px] xl:w-[395px] xl:h-[395px] object-contain bg-transparent drop-shadow-[0_12px_30px_rgba(0,20,50,0.35)] transition-transform duration-500 group-hover:scale-[1.025]"
                />
              </Link>
            </div>

            <div className="max-w-[455px]">
              <div className="flex items-center gap-5 mb-5">
                <span className="w-12 h-[3px] rounded-full bg-[#39A9FF]" />

                <span className="text-[11px] uppercase tracking-[0.36em] text-white/85">
                  Join the world of art
                </span>
              </div>

              <h1 className="font-serif text-[52px] xl:text-[58px] leading-[1.04] font-normal text-white">
                Create your
                <br />
                <span className="italic text-[#39A9FF]">
                  own collection.
                </span>
              </h1>

              <p className="mt-6 text-[14px] leading-7 text-white/80 max-w-[420px]">
                Create an account to discover artworks, follow artists,
                save your favourites and build your personal collection.
              </p>
            </div>

            <div className="mt-auto pt-8 flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[0.32em] text-white/60">
                Art · Artists · Stories
              </p>

              <div className="flex items-center gap-2.5">
                {artworks.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentArtwork(index)}
                    className={`transition-all duration-500 rounded-full ${
                      currentArtwork === index
                        ? "w-9 h-[5px] bg-[#1695F5]"
                        : "w-2 h-2 bg-white/70 hover:bg-white"
                    }`}
                    aria-label={`Artwork ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="relative min-h-[820px] flex flex-col bg-[#FCFDFE] dark:bg-[#0B1F33] transition-colors duration-500">

          <header className="px-7 sm:px-10 lg:px-12 pt-7 pb-3 flex items-center justify-between">
            <Link
              to="/"
              className="lg:hidden flex items-center"
            >
              <img
                src="/assets/logo.png"
                alt="Messina Gallery"
                className="w-[90px] h-[90px] object-contain"
              />
            </Link>

            <nav className="ml-auto flex items-center gap-8">
              <Link
                to="/"
                className="text-[13px] font-medium text-[#10233D] dark:text-[#D7E9F9] hover:text-[#168BE8] transition-colors"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="text-[13px] font-medium text-[#10233D] dark:text-[#D7E9F9] hover:text-[#168BE8] transition-colors"
              >
                Gallery
              </Link>

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
                className="w-[48px] h-[48px] rounded-full flex items-center justify-center bg-gradient-to-br from-[#39A9FF] to-[#0879DF] text-white shadow-[0_8px_22px_rgba(8,121,223,0.32)] border border-white/30 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Icon
                  icon={
                    darkMode
                      ? "mdi:white-balance-sunny"
                      : "mdi:weather-night"
                  }
                  width="22"
                />
              </button>
            </nav>
          </header>

          <div className="flex-1 px-7 sm:px-10 lg:px-12 pt-3 pb-8">
            <div className="w-full max-w-[520px] mx-auto">

              <div className="mb-7">
                <div className="flex items-center gap-4 mb-4">
                  <span className="w-12 h-[3px] rounded-full bg-[#168BE8]" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.30em] text-[#168BE8]">
                    Create your account
                  </span>
                </div>

                <h2 className="font-serif text-[46px] leading-[1.02] font-normal text-[#10233D] dark:text-white">
                  Welcome to
                  <br />
                  <span className="italic text-[#168BE8]">
                    Messina Gallery
                  </span>
                  .
                </h2>

                <p className="mt-4 text-[14px] text-[#6F7782] dark:text-[#A4B5C5]">
                  Join our community and start exploring the world of art.
                </p>

                <p className="mt-2 text-[11px] text-[#7D8995] dark:text-[#8FA8BC]">
                  Fields marked with{" "}
                  <span className="text-[#168BE8] font-bold">
                    *
                  </span>{" "}
                  are required.
                </p>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-3 px-4 py-3 border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 text-sm">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    width="20"
                  />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-5 px-4 py-4 border border-[#A9D8F7] bg-[#EFF9FF] dark:bg-[#0A2D4A] dark:border-[#1E6EA5] text-[#0D639E] dark:text-[#80CFFF]">

                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:check-circle-outline"
                      width="22"
                    />

                    <span className="text-sm">
                      {success}
                    </span>
                  </div>

                  {artistCode && (
                    <div className="mt-4 p-4 bg-white dark:bg-[#071C2E] border border-[#BFDFF4] dark:border-white/10 text-center">

                      <p className="text-[9px] uppercase tracking-[0.25em] text-[#71869A]">
                        Your Artist ID
                      </p>

                      <p className="mt-2 text-xl font-bold tracking-[0.15em] text-[#168BE8]">
                        {artistCode}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ROLE */}
              <div className="mb-7">
                <label className={labelClass}>
                  I am signing up as
                  <RequiredMark />
                </label>

                <div className="grid grid-cols-2 border border-[#CAD8E5] dark:border-white/15 rounded-[4px] overflow-hidden">

                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`h-[58px] flex items-center justify-center gap-3 text-sm font-medium transition-all duration-300 ${
                      role === "user"
                        ? "bg-gradient-to-r from-[#1677E8] to-[#269AF1] text-white"
                        : "bg-white dark:bg-transparent text-[#10233D] dark:text-white"
                    }`}
                  >
                    <Icon
                      icon="mdi:account-outline"
                      width="21"
                    />
                    Collector
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("artist")}
                    className={`h-[58px] flex items-center justify-center gap-3 text-sm font-medium transition-all duration-300 ${
                      role === "artist"
                        ? "bg-gradient-to-r from-[#1677E8] to-[#269AF1] text-white"
                        : "bg-white dark:bg-transparent text-[#10233D] dark:text-white"
                    }`}
                  >
                    <Icon
                      icon="mdi:fountain-pen-tip"
                      width="20"
                    />
                    Artist
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                {/* FIRST + LAST NAME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

                  <div>
                    <label
                      htmlFor="firstName"
                      className={labelClass}
                    >
                      First name
                      <RequiredMark />
                    </label>

                    <div className={inputWrapperClass}>
                      <Icon
                        icon="mdi:account-outline"
                        width="20"
                        className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                      />

                      <input
                        id="firstName"
                        type="text"
                        pattern={lettersPattern}
                        placeholder="Jean"
                        value={firstName}
                        onChange={handleLettersOnly(setFirstName)}
                        className={inputClass}
                        autoComplete="given-name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className={labelClass}
                    >
                      Last name
                      <RequiredMark />
                    </label>

                    <div className={inputWrapperClass}>
                      <Icon
                        icon="mdi:account-outline"
                        width="20"
                        className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                      />

                      <input
                        id="lastName"
                        type="text"
                        pattern={lettersPattern}
                        placeholder="Messina"
                        value={lastName}
                        onChange={handleLettersOnly(setLastName)}
                        className={inputClass}
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* EMAIL */}
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className={labelClass}
                  >
                    Email address
                    <RequiredMark />
                  </label>

                  <div className={inputWrapperClass}>
                    <Icon
                      icon="mdi:email-outline"
                      width="20"
                      className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                    />

                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="mb-5">
                  <label
                    htmlFor="phone"
                    className={labelClass}
                  >
                    Phone number
                    <RequiredMark />
                  </label>

                  <div className={inputWrapperClass}>
                    <Icon
                      icon="mdi:phone-outline"
                      width="20"
                      className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                    />

                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      pattern={phonePattern}
                      placeholder="+33 6 12 34 56 78"
                      value={phone}
                      onChange={handlePhoneChange}
                      className={inputClass}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-[#7D8995] dark:text-[#8FA8BC]">
                    Example: +33 6 12 34 56 78
                  </p>
                </div>

                {/* COUNTRY + CITY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

                  <div>
                    <label
                      htmlFor="country"
                      className={labelClass}
                    >
                      Country
                      <RequiredMark />
                    </label>

                    <div className={inputWrapperClass}>
                      <Icon
                        icon="mdi:earth"
                        width="20"
                        className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                      />

                      <input
                        id="country"
                        type="text"
                        pattern={lettersPattern}
                        placeholder="France"
                        value={country}
                        onChange={handleLettersOnly(setCountry)}
                        className={inputClass}
                        autoComplete="country-name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className={labelClass}
                    >
                      City
                      <RequiredMark />
                    </label>

                    <div className={inputWrapperClass}>
                      <Icon
                        icon="mdi:city-variant-outline"
                        width="20"
                        className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                      />

                      <input
                        id="city"
                        type="text"
                        pattern={lettersPattern}
                        placeholder="Paris"
                        value={city}
                        onChange={handleLettersOnly(setCity)}
                        className={inputClass}
                        autoComplete="address-level2"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="mb-5">
                  <label
                    htmlFor="address"
                    className={labelClass}
                  >
                    Address
                    <RequiredMark />
                  </label>

                  <div className={inputWrapperClass}>
                    <Icon
                      icon="mdi:map-marker-outline"
                      width="20"
                      className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                    />

                    <input
                      id="address"
                      type="text"
                      placeholder="12 Avenue des Arts"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass}
                      autoComplete="street-address"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD + CONFIRM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

                  <div>
                    <label
                      htmlFor="password"
                      className={labelClass}
                    >
                      Password
                      <RequiredMark />
                    </label>

                    <div className={inputWrapperClass}>
                      <Icon
                        icon="mdi:lock-outline"
                        width="20"
                        className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                      />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#10233D] dark:text-[#8EABC3] hover:text-[#168BE8]"
                      >
                        <Icon
                          icon={
                            showPassword
                              ? "mdi:eye-off-outline"
                              : "mdi:eye-outline"
                          }
                          width="20"
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className={labelClass}
                    >
                      Confirm password
                      <RequiredMark />
                    </label>

                    <div className={inputWrapperClass}>
                      <Icon
                        icon="mdi:lock-check-outline"
                        width="20"
                        className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                      />

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-[#10233D] dark:text-[#8EABC3] hover:text-[#168BE8]"
                      >
                        <Icon
                          icon={
                            showConfirmPassword
                              ? "mdi:eye-off-outline"
                              : "mdi:eye-outline"
                          }
                          width="20"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ARTIST SECTION */}
                {role === "artist" && (
                  <div className="mt-8 mb-7 pt-7 border-t border-[#D6E4EF] dark:border-white/10">

                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-8 h-[2px] bg-[#168BE8]" />

                      <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-[#168BE8]">
                        Artist profile
                      </span>
                    </div>

                    {/* ARTIST NAME */}
                    <div className="mb-5">
                      <label
                        htmlFor="artistName"
                        className={labelClass}
                      >
                        Artist name
                        <RequiredMark />
                      </label>

                      <div className={inputWrapperClass}>
                        <Icon
                          icon="mdi:palette-outline"
                          width="20"
                          className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                        />

                        <input
                          id="artistName"
                          type="text"
                          placeholder="Artist / professional name"
                          value={artistName}
                          onChange={(e) => setArtistName(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    {/* BIO */}
                    <div className="mb-5">
                      <label
                        htmlFor="bio"
                        className={labelClass}
                      >
                        Biography
                        <RequiredMark />
                      </label>

                      <textarea
                        id="bio"
                        rows="4"
                        placeholder="Tell us your story, inspiration and artistic journey..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full p-4 border border-[#CAD8E5] dark:border-white/15 rounded-[4px] bg-white/70 dark:bg-white/[0.03] text-sm text-[#10233D] dark:text-white placeholder:text-[#98A3AE] outline-none focus:border-[#168BE8] resize-none"
                        required
                      />
                    </div>

                    {/* SPECIALTY */}
                    <div className="mb-5">
                      <label
                        htmlFor="specialty"
                        className={labelClass}
                      >
                        Specialty
                        <RequiredMark />
                      </label>

                      <div className={inputWrapperClass}>
                        <Icon
                          icon="mdi:brush-outline"
                          width="20"
                          className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                        />

                        <input
                          id="specialty"
                          type="text"
                          placeholder="Painting, Sculpture, Photography..."
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>

                    {/* DATE OF BIRTH */}
                    <div className="mb-5">
                      <label className={labelClass}>
                        Date of birth
                        <RequiredMark />
                      </label>

                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="DD"
                          value={birthDay}
                          onChange={handleBirthDayChange}
                          className={birthFieldClass}
                          maxLength={2}
                          required
                        />

                        <select
                          value={birthMonth}
                          onChange={(e) => setBirthMonth(e.target.value)}
                          className={birthFieldClass}
                          required
                        >
                          <option value="">Month</option>
                          {months.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="YYYY"
                          value={birthYear}
                          onChange={handleBirthYearChange}
                          className={birthFieldClass}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    {/* BIRTH PLACE + BIRTH COUNTRY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

                      <div>
                        <label
                          htmlFor="birthPlace"
                          className={labelClass}
                        >
                          Place of birth
                          <RequiredMark />
                        </label>

                        <div className={inputWrapperClass}>
                          <Icon
                            icon="mdi:map-marker-outline"
                            width="20"
                            className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                          />

                          <input
                            id="birthPlace"
                            type="text"
                            pattern={lettersPattern}
                            placeholder="Paris"
                            value={birthPlace}
                            onChange={handleLettersOnly(setBirthPlace)}
                            className={inputClass}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="birthCountry"
                          className={labelClass}
                        >
                          Country of birth
                          <RequiredMark />
                        </label>

                        <div className={inputWrapperClass}>
                          <Icon
                            icon="mdi:earth"
                            width="20"
                            className="mr-3 text-[#10233D] dark:text-[#8EABC3]"
                          />

                          <input
                            id="birthCountry"
                            type="text"
                            pattern={lettersPattern}
                            placeholder="France"
                            value={birthCountry}
                            onChange={handleLettersOnly(setBirthCountry)}
                            className={inputClass}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* PROFILE PHOTO */}
                    <div className="mb-5">
                      <label className={labelClass}>
                        Profile photo (optional)
                      </label>

                      <div className="flex items-center gap-4">
                        {profilePreview ? (
                          <img
                            src={profilePreview}
                            alt="Profile Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#168BE8]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 border border-dashed border-[#CAD8E5] dark:border-white/20 flex items-center justify-center text-[#8EABC3]">
                            <Icon icon="mdi:camera-outline" width="24" />
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#168BE8]/10 file:text-[#168BE8] hover:file:bg-[#168BE8]/20 cursor-pointer"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* TERMS AND CONDITIONS */}
                <div className="mb-7 flex items-start gap-3">
                  <input
                    id="acceptedTerms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-[#168BE8] rounded focus:ring-[#168BE8]"
                  />

                  <label
                    htmlFor="acceptedTerms"
                    className="text-xs text-[#6F7782] dark:text-[#A4B5C5] leading-relaxed"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setLegalModal("terms")}
                      className="text-[#168BE8] underline font-medium"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setLegalModal("privacy")}
                      className="text-[#168BE8] underline font-medium"
                    >
                      Privacy Policy
                    </button>
                    . <RequiredMark />
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-gradient-to-r from-[#1677E8] to-[#269AF1] text-white font-medium rounded-[4px] shadow-lg shadow-[#1677E8]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Icon icon="mdi:loading" width="24" className="animate-spin" />
                  ) : (
                    "Create account"
                  )}
                </button>

              </form>

              <p className="mt-8 text-center text-xs text-[#6F7782] dark:text-[#A4B5C5]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#168BE8] font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>

            </div>
          </div>
        </section>

      </div>

      {/* MODAL TERMS & PRIVACY */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1F33] text-[#10233D] dark:text-white max-w-lg w-full rounded-lg p-6 max-h-[80vh] overflow-y-auto relative shadow-2xl">
            <button
              type="button"
              onClick={() => setLegalModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <Icon icon="mdi:close" width="24" />
            </button>

            {legalModal === "terms" ? (
              <div>
                <h3 className="text-xl font-bold mb-4 font-serif text-[#168BE8]">
                  Terms of Service
                </h3>
                <div className="text-sm space-y-3 text-slate-600 dark:text-slate-300">
                  <p>
                    Welcome to Messina Gallery. By creating an account on our platform, you agree to comply with and be bound by the following terms and conditions.
                  </p>
                  <p>
                    1. Account Responsibility: You are responsible for maintaining the confidentiality of your account information.
                  </p>
                  <p>
                    2. Artwork Integrity: Artists certify that all submitted works are original creations.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4 font-serif text-[#168BE8]">
                  Privacy Policy
                </h3>
                <div className="text-sm space-y-3 text-slate-600 dark:text-slate-300">
                  <p>
                    Your privacy is essential to us at Messina Gallery. This policy details how we handle your personal data.
                  </p>
                  <p>
                    1. Data Collection: We collect essential account data required for gallery communications and transaction processing.
                  </p>
                  <p>
                    2. Protection: Your information is secured and will not be shared with unauthorized third parties.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RegisterPage;