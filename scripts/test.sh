#!/usr/bin/env bash

set -euo pipefail

echo "Running FlightGPT tool tests"
npm run build
npm run test:calculator
npm run test:web-search
npm run test:knowledge-base
