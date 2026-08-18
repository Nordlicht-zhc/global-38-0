import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_data(path, declaration):
    source = path.read_text(encoding="utf-8")
    payload = source.split(f"const {declaration} = ", 1)[1].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    return json.loads(payload)


def write_data(path, declaration, comment, data):
    output = (
        f"// {comment}\n"
        f"const {declaration} = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};\n"
    )
    path.write_text(output, encoding="utf-8", newline="\n")


def find_club(data, season, club_id):
    return next(club for club in data[season]["clubs"] if club["id"] == club_id)


def rename_by_position(club, old_name, position, new_name):
    old_names = {old_name} if isinstance(old_name, str) else set(old_name)
    matches = [
        player for player in club["players"]
        if player["name"] in old_names and position in player["pos"]
    ]
    if not matches:
        repaired = [
            player for player in club["players"]
            if player["name"] == new_name and position in player["pos"]
        ]
        if len(repaired) == 1:
            return
    if len(matches) != 1:
        raise RuntimeError(f"Expected one {old_name} ({position}), found {len(matches)}")
    matches[0]["name"] = new_name


def repair_legacy(data):
    for season in ("1997-98", "1998-99"):
        club = find_club(data, season, "real-valladolid-cf")
        rename_by_position(club, "Juan Carlos", "ST", "Juan Carlos Gómez")
        rename_by_position(club, "Juan Carlos", "LB", "Juan Carlos Rodríguez")

    cagliari = find_club(data, "1999-00", "cagliari-calcio")
    duplicates = [
        player for player in cagliari["players"]
        if player["name"] == "Nicola Di Liso" and player["rate"] == 72
    ]
    if len(duplicates) > 1:
        raise RuntimeError("Unexpected duplicated Nicola Diliso records")
    cagliari["players"] = [
        player for player in cagliari["players"]
        if not (player["name"] == "Nicola Di Liso" and player["rate"] == 72)
    ]
    if not any(player["name"] == "Nicola Diliso" for player in cagliari["players"]):
        raise RuntimeError("Expected the verified Nicola Diliso record")

    valladolid = find_club(data, "2000-01", "real-valladolid-cf")
    rename_by_position(valladolid, ("Fernando", "Fernando Sales"), "LM", "Fernando Sánchez")
    rename_by_position(valladolid, "Fernando", "CAM", "Fernando Fernández")


def repair_season_players(data):
    malaga = find_club(data, "2008-09", "malaga-cf")
    matches = [player for player in malaga["players"] if player["name"] == "Luque"]
    if not matches:
        repaired = {player["name"] for player in malaga["players"]}
        if {"Albert Luque", "José Juan Luque"}.issubset(repaired):
            return
    if sorted(player["rate"] for player in matches) != [70, 73]:
        raise RuntimeError("Unexpected 2008-09 Málaga Luque records")
    for player in matches:
        if player["rate"] == 73:
            player["name"] = "Albert Luque"
            player["pos"] = ["ST"]
        else:
            player["name"] = "José Juan Luque"
            player["pos"] = ["LM"]


def main():
    legacy_path = ROOT / "source-data" / "legacy-seasons.js"
    season_path = ROOT / "season-players.js"
    legacy = load_data(legacy_path, "LEGACY_SEASONS")
    seasons = load_data(season_path, "SEASON_PLAYERS")
    repair_legacy(legacy)
    repair_season_players(seasons)
    write_data(
        legacy_path,
        "LEGACY_SEASONS",
        "Historical FIFA ratings for seasons before the modern dataset.",
        legacy,
    )
    write_data(
        season_path,
        "SEASON_PLAYERS",
        "Real FIFA / EA Sports FC ratings, grouped by season and club.",
        seasons,
    )
    print("Repaired historical player identity collisions.")


if __name__ == "__main__":
    main()
