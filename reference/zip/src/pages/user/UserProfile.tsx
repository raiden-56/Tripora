import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Save, Email, Phone, Language } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { useSnackbar } from "../../hooks/useSnackbar";

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { bookings, favoriteGuideIds } = useAppContext();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+1 234 567 8900");

  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((acc, b) => acc + b.totalPrice, 0);

  const handleSave = () => {
    setEditing(false);
    showSnackbar("Profile updated successfully!", "success");
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 0, sm: 0 } }}>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: "0.95rem", sm: "1rem" } }}
      >
        My Profile
      </Typography>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 2, sm: 3 },
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 48, sm: 60 },
                  height: { xs: 48, sm: 60 },
                  bgcolor: "primary.main",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  fontWeight: 700,
                }}
              >
                {name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Explorer & Traveler
                </Typography>
              </Box>
            </Box>
            <Button
              variant={editing ? "contained" : "outlined"}
              startIcon={editing ? <Save /> : <Edit />}
              onClick={editing ? handleSave : () => setEditing(true)}
              sx={{
                borderRadius: 2,
                alignSelf: { xs: "stretch", sm: "center" },
              }}
              fullWidth={false}
            >
              {editing ? "Save" : "Edit"}
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                disabled={!editing}
                InputProps={{
                  startAdornment: (
                    <Edit
                      sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                disabled={!editing}
                InputProps={{
                  startAdornment: (
                    <Email
                      sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                disabled={!editing}
                InputProps={{
                  startAdornment: (
                    <Phone
                      sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Preferred Language"
                value="English"
                fullWidth
                disabled={!editing}
                InputProps={{
                  startAdornment: (
                    <Language
                      sx={{ mr: 1, fontSize: 18, color: "text.secondary" }}
                    />
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, textAlign: "center" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {bookings.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, textAlign: "center" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                ${totalSpent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, textAlign: "center" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {favoriteGuideIds.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Favorite Guides
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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

export default UserProfile;
