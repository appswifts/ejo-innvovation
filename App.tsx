import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ViewState } from './types';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import LandingPage from './pages/Public/LandingPage';
import JournalsPage from './pages/Public/JournalsPage';
import JournalDetail from './pages/Public/JournalDetail';
import ArticleView from './pages/Public/ArticleView';
import BooksPage from './pages/Public/BooksPage';
import BookReader from './pages/Public/BookReader';
import CheckoutPage from './pages/Public/CheckoutPage';
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
import RoleManager from './pages/Dashboard/Admin/RoleManager';
import BookManagement from './pages/Dashboard/Admin/BookManagement';

const App: React.FC = () => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/journals" element={<JournalsPage />} />
        <Route path="/journals/:id" element={<JournalDetail />} />
        <Route path="/articles/:id" element={<ArticleView />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/book/read/:id" element={<BookReader />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />

          {/* Author Routes */}
          <Route path="submit" element={<SubmissionWizard />} />
          <Route path="my-manuscripts" element={<AuthorDashboard />} />

          {/* Editor Routes */}
          <Route path="submissions" element={<EditorDashboard />} />
          <Route path="submissions/:id" element={<ManuscriptDetailPage />} />

          {/* Reviewer Routes */}
          <Route path="reviews" element={<ReviewerPortal />} />

          {/* Finance Routes */}
          <Route path="finance" element={<FinanceDashboard />} />

          {/* Admin Routes */}
          <Route path="admin/users" element={<UserManagement />} />
          <Route path="admin/journals" element={<JournalManagement />} />
          <Route path="admin/roles" element={<RoleManager />} />
          <Route path="admin/books" element={<BookManagement />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;