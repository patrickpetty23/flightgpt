import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { logger } from "../logger";

const OPENSKY_URL = "https://opensky-network.org/api/states/all";
const MAX_RESULTS = 8;

type BoundingBox = {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
};

type LocationDefinition = {
  label: string;
  boundingBox: BoundingBox;
};

type OpenSkyStateVector = [
  string | null,
  string | null,
  string | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  boolean | null,
  number | null,
  number | null,
  number | null,
  unknown,
  number | null,
  string | null,
  boolean | null,
  number | null,
  number | null,
];

type OpenSkyResponse = {
  time?: number;
  states?: OpenSkyStateVector[] | null;
};

const LOCATION_MAP: Record<string, LocationDefinition> = {
  utah: {
    label: "Utah",
    boundingBox: { lamin: 36.99, lomin: -114.05, lamax: 42.01, lomax: -109.04 },
  },
  slc: {
    label: "Salt Lake City International Airport",
    boundingBox: { lamin: 40.62, lomin: -112.15, lamax: 40.92, lomax: -111.75 },
  },
  kslc: {
    label: "Salt Lake City International Airport",
    boundingBox: { lamin: 40.62, lomin: -112.15, lamax: 40.92, lomax: -111.75 },
  },
  "salt lake city": {
    label: "Salt Lake City, Utah",
    boundingBox: { lamin: 40.55, lomin: -112.2, lamax: 40.95, lomax: -111.7 },
  },
  jfk: {
    label: "John F. Kennedy International Airport",
    boundingBox: { lamin: 40.5, lomin: -73.95, lamax: 40.8, lomax: -73.55 },
  },
  kjfk: {
    label: "John F. Kennedy International Airport",
    boundingBox: { lamin: 40.5, lomin: -73.95, lamax: 40.8, lomax: -73.55 },
  },
  "new york": {
    label: "New York City",
    boundingBox: { lamin: 40.45, lomin: -74.3, lamax: 40.95, lomax: -73.55 },
  },
  lax: {
    label: "Los Angeles International Airport",
    boundingBox: { lamin: 33.75, lomin: -118.65, lamax: 34.15, lomax: -118.15 },
  },
  klax: {
    label: "Los Angeles International Airport",
    boundingBox: { lamin: 33.75, lomin: -118.65, lamax: 34.15, lomax: -118.15 },
  },
  ord: {
    label: "Chicago O'Hare International Airport",
    boundingBox: { lamin: 41.82, lomin: -88.1, lamax: 42.12, lomax: -87.62 },
  },
  kord: {
    label: "Chicago O'Hare International Airport",
    boundingBox: { lamin: 41.82, lomin: -88.1, lamax: 42.12, lomax: -87.62 },
  },
  atl: {
    label: "Hartsfield-Jackson Atlanta International Airport",
    boundingBox: { lamin: 33.45, lomin: -84.65, lamax: 33.85, lomax: -84.15 },
  },
  katl: {
    label: "Hartsfield-Jackson Atlanta International Airport",
    boundingBox: { lamin: 33.45, lomin: -84.65, lamax: 33.85, lomax: -84.15 },
  },
  dfw: {
    label: "Dallas Fort Worth International Airport",
    boundingBox: { lamin: 32.65, lomin: -97.35, lamax: 33.1, lomax: -96.85 },
  },
  kdfw: {
    label: "Dallas Fort Worth International Airport",
    boundingBox: { lamin: 32.65, lomin: -97.35, lamax: 33.1, lomax: -96.85 },
  },
  den: {
    label: "Denver International Airport",
    boundingBox: { lamin: 39.65, lomin: -104.95, lamax: 40.1, lomax: -104.45 },
  },
  kden: {
    label: "Denver International Airport",
    boundingBox: { lamin: 39.65, lomin: -104.95, lamax: 40.1, lomax: -104.45 },
  },
};

const flightLookupInputSchema = z
  .object({
    location: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .describe(
        "A supported region, city, or airport name/code like Utah, Salt Lake City, SLC, or JFK.",
      ),
    callsign: z
      .string()
      .trim()
      .min(2)
      .max(20)
      .optional()
      .describe("A flight callsign like UAL123 when tracking a specific flight."),
  })
  .refine(
    (value) => Boolean(value.location) !== Boolean(value.callsign),
    "Provide exactly one of location or callsign.",
  );

function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase();
}

function formatAltitudeFeet(meters: number | null): string {
  if (meters == null) {
    return "unknown altitude";
  }

  return `${Math.round(meters * 3.28084).toLocaleString()} ft`;
}

function formatSpeedKnots(metersPerSecond: number | null): string {
  if (metersPerSecond == null) {
    return "unknown speed";
  }

  return `${Math.round(metersPerSecond * 1.94384)} knots`;
}

function formatCoordinates(
  latitude: number | null,
  longitude: number | null,
): string {
  if (latitude == null || longitude == null) {
    return "unknown coordinates";
  }

  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
}

function formatFlights(
  flights: OpenSkyStateVector[],
  heading: string,
): string {
  if (flights.length === 0) {
    return `No active flights found for ${heading}.`;
  }

  const lines = flights.slice(0, MAX_RESULTS).map((flight, index) => {
    const callsign = flight[1]?.trim() || "unknown callsign";
    const originCountry = flight[2] || "unknown origin";
    const longitude = flight[5];
    const latitude = flight[6];
    const altitude = flight[13] ?? flight[7];
    const speed = flight[9];

    return [
      `${index + 1}. ${callsign}`,
      `Origin country: ${originCountry}`,
      `Altitude: ${formatAltitudeFeet(altitude)}`,
      `Speed: ${formatSpeedKnots(speed)}`,
      `Coordinates: ${formatCoordinates(latitude, longitude)}`,
    ].join("\n");
  });

  return `${heading}\n\n${lines.join("\n\n")}`;
}

function sortFlightsByAltitude(flights: OpenSkyStateVector[]): OpenSkyStateVector[] {
  return [...flights].sort((left, right) => {
    const leftAltitude = left[13] ?? left[7] ?? -1;
    const rightAltitude = right[13] ?? right[7] ?? -1;
    return rightAltitude - leftAltitude;
  });
}

function resolveLocation(location: string): LocationDefinition {
  const normalized = normalizeLookupValue(location);
  const match = LOCATION_MAP[normalized];

  if (!match) {
    const supportedLocations = Object.values(LOCATION_MAP)
      .map((entry) => entry.label)
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, 8)
      .join(", ");

    throw new Error(
      `Unsupported location "${location}". Try a supported region or airport like Utah, SLC, JFK, LAX, ORD, ATL, DFW, or DEN. Known examples: ${supportedLocations}.`,
    );
  }

  return match;
}

async function fetchOpenSky(url: string): Promise<OpenSkyResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OpenSky request failed with status ${response.status}.`);
  }

  return (await response.json()) as OpenSkyResponse;
}

async function lookupByLocation(location: string): Promise<string> {
  const resolved = resolveLocation(location);
  const { lamin, lomin, lamax, lomax } = resolved.boundingBox;
  const searchParams = new URLSearchParams({
    lamin: String(lamin),
    lomin: String(lomin),
    lamax: String(lamax),
    lomax: String(lomax),
  });

  const payload = await fetchOpenSky(`${OPENSKY_URL}?${searchParams.toString()}`);
  const flights = sortFlightsByAltitude(payload.states ?? []);

  return formatFlights(flights, `Flights near ${resolved.label}:`);
}

async function lookupByCallsign(callsign: string): Promise<string> {
  const normalizedCallsign = callsign.trim().toUpperCase();
  const payload = await fetchOpenSky(OPENSKY_URL);
  const flights = (payload.states ?? []).filter(
    (flight) => flight[1]?.trim().toUpperCase() === normalizedCallsign,
  );

  return formatFlights(
    sortFlightsByAltitude(flights),
    `Flights matching callsign ${normalizedCallsign}:`,
  );
}

export async function runFlightLookup(input: {
  location?: string;
  callsign?: string;
}): Promise<string> {
  try {
    const validated = flightLookupInputSchema.parse(input);
    const result = validated.location
      ? await lookupByLocation(validated.location)
      : await lookupByCallsign(validated.callsign as string);

    logger.info({
      tool: "flight_lookup",
      arguments: validated,
      result,
    });

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown flight lookup error.";
    const result = `Flight lookup error: ${message}`;

    logger.info({
      tool: "flight_lookup",
      arguments: input,
      result,
    });

    return result;
  }
}

export const flightLookupTool = tool(
  async (input) => runFlightLookup(input),
  {
    name: "flight_lookup",
    description:
      "Use this for live aircraft currently flying over a supported region or near an airport, or to look up a flight by callsign. Set location for places like Utah, SLC, or JFK. Set callsign for identifiers like UAL123.",
    schema: flightLookupInputSchema,
  },
);
