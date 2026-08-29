import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { Add, Edit, Delete, Place as PlaceIcon } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import type { Place } from "../../types";
import { useSnackbar } from "../../hooks/useSnackbar";
import EmptyState from "../../components/EmptyState";

const emptyPlace: Partial<Place> = {
  name: "",
  description: "",
  image: "",
  location: "",
  category: "",
  guides: [],
};

const ManagePlaces: React.FC = () => {
  const { places, addPlace, updatePlace, deletePlace } = useAppContext();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Partial<Place>>(emptyPlace);
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleOpen = (place?: Place) => {
    if (place) {
      setEditingPlace(place);
      setIsEditing(true);
    } else {
      setEditingPlace(emptyPlace);
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingPlace.name || !editingPlace.location) {
      showSnackbar("Please fill in required fields", "error");
      return;
    }

    if (isEditing && editingPlace.id) {
      updatePlace(editingPlace.id, editingPlace);
      showSnackbar("Place updated successfully", "success");
    } else {
      const newPlace: Place = {
        id: `p${Date.now()}`,
        name: editingPlace.name!,
        description: editingPlace.description || "",
        image:
          editingPlace.image ||
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
        location: editingPlace.location!,
        category: editingPlace.category || "General",
        guides: [],
      };
      addPlace(newPlace);
      showSnackbar("Place added successfully", "success");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deletePlace(id);
    showSnackbar("Place deleted", "info");
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
          Manage Places
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
          size="small"
        >
          Add Place
        </Button>
      </Box>

      {places.length === 0 ? (
        <EmptyState
          icon={<PlaceIcon sx={{ fontSize: 64, opacity: 0.4 }} />}
          title="No places added"
          subtitle="Add your first place to get started"
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpen()}
            >
              Add Place
            </Button>
          }
        />
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
          {places.map((place) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={place.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={place.image}
                  alt={place.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent
                  sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {place.name}
                    </Typography>
                    <Chip
                      label={place.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {place.location}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flex: 1,
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {place.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {place.guides.length} guides assigned
                    </Typography>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(place)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(place.id)}
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
          {isEditing ? "Edit Place" : "Add New Place"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
          >
            <TextField
              label="Place Name *"
              value={editingPlace.name || ""}
              onChange={(e) =>
                setEditingPlace({ ...editingPlace, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Location *"
              value={editingPlace.location || ""}
              onChange={(e) =>
                setEditingPlace({ ...editingPlace, location: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Category"
              value={editingPlace.category || ""}
              onChange={(e) =>
                setEditingPlace({ ...editingPlace, category: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Image URL"
              value={editingPlace.image || ""}
              onChange={(e) =>
                setEditingPlace({ ...editingPlace, image: e.target.value })
              }
              fullWidth
              placeholder="https://images.unsplash.com/..."
            />
            <TextField
              label="Description"
              value={editingPlace.description || ""}
              onChange={(e) =>
                setEditingPlace({
                  ...editingPlace,
                  description: e.target.value,
                })
              }
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
            {isEditing ? "Update" : "Add Place"}
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

export default ManagePlaces;
