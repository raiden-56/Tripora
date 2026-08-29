import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  BookOnline,
  AttachMoney,
  Star,
  Place,
} from "@mui/icons-material";
import { mockAnalytics } from "../../services/mockData";
import StatCard from "../../components/StatCard";
import { useAppContext } from "../../context/AppContext";

const AdminAnalytics: React.FC = () => {
  const { bookings } = useAppContext();
  const analytics = mockAnalytics;

  // Guide leaderboard
  const guideBookingCount: Record<string, number> = {};
  bookings.forEach((b) => {
    guideBookingCount[b.guideName] = (guideBookingCount[b.guideName] || 0) + 1;
  });
  const guideLeaderboard = Object.entries(guideBookingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Place popularity
  const placeBookingCount: Record<string, number> = {};
  bookings.forEach((b) => {
    placeBookingCount[b.placeName] = (placeBookingCount[b.placeName] || 0) + 1;
  });
  const placeLeaderboard = Object.entries(placeBookingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: "0.95rem", sm: "1rem" } }}
      >
        Analytics Dashboard
      </Typography>

      <Grid
        container
        spacing={{ xs: 1.5, sm: 3 }}
        sx={{ mb: { xs: 2, sm: 4 } }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Bookings"
            value={analytics.totalBookings}
            icon={<BookOnline />}
            color="#212121"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color="#388e3c"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Most Hired"
            value={analytics.mostHiredGuide.name}
            icon={<Star />}
            color="#1976d2"
            subtitle={`${analytics.mostHiredGuide.count} bookings`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Top Place"
            value={analytics.mostVisitedPlace.name}
            icon={<Place />}
            color="#7b1fa2"
            subtitle={`${analytics.mostVisitedPlace.count} visits`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        {/* Revenue by Month */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <TrendingUp color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Monthly Revenue
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {analytics.revenueByMonth.map((item) => (
                  <Box key={item.month}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {item.month}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight={700}
                      >
                        ${item.revenue}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.revenue / 2000) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": { borderRadius: 4 },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bookings by Month */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <BookOnline color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Monthly Bookings
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {analytics.bookingsByMonth.map((item) => (
                  <Box key={item.month}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {item.month}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="info.main"
                        fontWeight={700}
                      >
                        {item.count} bookings
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / 40) * 100}
                      color="info"
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": { borderRadius: 4 },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Guide Leaderboard */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Top Guides
              </Typography>
              {guideLeaderboard.length > 0 ? (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {guideLeaderboard.map(([name, count], idx) => (
                    <Box
                      key={name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={idx === 0 ? "primary.main" : "text.secondary"}
                        sx={{ width: 30 }}
                      >
                        #{idx + 1}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ flex: 1 }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight={700}
                      >
                        {count} bookings
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No booking data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Place Leaderboard */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Top Places
              </Typography>
              {placeLeaderboard.length > 0 ? (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {placeLeaderboard.map(([name, count], idx) => (
                    <Box
                      key={name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={idx === 0 ? "primary.main" : "text.secondary"}
                        sx={{ width: 30 }}
                      >
                        #{idx + 1}
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ flex: 1 }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight={700}
                      >
                        {count} bookings
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No booking data
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
