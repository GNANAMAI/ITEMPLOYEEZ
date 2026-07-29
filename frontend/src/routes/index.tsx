import { Navigate, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { ProductsCatalogPage } from "@/pages/ProductsCatalogPage";
import { ProductCategoryPage } from "@/pages/ProductCategoryPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { SubscriptionCheckoutPage } from "@/pages/SubscriptionCheckoutPage";
import { CommunityPage } from "@/pages/CommunityPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { ContactPage } from "@/pages/ContactPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import {
  TermsPage,
  PrivacyPage,
  CancelPolicyPage,
  DisclaimerPage,
} from "@/pages/legal/LegalPages";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import {
  AdminAboutPage,
  AdminBannersPage,
  AdminCandidatesPage,
  AdminCategoriesPage,
  AdminContactDetailsPage,
  AdminDashboardHome,
  AdminLegalEditPage,
  AdminLoginPage,
  AdminMessagesPage,
  AdminPaymentsPage,
  AdminProductsPage,
  AdminServicesPage,
  AdminSubAdminsPage,
  AdminSubscriptionAmountPage,
} from "@/pages/admin/AdminPages";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route
        path="/it-apps"
        element={
          <RequireAuth>
            <ProductsCatalogPage />
          </RequireAuth>
        }
      />
      <Route
        path="/product/:id"
        element={
          <RequireAuth>
            <ProductCategoryPage />
          </RequireAuth>
        }
      />
      <Route
        path="/product-details/:slug"
        element={
          <RequireAuth>
            <ProductDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/subscription-checkout/:slug"
        element={
          <RequireAuth>
            <SubscriptionCheckoutPage />
          </RequireAuth>
        }
      />
      <Route path="/community-subscribe" element={<CommunityPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/service-details/:slug" element={<ServiceDetailPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/candidate/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/terms-conditions" element={<TermsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPage />} />
      <Route path="/cancel-policies" element={<CancelPolicyPage />} />
      <Route path="/disclaimer" element={<DisclaimerPage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardHome />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="contact-details" element={<AdminContactDetailsPage />} />
        <Route path="sub-admins" element={<AdminSubAdminsPage />} />
        <Route path="subscription-amount" element={<AdminSubscriptionAmountPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="about" element={<AdminAboutPage />} />
        <Route path="legal/:slug" element={<AdminLegalEditPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
        <Route path="candidates" element={<AdminCandidatesPage />} />
        <Route path="contact-us" element={<AdminMessagesPage title="Contact Us Details" />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
      </Route>

      {/* Legacy sub-admin URLs */}
      <Route path="/sub-admin/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/sub-admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/sub-admin/*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
