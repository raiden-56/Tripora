import React from "react";
import { Box, Typography } from "@mui/material";
import { SearchOff } from "@mui/icons-material";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 8,
      px: 3,
      textAlign: "center",
    }}
  >
    <Box sx={{ color: "text.secondary", mb: 2 }}>
      {icon || <SearchOff sx={{ fontSize: 64, opacity: 0.4 }} />}
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 400, mb: 2 }}
      >
        {subtitle}
      </Typography>
    )}
    {action}
  </Box>
);

export default EmptyState;
