# -*- coding: utf-8 -*-
# scripts/fetch_careers_soccerdata.py
"""
Recuperation des carrieres des 55 joueurs FIFPro World XI 2024 via FBref.
Compatible Python 3.8 + Windows.

Usage : python scripts/fetch_careers_soccerdata.py
"""

from __future__ import annotations

import io
import json
import random
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd
import soccerdata as sd

# Forcer UTF-8 sur la sortie standard (Windows cp1252 sinon)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ---------------------------------------------------------------------------
# Liste des 55 joueurs FIFPro World XI 2024
# ---------------------------------------------------------------------------

FIFPRO_PLAYERS = [
    # Gardiens
    "Alisson Becker", "Thibaut Courtois", "Gianluigi Donnarumma", "Ederson",
    # Defenseurs
    "Virgil van Dijk", "Ruben Dias", "William Saliba", "Antonio Rudiger",
    "Achraf Hakimi", "Federico Dimarco", "Josko Gvardiol", "Ronald Araujo",
    "Trent Alexander-Arnold", "Nuno Mendes", "Pau Cubarsi", "Gabriel Magalhaes",
    # Milieux
    "Rodri", "Jude Bellingham", "Pedri", "Florian Wirtz", "Vitinha",
    "Federico Valverde", "Declan Rice", "Bruno Fernandes", "Alexis Mac Allister",
    "Lautaro Martinez", "Martin Odegaard", "Fabian Ruiz", "Martin Zubimendi",
    "Bernardo Silva", "Nicolo Barella", "Eduardo Camavinga", "Joao Neves",
    # Attaquants
    "Kylian Mbappe", "Lamine Yamal", "Erling Haaland", "Vinicius Junior",
    "Harry Kane", "Mohamed Salah", "Cole Palmer", "Bukayo Saka", "Raphinha",
    "Phil Foden", "Jamal Musiala", "Robert Lewandowski", "Khvicha Kvaratskhelia",
    "Ousmane Dembele", "Michael Olise", "Desire Doue", "Victor Osimhen",
    "Alexander Isak", "Benjamin Sesko", "Julian Alvarez",
    # Legendes
    "Cristiano Ronaldo", "Lionel Messi",
]

# Noms affichage (avec accents) — correspondance index -> nom beau
DISPLAY_NAMES = {
    "Ruben Dias":           "Rúben Dias",
    "Antonio Rudiger":      "Antonio Rüdiger",
    "Josko Gvardiol":       "Joško Gvardiol",
    "Ronald Araujo":        "Ronald Araújo",
    "Pau Cubarsi":          "Pau Cubarsí",
    "Gabriel Magalhaes":    "Gabriel Magalhães",
    "Martin Odegaard":      "Martin Ødegaard",
    "Fabian Ruiz":          "Fabián Ruiz",
    "Nicolo Barella":       "Nicolò Barella",
    "Joao Neves":           "João Neves",
    "Kylian Mbappe":        "Kylian Mbappé",
    "Vinicius Junior":      "Vinícius Júnior",
    "Lautaro Martinez":     "Lautaro Martínez",
    "Ousmane Dembele":      "Ousmane Dembélé",
    "Desire Doue":          "Désiré Doué",
    "Benjamin Sesko":       "Benjamin Šeško",
    "Julian Alvarez":       "Julián Álvarez",
}

def display_name(search_name):
    """Retourne le nom d'affichage (avec accents) depuis le nom de recherche."""
    return DISPLAY_NAMES.get(search_name, search_name)

# ---------------------------------------------------------------------------
# Donnees statiques de secours (verifiees sur Transfermarkt / Wikipedia)
# Utilisees si FBref ne trouve pas le joueur (clubs hors Top 5 ou hors periode)
# ---------------------------------------------------------------------------

STATIC_CAREERS = {
    "Alisson Becker":       ["Internacional", "AS Roma", "Liverpool"],
    "Thibaut Courtois":     ["Genk", "Atletico Madrid", "Chelsea", "Real Madrid"],
    "Gianluigi Donnarumma": ["AC Milan", "Paris Saint-Germain"],
    "Ederson":              ["Benfica", "Manchester City"],
    "Virgil van Dijk":      ["Groningen", "Celtic", "Southampton", "Liverpool"],
    "Ruben Dias":           ["Benfica", "Manchester City"],
    "William Saliba":       ["Saint-Etienne", "Arsenal", "Nice", "Marseille"],
    "Antonio Rudiger":      ["VfB Stuttgart", "AS Roma", "Chelsea", "Real Madrid"],
    "Achraf Hakimi":        ["Real Madrid", "Borussia Dortmund", "Inter Milan", "Paris Saint-Germain"],
    "Federico Dimarco":     ["Inter Milan", "Ascoli", "Empoli", "Sion", "Parma", "Hellas Verona"],
    "Josko Gvardiol":       ["Dinamo Zagreb", "RB Leipzig", "Manchester City"],
    "Ronald Araujo":        ["Boston River", "FC Barcelona"],
    "Trent Alexander-Arnold": ["Liverpool"],
    "Nuno Mendes":          ["Sporting CP", "Paris Saint-Germain"],
    "Pau Cubarsi":          ["FC Barcelona"],
    "Gabriel Magalhaes":    ["Avai", "Toulouse", "Lille", "Arsenal"],
    "Rodri":                ["Villarreal", "Atletico Madrid", "Manchester City"],
    "Jude Bellingham":      ["Birmingham City", "Borussia Dortmund", "Real Madrid"],
    "Pedri":                ["Las Palmas", "FC Barcelona"],
    "Florian Wirtz":        ["Bayer Leverkusen"],
    "Vitinha":              ["FC Porto", "Wolverhampton", "Paris Saint-Germain"],
    "Federico Valverde":    ["Penarol", "Real Madrid", "Deportivo La Coruna"],
    "Declan Rice":          ["West Ham United", "Arsenal"],
    "Bruno Fernandes":      ["Novara", "Udinese", "Sampdoria", "Sporting CP", "Manchester United"],
    "Alexis Mac Allister":  ["Argentinos Juniors", "Boca Juniors", "Brighton", "Liverpool"],
    "Lautaro Martinez":     ["Racing Club", "Inter Milan"],
    "Martin Odegaard":      ["Stromsgodset", "Real Madrid", "Heerenveen", "Vitesse", "Real Sociedad", "Arsenal"],
    "Fabian Ruiz":          ["Real Betis", "Elche", "Napoli", "Paris Saint-Germain"],
    "Martin Zubimendi":     ["Real Sociedad"],
    "Bernardo Silva":       ["Benfica", "AS Monaco", "Manchester City"],
    "Nicolo Barella":       ["Cagliari", "Como", "Inter Milan"],
    "Eduardo Camavinga":    ["Rennes", "Real Madrid"],
    "Joao Neves":           ["Benfica", "Paris Saint-Germain"],
    "Kylian Mbappe":        ["AS Monaco", "Paris Saint-Germain", "Real Madrid"],
    "Lamine Yamal":         ["FC Barcelona"],
    "Erling Haaland":       ["Bryne FK", "Molde FK", "Red Bull Salzburg", "Borussia Dortmund", "Manchester City"],
    "Vinicius Junior":      ["Flamengo", "Real Madrid"],
    "Harry Kane":           ["Tottenham Hotspur", "Leyton Orient", "Millwall", "Norwich City", "Leicester City", "Bayern Munich"],
    "Mohamed Salah":        ["Al Mokawloon", "Basel", "Chelsea", "Fiorentina", "AS Roma", "Liverpool"],
    "Cole Palmer":          ["Manchester City", "Chelsea"],
    "Bukayo Saka":          ["Arsenal"],
    "Raphinha":             ["Vitoria de Guimaraes", "Sporting CP", "Rennes", "Leeds United", "FC Barcelona"],
    "Phil Foden":           ["Manchester City"],
    "Jamal Musiala":        ["Chelsea", "Bayern Munich"],
    "Robert Lewandowski":   ["Znicz Pruszkow", "Lech Poznan", "Borussia Dortmund", "Bayern Munich", "FC Barcelona"],
    "Khvicha Kvaratskhelia": ["Dinamo Tbilisi", "Rustavi", "Lokomotiv Moscow", "Rubin Kazan", "Dinamo Batumi", "Napoli", "Paris Saint-Germain"],
    "Ousmane Dembele":      ["Rennes", "Borussia Dortmund", "FC Barcelona", "Paris Saint-Germain"],
    "Michael Olise":        ["Reading", "Crystal Palace", "Bayern Munich"],
    "Desire Doue":          ["Rennes", "Paris Saint-Germain"],
    "Victor Osimhen":       ["Wolfsburg", "Charleroi", "Lille", "Napoli", "Galatasaray"],
    "Alexander Isak":       ["AIK", "Borussia Dortmund", "Willem II", "Real Sociedad", "Newcastle United"],
    "Benjamin Sesko":       ["NK Domzale", "Red Bull Salzburg", "RB Leipzig"],
    "Julian Alvarez":       ["River Plate", "Manchester City", "Atletico Madrid"],
    "Cristiano Ronaldo":    ["Sporting CP", "Manchester United", "Real Madrid", "Juventus", "Al-Nassr"],
    "Lionel Messi":         ["FC Barcelona", "Paris Saint-Germain", "Inter Miami CF"],
}  # type: Dict[str, List[str]]

# ---------------------------------------------------------------------------
# Normalisation des noms d'equipes
# ---------------------------------------------------------------------------

TEAM_ALIASES = {
    "Manchester City":      ["Man City", "Manchester City FC", "Man. City"],
    "Manchester United":    ["Man Utd", "Man United", "Manchester Utd"],
    "FC Barcelona":         ["Barcelona", "Barca", "Barcelone"],
    "Real Madrid":          ["Real Madrid CF"],
    "Paris Saint-Germain":  ["PSG", "Paris SG", "Paris S-G", "Paris Saint Germain"],
    "Bayern Munich":        ["Bayern Munchen", "FC Bayern Munchen", "FC Bayern", "Bayern München", "FC Bayern München"],
    "Liverpool":            ["Liverpool FC"],
    "Chelsea":              ["Chelsea FC"],
    "Arsenal":              ["Arsenal FC"],
    "Tottenham Hotspur":    ["Tottenham", "Spurs", "Tottenham Hotspur FC"],
    "Juventus":             ["Juventus FC"],
    "AC Milan":             ["Milan", "A.C. Milan"],
    "Inter Milan":          ["Internazionale", "Inter", "FC Internazionale"],
    "Borussia Dortmund":    ["Dortmund", "BVB", "BVB 09"],
    "Atletico Madrid":      ["Atletico de Madrid", "Atlético Madrid", "Atlético de Madrid"],
    "AS Monaco":            ["Monaco", "AS Monaco FC"],
    "Napoli":               ["SSC Napoli"],
    "AS Roma":              ["Roma", "A.S. Roma"],
    "Benfica":              ["SL Benfica", "Sport Lisboa e Benfica"],
    "Sporting CP":          ["Sporting Lisbon", "Sporting de Lisboa"],
    "FC Porto":             ["Porto"],
    "Al-Nassr":             ["Al Nassr", "Al-Nassr FC"],
    "Al-Hilal":             ["Al Hilal", "Al-Hilal SFC"],
    "RB Leipzig":           ["Leipzig", "RasenBallsport Leipzig"],
    "Red Bull Salzburg":    ["RB Salzburg", "FC Red Bull Salzburg"],
    "Bayer Leverkusen":     ["Leverkusen"],
    "Wolverhampton":        ["Wolves", "Wolverhampton Wanderers"],
    "West Ham United":      ["West Ham", "West Ham United FC"],
    "Newcastle United":     ["Newcastle", "Newcastle United FC"],
    "Inter Miami CF":       ["Inter Miami"],
    "Aston Villa":          ["Aston Villa FC"],
    "Leicester City":       ["Leicester"],
    "Real Sociedad":        ["Real Sociedad de Futbol"],
    "Hellas Verona":        ["Verona"],
}  # type: Dict[str, List[str]]


def normalize_team(team):
    # type: (str) -> Optional[str]
    """Normalise un nom d'equipe vers sa forme canonique."""
    if not team:
        return None
    try:
        if pd.isna(team):
            return None
    except Exception:
        pass

    team = str(team).strip()

    for canonical, aliases in TEAM_ALIASES.items():
        if team.lower() == canonical.lower():
            return canonical
        for alias in aliases:
            if alias.lower() == team.lower():
                return canonical

    # Nettoyage léger
    for suffix in [" FC", " CF", " S.A.D.", " AFC", " F.C."]:
        if team.endswith(suffix):
            team = team[: -len(suffix)].strip()

    return team if team else None


# ---------------------------------------------------------------------------
# Ligues et saisons a scanner
# ---------------------------------------------------------------------------

LEAGUES_TO_SCAN = [
    "ENG-Premier League",
    "ESP-La Liga",
    "ITA-Serie A",
    "GER-Bundesliga",
    "FRA-Ligue 1",
]

# "2024" = saison 2023-24, format accepte par FBref v1.3.x
SEASONS_TO_SCAN = ["2018", "2019", "2020", "2021", "2022", "2023", "2024"]


# ---------------------------------------------------------------------------
# Construction de l'index FBref
# ---------------------------------------------------------------------------

def build_fbref_index():
    # type: () -> Optional[pd.DataFrame]
    """
    Construit un DataFrame unique avec toutes les stats joueurs
    pour toutes les ligues et saisons. Evite N x M appels API.
    Colonnes resultantes : player, team, league.
    """
    frames = []

    for league in LEAGUES_TO_SCAN:
        print("\n  [FBREF] {} ...".format(league), end=" ")
        sys.stdout.flush()

        try:
            fbref = sd.FBref(
                leagues=league,
                seasons=SEASONS_TO_SCAN,
            )

            stats = fbref.read_player_season_stats(stat_type="standard")
            stats = stats.reset_index()

            # Detecter les colonnes player et team (noms varient selon version)
            col_player = None
            col_team = None
            for c in stats.columns:
                lc = str(c).lower()
                if "player" in lc and col_player is None:
                    col_player = c
                if lc in ("team", "squad", "club") and col_team is None:
                    col_team = c

            if col_player is None or col_team is None:
                print("[WARN] Colonnes introuvables : {}".format(list(stats.columns)[:8]))
                continue

            subset = stats[[col_player, col_team]].copy()
            subset.columns = ["player", "team"]
            subset["league"] = league
            frames.append(subset)
            print("OK - {} lignes".format(len(subset)))

        except Exception as exc:
            print("[ERREUR] {}".format(str(exc)[:100]))

        # Pause entre requetes pour eviter le rate-limiting
        wait = random.uniform(3, 6)
        print("  Pause {:.1f}s...".format(wait))
        time.sleep(wait)

    if not frames:
        return None

    return pd.concat(frames, ignore_index=True)


# ---------------------------------------------------------------------------
# Extraction de la carriere d'un joueur depuis l'index
# ---------------------------------------------------------------------------

def get_career_from_index(player_search, index):
    # type: (str, pd.DataFrame) -> List[str]
    """
    Cherche un joueur dans l'index FBref (recherche approximative)
    et retourne la liste de ses clubs (normalises, sans doublons).
    """
    clubs = []
    seen = set()

    # Recherche exacte d'abord
    mask = index["player"].str.lower() == player_search.lower()

    # Si pas trouve, recherche partielle (ex: "Mbappe" trouve "Kylian Mbappé")
    if not mask.any():
        # Prendre le premier mot du nom de recherche
        first_word = player_search.split()[0].lower()
        last_word = player_search.split()[-1].lower()
        mask = (
            index["player"].str.lower().str.contains(first_word, na=False)
            | index["player"].str.lower().str.contains(last_word, na=False)
        )

    rows = index[mask]

    for team_raw in rows["team"].dropna().unique():
        norm = normalize_team(str(team_raw))
        if norm and norm not in seen:
            seen.add(norm)
            clubs.append(norm)

    return clubs


# ---------------------------------------------------------------------------
# Calcul de la difficulte
# ---------------------------------------------------------------------------

def determine_difficulty(career):
    # type: (List[str]) -> str
    n = len(career)
    if n <= 2:
        return "easy"
    elif n >= 5:
        return "hard"
    else:
        return "medium"


# ---------------------------------------------------------------------------
# Programme principal
# ---------------------------------------------------------------------------

def main():
    print("=" * 70)
    print("FIFPro World XI 2024 - Recuperation des carrieres via FBref")
    print("=" * 70)
    print("\nConstruction de l'index FBref (5-10 min selon connexion)...\n")

    # 1. Construire l'index FBref une seule fois
    fbref_index = build_fbref_index()

    if fbref_index is None or fbref_index.empty:
        print("\n[ATTENTION] FBref inaccessible - utilisation des donnees statiques.\n")
        fbref_index = None
    else:
        total_rows = len(fbref_index)
        total_players = fbref_index["player"].nunique()
        print("\nIndex FBref construit : {} lignes, {} joueurs distincts".format(
            total_rows, total_players))

    # 2. Construire les resultats pour chaque joueur
    results = []
    found_fbref = 0
    found_static = 0

    for idx, search_name in enumerate(FIFPRO_PLAYERS, start=1):
        pretty = display_name(search_name)
        print("\n[{:02d}/55] {}".format(idx, pretty))

        career = []

        # Tentative FBref
        if fbref_index is not None:
            career = get_career_from_index(search_name, fbref_index)
            if career:
                found_fbref += 1
                print("  [FBREF]   -> {}".format(", ".join(career)))

        # Fallback donnees statiques si FBref ne trouve rien
        if not career:
            career = STATIC_CAREERS.get(search_name, [])
            if career:
                found_static += 1
                print("  [STATIC]  -> {}".format(", ".join(career)))
            else:
                print("  [MANQUE]  Aucune donnee !")
                career = ["Club professionnel"]

        difficulty = determine_difficulty(career)

        results.append({
            "playerId":   idx,
            "name":       pretty,
            "career":     career,
            "difficulty": difficulty,
        })

    # 3. Ecrire le fichier TypeScript
    project_root = Path(__file__).parent.parent
    output_path = project_root / "src" / "lib" / "players-data.ts"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    now = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    source_note = "FBref + donnees statiques" if found_fbref > 0 else "Donnees statiques uniquement"

    json_data = json.dumps(results, indent=2, ensure_ascii=False)

    ts_content = (
        'export interface QuizPlayer {\n'
        '  playerId: number;\n'
        '  name: string;\n'
        '  career: string[];\n'
        '  difficulty: "easy" | "medium" | "hard";\n'
        '}\n'
        '\n'
        '// FIFPro World XI 2024 - 55 joueurs\n'
        '// Source : ' + source_note + ' | Genere le ' + now + '\n'
        'export const PLAYERS_DATA: QuizPlayer[] = ' + json_data + ';\n'
    )

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(ts_content)

    # 4. Rapport
    print("\n" + "=" * 70)
    print("Fichier genere : {}".format(output_path))
    print("Total          : {} joueurs".format(len(results)))
    print("Via FBref      : {}".format(found_fbref))
    print("Via statique   : {}".format(found_static))

    diff_stats = {"easy": 0, "medium": 0, "hard": 0}
    for p in results:
        diff_stats[p["difficulty"]] += 1
    print("\nDifficulte :")
    print("  Easy   : {}".format(diff_stats["easy"]))
    print("  Medium : {}".format(diff_stats["medium"]))
    print("  Hard   : {}".format(diff_stats["hard"]))

    missing = [p for p in results if p["career"] == ["Club professionnel"]]
    if missing:
        print("\n[ATTENTION] Joueurs sans donnees ({}) :".format(len(missing)))
        for p in missing:
            print("  - {}".format(p["name"]))
    else:
        print("\nTous les joueurs ont une carriere. OK !")


if __name__ == "__main__":
    main()