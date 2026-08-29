import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Avatar,
} from "@mui/material";
import { AdminPanelSettings, Person, Explore } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    navigate(role === "admin" ? "/admin" : "/user");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // background:
        //   "linear-gradient(135deg, #ff9800 0%, #f57c00 50%, #e65100 100%)",
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: {
            xs: "0 4px 20px rgba(0,0,0,0.08)",
            sm: "0 20px 60px rgba(0,0,0,0.1)",
          },
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 }, textAlign: "center" }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              mx: "auto",
              mb: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}
          >
            <Explore sx={{ fontSize: 28 }} />
          </Avatar>

          <Typography variant="h5" fontWeight={800} gutterBottom>
            HIRE GUIDE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Discover amazing places with expert local guides
          </Typography>

          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(_, val) => val && setRole(val)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton
              value="user"
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                gap: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <Person /> User
            </ToggleButton>
            <ToggleButton
              value="admin"
              sx={{
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                gap: 1,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <AdminPanelSettings /> Admin
            </ToggleButton>
          </ToggleButtonGroup>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                role === "admin" ? "admin@example.com" : "john@example.com"
              }
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter any password"
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 1,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: 2,
                background: "linear-gradient(135deg, #424242, #212121)",
                "&:hover": {
                  background: "linear-gradient(135deg, #212121, #000000)",
                },
              }}
            >
              Sign In as {role === "admin" ? "Admin" : "User"}
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, display: "block" }}
          >
            No authentication required — select a role and sign in
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
