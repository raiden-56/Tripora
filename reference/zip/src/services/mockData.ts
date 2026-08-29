import type {
  Guide,
  Place,
  Booking,
  TimeSlot,
  Review,
  Analytics,
  User,
} from "../types";

const generateSlots = (guideId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dates = [
    "2026-03-01",
    "2026-03-02",
    "2026-03-03",
    "2026-03-04",
    "2026-03-05",
  ];
  const times = [
    { start: "09:00", end: "11:00" },
    { start: "11:00", end: "13:00" },
    { start: "14:00", end: "16:00" },
    { start: "16:00", end: "18:00" },
  ];

  dates.forEach((date) => {
    times.forEach((time, idx) => {
      slots.push({
        id: `${guideId}-${date}-${idx}`,
        date,
        startTime: time.start,
        endTime: time.end,
        isBooked: Math.random() > 0.7,
      });
    });
  });
  return slots;
};

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "John Traveler",
    email: "john@example.com",
    role: "user",
    avatar: "",
  },
  {
    id: "a1",
    name: "Admin Smith",
    email: "admin@example.com",
    role: "admin",
    avatar: "",
  },
];

export const mockGuides: Guide[] = [
  {
    id: "g1",
    name: "Raj Sharma",
    avatar: "https://i.pravatar.cc/150?img=11",
    experience: 8,
    rating: 4.8,
    totalReviews: 124,
    languages: ["English", "Hindi", "French"],
    bio: "Passionate guide with deep knowledge of historical sites and local culture.",
    pricePerSlot: 45,
    availableSlots: generateSlots("g1"),
    assignedPlaces: ["p1", "p2"],
  },
  {
    id: "g2",
    name: "Maria Garcia",
    avatar: "https://i.pravatar.cc/150?img=5",
    experience: 5,
    rating: 4.6,
    totalReviews: 89,
    languages: ["English", "Spanish"],
    bio: "Adventurous guide specializing in nature trails and outdoor explorations.",
    pricePerSlot: 35,
    availableSlots: generateSlots("g2"),
    assignedPlaces: ["p2", "p3"],
  },
  {
    id: "g3",
    name: "Kenji Tanaka",
    avatar: "https://i.pravatar.cc/150?img=12",
    experience: 12,
    rating: 4.9,
    totalReviews: 210,
    languages: ["English", "Japanese", "Mandarin"],
    bio: "Expert cultural guide with over a decade of experience in heritage tourism.",
    pricePerSlot: 60,
    availableSlots: generateSlots("g3"),
    assignedPlaces: ["p1", "p4"],
  },
  {
    id: "g4",
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=9",
    experience: 3,
    rating: 4.3,
    totalReviews: 45,
    languages: ["English"],
    bio: "Enthusiastic guide perfect for first-time visitors looking for a fun experience.",
    pricePerSlot: 25,
    availableSlots: generateSlots("g4"),
    assignedPlaces: ["p3", "p5"],
  },
  {
    id: "g5",
    name: "Ahmed Hassan",
    avatar: "https://i.pravatar.cc/150?img=14",
    experience: 7,
    rating: 4.7,
    totalReviews: 156,
    languages: ["English", "Arabic", "French"],
    bio: "History buff with extensive knowledge of ancient monuments and architecture.",
    pricePerSlot: 50,
    availableSlots: generateSlots("g5"),
    assignedPlaces: ["p4", "p5", "p1"],
  },
  {
    id: "g6",
    name: "Elena Petrova",
    avatar: "https://i.pravatar.cc/150?img=16",
    experience: 6,
    rating: 4.5,
    totalReviews: 98,
    languages: ["English", "Russian", "German"],
    bio: "Art and architecture specialist who brings cities to life with stories.",
    pricePerSlot: 40,
    availableSlots: generateSlots("g6"),
    assignedPlaces: ["p2", "p6"],
  },
];

export const mockPlaces: Place[] = [
  {
    id: "p1",
    name: "Taj Mahal",
    description:
      "One of the Seven Wonders of the World, this ivory-white marble mausoleum is a masterpiece of Mughal architecture.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800",
    location: "Agra, India",
    category: "Heritage",
    guides: ["g1", "g3", "g5"],
  },
  {
    id: "p2",
    name: "Grand Canyon",
    description:
      "A steep-sided canyon carved by the Colorado River, known for its visually overwhelming size and colorful landscape.",
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800",
    location: "Arizona, USA",
    category: "Nature",
    guides: ["g1", "g2", "g6"],
  },
  {
    id: "p3",
    name: "Machu Picchu",
    description:
      "An ancient Incan citadel set high in the Andes Mountains, renowned for its sophisticated dry-stone walls.",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d163571?w=800",
    location: "Cusco, Peru",
    category: "Heritage",
    guides: ["g2", "g4"],
  },
  {
    id: "p4",
    name: "Great Wall of China",
    description:
      "A series of fortifications stretching over 13,000 miles, built to protect the Chinese states from invasions.",
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
    location: "Beijing, China",
    category: "Heritage",
    guides: ["g3", "g5"],
  },
  {
    id: "p5",
    name: "Santorini",
    description:
      "A stunning Greek island known for its whitewashed buildings, blue-domed churches, and breathtaking sunsets.",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
    location: "Cyclades, Greece",
    category: "Beach",
    guides: ["g4", "g5"],
  },
  {
    id: "p6",
    name: "Paris City Tour",
    description:
      "Explore the City of Light with visits to the Eiffel Tower, Louvre Museum, and charming Montmartre streets.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    location: "Paris, France",
    category: "City",
    guides: ["g6"],
  },
];

export const mockBookings: Booking[] = [
  {
    id: "b1",
    userId: "u1",
    guideId: "g1",
    guideName: "Raj Sharma",
    placeId: "p1",
    placeName: "Taj Mahal",
    slot: {
      id: "g1-2026-03-01-0",
      date: "2026-03-01",
      startTime: "09:00",
      endTime: "11:00",
      isBooked: true,
    },
    totalPrice: 45,
    status: "confirmed",
    bookedAt: "2026-02-25T10:30:00Z",
  },
  {
    id: "b2",
    userId: "u1",
    guideId: "g3",
    guideName: "Kenji Tanaka",
    placeId: "p4",
    placeName: "Great Wall of China",
    slot: {
      id: "g3-2026-03-02-1",
      date: "2026-03-02",
      startTime: "11:00",
      endTime: "13:00",
      isBooked: true,
    },
    totalPrice: 60,
    status: "completed",
    bookedAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "b3",
    userId: "u1",
    guideId: "g2",
    guideName: "Maria Garcia",
    placeId: "p3",
    placeName: "Machu Picchu",
    slot: {
      id: "g2-2026-03-03-2",
      date: "2026-03-03",
      startTime: "14:00",
      endTime: "16:00",
      isBooked: true,
    },
    totalPrice: 35,
    status: "cancelled",
    bookedAt: "2026-02-22T09:15:00Z",
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    userId: "u1",
    userName: "John Traveler",
    guideId: "g1",
    rating: 5,
    comment: "Amazing experience! Raj made the Taj Mahal visit unforgettable.",
    date: "2026-02-26",
  },
  {
    id: "r2",
    userId: "u1",
    userName: "John Traveler",
    guideId: "g3",
    rating: 5,
    comment: "Kenji is incredibly knowledgeable. Highly recommend!",
    date: "2026-02-21",
  },
  {
    id: "r3",
    userId: "u1",
    userName: "Jane Smith",
    guideId: "g2",
    rating: 4,
    comment: "Maria was great. The trail was beautiful.",
    date: "2026-02-18",
  },
  {
    id: "r4",
    userId: "u1",
    userName: "Alex Brown",
    guideId: "g1",
    rating: 4,
    comment: "Very informative tour. Would book again.",
    date: "2026-02-15",
  },
];

export const mockAnalytics: Analytics = {
  totalBookings: 156,
  totalRevenue: 7840,
  mostHiredGuide: { name: "Raj Sharma", count: 42 },
  mostVisitedPlace: { name: "Taj Mahal", count: 58 },
  revenueByMonth: [
    { month: "Sep", revenue: 920 },
    { month: "Oct", revenue: 1340 },
    { month: "Nov", revenue: 1560 },
    { month: "Dec", revenue: 1100 },
    { month: "Jan", revenue: 1420 },
    { month: "Feb", revenue: 1500 },
  ],
  bookingsByMonth: [
    { month: "Sep", count: 18 },
    { month: "Oct", count: 26 },
    { month: "Nov", count: 32 },
    { month: "Dec", count: 22 },
    { month: "Jan", count: 28 },
    { month: "Feb", count: 30 },
  ],
};
