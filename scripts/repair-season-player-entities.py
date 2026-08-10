import csv
import html
import io
import json
import re
import time
import unicodedata
import urllib.request
from urllib.error import HTTPError
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parents[1] / "season-players.js"
CACHE_PATH = Path(__file__).resolve().with_name(".season-player-rating-cache.json")
SOURCE_CSV = "https://raw.githubusercontent.com/lbenz730/fifa_model/master/player_stats.csv"
FIFA_INDEX_READER = "https://r.jina.ai/http://fifaindex.com/player"
USER_AGENT = "Mozilla/5.0 (compatible; Global38DataRepair/1.0)"


def fetch_text(url, attempts=3, timeout=60):
    last_error = None
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(
                url,
                headers={"User-Agent": USER_AGENT, "Accept": "text/plain"},
            )
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.read().decode("utf-8")
        except Exception as error:
            last_error = error
            if attempt < attempts:
                if isinstance(error, HTTPError) and error.code == 429:
                    retry_after = int(error.headers.get("Retry-After", "30"))
                    time.sleep(max(retry_after, 30))
                else:
                    time.sleep(attempt)
    raise last_error


def load_season_players():
    source = DATA_PATH.read_text(encoding="utf-8")
    payload = source.split("const SEASON_PLAYERS = ", 1)[1].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    return json.loads(payload)


def normalize(value):
    decoded = html.unescape(str(value or ""))
    plain = "".join(
        char
        for char in unicodedata.normalize("NFD", decoded)
        if unicodedata.category(char) != "Mn"
    )
    return re.sub(r"[^a-z0-9]", "", plain.lower())


def fifa_version_for_season(season):
    return str(int(season[2:4]) + 1).zfill(2)


def find_polluted_players(data):
    polluted = []
    for season, entry in data.items():
        for club in entry.get("clubs", []):
            for player in club.get("players", []):
                if player.get("rate") == 39 and "&#39;" in player.get("name", ""):
                    polluted.append(
                        {
                            "season": season,
                            "club": club,
                            "player": player,
                            "version": fifa_version_for_season(season),
                        }
                    )
    return polluted


def map_player_ids(polluted):
    wanted = {
        (normalize(item["player"]["name"]), item["version"])
        for item in polluted
    }
    rows = []
    source = fetch_text(SOURCE_CSV, timeout=120)
    for row in csv.DictReader(io.StringIO(source)):
        key = (normalize(row["name"]), row["season"])
        if key in wanted:
            rows.append(
                {
                    "id": row["player_id"],
                    "name": html.unescape(row["name"]),
                    "season": row["season"],
                    "club": row["club"],
                }
            )

    for item in polluted:
        candidates = [
            row
            for row in rows
            if row["season"] == item["version"]
            and normalize(row["name"]) == normalize(item["player"]["name"])
        ]
        exact_club = [
            row
            for row in candidates
            if normalize(row["club"]) == normalize(item["club"]["name"])
        ]
        ids = sorted({row["id"] for row in (exact_club or candidates)})
        if len(ids) != 1:
            details = ", ".join(ids) or "no match"
            raise RuntimeError(
                f"Unable to identify {item['season']} {item['club']['name']} "
                f"{item['player']['name']}: {details}"
            )
        item["player_id"] = ids[0]


def parse_ratings(markdown):
    return {
        version.zfill(2): int(rating)
        for version, rating in re.findall(r"FIFA\s+(\d{1,2})\s+(\d{2})(?=[\]\s<])", markdown)
    }


def fetch_player_ratings(player_id, items):
    version = items[0]["version"]
    url = f"{FIFA_INDEX_READER}/{player_id}/x/fifa{version}/"
    required_versions = {item["version"] for item in items}
    ratings = {}
    for attempt in range(1, 4):
        ratings = parse_ratings(fetch_text(url))
        if required_versions.issubset(ratings):
            break
        if attempt < 3:
            time.sleep(attempt)
    repaired = []
    for item in items:
        rating = ratings.get(item["version"])
        if rating is None or not 40 <= rating <= 99:
            raise RuntimeError(
                f"Missing FIFA {item['version']} rating for player "
                f"{player_id} ({item['player']['name']})"
            )
        repaired.append((item, rating))
    return repaired, ratings


def fetch_all_ratings(polluted):
    groups = {}
    for item in polluted:
        groups.setdefault(item["player_id"], []).append(item)
    cache = json.loads(CACHE_PATH.read_text(encoding="utf-8")) if CACHE_PATH.exists() else {}
    results = []
    for completed, (player_id, items) in enumerate(groups.items(), start=1):
        required = {item["version"] for item in items}
        cached = {key: int(value) for key, value in cache.get(player_id, {}).items()}
        if required.issubset(cached):
            repaired = [(item, cached[item["version"]]) for item in items]
            source = "cache"
        else:
            repaired, ratings = fetch_player_ratings(player_id, items)
            cache[player_id] = ratings
            CACHE_PATH.write_text(json.dumps(cache, sort_keys=True), encoding="utf-8")
            source = "FIFA Index"
            time.sleep(3.2)
        results.extend(repaired)
        print(
            f"Verified ratings {completed}/{len(groups)} from {source}: {player_id}",
            flush=True,
        )
    return results


def main():
    data = load_season_players()
    polluted = find_polluted_players(data)
    if not polluted:
        print("No polluted season-player records found.")
        return

    map_player_ids(polluted)
    repaired = fetch_all_ratings(polluted)
    for item, rating in repaired:
        item["player"]["name"] = html.unescape(item["player"]["name"])
        item["player"]["rate"] = rating

    output = (
        "// Real FIFA / EA Sports FC ratings, grouped by season and club.\n"
        f"const SEASON_PLAYERS = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};\n"
    )
    DATA_PATH.write_text(output, encoding="utf-8", newline="\n")
    CACHE_PATH.unlink(missing_ok=True)
    print(f"Repaired {len(repaired)} polluted player records from FIFA Index.")


if __name__ == "__main__":
    main()
