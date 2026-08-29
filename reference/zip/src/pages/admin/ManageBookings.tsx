import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Grid,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import { Cancel, AccessTime } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import { useSnackbar } from "../../hooks/useSnackbar";
import EmptyState from "../../components/EmptyState";

const statusColors: Record<string, "success" | "error" | "info"> = {
  confirmed: "success",
  cancelled: "error",
  completed: "info",
};

const ManageBookings: React.FC = () => {
  const { bookings, cancelBooking } = useAppContext();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [dateFilter, setDateFilter] = useState("");

  const filteredBookings = useMemo(() => {
    if (!dateFilter) return bookings;
    return bookings.filter((b) => b.slot.date === dateFilter);
  }, [bookings, dateFilter]);

  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const handleCancel = (id: string) => {
    cancelBooking(id);
    showSnackbar("Booking cancelled", "info");
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
        >
          Manage Bookings
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={`Revenue: $${totalRevenue}`}
            color="primary"
            sx={{ fontWeight: 700 }}
          />
          <TextField
            type="date"
            label="Filter by date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
      </Box>

      {filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          subtitle={
            dateFilter ? "No bookings for this date" : "No bookings yet"
          }
        />
      ) : (
        <Grid container spacing={2}>
          {filteredBookings.map((booking) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={booking.id}>
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
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {booking.guideName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {booking.guideName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                  >
                    <Chip
                      icon={<AccessTime sx={{ fontSize: 16 }} />}
                      label={`${booking.slot.date} · ${booking.slot.startTime}–${booking.slot.endTime}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`$${booking.totalPrice}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Booked: {new Date(booking.bookedAt).toLocaleDateString()}
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
      )}

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

export default ManageBookings;
