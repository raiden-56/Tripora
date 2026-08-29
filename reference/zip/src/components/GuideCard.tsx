import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Rating,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Language,
  WorkHistory,
} from "@mui/icons-material";
import type { Guide } from "../types";

interface GuideCardProps {
  guide: Guide;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onClick?: () => void;
  compact?: boolean;
}

const GuideCard: React.FC<GuideCardProps> = ({
  guide,
  isFavorite,
  onToggleFavorite,
  onClick,
  compact,
}) => {
  const availableSlots = guide.availableSlots.filter((s) => !s.isBooked).length;

  if (compact) {
    return (
      <Card
        onClick={onClick}
        sx={{
          cursor: onClick ? "pointer" : "default",
          "&:hover": { boxShadow: 3 },
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Avatar
            src={guide.avatar}
            alt={guide.name}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {guide.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating
                value={guide.rating}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="caption" color="text.secondary">
                ({guide.totalReviews})
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
            ${guide.pricePerSlot}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="card-hover"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Avatar
            src={guide.avatar}
            alt={guide.name}
            sx={{
              width: { xs: 52, sm: 64 },
              height: { xs: 52, sm: 64 },
              border: "3px solid",
              borderColor: "primary.light",
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                noWrap
                sx={{ flex: 1 }}
              >
                {guide.name}
              </Typography>
              {onToggleFavorite && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(guide.id);
                  }}
                  sx={{ color: isFavorite ? "error.main" : "text.secondary" }}
                >
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating
                value={guide.rating}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="caption" color="text.secondary">
                {guide.rating} ({guide.totalReviews} reviews)
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {guide.bio}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            icon={<WorkHistory sx={{ fontSize: 16 }} />}
            label={`${guide.experience} yrs exp`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<Language sx={{ fontSize: 16 }} />}
            label={guide.languages.join(", ")}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
            pt: 1,
          }}
        >
          <Chip
            label={`${availableSlots} slots available`}
            size="small"
            color={
              availableSlots > 5
                ? "success"
                : availableSlots > 0
                  ? "warning"
                  : "error"
            }
            variant="outlined"
          />
          <Typography variant="subtitle1" color="primary.main" fontWeight={800}>
            ${guide.pricePerSlot}
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
            >
              /slot
            </Typography>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GuideCard;
