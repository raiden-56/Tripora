import React from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { BookOnline, AttachMoney, Person, Place } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import { mockAnalytics } from "../../services/mockData";
import StatCard from "../../components/StatCard";

const AdminDashboard: React.FC = () => {
  const { bookings, guides, places } = useAppContext();
  const analytics = mockAnalytics;

  const recentBookings = bookings.slice(0, 5);

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: "0.95rem", sm: "1rem" } }}
      >
        Welcome back, Admin
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
            subtitle="+12% this month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={`$${analytics.totalRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color="#388e3c"
            subtitle="+8% this month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Guides"
            value={guides.length}
            icon={<Person />}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Places"
            value={places.length}
            icon={<Place />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        {/* Revenue Chart Placeholder */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: { xs: 2, sm: 3 } }}
              >
                Revenue Overview
              </Typography>
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
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": { borderRadius: 5 },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Most Hired Guide
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight={800}>
                {analytics.mostHiredGuide.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics.mostHiredGuide.count} bookings
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Most Visited Place
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight={800}>
                {analytics.mostVisitedPlace.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analytics.mostVisitedPlace.count} visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings */}
        <Grid size={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Recent Bookings
              </Typography>
              {recentBookings.length > 0 ? (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {recentBookings.map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {booking.guideName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.placeName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="subtitle2"
                          color="primary.main"
                          fontWeight={700}
                        >
                          ${booking.totalPrice}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.slot.date}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent bookings
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
