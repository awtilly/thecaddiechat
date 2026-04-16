#!/usr/bin/env python3
"""
Flight Tracker — Scrapes AA.com award prices for CLT <> Ireland.
Runs via GitHub Actions cron or manually: python scripts/flight-tracker/scrape.py
"""

import json
import os
import sys
import time
import requests
from datetime import datetime, timedelta

# ── Configuration ─────────────────────────────────────────
# Adjust these to change what gets tracked.

ROUTES = [
    ("CLT", "DUB"),  # Outbound to Dublin
    ("CLT", "SNN"),  # Outbound to Shannon
    ("DUB", "CLT"),  # Return from Dublin
    ("SNN", "CLT"),  # Return from Shannon
]

DATE_START = "2026-06-01"
DATE_END = "2026-07-31"

PASSENGERS = 1

# Seconds between API calls — keep this >= 2 to be respectful
REQUEST_DELAY = 2

# Trim scan history older than this many days
HISTORY_DAYS = 45

# ── End Configuration ─────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
DATA_FILE = os.path.join(REPO_ROOT, "public", "data", "flight-tracker.json")

API_URL = "https://www.aa.com/booking/api/search/itinerary"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/133.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://www.aa.com",
    "Referer": "https://www.aa.com/booking/choose-flights/1",
}


def get_dates(start, end):
    """Generate date strings from start to end inclusive."""
    d = datetime.strptime(start, "%Y-%m-%d")
    end_d = datetime.strptime(end, "%Y-%m-%d")
    dates = []
    while d <= end_d:
        dates.append(d.strftime("%Y-%m-%d"))
        d += timedelta(days=1)
    return dates


def build_payload(origin, destination, date):
    return {
        "metadata": {"selectedProducts": [], "tripType": "OneWay", "udo": {}},
        "passengers": [{"type": "adult", "count": PASSENGERS}],
        "requestHeader": {"clientId": "AAcom"},
        "slices": [
            {
                "allCarriers": True,
                "cabin": "",
                "departureDate": date,
                "destination": destination,
                "destinationNearbyAirports": False,
                "maxStops": None,
                "origin": origin,
                "originNearbyAirports": False,
            }
        ],
        "tripOptions": {
            "corporateBooking": False,
            "fareType": "Lowest",
            "locale": "en_US",
            "searchType": "Award",
        },
        "loyaltyInfo": None,
        "version": "",
        "queryParams": {
            "sliceIndex": 0,
            "sessionId": "",
            "solutionSet": "",
            "solutionId": "",
            "sort": "CARRIER",
        },
    }


def search_award(origin, destination, date):
    """Hit AA API for award availability. Returns cheapest option or None."""
    payload = build_payload(origin, destination, date)
    try:
        resp = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"    ERROR: {e}")
        return None

    slices = data.get("slices", [])
    if not slices:
        return None

    cheapest = None
    for s in slices:
        pricing = s.get("pricingDetail", [])
        if not pricing:
            continue
        miles = pricing[0].get("perPassengerAwardPoints")
        if miles is None or miles == 0:
            continue

        segments = s.get("segments", [])
        stops = len(segments) - 1
        dep_time = ""
        if segments:
            raw = segments[0].get("departureDateTime", "")
            if "T" in raw:
                dep_time = raw.split("T")[1][:5]

        flight_nums = "/".join(
            seg.get("flight", {}).get("flightNumber", "?") for seg in segments
        )

        if cheapest is None or miles < cheapest["miles"]:
            cheapest = {
                "miles": miles,
                "stops": stops,
                "flight": flight_nums,
                "dep": dep_time,
            }

    return cheapest


def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []


def save_data(data):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, separators=(",", ":"))


def main():
    ts = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"Flight Tracker — {ts}")
    print(f"Routes: {len(ROUTES)} | Dates: {DATE_START} to {DATE_END}")
    print(f"Data file: {DATA_FILE}\n")

    data = load_data()
    dates = get_dates(DATE_START, DATE_END)
    new_entries = 0
    errors = 0

    for origin, dest in ROUTES:
        route_key = f"{origin}-{dest}"
        print(f"{route_key} ({len(dates)} dates)")

        for i, date in enumerate(dates):
            result = search_award(origin, dest, date)

            if result:
                data.append(
                    {
                        "ts": ts,
                        "route": route_key,
                        "date": date,
                        "miles": result["miles"],
                        "stops": result["stops"],
                        "flight": result["flight"],
                        "dep": result["dep"],
                    }
                )
                new_entries += 1
                print(f"  {date}: {result['miles']:>7,} mi  {result['stops']}stop  {result['flight']}")
            else:
                errors += 1
                print(f"  {date}: --")

            # Progress every 10 dates
            if (i + 1) % 10 == 0:
                print(f"  ... {i + 1}/{len(dates)} dates scanned")

            if i < len(dates) - 1:
                time.sleep(REQUEST_DELAY)

        # Small pause between routes
        time.sleep(REQUEST_DELAY)

    # Trim old history
    cutoff = (datetime.utcnow() - timedelta(days=HISTORY_DAYS)).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    before = len(data)
    data = [d for d in data if d["ts"] >= cutoff]
    trimmed = before - len(data)

    save_data(data)

    print(f"\nDone.")
    print(f"  New entries:  {new_entries}")
    print(f"  Errors/empty: {errors}")
    print(f"  Trimmed old:  {trimmed}")
    print(f"  Total stored: {len(data)}")


if __name__ == "__main__":
    main()
