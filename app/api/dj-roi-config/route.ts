export async function GET() {
  // Single source of truth for DJ ROI Calculator configuration
  const config = {
    software_cost_per_month: 2000,
    inputs: {
      numVenues: { label: "Number of Venues", default: 1, min: 1, max: 50 },
      totalDJs: { label: "Total DJs (All Venues)", default: 2, min: 1, max: 100 },
      weeklyHours: { label: "Total # of weekly hours replaced by Software", default: 80, min: 1, max: 200 },
      hourlyRate: { label: "Hourly Rate ($)", default: 20, min: 5, max: 200 },
    },
    description: "Estimate annual savings by automating DJ management",
  };

  return Response.json(config);
}
