import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Paper,
  Rating,
  Button,
  Snackbar,
  Alert,
  Avatar,
  Divider,
} from "@mui/material";
import { Search, FilterList, AccessTime } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import type { FilterOptions, Guide, TimeSlot } from "../../types";
import PlaceCard from "../../components/PlaceCard";
import GuideCard from "../../components/GuideCard";
import BookingModal from "../../components/BookingModal";
import EmptyState from "../../components/EmptyState";
import { useSnackbar } from "../../hooks/useSnackbar";

const UserHome: React.FC = () => {
  const {
    places,
    guides,
    addBooking,
    favoriteGuideIds,
    toggleFavorite,
    getGuidesForPlace,
    getAvailableSlots,
  } = useAppContext();
  const { user } = useAuth();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    priceRange: [0, 100],
    rating: null,
    timeSlot: "",
    sortBy: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const filteredPlaces = useMemo(() => {
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.location.toLowerCase().includes(filters.search.toLowerCase()),
    );
  }, [places, filters.search]);

  const filteredGuides = useMemo(() => {
    if (!selectedPlaceId) return [];
    let placeGuides = getGuidesForPlace(selectedPlaceId);

    placeGuides = placeGuides.filter(
      (g) =>
        g.pricePerSlot >= filters.priceRange[0] &&
        g.pricePerSlot <= filters.priceRange[1],
    );

    if (filters.rating) {
      placeGuides = placeGuides.filter(
        (g) => g.rating >= (filters.rating || 0),
      );
    }

    if (filters.sortBy === "price-asc")
      placeGuides.sort((a, b) => a.pricePerSlot - b.pricePerSlot);
    else if (filters.sortBy === "price-desc")
      placeGuides.sort((a, b) => b.pricePerSlot - a.pricePerSlot);
    else if (filters.sortBy === "rating")
      placeGuides.sort((a, b) => b.rating - a.rating);

    return placeGuides;
  }, [selectedPlaceId, getGuidesForPlace, filters]);

  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedPlaceId),
    [places, selectedPlaceId],
  );

  const handleBookGuide = (guide: Guide) => {
    const slots = getAvailableSlots(guide.id);
    if (slots.length === 0) {
      showSnackbar("No available slots for this guide", "warning");
      return;
    }
    setSelectedGuide(guide);
    setSelectedSlot(null);
  };

  const handleConfirmBooking = () => {
    if (!selectedGuide || !selectedPlace || !selectedSlot || !user) return;

    const newBooking = {
      id: `b${Date.now()}`,
      userId: user.id,
      guideId: selectedGuide.id,
      guideName: selectedGuide.name,
      placeId: selectedPlace.id,
      placeName: selectedPlace.name,
      slot: { ...selectedSlot, isBooked: true },
      totalPrice: selectedGuide.pricePerSlot,
      status: "confirmed" as const,
      bookedAt: new Date().toISOString(),
    };

    addBooking(newBooking);
    showSnackbar("Booking confirmed successfully!", "success");
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{ mb: { xs: 2, sm: 4 }, textAlign: "center", px: { xs: 1, sm: 0 } }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Explore Amazing Places
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: { xs: 2, sm: 3 },
            maxWidth: 600,
            mx: "auto",
            fontSize: { xs: "0.75rem", sm: "0.8125rem" },
          }}
        >
          Discover destinations worldwide and hire expert local guides for an
          unforgettable experience.
        </Typography>
      </Box>

      {/* Search & Filter Bar */}
      <Paper
        sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, borderRadius: 1 }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            placeholder="Search places..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: "2px" }}
          />
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? "primary" : "default"}
          >
            <FilterList />
          </IconButton>
        </Box>

        <Collapse in={showFilters}>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ minWidth: { xs: "100%", sm: 200 }, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Price Range: ${filters.priceRange[0]} – ${filters.priceRange[1]}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, val) =>
                  setFilters({
                    ...filters,
                    priceRange: val as [number, number],
                  })
                }
                valueLabelDisplay="auto"
                min={0}
                max={100}
                color="primary"
              />
            </Box>
            <Box sx={{ minWidth: { xs: "100%", sm: 150 } }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Min Rating
              </Typography>
              <Rating
                value={filters.rating}
                onChange={(_, val) => setFilters({ ...filters, rating: val })}
                precision={0.5}
              />
            </Box>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 160 } }}
            >
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as FilterOptions["sortBy"],
                  })
                }
              >
                <MenuItem value="">Default</MenuItem>
                <MenuItem value="price-asc">Price: Low → High</MenuItem>
                <MenuItem value="price-desc">Price: High → Low</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </Paper>

      {/* Places Grid */}
      {!selectedPlaceId && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Popular Destinations
          </Typography>
          {filteredPlaces.length > 0 ? (
            <Grid container spacing={3}>
              {filteredPlaces.map((place) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={place.id}>
                  <PlaceCard
                    place={place}
                    guides={guides}
                    onClick={() => setSelectedPlaceId(place.id)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState
              title="No places found"
              subtitle="Try adjusting your search filters"
            />
          )}
        </>
      )}

      {/* Selected Place - Guides View */}
      {selectedPlaceId && selectedPlace && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label="← Back to places"
              onClick={() => {
                setSelectedPlaceId(null);
                setSelectedGuide(null);
              }}
              variant="outlined"
              sx={{ cursor: "pointer" }}
            />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              {selectedPlace.name}
            </Typography>
          </Box>

          {!selectedGuide ? (
            <>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Available Guides ({filteredGuides.length})
              </Typography>
              {filteredGuides.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredGuides.map((guide) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={guide.id}>
                      <Box
                        onClick={() => handleBookGuide(guide)}
                        sx={{ cursor: "pointer" }}
                      >
                        <GuideCard
                          guide={guide}
                          isFavorite={favoriteGuideIds.includes(guide.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="No guides available"
                  subtitle="Try adjusting your filters"
                />
              )}
            </>
          ) : (
            /* Time Slot Selection */
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Chip
                  label="← Back to guides"
                  onClick={() => setSelectedGuide(null)}
                  variant="outlined"
                  sx={{ cursor: "pointer" }}
                />
              </Box>

              <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 1.5, sm: 2 },
                    mb: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      src={selectedGuide.avatar}
                      sx={{
                        width: { xs: 44, sm: 56 },
                        height: { xs: 44, sm: 56 },
                      }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                      >
                        {selectedGuide.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                      >
                        ${selectedGuide.pricePerSlot}/slot •{" "}
                        {selectedGuide.experience} yrs exp • ★{" "}
                        {selectedGuide.rating}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  <AccessTime
                    sx={{ fontSize: 20, verticalAlign: "middle", mr: 1 }}
                  />
                  Select a Time Slot
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                  {getAvailableSlots(selectedGuide.id).map((slot) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={slot.id}>
                      <Chip
                        label={`${slot.date} · ${slot.startTime}–${slot.endTime}`}
                        onClick={() => setSelectedSlot(slot)}
                        color={
                          selectedSlot?.id === slot.id ? "primary" : "default"
                        }
                        variant={
                          selectedSlot?.id === slot.id ? "filled" : "outlined"
                        }
                        sx={{
                          width: "100%",
                          height: { xs: 36, sm: 40 },
                          fontWeight: 500,
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
                {selectedSlot && (
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: { xs: "center", sm: "flex-end" },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setBookingModalOpen(true)}
                      sx={{ px: 4, borderRadius: 2 }}
                    >
                      Hire Guide — ${selectedGuide.pricePerSlot}
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </Box>
      )}

      <BookingModal
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedGuide(null);
          setSelectedSlot(null);
        }}
        guide={selectedGuide}
        place={selectedPlace || null}
        slot={selectedSlot}
        onConfirm={handleConfirmBooking}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserHome;
