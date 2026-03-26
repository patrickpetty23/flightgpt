# OpenSky API Reference

## What OpenSky Provides

The OpenSky Network is a free, community-based flight tracking service that collects ADS-B data from volunteer receivers worldwide. It provides near real-time aircraft position data with a typical delay of 5 to 10 seconds.

## Base Endpoint

```
GET https://opensky-network.org/api/states/all
```

No API key is required for anonymous access. Rate limits apply.

## Bounding Box Parameters

To query flights over a region, pass these query parameters:

| Parameter | Meaning |
|-----------|---------|
| `lamin` | Minimum latitude (south boundary) |
| `lamax` | Maximum latitude (north boundary) |
| `lomin` | Minimum longitude (west boundary) |
| `lomax` | Maximum longitude (east boundary) |

Example — flights over New York City:
```
https://opensky-network.org/api/states/all?lamin=40.0&lomin=-74.5&lamax=41.0&lomax=-73.5
```

## US Location Bounding Boxes

These are ready-to-use bounding boxes for common US locations:

| Location | lamin | lamax | lomin | lomax |
|----------|-------|-------|-------|-------|
| Utah (state) | 37.0 | 42.0 | -114.05 | -109.0 |
| Salt Lake City | 40.5 | 41.0 | -112.2 | -111.6 |
| Los Angeles | 33.7 | 34.3 | -118.7 | -117.9 |
| New York City | 40.5 | 40.92 | -74.26 | -73.7 |
| Chicago | 41.6 | 42.1 | -88.0 | -87.5 |
| Denver | 39.5 | 40.0 | -105.2 | -104.6 |
| Seattle | 47.4 | 47.8 | -122.5 | -122.1 |
| Dallas | 32.6 | 33.1 | -97.2 | -96.6 |
| Atlanta | 33.5 | 34.0 | -84.6 | -84.1 |
| Miami | 25.6 | 26.0 | -80.4 | -80.0 |
| San Francisco | 37.6 | 37.9 | -122.6 | -122.3 |
| Phoenix | 33.2 | 33.7 | -112.4 | -111.8 |
| Las Vegas | 35.9 | 36.4 | -115.4 | -114.9 |
| Boston | 42.2 | 42.5 | -71.2 | -70.9 |
| Portland | 45.4 | 45.7 | -122.8 | -122.4 |

## State Vector Field Order

Each flight in the `states` array is an array of values. The field order is:

| Index | Field | Type | Description |
|-------|-------|------|-------------|
| 0 | icao24 | string | Unique ICAO 24-bit transponder address |
| 1 | callsign | string | Aircraft callsign (may have trailing spaces, trim before use) |
| 2 | origin_country | string | Country of origin |
| 3 | time_position | int | Unix timestamp of last position report |
| 4 | last_contact | int | Unix timestamp of last message received |
| 5 | longitude | float | WGS-84 longitude in degrees. Can be null |
| 6 | latitude | float | WGS-84 latitude in degrees. Can be null |
| 7 | baro_altitude | float | Barometric altitude in meters. Can be null |
| 8 | on_ground | bool | True if aircraft is on the ground |
| 9 | velocity | float | Speed over ground in m/s. Can be null |
| 10 | true_track | float | Heading in degrees (0 = north). Can be null |
| 11 | vertical_rate | float | Climb/descent rate in m/s. Can be null |
| 12 | sensors | array | Sensor serial numbers. Can be null |
| 13 | geo_altitude | float | Geometric altitude in meters. Can be null |
| 14 | squawk | string | Transponder squawk code. Can be null |
| 15 | spi | bool | Special purpose indicator |
| 16 | position_source | int | 0=ADS-B, 1=ASTERIX, 2=MLAT |

## Important Implementation Notes

- Callsigns at index 1 often have trailing spaces — always call `.trim()` before displaying
- Many fields can be `null` — always null-check before using altitude, velocity, and heading
- The free anonymous tier allows approximately 10 requests per 10 seconds
- Coverage depends on volunteer ADS-B receivers — rural areas may have gaps
- Data is near real-time with a 5 to 10 second delay

## Rate Limits

- Anonymous (no account): ~10 requests per 10 seconds
- Registered user: 4000 API credits per day
- For this project, anonymous access is sufficient for demo purposes

## Example Raw Response

```json
{
  "time": 1707885494,
  "states": [
    ["ac0bfb", "SWA3275 ", "United States", 1707885494, 1707885494, -118.46, 34.02, 11750.04, false, 214.8, 349.09, 2.93, null, 11772.9, "6713", false, 0]
  ]
}
```

Parsed: Southwest Airlines flight 3275, at 11,750 meters altitude, speed 214.8 m/s, heading 349 degrees (roughly north).
