# Aviation Math Reference

This document covers common calculations used in aviation that FlightGPT's calculator tool can help with.

## Unit Conversions

### Speed
- 1 knot = 1.852 km/h = 1.151 mph = 0.514 m/s
- 1 mph = 0.869 knots = 1.609 km/h
- OpenSky reports velocity in **m/s** — multiply by 1.944 to get knots, or by 2.237 to get mph

Example: OpenSky shows velocity = 214.8 m/s
- In knots: 214.8 × 1.944 = 417.6 kt
- In mph: 214.8 × 2.237 = 480.5 mph

### Altitude
- 1 meter = 3.281 feet
- 1 foot = 0.305 meters
- OpenSky reports altitude in **meters** — multiply by 3.281 to get feet

Example: OpenSky shows baro_altitude = 11,750 meters
- In feet: 11,750 × 3.281 = 38,551 feet ≈ FL385

### Distance
- 1 nautical mile (nm) = 1.852 km = 1.151 statute miles
- 1 statute mile = 0.869 nm = 1.609 km
- 1 km = 0.540 nm = 0.621 statute miles

## Common Aviation Calculations

### Estimated Flight Duration
```
duration (hours) = distance (nm) / groundspeed (knots)
```
Example: 1,800 nm route, groundspeed 450 kt
- Duration = 1,800 / 450 = 4.0 hours

### Distance Between Two Points (Approximate)
For rough estimates, use the calculator with known route distances from the common routes document. For precise calculations, the Haversine formula is needed:
```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1-a))
distance = R × c  (where R = 3,440 nm or 6,371 km)
```

### Fuel Estimation (Rough)
Typical commercial jet fuel burn:
- Narrow-body (737/A320): ~5,000–6,000 lbs/hour, or ~750 gallons/hour
- Wide-body (777/A350): ~12,000–18,000 lbs/hour

Example: 737 on a 3-hour flight
- Fuel burn ≈ 5,500 × 3 = 16,500 lbs ≈ 2,460 gallons

### Recipe Scaling / Passenger Load Factor
Load factor = (passengers boarded / seats available) × 100
Example: 160 passengers on a 189-seat 737-800
- Load factor = (160 / 189) × 100 = 84.7%

### Speed Conversion (m/s to knots)
Since OpenSky reports in m/s:
```
knots = m_per_s × 1.944
mph = m_per_s × 2.237
km_per_h = m_per_s × 3.6
```

### Altitude Conversion (meters to feet)
```
feet = meters × 3.281
flight_level = feet / 100  (rounded to nearest 5 above 18,000 ft)
```

## Typical Performance Numbers

| Aircraft | Cruise Speed (kt) | Cruise Alt (ft) | Range (nm) |
|----------|------------------|-----------------|------------|
| 737-800 | 453 | 35,000 | 3,115 |
| A320 | 447 | 35,000 | 3,300 |
| A321 | 447 | 37,000 | 3,200 |
| 787-9 | 488 | 40,000 | 7,635 |
| 777-300ER | 490 | 39,000 | 7,370 |
| A350-900 | 488 | 41,000 | 8,100 |
| E175 | 416 | 37,000 | 2,200 |

## Great Circle Distances (Common US Routes)

These are approximate great-circle (shortest path) distances in nautical miles:

| Route | Nautical Miles | Statute Miles | Kilometers |
|-------|---------------|---------------|------------|
| SLC → LAX | 513 | 590 | 950 |
| SLC → JFK | 1,731 | 1,990 | 3,203 |
| SLC → ORD | 1,087 | 1,250 | 2,012 |
| SLC → DEN | 339 | 390 | 628 |
| LAX → JFK | 2,151 | 2,475 | 3,983 |
| LAX → SEA | 830 | 955 | 1,537 |
| JFK → BOS | 165 | 190 | 306 |
| JFK → MIA | 947 | 1,090 | 1,754 |
| ORD → ATL | 527 | 606 | 975 |
| DFW → DEN | 557 | 641 | 1,032 |
| SEA → SFO | 591 | 680 | 1,094 |
| SFO → LAS | 361 | 415 | 668 |
