import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ViewState } from './types';
import { useAuth } from './contexts/AuthContext';

import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import LandingPage from './pages/Public/LandingPage';
import JournalsPage from './pages/Public/JournalsPage';
import JournalDetail from './pages/Public/JournalDetail';
import ArticleView from './pages/Public/ArticleView';
import BooksPage from './pages/Public/BooksPage';
import BookReader from './pages/Public/BookReader';
import CheckoutPage from './pages/Public/CheckoutPage';
import AboutUs from './pages/Public/AboutUs';
import ContactUs from './pages/Public/ContactUs';
import PrivacyPolicy from './pages/Public/PrivacyPolicy';
import Copyright from './pages/Public/Copyright';
import BookGuidelines from './pages/Public/BookGuidelines';
import SubmissionWizard from './pages/Dashboard/SubmissionWizard';
// Dashboard Widgets
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/Dashboard/Overview';
import AuthorDashboard from './pages/Dashboard/AuthorDashboard'; // To be refactored into widgets later, using as page for now
import EditorDashboard from './pages/Dashboard/EditorDashboard';
import ManuscriptDetailPage from './pages/Dashboard/ManuscriptDetail';
import ReviewerPortal from './pages/Dashboard/ReviewerPortal';
import FinanceDashboard from './pages/Dashboard/FinanceDashboard';
import UserManagement from './pages/Dashboard/Admin/UserManagement';
import JournalManagement from './pages/Dashboard/Admin/JournalManagement';
import EditorManagement from './pages/Dashboard/Admin/EditorManagement';
import Roles from './pages/Dashboard/Admin/Roles';
import BookManagement from './pages/Dashboard/Admin/BookManagement';
import AdminApplications from './pages/Dashboard/Admin/Applications';
import Applications from './pages/Dashboard/Reader/Applications';
import UserApplications from './pages/Dashboard/Reader/UserApplications';
import PostBook from './pages/Dashboard/PostBook';
import PartnerManagement from './pages/Dashboard/Admin/PartnerManagement';
import SiteSettings from './pages/Dashboard/Admin/SiteSettings';
import PartnersPage from './pages/Public/PartnersPage';
import EditorsPage from './pages/Public/EditorsPage';
import LoadingSpinner from '@/components/LoadingSpinner';

const App: React.FC = () => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans antialiased">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/journals" element={<JournalsPage />} />
          <Route path="/journals/:id" element={<JournalDetail />} />
          <Route path="/articles/:id" element={<ArticleView />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/book/read/:id" element={<BookReader />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/copyright" element={<Copyright />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/editors" element={<EditorsPage />} />
          <Route path="/book-guidelines" element={<BookGuidelines />} />

          {/* Dashboard Routes (Protected) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="overview" element={<Overview />} />

            {/* Admin Routes */}
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/roles" element={<Roles />} />
            <Route path="admin/journals" element={<JournalManagement />} />
            <Route path="admin/editors" element={<EditorManagement />} />
            <Route path="admin/applications" element={<AdminApplications />} /> {/* Admin Review */}
            <Route path="admin/books" element={<BookManagement />} />
            <Route path="admin/partners" element={<PartnerManagement />} />
            <Route path="admin/settings" element={<SiteSettings />} />

            {/* Author Routes */}
            <Route path="submit" element={<SubmissionWizard />} />
            <Route path="my-manuscripts" element={<AuthorDashboard />} />
            <Route path="books" element={<BookManagement />} />
            <Route path="post-book" element={<PostBook />} />

            {/* Reader / Applicant Routes */}
            <Route path="applications" element={<UserApplications />} /> {/* Reader List */}
            <Route path="applications/new" element={<Applications />} /> {/* Reader Apply */}

            {/* Editor Routes */}
            <Route path="submissions" element={<EditorDashboard />} />
            <Route path="submissions/:id" element={<ManuscriptDetailPage />} />

            {/* Reviewer Routes */}
            <Route path="reviews" element={<ReviewerPortal />} />

            {/* Finance Routes */}
            <Route path="finance" element={<FinanceDashboard />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;