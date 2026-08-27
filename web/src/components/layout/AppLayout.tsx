import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ToastHost } from "../common/ToastHost";
import { DestinationDrawer } from "../destinations/DestinationDrawer";
import { AddDestinationModal } from "../destinations/AddDestinationModal";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppStore } from "../../store/useAppStore";

export function AppLayout() {
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dataLoaded = useAppStore((s) => s.dataLoaded);
  const fetchAllData = useAppStore((s) => s.fetchAllData);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !dataLoaded) {
      fetchAllData();
    }
  }, [isAuthenticated, dataLoaded, fetchAllData]);

  return (
    <div className="flex min-h-screen bg-paper dark:bg-[#14171a]">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        {isDemoMode && (
          <div className="flex items-center justify-center gap-2.5 flex-wrap bg-forest-500 text-white text-xs font-medium px-4 py-2 text-center">
            <Sparkles size={13} />
            You're exploring a demo journey.
            <button
              onClick={() => navigate("/signup")}
              className="underline underline-offset-2 font-semibold"
            >
              Create Your Own Journey
            </button>
          </div>
        )}
        <Outlet />
      </div>
      <MobileNav />
      <ToastHost />
      <DestinationDrawer />
      <AddDestinationModal />
    </div>
  );
}
