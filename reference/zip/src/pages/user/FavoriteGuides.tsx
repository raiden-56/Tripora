import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import GuideCard from "../../components/GuideCard";
import EmptyState from "../../components/EmptyState";

const FavoriteGuides: React.FC = () => {
  const { guides, favoriteGuideIds, toggleFavorite } = useAppContext();
  const favoriteGuides = guides.filter((g) => favoriteGuideIds.includes(g.id));

  if (favoriteGuides.length === 0) {
    return (
      <EmptyState
        icon={<Favorite sx={{ fontSize: 64, opacity: 0.4 }} />}
        title="No favorite guides yet"
        subtitle="Explore places and tap the heart icon to save your favorite guides."
      />
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: "0.95rem", sm: "1rem" } }}
      >
        My Favorite Guides ({favoriteGuides.length})
      </Typography>
      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        {favoriteGuides.map((guide) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={guide.id}>
            <GuideCard
              guide={guide}
              isFavorite
              onToggleFavorite={toggleFavorite}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FavoriteGuides;
