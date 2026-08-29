import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  AvatarGroup,
  Avatar,
  Tooltip,
} from "@mui/material";
import { LocationOn, People } from "@mui/icons-material";
import type { Place, Guide } from "../types";

interface PlaceCardProps {
  place: Place;
  guides: Guide[];
  onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, guides, onClick }) => {
  const placeGuides = guides.filter((g) => place.guides.includes(g.id));
  const minPrice =
    placeGuides.length > 0
      ? Math.min(...placeGuides.map((g) => g.pricePerSlot))
      : 0;

  return (
    <Card
      className="card-hover"
      onClick={onClick}
      sx={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CardMedia
        component="img"
        image={place.image}
        alt={place.name}
        sx={{ objectFit: "cover", height: { xs: 160, sm: 200 } }}
      />
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {place.name}
          </Typography>
          <Chip
            label={place.category}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
          }}
        >
          <LocationOn sx={{ fontSize: 16 }} />
          <Typography variant="body2">{place.location}</Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flex: 1,
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
            mt: "auto",
            pt: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <People sx={{ fontSize: 18, color: "text.secondary" }} />
            <AvatarGroup
              max={3}
              sx={{
                "& .MuiAvatar-root": {
                  width: 28,
                  height: 28,
                  fontSize: "0.75rem",
                },
              }}
            >
              {placeGuides.map((g) => (
                <Tooltip key={g.id} title={g.name}>
                  <Avatar src={g.avatar} alt={g.name} />
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
          {minPrice > 0 && (
            <Typography
              variant="subtitle2"
              color="primary.main"
              fontWeight={700}
            >
              From ${minPrice}/slot
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;
