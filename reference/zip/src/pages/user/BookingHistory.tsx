import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { Cancel, AccessTime, Place, AttachMoney } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import EmptyState from "../../components/EmptyState";
import { useSnackbar } from "../../hooks/useSnackbar";

const statusColors: Record<string, "success" | "error" | "info"> = {
  confirmed: "success",
  cancelled: "error",
  completed: "info",
};

const BookingHistory: React.FC = () => {
  const { bookings, cancelBooking } = useAppContext();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const handleCancel = (id: string) => {
    cancelBooking(id);
    showSnackbar("Booking cancelled successfully", "info");
  };

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        subtitle="Start exploring places and hire a guide to begin your adventure!"
      />
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: "0.95rem", sm: "1rem" } }}
      >
        My Bookings
      </Typography>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {bookings.map((booking) => (
          <Grid size={{ xs: 12, md: 6 }} key={booking.id}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 40, height: 40 }}
                    >
                      {booking.guideName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {booking.guideName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Place sx={{ fontSize: 14, verticalAlign: "middle" }} />{" "}
                        {booking.placeName}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={booking.status}
                    size="small"
                    color={statusColors[booking.status]}
                    sx={{ textTransform: "capitalize", fontWeight: 600 }}
                  />
                </Box>

                <Box
                  sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1.5 }}
                >
                  <Chip
                    icon={<AccessTime sx={{ fontSize: 16 }} />}
                    label={`${booking.slot.date} · ${booking.slot.startTime}–${booking.slot.endTime}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<AttachMoney sx={{ fontSize: 16 }} />}
                    label={`$${booking.totalPrice}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Booked on {new Date(booking.bookedAt).toLocaleDateString()}
                  </Typography>
                  {booking.status === "confirmed" && (
                    <Tooltip title="Cancel booking">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCancel(booking.id)}
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default BookingHistory;
