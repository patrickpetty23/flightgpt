#!/usr/bin/env bash

set -euo pipefail

echo "Running FlightGPT Phase 2 tool tests"
npm run build
npm run test:calculator
npm run test:web-search
