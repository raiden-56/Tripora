import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Chip,
  Rating,
  Snackbar,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { Add, Edit, Delete, People } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import type { Guide } from "../../types";
import { useSnackbar } from "../../hooks/useSnackbar";
import EmptyState from "../../components/EmptyState";

const ManageGuides: React.FC = () => {
  const { guides, places, addGuide, updateGuide, deleteGuide } =
    useAppContext();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [form, setForm] = useState({
    id: "",
    name: "",
    avatar: "",
    experience: 0,
    rating: 4.5,
    bio: "",
    pricePerSlot: 30,
    languages: "",
    assignedPlaces: [] as string[],
  });

  const handleOpen = (guide?: Guide) => {
    if (guide) {
      setForm({
        id: guide.id,
        name: guide.name,
        avatar: guide.avatar,
        experience: guide.experience,
        rating: guide.rating,
        bio: guide.bio,
        pricePerSlot: guide.pricePerSlot,
        languages: guide.languages.join(", "),
        assignedPlaces: guide.assignedPlaces,
      });
      setIsEditing(true);
    } else {
      setForm({
        id: "",
        name: "",
        avatar: "",
        experience: 0,
        rating: 4.5,
        bio: "",
        pricePerSlot: 30,
        languages: "",
        assignedPlaces: [],
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name) {
      showSnackbar("Please enter a guide name", "error");
      return;
    }

    const guideData: Partial<Guide> = {
      name: form.name,
      avatar: form.avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
      experience: form.experience,
      rating: form.rating,
      bio: form.bio,
      pricePerSlot: form.pricePerSlot,
      languages: form.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      assignedPlaces: form.assignedPlaces,
    };

    if (isEditing) {
      updateGuide(form.id, guideData);
      showSnackbar("Guide updated successfully", "success");
    } else {
      const newGuide: Guide = {
        id: `g${Date.now()}`,
        totalReviews: 0,
        availableSlots: [],
        ...guideData,
      } as Guide;
      addGuide(newGuide);
      showSnackbar("Guide added successfully", "success");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteGuide(id);
    showSnackbar("Guide deleted", "info");
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 3 },
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
        >
          Manage Guides
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
          size="small"
        >
          Add Guide
        </Button>
      </Box>

      {guides.length === 0 ? (
        <EmptyState
          icon={<People sx={{ fontSize: 64, opacity: 0.4 }} />}
          title="No guides added"
          subtitle="Add your first guide to get started"
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpen()}
            >
              Add Guide
            </Button>
          }
        />
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
          {guides.map((guide) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={guide.id}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Avatar
                      src={guide.avatar}
                      alt={guide.name}
                      sx={{ width: 56, height: 56 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {guide.name}
                      </Typography>
                      <Rating
                        value={guide.rating}
                        precision={0.1}
                        size="small"
                        readOnly
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {guide.experience} yrs exp · {guide.totalReviews}{" "}
                        reviews
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}
                  >
                    {guide.languages.map((lang) => (
                      <Chip
                        key={lang}
                        label={lang}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Box
                    sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}
                  >
                    {guide.assignedPlaces.map((placeId) => {
                      const place = places.find((p) => p.id === placeId);
                      return place ? (
                        <Chip
                          key={placeId}
                          label={place.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : null;
                    })}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="primary.main"
                      fontWeight={800}
                    >
                      ${guide.pricePerSlot}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        /slot
                      </Typography>
                    </Typography>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(guide)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(guide.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
      >
        <DialogTitle fontWeight={700}>
          {isEditing ? "Edit Guide" : "Add New Guide"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
          >
            <TextField
              label="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Avatar URL"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Experience (years)"
                  type="number"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: Number(e.target.value) })
                  }
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Price per Slot ($)"
                  type="number"
                  value={form.pricePerSlot}
                  onChange={(e) =>
                    setForm({ ...form, pricePerSlot: Number(e.target.value) })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={form.rating}
                precision={0.5}
                onChange={(_, val) => setForm({ ...form, rating: val || 4.5 })}
              />
            </Box>
            <TextField
              label="Languages (comma separated)"
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
              fullWidth
              placeholder="English, Spanish, French"
            />
            <FormControl fullWidth>
              <InputLabel>Assign to Places</InputLabel>
              <Select
                multiple
                value={form.assignedPlaces}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignedPlaces: e.target.value as string[],
                  })
                }
                label="Assign to Places"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((val) => {
                      const place = places.find((p) => p.id === val);
                      return (
                        <Chip
                          key={val}
                          label={place?.name || val}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {places.map((place) => (
                  <MenuItem key={place.id} value={place.id}>
                    {place.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ borderRadius: 2, px: 4 }}
          >
            {isEditing ? "Update" : "Add Guide"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ManageGuides;
