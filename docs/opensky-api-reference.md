# OpenSky API Reference Notes

The OpenSky Network API provides live and recent aircraft state data from crowd-sourced ADS-B receivers. It is useful for answering questions about flights currently airborne in a region or about a specific callsign.

## Useful Data Fields

OpenSky state vectors commonly include fields such as:

- ICAO24 aircraft identifier
- Callsign
- Origin country
- Last known longitude and latitude
- Barometric altitude
- Velocity
- Heading
- Vertical rate
- Whether the aircraft is on the ground
- Last contact timestamps

## Common Use Cases

- Flights currently over a state or city
- Flights near an airport
- Tracking an aircraft by callsign
- Looking at altitude and speed for nearby aircraft

## Important Constraints

- The free API is rate limited
- Coverage depends on available ADS-B receivers
- Not every flight will have complete data
- Callsigns may contain trailing spaces and often need trimming

## Bounding Box Queries

Regional queries typically use a latitude and longitude bounding box rather than a city name. For example, to find flights over a region, an application may convert a target area into minimum and maximum latitude and longitude values before calling the API.
