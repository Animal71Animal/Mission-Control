# Tesla Charging Data

## Quick Add Format

Text or voice me something like:

> "Charged today for 45 minutes, $12.50, 65 kWh at Orchard"

Or more detailed:
> "March 24th, charged at 2am for 30 minutes, cost $8.25, got 45 kWh, rate was 18 cents"

## Data Structure

Each charging session includes:
- `date`: YYYY-MM-DD
- `time`: HH:MM (optional)
- `duration_minutes`: number
- `rate_per_kwh`: dollars per kWh
- `cost`: total dollars
- `kwh`: kilowatt hours
- `location`: string (optional)
- `notes`: string (optional)

## API Endpoints

- `GET /api/tesla` - Get all charging data
- `POST /api/tesla` - Add new charging session

## Current Stats

- Total sessions: 43
- Total spent: $686.86
- Total kWh: 2,320.93
- Average per session: $15.97
