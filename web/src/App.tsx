import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth } from "./components/auth/RequireAuth";
import Landing from "./pages/Landing";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ExploreMap = lazy(() => import("./pages/ExploreMap"));
const MyJourneys = lazy(() => import("./pages/MyJourneys"));
const Destinations = lazy(() => import("./pages/Destinations"));
const Memories = lazy(() => import("./pages/Memories"));
const UpcomingTrips = lazy(() => import("./pages/UpcomingTrips"));
const TravelStatistics = lazy(() => import("./pages/TravelStatistics"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const PublicJourney = lazy(() => import("./pages/PublicJourney"));
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Onboarding = lazy(() => import("./pages/onboarding/Onboarding"));
const Discover = lazy(() => import("./pages/Discover"));
const CanvasAI = lazy(() => import("./pages/CanvasAI"));
const YearlyRecap = lazy(() => import("./pages/YearlyRecap"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Guides = lazy(() => import("./pages/Guides"));
const BecomeGuide = lazy(() => import("./pages/BecomeGuide"));
const Photos = lazy(() => import("./pages/Photos"));
const PublicPhotoShare = lazy(() => import("./pages/PublicPhotoShare"));
const Planner = lazy(() => import("./pages/Planner"));
const Community = lazy(() => import("./pages/Community"));
const Admin = lazy(() => import("./pages/Admin"));
const TravelCalendar = lazy(() => import("./pages/TravelCalendar"));

function PageLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-ink-soft" role="status">
      Loading…
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-6">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p className="text-sm text-ink-soft">That page doesn't exist or has moved.</p>
      <Link to="/app" className="px-5 py-2 rounded-full bg-forest-500 text-white text-sm font-semibold">
        Back to your journey
      </Link>
    </div>
  );
}

function App() {
  // Pages load on demand so the first visit doesn't download the whole app.
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/u/:handle" element={<PublicJourney />} />
        <Route path="/journey/:handle" element={<PublicJourney />} />
        <Route path="/share/:token" element={<PublicPhotoShare />} />
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
          <Route path="planner" element={<Planner />} />
          <Route path="community" element={<Community />} />
          <Route path="guides" element={<Guides />} />
          <Route path="become-guide" element={<BecomeGuide />} />
          <Route path="photos" element={<Photos />} />
          <Route path="statistics" element={<TravelStatistics />} />
          <Route path="ai" element={<CanvasAI />} />
          <Route path="recap" element={<YearlyRecap />} />
          <Route path="upgrade" element={<Upgrade />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
          <Route path="calendar" element={<TravelCalendar />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
