import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  CartProvider,
} from "./context/CartContext";

import {
  AuthProvider,
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================
// HOME
// ============================================================

import Home from "./pages/Home";

// ============================================================
// AUTH
// ============================================================

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// ============================================================
// PROFILE
// ============================================================

import ProfilePage from "./pages/ProfilePage";

// ============================================================
// INFORMATION
// ============================================================

import AboutLegalPage from "./pages/AboutLegalPage";

// ============================================================
// GALLERY
// ============================================================

import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetailsPage from "./pages/CollectionDetailsPage";

import ProductsPage from "./pages/ProductsPage";
import ArtworkDetailsPage from "./pages/ArtworkDetailsPage";

// ============================================================
// CERTIFICATE
// ============================================================

import CertificatePage from "./pages/CertificatePage";

// ============================================================
// ARTISTS
// ============================================================

import ArtistsPage from "./pages/ArtistsPage";
import ArtistProfilePage from "./pages/ArtistProfilePage";

import ArtistStudioPage from "./pages/ArtistStudioPage";
import ArtistSalesPage from "./pages/ArtistSalesPage";

// ============================================================
// SHOP
// ============================================================

import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";

// ============================================================
// ORDERS
// ============================================================

import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";

// ============================================================
// ADMIN
// ============================================================

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminArtistsPage from "./pages/AdminArtistsPage";
import AdminArtworksPage from "./pages/AdminArtworksPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminSupportPage from "./pages/AdminSupportPage";

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* =================================================
                PUBLIC
            ================================================= */}

            <Route
              path="/"
              element={
                <Home />
              }
            />

            <Route
              path="/products"
              element={
                <ProductsPage />
              }
            />

            <Route
              path="/artwork/:id"
              element={
                <ArtworkDetailsPage />
              }
            />

            {/* COLLECTIONS */}

            <Route
              path="/collections"
              element={
                <CollectionsPage />
              }
            />

            <Route
              path="/collection/:id"
              element={
                <CollectionDetailsPage />
              }
            />

            {/* ARTISTS */}

            <Route
              path="/artists"
              element={
                <ArtistsPage />
              }
            />

            <Route
              path="/artist/:id"
              element={
                <ArtistProfilePage />
              }
            />

            {/* CERTIFICATES */}

            <Route
              path="/c/:certificateId"
              element={
                <CertificatePage />
              }
            />

            <Route
              path="/certificate/:certificateId"
              element={
                <CertificatePage />
              }
            />

            {/* =================================================
                AUTH
            ================================================= */}

            <Route
              path="/login"
              element={
                <LoginPage />
              }
            />

            <Route
              path="/register"
              element={
                <RegisterPage />
              }
            />

            <Route
              path="/forgot-password"
              element={
                <ForgotPasswordPage />
              }
            />

            <Route
              path="/reset-password/:token"
              element={
                <ResetPasswordPage />
              }
            />

            {/* =================================================
                PROFILE
            ================================================= */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                COLLECTOR + ARTIST
            ================================================= */}

            <Route
              path="/orders"
              element={
                <ProtectedRoute
                  roles={[
                    "collector",
                    "artist",
                  ]}
                >
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute
                  roles={[
                    "collector",
                    "artist",
                  ]}
                >
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment"
              element={
                <ProtectedRoute
                  roles={[
                    "collector",
                    "artist",
                  ]}
                >
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order-success"
              element={
                <ProtectedRoute
                  roles={[
                    "collector",
                    "artist",
                  ]}
                >
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                ARTIST ONLY
            ================================================= */}

            <Route
              path="/artist-studio"
              element={
                <ProtectedRoute
                  roles={[
                    "artist",
                  ]}
                >
                  <ArtistStudioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/artist-sales"
              element={
                <ProtectedRoute
                  roles={[
                    "artist",
                  ]}
                >
                  <ArtistSalesPage />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                ADMIN ONLY
            ================================================= */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                  ]}
                >
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                  ]}
                >
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/artists"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                  ]}
                >
                  <AdminArtistsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/artworks"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                  ]}
                >
                  <AdminArtworksPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                  ]}
                >
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/support"
              element={
                <ProtectedRoute
                  roles={[
                    "admin",
                  ]}
                >
                  <AdminSupportPage />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                CART
            ================================================= */}

            <Route
              path="/cart"
              element={
                <CartPage />
              }
            />

            {/* =================================================
                INFORMATION
            ================================================= */}

            <Route
              path="/about"
              element={
                <AboutLegalPage />
              }
            />

            <Route
              path="/about-legal"
              element={
                <AboutLegalPage />
              }
            />

            <Route
              path="/terms"
              element={
                <AboutLegalPage />
              }
            />

            <Route
              path="/privacy"
              element={
                <AboutLegalPage />
              }
            />

            <Route
              path="/shipping"
              element={
                <AboutLegalPage />
              }
            />

            <Route
              path="/faq"
              element={
                <AboutLegalPage />
              }
            />

            {/* =================================================
                OLD FAVORITES
            ================================================= */}

            <Route
              path="/favorites"
              element={
                <Navigate
                  to="/products"
                  replace
                />
              }
            />

            {/* =================================================
                FALLBACK
            ================================================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;