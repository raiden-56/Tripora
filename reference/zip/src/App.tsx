import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeContext";
import { getTheme } from "./theme";

// Layouts
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import UserHome from "./pages/user/UserHome";
import BookingHistory from "./pages/user/BookingHistory";
import FavoriteGuides from "./pages/user/FavoriteGuides";
import UserProfile from "./pages/user/UserProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePlaces from "./pages/admin/ManagePlaces";
import ManageGuides from "./pages/admin/ManageGuides";
import ManageBookings from "./pages/admin/ManageBookings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  role: "user" | "admin";
}> = ({ children, role }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to={`/${user?.role}`} replace />;
  return <>{children}</>;
};

const ThemedApp: React.FC = () => {
  const { mode } = useThemeMode();
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* User Routes */}
          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserHome />} />
            <Route path="bookings" element={<BookingHistory />} />
            <Route path="favorites" element={<FavoriteGuides />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="places" element={<ManagePlaces />} />
            <Route path="guides" element={<ManageGuides />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <AppProvider>
          <ThemedApp />
        </AppProvider>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
