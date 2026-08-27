import { destinations } from "../../data/mockData";

export const HERO_DESTINATION_IDS = [
  "coorg",
  "hampi",
  "north-goa",
  "munnar",
  "jaipur",
  "bali",
  "singapore",
];
export const heroDestinations = destinations.filter((d) =>
  HERO_DESTINATION_IDS.includes(d.id),
);

export const SCATTERED_SOURCES = [
  "Google Photos",
  "WhatsApp",
  "Google Drive",
  "Notes",
  "Instagram",
  "Phone Gallery",
  "Maps",
  "Tickets",
];

export const FEATURES = [
  {
    title: "Personal Travel Map",
    desc: "Pin every place you've visited and see your journey grow.",
  },
  {
    title: "Memory Vault",
    desc: "Keep photos, notes and memories connected to the places where they happened.",
  },
  {
    title: "Trip Planner",
    desc: "Plan your next adventure without losing track of the bigger journey.",
  },
  {
    title: "Google Drive",
    desc: "Keep your travel files organized by destination.",
  },
  {
    title: "Travel Statistics",
    desc: "See how far you've travelled and how much of the world you've explored.",
  },
  {
    title: "Wishlist",
    desc: "Keep the places you're dreaming about within reach.",
  },
  {
    title: "AI Travel Assistant",
    desc: "Discover destinations and build personalized itineraries based on your journey.",
  },
  {
    title: "Travel Stories",
    desc: "Turn your trips into beautiful stories you can revisit and share.",
  },
];

export const TRAVEL_STORIES = [
  {
    title: "The Coorg Escape",
    days: 3,
    places: 7,
    memories: 126,
    image: destinations.find((d) => d.id === "coorg")?.heroImageUrl,
  },
  {
    title: "Lost in Hampi",
    days: 2,
    places: 5,
    memories: 84,
    image: destinations.find((d) => d.id === "hampi")?.heroImageUrl,
  },
  {
    title: "Goa Road Trip",
    days: 4,
    places: 11,
    memories: 214,
    image: destinations.find((d) => d.id === "north-goa")?.heroImageUrl,
  },
];

export const USE_CASES = [
  {
    title: "Solo Travelers",
    desc: "Keep your personal journey.",
    image: destinations.find((d) => d.id === "gokarna")?.heroImageUrl,
  },
  {
    title: "Couples",
    desc: "Capture shared adventures.",
    image: destinations.find((d) => d.id === "munnar")?.heroImageUrl,
  },
  {
    title: "Friends",
    desc: "Plan group trips.",
    image: destinations.find((d) => d.id === "north-goa")?.heroImageUrl,
  },
  {
    title: "Families",
    desc: "Preserve memories for years.",
    image: destinations.find((d) => d.id === "mysore")?.heroImageUrl,
  },
  {
    title: "Road Trippers",
    desc: "Track routes and destinations.",
    image: destinations.find((d) => d.id === "lonavala")?.heroImageUrl,
  },
  {
    title: "Travel Creators",
    desc: "Build a shareable travel map.",
    image: destinations.find((d) => d.id === "bali")?.heroImageUrl,
  },
];

export const BUCKET_LIST = [
  { name: "Ladakh", season: "May – Sep" },
  { name: "Meghalaya", season: "Sep – Apr" },
  { name: "Rajasthan", season: "Oct – Mar" },
  { name: "Spiti Valley", season: "Jun – Sep" },
  { name: "Andaman", season: "Nov – Apr" },
  { name: "Japan", season: "Mar – May" },
  { name: "Switzerland", season: "Jun – Sep" },
  { name: "Bali", season: "Apr – Oct" },
].map((item) => ({
  ...item,
  image:
    destinations.find((d) => d.name === item.name)?.heroImageUrl ??
    destinations[0].heroImageUrl,
}));

export const UPCOMING_PREVIEW = [
  { name: "Goa", when: "September 2026", status: "planned" as const },
  { name: "Manali", when: "December 2026", status: "planned" as const },
  { name: "Ladakh", when: "May 2027", status: "wishlist" as const },
  { name: "Meghalaya", when: "Wishlist", status: "wishlist" as const },
];

export const TESTIMONIALS = [
  {
    quote:
      "I've always had photos everywhere, but TravelCanvas finally gives my trips a story.",
    name: "Demo Traveler",
    seed: "traveler1",
  },
  {
    quote:
      "Seeing every place I've visited on one map makes me want to plan the next trip.",
    name: "Demo Traveler",
    seed: "traveler2",
  },
  {
    quote: "The map is what got me. It feels like a visual history of my life.",
    name: "Demo Traveler",
    seed: "traveler3",
  },
];

export const FAQ_ITEMS = [
  {
    q: "What is TravelCanvas?",
    a: "TravelCanvas is a personal travel memory and journey platform — a map-first place to track everywhere you've been, save memories, and plan where you're going next.",
  },
  {
    q: "Is TravelCanvas free?",
    a: "Yes. The core map, destinations, wishlist, memories, and statistics are free to use. A Pro plan with deeper AI planning and advanced sharing is coming soon.",
  },
  {
    q: "Can I connect Google Drive?",
    a: "Yes — you can attach a Drive folder to any destination so your photos, videos, and documents stay organized by place.",
  },
  {
    q: "Can I track international travel?",
    a: "Absolutely. TravelCanvas tracks countries and continents alongside a dedicated India Explorer view for Indian states and union territories.",
  },
  {
    q: "Can I keep my journey private?",
    a: "Your journey is private by default. You control whether to share it with friends or make it public.",
  },
  {
    q: "Can I share my travel map?",
    a: "Yes — you can generate a public journey page with your map, stats, and favorite destinations.",
  },
  {
    q: "Can I import my memories?",
    a: "You can add memories manually today, with bulk import and Drive sync on the roadmap.",
  },
  {
    q: "Does TravelCanvas work on mobile?",
    a: "Yes, TravelCanvas is fully responsive with a dedicated mobile navigation and touch-friendly map.",
  },
  {
    q: "Will there be an AI travel planner?",
    a: "Canvas AI already offers a mock, architecture-ready assistant today, with deeper AI itinerary planning on the roadmap.",
  },
  {
    q: "Can I use TravelCanvas for group trips?",
    a: "Group trip collaboration — shared destinations, memories, and expenses — is on our roadmap.",
  },
];

export const TIMELINE_MILESTONES = [
  { year: "2019", label: "First Journey" },
  { year: "2022", label: "New Places" },
  { year: "2024", label: "More Adventures" },
  { year: "2025", label: "International" },
  { year: "2026", label: "Your Next Chapter" },
];

export const ROAD_TRIP_ROUTE = [
  "Bangalore",
  "Mysore",
  "Coorg",
  "Gokarna",
  "Goa",
];
