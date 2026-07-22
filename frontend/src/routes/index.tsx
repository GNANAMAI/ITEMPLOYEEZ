import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { ProductsCatalogPage } from "@/pages/ProductsCatalogPage";
import { ProductCategoryPage } from "@/pages/ProductCategoryPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
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
import { SubAdminLoginPage, SubAdminDashboardPage } from "@/pages/admin/AdminPages";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/it-apps" element={<ProductsCatalogPage />} />
      <Route path="/product/:id" element={<ProductCategoryPage />} />
      <Route path="/product-details/:slug" element={<ProductDetailPage />} />
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
      <Route path="/sub-admin/login" element={<SubAdminLoginPage />} />
      <Route path="/sub-admin/dashboard" element={<SubAdminDashboardPage />} />
    </Routes>
  );
}
