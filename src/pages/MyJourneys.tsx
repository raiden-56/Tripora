import { TopBar } from "../components/layout/TopBar";
import { TravelTimeline } from "../components/timeline/TravelTimeline";
import { AchievementCard } from "../components/achievements/AchievementCard";
import { useAppStore } from "../store/useAppStore";

export default function MyJourneys() {
  const destinations = useAppStore((s) => s.destinations);
  const achievements = useAppStore((s) => s.achievements);

  return (
    <div>
      <TopBar
        title="My Journeys"
        subtitle="A chronological look back at everywhere you've explored."
      />
      <div className="px-5 md:px-8 pb-10 grid md:grid-cols-[1fr_320px] gap-8">
        <div>
          <TravelTimeline destinations={destinations} />
        </div>
        <div>
          <h2 className="font-display text-lg mb-4">Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
