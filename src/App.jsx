import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';

// New Architectural Frontend Portal
import AuraLibMain from './pages/AuraLibMain';

// Admin Layout & Pages
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageBooks } from './pages/admin/ManageBooks';
import { ManageMembers } from './pages/admin/ManageMembers';
import { BorrowingManagement } from './pages/admin/BorrowingManagement';
import { BorrowingHistory } from './pages/admin/BorrowingHistory';
import { AdminSettings } from './pages/admin/AdminSettings';

// Chatbot
import { FloatingChatbot } from './chatbot/chatbot';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LibraryProvider>
            <Routes>
              {/* Public Sanctuary Portal Routes */}
              <Route path="/" element={<AuraLibMain initialTab="journey" />} />
              <Route path="/catalog" element={<AuraLibMain initialTab="catalogue" />} />
              <Route path="/categories" element={<AuraLibMain initialTab="categories" />} />
              <Route path="/my-books" element={<AuraLibMain initialTab="mylibrary" />} />
              <Route path="/recommendations" element={<AuraLibMain initialTab="recommendations" />} />
              <Route path="/about" element={<AuraLibMain initialTab="about" />} />
              <Route path="/books/:id" element={<AuraLibMain initialTab="catalogue" />} />
              <Route path="/login" element={<AuraLibMain initialTab="journey" openAuth="signin" />} />
              <Route path="/register" element={<AuraLibMain initialTab="journey" openAuth="register" />} />

              {/* Admin / Librarian Portal Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="books" element={<ManageBooks />} />
                <Route path="members" element={<ManageMembers />} />
                <Route path="borrowings" element={<BorrowingManagement />} />
                <Route path="history" element={<BorrowingHistory />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <FloatingChatbot />
          </LibraryProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
