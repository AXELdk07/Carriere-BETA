# scripts/fetch_careers.py
import soccerdata as sd
import pandas as pd
import json
import os
from pathlib import Path

# Liste des 55 joueurs FIFPro World XI 2024
FIFPRO_PLAYERS = [
    # Gardiens
    "Alisson Becker", "Thibaut Courtois", "Gianluigi Donnarumma", "Ederson",
    # Défenseurs
    "Virgil van Dijk", "Rúben Dias", "William Saliba", "Antonio Rüdiger",
    "Achraf Hakimi", "Federico Dimarco", "Joško Gvardiol", "Ronald Araújo",
    "Trent Alexander-Arnold", "Nuno Mendes", "Pau Cubarsí", "Gabriel Magalhães",
    # Milieux
    "Rodri", "Jude Bellingham", "Pedri", "Florian Wirtz", "Vitinha",
    "Federico Valverde", "Declan Rice", "Bruno Fernandes", "Alexis Mac Allister",
    "Lautaro Martínez", "Martin Ødegaard", "Fabián Ruiz", "Martin Zubimendi",
    "Bernardo Silva", "Nicolò Barella", "Eduardo Camavinga", "João Neves",
    # Attaquants
    "Kylian Mbappé", "Lamine Yamal", "Erling Haaland", "Vinícius Júnior",
    "Harry Kane", "Mohamed Salah", "Cole Palmer", "Bukayo Saka", "Raphinha",
    "Phil Foden", "Jamal Musiala", "Robert Lewandowski", "Khvicha Kvaratskhelia",
    "Ousmane Dembélé", "Michael Olise", "Désiré Doué", "Victor Osimhen",
    "Alexander Isak", "Benjamin Šeško", "Julián Álvarez",
    # Légendes
    "Cristiano Ronaldo", "Lionel Messi"
]

def normalize_team(team):
    """Normalise les noms d'équipes"""
    if not team or pd.isna(team):
        return None
    
    replacements = {
        'Manchester City': ['Man City', 'Manchester City FC'],
        'Manchester United': ['Man Utd', 'Man United', 'Manchester Utd'],
        'FC Barcelona': ['Barcelona', 'Barça'],
        'Real Madrid': ['Real Madrid CF'],
        'Paris Saint-Germain': ['PSG', 'Paris SG', 'Paris S-G'],
        'Bayern Munich': ['Bayern München'],
        'Liverpool': ['Liverpool FC'],
        'Chelsea': ['Chelsea FC'],
        'Arsenal': ['Arsenal FC'],
        'Tottenham Hotspur': ['Tottenham', 'Spurs'],
        'Juventus': ['Juventus FC'],
        'AC Milan': ['Milan'],
        'Inter Milan': ['Internazionale', 'Inter'],
        'Borussia Dortmund': ['Dortmund'],
        'Atlético Madrid': ['Atletico Madrid'],
        'AS Monaco': ['Monaco'],
        'Napoli': ['SSC Napoli'],
        'AS Roma': ['Roma'],
        'Benfica': ['SL Benfica'],
        'Sporting CP': ['Sporting Lisbon'],
        'FC Porto': ['Porto'],
        'Al-Nassr': ['Al Nassr'],
        'Al-Hilal': ['Al Hilal'],
        'Al-Ittihad': ['Al Ittihad'],
        'Inter Miami CF': ['Inter Miami']
    }
    
    for canonical, aliases in replacements.items():
        for alias in aliases:
            if alias.lower() in team.lower():
                return canonical
    return team

def get_career_from_sources(player_name):
    """Récupère la carrière d'un joueur depuis plusieurs sources"""
    clubs = set()
    
    print(f"  📡 Recherche dans FBref...", end=" ")
    
    # Essayer différentes ligues
    leagues = [
        ('ENG-Premier League', ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']),
        ('ESP-La Liga', ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']),
        ('ITA-Serie A', ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']),
        ('GER-Bundesliga', ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']),
        ('FRA-Ligue 1', ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'])
    ]
    
    for league, seasons in leagues:
        try:
            fbref = sd.FBref(league, seasons)
            stats = fbref.read_player_season_stats(stat_type="standard")
            player_stats = stats[stats['player'] == player_name]
            
            if not player_stats.empty:
                for team in player_stats['team'].unique():
                    if pd.notna(team):
                        normalized = normalize_team(team)
                        if normalized:
                            clubs.add(normalized)
        except Exception as e:
            # Ignorer les erreurs et continuer
            pass
    
    # Si pas de clubs trouvés, essayer Understat
    if not clubs:
        print("❌ Aucun club trouvé dans FBref")
        print("  📡 Recherche dans Understat...", end=" ")
        try:
            understat = sd.Understat('ENG-Premier League', ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'])
            players = understat.read_player_season_stats()
            player_stats = players[players['player'] == player_name]
            
            if not player_stats.empty:
                for team in player_stats['team'].unique():
                    if pd.notna(team):
                        normalized = normalize_team(team)
                        if normalized:
                            clubs.add(normalized)
        except:
            pass
    
    # Si toujours rien, essayer MatchHistory
    if not clubs:
        print("❌ Aucun club trouvé dans Understat")
        print("  📡 Recherche dans MatchHistory...", end=" ")
        try:
            mh = sd.MatchHistory('ENG-Premier League', list(range(2015, 2025)))
            # MatchHistory n'a pas de données joueurs, donc on passe
        except:
            pass
    
    return list(clubs)

def main():
    print("=" * 60)
    print("⚽ Récupération des carrières des 55 joueurs FIFPro World XI")
    print("=" * 60)
    
    results = []
    player_id = 1
    found_count = 0
    
    for player in FIFPRO_PLAYERS:
        print(f"\n🔍 [{player_id:02d}/55] {player}")
        
        career = get_career_from_sources(player)
        
        if not career:
            print(f"  ❌ Aucune carrière trouvée pour {player}")
            career = ["Professional Club"]
        else:
            found_count += 1
            print(f"  ✅ {len(career)} clubs trouvés")
            print(f"     {', '.join(career[:5])}{'...' if len(career) > 5 else ''}")
        
        # Déterminer la difficulté
        if len(career) <= 3:
            difficulty = "easy"
        elif len(career) >= 6:
            difficulty = "hard"
        else:
            difficulty = "medium"
        
        results.append({
            "playerId": player_id,
            "name": player,
            "career": career,
            "difficulty": difficulty
        })
        player_id += 1
    
    # Sauvegarder dans players-data.ts
    project_root = Path(__file__).parent.parent
    output_path = project_root / 'src' / 'lib' / 'players-data.ts'
    
    # Créer les dossiers si nécessaire
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    ts_content = f'''export interface QuizPlayer {{
  playerId: number;
  name: string;
  career: string[];
  difficulty: "easy" | "medium" | "hard";
}}

// FIFPro World XI 2024 - {len(results)} joueurs
// Généré avec SoccerData le {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
export const PLAYERS_DATA: QuizPlayer[] = {json.dumps(results, indent=2, ensure_ascii=False)};
'''
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print("\n" + "=" * 60)
    print(f"✅ Fichier généré: {output_path}")
    print(f"📊 Total: {len(results)} joueurs")
    print(f"🎯 Joueurs avec carrière trouvée: {found_count}/{len(FIFPRO_PLAYERS)}")
    
    # Statistiques
    stats = {'easy': 0, 'medium': 0, 'hard': 0}
    for p in results:
        stats[p['difficulty']] += 1
    
    print(f"\n📊 Répartition par difficulté:")
    print(f"   🟢 Easy: {stats['easy']} joueurs")
    print(f"   🟡 Medium: {stats['medium']} joueurs")
    print(f"   🔴 Hard: {stats['hard']} joueurs")
    
    # Afficher les joueurs sans carrière
    no_career = [p for p in results if p['career'] == ["Professional Club"]]
    if no_career:
        print(f"\n⚠️ Joueurs sans carrière trouvée ({len(no_career)}):")
        for p in no_career:
            print(f"   - {p['name']}")

if __name__ == "__main__":
    main()