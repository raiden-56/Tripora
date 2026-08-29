import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  type SvgIconProps,
} from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  color?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = "primary.main",
  subtitle,
}) => (
  <Card sx={{ height: "100%" }}>
    <CardContent
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: { xs: 1.5, sm: 2 },
        p: { xs: 2, sm: 3 },
        "&:last-child": { pb: { xs: 2, sm: 3 } },
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: `${color}15`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 22 } })}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ color, lineHeight: 1.2, mt: 0.5 }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
