import { motion } from "framer-motion";
import { ArrowUpRight, Camera, Calendar, MapPin } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { TRAVEL_STORIES } from "./shared/marketingData";

export function StoriesSection({
  onStartJourney,
}: {
  onStartJourney: () => void;
}) {
  return (
    <section
      id="stories"
      className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto"
    >
      <SectionHeading
        eyebrow="Travel stories"
        title="Every trip has a story."
      />
      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {TRAVEL_STORIES.map((story, i) => (
          <motion.button
            key={story.title}
            onClick={onStartJourney}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1 }}
            className="group relative rounded-3xl overflow-hidden h-96 text-left"
          >
            <img
              src={story.image}
              alt={story.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="font-display text-2xl mb-2">{story.title}</h3>
              <div className="flex items-center gap-4 text-xs opacity-85">
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {story.days} days
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {story.places} places
                </span>
                <span className="flex items-center gap-1">
                  <Camera size={11} /> {story.memories} memories
                </span>
              </div>
            </div>
            <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight size={16} />
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
