import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Alert,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle,
  AccessTime,
  Place as PlaceIcon,
  AttachMoney,
} from "@mui/icons-material";
import type { Guide, Place, TimeSlot } from "../types";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  guide: Guide | null;
  place: Place | null;
  slot: TimeSlot | null;
  onConfirm: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  guide,
  place,
  slot,
  onConfirm,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  if (!guide || !place || !slot) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      {!confirmed ? (
        <>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm Booking</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                }}
              >
                <Avatar
                  src={guide.avatar}
                  alt={guide.name}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {guide.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {guide.experience} years experience • Rating: {guide.rating}
                    ★
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PlaceIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Place:</strong> {place.name}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTime color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Date:</strong> {slot.date} | <strong>Time:</strong>{" "}
                    {slot.startTime} – {slot.endTime}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachMoney color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Price:</strong>
                  </Typography>
                  <Chip
                    label={`$${guide.pricePerSlot}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Total Amount
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  ${guide.pricePerSlot}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Hire Guide
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent sx={{ textAlign: "center", py: 5 }}>
            <CheckCircle sx={{ fontSize: 56, color: "success.main", mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Your guide <strong>{guide.name}</strong> is booked for{" "}
              <strong>{place.name}</strong>
            </Typography>
            <Alert severity="success" sx={{ borderRadius: 2, mt: 2 }}>
              {slot.date} | {slot.startTime} – {slot.endTime} | Total: $
              {guide.pricePerSlot}
            </Alert>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              onClick={handleClose}
              variant="contained"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Done
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default BookingModal;
