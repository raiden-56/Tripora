import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth } from "./components/auth/RequireAuth";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ExploreMap from "./pages/ExploreMap";
import MyJourneys from "./pages/MyJourneys";
import Destinations from "./pages/Destinations";
import Memories from "./pages/Memories";
import UpcomingTrips from "./pages/UpcomingTrips";
import TravelStatistics from "./pages/TravelStatistics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import PublicJourney from "./pages/PublicJourney";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Onboarding from "./pages/onboarding/Onboarding";
import Discover from "./pages/Discover";
import CanvasAI from "./pages/CanvasAI";
import YearlyRecap from "./pages/YearlyRecap";
import Upgrade from "./pages/Upgrade";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/u/:handle" element={<PublicJourney />} />
      <Route path="/journey/:handle" element={<PublicJourney />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="map" element={<ExploreMap />} />
        <Route path="discover" element={<Discover />} />
        <Route path="journeys" element={<MyJourneys />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="memories" element={<Memories />} />
        <Route path="trips" element={<UpcomingTrips />} />
        <Route path="statistics" element={<TravelStatistics />} />
        <Route path="ai" element={<CanvasAI />} />
        <Route path="recap" element={<YearlyRecap />} />
        <Route path="upgrade" element={<Upgrade />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
