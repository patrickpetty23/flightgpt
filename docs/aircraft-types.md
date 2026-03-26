# Aircraft Types Reference

## Narrow-Body Aircraft (Single-Aisle)

### Boeing 737-800
The 737-800 is the most common variant of the 737 family and one of the most widely flown commercial aircraft in the world.
- Seating: 162–189 passengers (typical 2-3-2 config)
- Range: up to 3,115 nautical miles
- Cruise speed: ~485 mph (Mach 0.79)
- Engines: 2x CFM56-7B
- Common operators: Southwest (entire fleet), American, United, Delta, Ryanair
- Use case: Domestic routes, short to medium haul

### Boeing 737 MAX 8
The modern replacement for the 737-800 with improved fuel efficiency.
- Seating: 162–178 passengers
- Range: up to 3,550 nautical miles
- Cruise speed: ~521 mph (Mach 0.79)
- Engines: 2x CFM LEAP-1B
- Common operators: Southwest, Alaska, American, United
- Note: Grounded 2019–2020 following two fatal crashes; returned to service with software updates

### Boeing 737-900ER
The longest variant of the classic 737 family.
- Seating: up to 220 passengers
- Range: up to 3,200 nautical miles
- Common operators: Alaska Airlines (primary fleet type), United

### Airbus A320
The most common Airbus narrow-body, competing directly with the 737-800.
- Seating: 150–180 passengers
- Range: up to 3,300 nautical miles
- Cruise speed: ~511 mph (Mach 0.78)
- Engines: CFM56 or IAE V2500
- Common operators: Delta, United, American, JetBlue, Spirit

### Airbus A321
Stretched version of the A320, offering higher capacity on busier routes.
- Seating: 180–220 passengers
- Range: up to 3,200 nautical miles
- Common operators: American (largest A321 fleet in the world), Delta, United, JetBlue
- The A321XLR variant extends range to ~5,400 nautical miles, enabling transatlantic service

### Airbus A319
Shorter version of the A320, used on thinner routes.
- Seating: 120–150 passengers
- Common operators: United, American, Frontier

### Embraer E175
A regional jet used by regional subsidiaries of major airlines.
- Seating: 76 passengers
- Range: up to 2,200 nautical miles
- Common operators: SkyWest (for United, Delta, Alaska), Envoy (for American)
- Often seen on routes from smaller cities to major hubs

### Bombardier CRJ-900
Another common regional jet on short-haul feeder routes.
- Seating: 76–90 passengers
- Common operators: SkyWest, Endeavor Air (Delta Connection)

---

## Wide-Body Aircraft (Twin-Aisle)

### Boeing 777-200ER
A long-range wide-body twin used heavily on international routes.
- Seating: 300–400 passengers
- Range: up to 7,700 nautical miles
- Engines: 2x GE90 (largest turbofan engines ever built)
- Common operators: Delta, United, American

### Boeing 777-300ER
The stretched, higher-capacity version of the 777.
- Seating: 350–400 passengers
- Range: up to 7,370 nautical miles
- Common operators: Delta, Korean Air, Emirates (world's largest 777 fleet)

### Boeing 787-8 Dreamliner
A modern, fuel-efficient long-range aircraft. Notable for its composite airframe.
- Seating: 242–259 passengers
- Range: up to 7,305 nautical miles
- Engines: 2x GEnx or Rolls-Royce Trent 1000
- Common operators: United, American, Delta, Ana, Japan Airlines

### Boeing 787-9 Dreamliner
Stretched version of the 787-8, the most popular Dreamliner variant.
- Seating: 296 passengers
- Range: up to 7,635 nautical miles
- Common operators: United, Delta, Air New Zealand, Qantas

### Airbus A350-900
Airbus's answer to the 787, competing on long-haul efficiency.
- Seating: 300–350 passengers
- Range: up to 8,100 nautical miles
- Engines: 2x Rolls-Royce Trent XWB
- Common operators: Delta, American, Singapore Airlines, Cathay Pacific

### Airbus A330-300
An older wide-body still common on medium and long-haul international routes.
- Seating: 250–300 passengers
- Range: up to 6,350 nautical miles
- Common operators: Delta, United, Hawaiian

### Boeing 767-300ER
A medium wide-body used on transatlantic routes and domestic premium routes.
- Seating: 218–269 passengers
- Range: up to 6,025 nautical miles
- Common operators: Delta, American, United

---

## Identifying Aircraft in FlightGPT

When OpenSky returns flight data, it does not include aircraft type directly in the state vector. Aircraft type lookup requires cross-referencing the ICAO24 address against a registration database. However, callsign prefixes can help identify the airline:

| Callsign Prefix | Airline |
|----------------|---------|
| UAL | United Airlines |
| DAL | Delta Air Lines |
| AAL | American Airlines |
| SWA | Southwest Airlines |
| ASA | Alaska Airlines |
| JBU | JetBlue Airways |
| SKW | SkyWest Airlines |
| FFT | Frontier Airlines |
| NKS | Spirit Airlines |
| SCX | Sun Country Airlines |
