# Aviation Terminology Glossary

## Callsign
A callsign is the spoken and operational identifier used by an aircraft on radio and in flight tracking systems. For commercial flights, the callsign is typically the airline's ICAO code followed by the flight number. For example, United Airlines flight 123 uses the callsign `UAL123`. Delta uses `DAL`, Southwest uses `SWA`, American uses `AAL`.

## Squawk Code
A squawk code is a four-digit transponder code assigned to an aircraft by air traffic control. Each digit ranges from 0 to 7 (octal), giving 4,096 possible codes. ATC assigns a discrete squawk code to each aircraft to identify it on radar.

Special squawk codes with universal meaning:
- `7500` — Hijacking or unlawful interference
- `7600` — Radio communication failure (NORDO)
- `7700` — General emergency
- `1200` — VFR flight in the US with no ATC contact

## Transponder
A transponder is onboard avionics equipment that automatically replies to radar interrogations from ATC. It broadcasts the aircraft's squawk code and altitude (Mode C). ADS-B transponders also broadcast GPS position continuously.

## ADS-B (Automatic Dependent Surveillance–Broadcast)
ADS-B is a surveillance technology where aircraft automatically broadcast their GPS position, altitude, speed, and identity. This is what OpenSky Network receivers collect. The FAA required ADS-B Out equipment on most aircraft flying in US controlled airspace as of January 2020.

## ICAO
ICAO stands for International Civil Aviation Organization. In flight tracking, ICAO codes appear in two contexts:
- **Airport codes**: 4-letter codes like `KSLC` or `KJFK` (US airports start with K)
- **Aircraft addresses**: 6-digit hexadecimal codes (like `a1b2c3`) that uniquely identify each aircraft's transponder globally

## IATA
IATA stands for International Air Transport Association. IATA airport codes are the familiar 3-letter codes passengers see on tickets: `SLC`, `JFK`, `LAX`. Airlines also have IATA codes: `UA` for United, `DL` for Delta, `AA` for American, `WN` for Southwest.

## IFR (Instrument Flight Rules)
Under IFR, pilots fly by reference to cockpit instruments and operate under ATC clearances. Commercial airline flights always operate under IFR regardless of weather. IFR requires filing a flight plan.

## VFR (Visual Flight Rules)
Under VFR, pilots navigate primarily by looking outside the cockpit. VFR requires certain weather minimums (visibility and cloud clearance). Most small general aviation aircraft fly VFR in good weather.

## Flight Level (FL)
Above 18,000 feet in the US, altitude is expressed as a Flight Level — the altitude in hundreds of feet based on a standard pressure setting. FL350 means 35,000 feet. Commercial airliners typically cruise between FL300 and FL410.

## Altitude Types
- **Barometric altitude**: Height based on atmospheric pressure, referenced to mean sea level
- **Geometric altitude**: GPS-based height above the WGS-84 ellipsoid
- **AGL**: Above Ground Level — height above the terrain below
- OpenSky provides both barometric and geometric altitude in meters

## Velocity and Speed
- **Groundspeed**: Speed relative to the ground — what OpenSky reports in m/s
- **Airspeed**: Speed relative to the air mass — what the cockpit instruments show
- **Knots (kt)**: Nautical miles per hour. 1 knot = 1.852 km/h = 1.151 mph
- Typical commercial airliner cruise: 450–530 mph / 390–460 knots / 720–850 km/h

## True Track / Heading
The direction of travel in degrees, measured clockwise from true north. 0° = North, 90° = East, 180° = South, 270° = West. OpenSky reports this as `true_track`.

## Vertical Rate
Rate of climb or descent in meters per second. Positive = climbing, negative = descending. A typical airline climb rate is about 8–10 m/s (1,500–2,000 feet per minute).

## ATIS (Automatic Terminal Information Service)
A pre-recorded broadcast at airports providing current weather, runway in use, and other information to pilots. Pilots listen to ATIS before calling ATC to know current conditions.

## ATC (Air Traffic Control)
Air Traffic Control manages aircraft separation and flow in controlled airspace. In the US, the FAA operates ATC. Key facilities include TRACON (approach/departure control) and ARTCC (en-route centers).

## Airspace Classes (US)
- **Class A**: Above 18,000 feet — IFR only, all aircraft under ATC
- **Class B**: Around major airports (like SLC, LAX) — all aircraft need ATC clearance
- **Class C**: Around medium airports — clearance required
- **Class D**: Around smaller airports with control towers
- **Class E**: Controlled airspace not A/B/C/D
- **Class G**: Uncontrolled airspace — mostly low altitude rural areas

## ICAO24 Address
The unique 24-bit (6 hex digit) identifier assigned to each aircraft's transponder. This is what OpenSky uses as a primary aircraft identifier. US-registered aircraft have ICAO24 addresses starting with `a`.

## State Vector
In OpenSky terminology, a state vector is a snapshot of an aircraft's position and status at a given moment — including callsign, position, altitude, speed, heading, and whether it's on the ground.

## On Ground
A boolean field in OpenSky data indicating whether an aircraft is currently on the ground (taxiing, parked) versus airborne. When `on_ground` is true, altitude and speed data may be less reliable.

## Waypoint
A defined geographic position used in navigation, identified by a 5-letter name (like KSALT or BOILE). Flight routes are described as a series of waypoints connecting departure and destination.

## FIR (Flight Information Region)
A defined volume of airspace in which flight information and alerting services are provided. The US is divided into several FIRs managed by ARTCC centers like ZLC (Salt Lake City Center) or ZLA (Los Angeles Center).

## Nautical Mile
The standard unit of distance in aviation. 1 nautical mile = 1.852 km = 1.151 statute miles. Airport distances and aircraft range are typically expressed in nautical miles.

## METAR
A standardized weather report format used at airports, updated hourly or more frequently. Contains wind, visibility, cloud cover, temperature, dewpoint, and altimeter setting. Relevant for understanding delays.
