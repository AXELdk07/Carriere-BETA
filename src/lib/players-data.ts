export interface QuizPlayer {
  playerId: number;
  name: string;
  career: string[];
}

// FIFPro World XI 2024 – 55 joueurs
// Carrières complètes et chronologiques (incluant prêts et retours en club)
// Sources : Transfermarkt, Wikipedia, sites officiels
export const PLAYERS_DATA: QuizPlayer[] = [
  {
    "playerId": 1,
    "name": "Alisson Becker",
    "career": ["Internacional", "AS Roma", "Liverpool"]
  },
  {
    "playerId": 2,
    "name": "Thibaut Courtois",
    "career": ["Genk", "Chelsea", "Atlético Madrid", "Chelsea", "Real Madrid"]
  },
  {
    "playerId": 3,
    "name": "Gianluigi Donnarumma",
    "career": ["AC Milan", "Paris Saint-Germain"]
  },
  {
    "playerId": 4,
    "name": "Ederson",
    "career": ["Rio Ave", "Benfica", "Manchester City"]
  },
  {
    "playerId": 5,
    "name": "Virgil van Dijk",
    "career": ["Groningen", "Celtic", "Southampton", "Liverpool"]
  },
  {
    "playerId": 6,
    "name": "Rúben Dias",
    "career": ["Benfica", "Manchester City"]
  },
  {
    "playerId": 7,
    "name": "William Saliba",
    "career": ["Saint-Étienne", "Arsenal", "Nice", "Marseille", "Arsenal"]
  },
  {
    "playerId": 8,
    "name": "Antonio Rüdiger",
    "career": ["VfB Stuttgart", "AS Roma", "Chelsea", "Real Madrid"]
  },
  {
    "playerId": 9,
    "name": "Achraf Hakimi",
    "career": ["Real Madrid", "Borussia Dortmund", "Inter Milan", "Paris Saint-Germain"]
  },
  {
    "playerId": 10,
    "name": "Federico Dimarco",
    "career": ["Inter Milan", "Ascoli", "Empoli", "Sion", "Inter Milan", "Parma", "Hellas Verona", "Inter Milan"]
  },
  {
    "playerId": 11,
    "name": "Joško Gvardiol",
    "career": ["Dinamo Zagreb", "RB Leipzig", "Manchester City"]
  },
  {
    "playerId": 12,
    "name": "Ronald Araújo",
    "career": ["Boston River", "FC Barcelona"]
  },
  {
    "playerId": 13,
    "name": "Trent Alexander-Arnold",
    "career": ["Liverpool", "Real Madrid"]
  },
  {
    "playerId": 14,
    "name": "Nuno Mendes",
    "career": ["Sporting CP", "Paris Saint-Germain"]
  },
  {
    "playerId": 15,
    "name": "Pau Cubarsí",
    "career": ["FC Barcelona"]
  },
  {
    "playerId": 16,
    "name": "Gabriel Magalhães",
    "career": ["Avaí", "Lille", "Troyes", "Dinamo Zagreb", "Lille", "Arsenal"]
    
  },
  {
    "playerId": 17,
    "name": "Rodri",
    "career": ["Villarreal", "Atlético Madrid", "Manchester City"]
  },
  {
    "playerId": 18,
    "name": "Jude Bellingham",
    "career": ["Birmingham City", "Borussia Dortmund", "Real Madrid"]
  },
  {
    "playerId": 19,
    "name": "Pedri",
    "career": ["Las Palmas", "FC Barcelona"]
  },
  {
    "playerId": 20,
    "name": "Florian Wirtz",
    "career": ["Bayer Leverkusen"]
  },
  {
    "playerId": 21,
    "name": "Vitinha",
    "career": ["FC Porto", "Wolverhampton", "FC Porto", "Paris Saint-Germain"]
  },
  {
    "playerId": 22,
    "name": "Federico Valverde",
    "career": ["Peñarol", "Real Madrid", "Deportivo La Coruña", "Real Madrid"]
  },
  {
    "playerId": 23,
    "name": "Declan Rice",
    "career": ["West Ham United", "Arsenal"]
  },
  {
    "playerId": 24,
    "name": "Bruno Fernandes",
    "career": ["Novara", "Udinese", "Sampdoria", "Sporting CP", "Manchester United"]
  },
  {
    "playerId": 25,
    "name": "Alexis Mac Allister",
    "career": ["Argentinos Juniors", "Boca Juniors", "Brighton", "Liverpool"]
  },
  {
    "playerId": 26,
    "name": "Lautaro Martínez",
    "career": ["Racing Club", "Inter Milan"]
  },
  {
    "playerId": 27,
    "name": "Martin Ødegaard",
    "career": ["Strømsgodset", "Real Madrid", "Heerenveen", "Vitesse", "Real Sociedad", "Arsenal"]
  },
  {
    "playerId": 28,
    "name": "Fabián Ruiz",
    "career": ["Real Betis", "Elche", "Napoli", "Paris Saint-Germain"]
  },
  {
    "playerId": 29,
    "name": "Martin Zubimendi",
    "career": ["Real Sociedad"]
  },
  {
    "playerId": 30,
    "name": "Bernardo Silva",
    "career": ["Benfica", "AS Monaco", "Manchester City"]
  },
  {
    "playerId": 31,
    "name": "Nicolò Barella",
    "career": ["Cagliari", "Como", "Cagliari", "Inter Milan"]
  },
  {
    "playerId": 32,
    "name": "Eduardo Camavinga",
    "career": ["Rennes", "Real Madrid"]
  },
  {
    "playerId": 33,
    "name": "João Neves",
    "career": ["Benfica", "Paris Saint-Germain"]
  },
  {
    "playerId": 34,
    "name": "Kylian Mbappé",
    "career": ["AS Monaco", "Paris Saint-Germain", "Real Madrid"]
  },
  {
    "playerId": 35,
    "name": "Lamine Yamal",
    "career": ["FC Barcelona"]
  },
  {
    "playerId": 36,
    "name": "Erling Haaland",
    "career": ["Bryne FK", "Molde FK", "Red Bull Salzburg", "Borussia Dortmund", "Manchester City"]
  },
  {
    "playerId": 37,
    "name": "Vinícius Júnior",
    "career": ["Flamengo", "Real Madrid"]
  },
  {
    "playerId": 38,
    "name": "Harry Kane",
    "career": ["Tottenham Hotspur", "Leyton Orient", "Millwall", "Norwich City", "Leicester City", "Tottenham Hotspur", "Bayern Munich"]
  },
  {
    "playerId": 39,
    "name": "Mohamed Salah",
    "career": ["Al Mokawloon", "Basel", "Chelsea", "Fiorentina", "AS Roma", "Liverpool"]
  },
  {
    "playerId": 40,
    "name": "Cole Palmer",
    "career": ["Manchester City", "Chelsea"]
  },
  {
    "playerId": 41,
    "name": "Bukayo Saka",
    "career": ["Arsenal"]
  },
  {
    "playerId": 42,
    "name": "Raphinha",
    "career": ["Vitória de Guimarães", "Sporting CP", "Rennes", "Leeds United", "FC Barcelona"]
  },
  {
    "playerId": 43,
    "name": "Phil Foden",
    "career": ["Manchester City"]
  },
  {
    "playerId": 44,
    "name": "Jamal Musiala",
    "career": ["Chelsea", "Bayern Munich"]
  },
  {
    "playerId": 45,
    "name": "Robert Lewandowski",
    "career": ["Znicz Pruszków", "Lech Poznań", "Borussia Dortmund", "Bayern Munich", "FC Barcelona"]
  },
  {
    "playerId": 46,
    "name": "Khvicha Kvaratskhelia",
    "career": ["Dinamo Tbilisi", "Rustavi", "Lokomotiv Moscow", "Rubin Kazan", "Dinamo Batumi", "Napoli", "Paris Saint-Germain"]
  },
  {
    "playerId": 47,
    "name": "Ousmane Dembélé",
    "career": ["Rennes", "Borussia Dortmund", "FC Barcelona", "Paris Saint-Germain"]
  },
  {
    "playerId": 48,
    "name": "Michael Olise",
    "career": ["Reading", "Crystal Palace", "Bayern Munich"]
  },
  {
    "playerId": 49,
    "name": "Désiré Doué",
    "career": ["Rennes", "Paris Saint-Germain"]
  },
  {
    "playerId": 50,
    "name": "Victor Osimhen",
    "career": ["Wolfsburg", "Charleroi", "Lille", "Napoli", "Galatasaray"]
  },
  {
    "playerId": 51,
    "name": "Alexander Isak",
    "career": ["AIK", "Borussia Dortmund", "Willem II", "Real Sociedad", "Newcastle United"]
  },
  {
    "playerId": 52,
    "name": "Benjamin Šeško",
    "career": ["NK Domžale", "Red Bull Salzburg", "RB Leipzig"]
  },
  {
    "playerId": 53,
    "name": "Julián Álvarez",
    "career": ["River Plate", "Manchester City", "Atlético Madrid"]
  },
  {
    "playerId": 54,
    "name": "Cristiano Ronaldo",
    "career": ["Sporting CP", "Manchester United", "Real Madrid", "Juventus", "Manchester United", "Al-Nassr"]
  },
  {
    "playerId": 55,
    "name": "Lionel Messi",
    "career": ["FC Barcelona", "Paris Saint-Germain", "Inter Miami CF"]
  },
  {
    "playerId": 56,
    "name": "Neymar",
    "career": ["Santos", "FC Barcelona", "Paris Saint-Germain", "Al-Hilal", "Santos"]
  },
  {
    "playerId": 57,
    "name": "Kevin De Bruyne",
    "career": ["Genk", "Chelsea", "Werder Bremen", "Chelsea", "VfL Wolfsburg", "Manchester City", "Napoli"]
  },
  {
    "playerId": 58,
    "name": "Luka Modrić",
    "career": ["Dinamo Zagreb", "Zrinjski Mostar", "Inter Zaprešić", "Dinamo Zagreb", "Tottenham Hotspur", "Real Madrid", "AC Milan"]
  },
  {
    "playerId": 59,
    "name": "Karim Benzema",
    "career": ["Olympique Lyonnais", "Real Madrid", "Al-Ittihad"]
  },
  {
    "playerId": 60,
    "name": "Sergio Ramos",
    "career": ["Sevilla", "Real Madrid", "Paris Saint-Germain", "Sevilla", "Monterrey"]
  },
  {
    "playerId": 61,
    "name": "Antoine Griezmann",
    "career": ["Real Sociedad", "Atlético Madrid", "FC Barcelona", "Atlético Madrid", "Orlando City"]
  },
  {
    "playerId": 62,
    "name": "Son Heung-min",
    "career": ["Hamburger SV", "Bayer Leverkusen", "Tottenham Hotspur", "Los Angeles FC"]
  },
  {
    "playerId": 63,
    "name": "Toni Kroos",
    "career": ["Bayern Munich", "Bayer Leverkusen", "Bayern Munich", "Real Madrid"]
  },
  {
    "playerId": 64,
    "name": "Manuel Neuer",
    "career": ["Schalke 04", "Bayern Munich"]
  },
  {
    "playerId": 65,
    "name": "Thomas Müller",
    "career": ["Bayern Munich"]
  },
  {
    "playerId": 66,
    "name": "Gareth Bale",
    "career": ["Southampton", "Tottenham Hotspur", "Real Madrid", "Tottenham Hotspur", "Los Angeles FC"]
  },
  {
    "playerId": 67,
    "name": "Luis Suárez",
    "career": ["Nacional", "Groningen", "Ajax", "Liverpool", "FC Barcelona", "Atlético Madrid", "Grêmio", "Inter Miami CF"]
  },
  {
    "playerId": 68,
    "name": "Zlatan Ibrahimović",
    "career": ["Malmö FF", "Ajax", "Juventus", "Inter Milan", "FC Barcelona", "AC Milan", "Paris Saint-Germain", "Manchester United", "LA Galaxy", "AC Milan"]
  },
  {
    "playerId": 69,
    "name": "Paulo Dybala",
    "career": ["Instituto", "Palermo", "Juventus", "AS Roma"]
  },
  {
    "playerId": 70,
    "name": "Romelu Lukaku",
    "career": ["Anderlecht", "Chelsea", "West Bromwich Albion", "Everton", "Manchester United", "Inter Milan", "Chelsea", "Inter Milan", "AS Roma", "Napoli"]
  },
  {
    "playerId": 71,
    "name": "Sadio Mané",
    "career": ["Metz", "Red Bull Salzburg", "Southampton", "Liverpool", "Bayern Munich", "Al-Nassr"]
  },
  {
    "playerId": 72,
    "name": "Raheem Sterling",
    "career": ["Liverpool", "Manchester City", "Chelsea", "Arsenal", "Chelsea", "Feyenoord"]
  },
  {
    "playerId": 73,
    "name": "Kai Havertz",
    "career": ["Bayer Leverkusen", "Chelsea", "Arsenal"]
  },
  {
    "playerId": 74,
    "name": "Marcus Rashford",
    "career": ["Manchester United", "Aston Villa", "FC Barcelona", "Manchester United"]
  },
  {
    "playerId": 75,
    "name": "João Félix",
    "career": ["Benfica", "Atlético Madrid", "Chelsea", "FC Barcelona", "Chelsea", "AC Milan", "Al-Nassr"]
  },
  {
    "playerId": 76,
    "name": "Casemiro",
    "career": ["São Paulo", "Real Madrid", "Porto", "Real Madrid", "Manchester United", "Inter Miami"]
  },
  {
    "playerId": 77,
    "name": "Thiago Silva",
    "career": ["Juventude", "Porto", "Dynamo Moscow", "Fluminense", "AC Milan", "Paris Saint-Germain", "Chelsea", "Fluminense"]
  },
  {
    "playerId": 78,
    "name": "Eden Hazard",
    "career": ["Lille", "Chelsea", "Real Madrid"]
  },
  {
    "playerId": 79,
    "name": "Paul Pogba",
    "career": ["Manchester United", "Juventus", "Manchester United", "Juventus", "Monaco"]
  },
  {
    "playerId": 80,
    "name": "Gerard Piqué",
    "career": ["Manchester United", "Zaragoza", "Manchester United", "FC Barcelona"]
  },
  {
    "playerId": 81,
    "name": "Iker Casillas",
    "career": ["Real Madrid", "Porto"]
  },
  {
    "playerId": 82,
    "name": "Xavi",
    "career": ["FC Barcelona", "Al-Sadd"]
  },
  {
    "playerId": 83,
    "name": "Andrés Iniesta",
    "career": ["FC Barcelona", "Vissel Kobe", "Emirates Club"]
  },
  {
    "playerId": 84,
    "name": "Sergio Agüero",
    "career": ["Independiente", "Atlético Madrid", "Manchester City", "FC Barcelona"]
  },
  {
    "playerId": 85,
    "name": "David Villa",
    "career": ["Sporting Gijón", "Zaragoza", "Valencia", "FC Barcelona", "Atlético Madrid", "New York City FC", "Vissel Kobe"]
  },
  {
    "playerId": 86,
    "name": "Fernando Torres",
    "career": ["Atlético Madrid", "Liverpool", "Chelsea", "AC Milan", "Atlético Madrid", "Sagan Tosu"]
  },
  {
    "playerId": 87,
    "name": "Didier Drogba",
    "career": ["Le Mans", "Guingamp", "Olympique de Marseille", "Chelsea", "Shanghai Shenhua", "Galatasaray", "Chelsea", "Montreal Impact"]
  },
  {
    "playerId": 88,
    "name": "Frank Lampard",
    "career": ["West Ham United", "Swansea City", "West Ham United", "Chelsea", "Manchester City", "New York City FC"]
  },
  {
    "playerId": 89,
    "name": "Steven Gerrard",
    "career": ["Liverpool", "LA Galaxy"]
  },
  {
    "playerId": 90,
    "name": "Wayne Rooney",
    "career": ["Everton", "Manchester United", "Everton", "DC United", "Derby County"]
  },
  {
    "playerId": 91,
    "name": "Petr Čech",
    "career": ["Chmel Blšany", "Sparta Prague", "Rennes", "Chelsea", "Arsenal"]
  },
  {
    "playerId": 92,
    "name": "Gianluigi Buffon",
    "career": ["Parma", "Juventus", "Paris Saint-Germain", "Juventus", "Parma"]
  },
  {
    "playerId": 93,
    "name": "Andrea Pirlo",
    "career": ["Brescia", "Inter Milan", "Reggina", "Brescia", "AC Milan", "Juventus", "New York City FC"]
  },
  {
    "playerId": 94,
    "name": "Francesco Totti",
    "career": ["AS Roma"]
  },
  {
    "playerId": 95,
    "name": "Paolo Maldini",
    "career": ["AC Milan"]
  },
  {
    "playerId": 96,
    "name": "Zinedine Zidane",
    "career": ["Cannes", "Bordeaux", "Juventus", "Real Madrid"]
  },
  {
    "playerId": 97,
    "name": "Ronaldinho",
    "career": ["Grêmio", "Paris Saint-Germain", "FC Barcelona", "AC Milan", "Flamengo", "Atlético Mineiro", "Querétaro", "Fluminense"]
  },
  {
    "playerId": 98,
    "name": "Kaká",
    "career": ["São Paulo", "AC Milan", "Real Madrid", "AC Milan", "São Paulo", "Orlando City"]
  },
  {
    "playerId": 99,
    "name": "Thierry Henry",
    "career": ["Monaco", "Juventus", "Arsenal", "FC Barcelona", "New York Red Bulls", "Arsenal"]
  },
  {
    "playerId": 100,
    "name": "Ronaldo Nazário",
    "career": ["Cruzeiro", "PSV Eindhoven", "FC Barcelona", "Inter Milan", "Real Madrid", "AC Milan", "Corinthians"]
  },
  {
    "playerId": 101,
    "name": "Rivaldo",
    "career": ["Santa Cruz", "Mogi Mirim", "Corinthians", "Palmeiras", "Deportivo La Coruña", "FC Barcelona", "AC Milan", "Cruzeiro", "Olympiacos", "AEK Athens", "Bunyodkor", "São Paulo", "Kabuscorp", "Mogi Mirim"]
  },
  {
    "playerId": 102,
    "name": "Cafu",
    "career": ["São Paulo", "Real Zaragoza", "Palmeiras", "AS Roma", "AC Milan"]
  },
  {
    "playerId": 103,
    "name": "Roberto Carlos",
    "career": ["União São João", "Atlético Mineiro", "Palmeiras", "Inter Milan", "Real Madrid", "Fenerbahçe", "Corinthians", "Anzhi Makhachkala"]
  },
  {
    "playerId": 104,
    "name": "Fabio Cannavaro",
    "career": ["Napoli", "Parma", "Inter Milan", "Juventus", "Real Madrid", "Al-Ahli", "Al-Sadd"]
  },
  {
    "playerId": 105,
    "name": "Alessandro Nesta",
    "career": ["Lazio", "AC Milan", "Montreal Impact", "Chennaiyin"]
  },
  {
    "playerId": 106,
    "name": "Andrea Barzagli",
    "career": ["Rondinella", "Pistoiese", "Ascoli", "Piacenza", "Palermo", "VfL Wolfsburg", "Juventus"]
  },
  {
    "playerId": 107,
    "name": "Giorgio Chiellini",
    "career": ["Livorno", "Roma", "Livorno", "Fiorentina", "Juventus", "Los Angeles FC"]
  },
  {
    "playerId": 108,
    "name": "Leonardo Bonucci",
    "career": ["Inter Milan", "Treviso", "Pisa", "Bari", "Juventus", "AC Milan", "Juventus", "Union Berlin", "Fenerbahçe"]
  },
  {
    "playerId": 109,
    "name": "Dani Alves",
    "career": ["Bahia", "Sevilla", "FC Barcelona", "Juventus", "Paris Saint-Germain", "São Paulo", "FC Barcelona", "UNAM Pumas"]
  },
  {
    "playerId": 110,
    "name": "Marcelo",
    "career": ["Fluminense", "Real Madrid", "Olympiacos", "Fluminense"]
  },
  {
    "playerId": 111,
    "name": "Pepe",
    "career": ["Marítimo", "Porto", "Real Madrid", "Beşiktaş", "Porto"]
  },
  {
    "playerId": 112,
    "name": "Sergio Busquets",
    "career": ["FC Barcelona", "Inter Miami"]
  },
  {
    "playerId": 113,
    "name": "Jordi Alba",
    "career": ["FC Barcelona", "Valencia", "Benfica", "Valencia", "FC Barcelona", "Inter Miami"]
  },
  {
    "playerId": 114,
    "name": "Ivan Rakitić",
    "career": ["Basel", "Schalke 04", "Sevilla", "FC Barcelona", "Sevilla", "Al-Shabab"]
  },
  {
    "playerId": 115,
    "name": "Arturo Vidal",
    "career": ["Colo-Colo", "Bayer Leverkusen", "Juventus", "Bayern Munich", "FC Barcelona", "Inter Milan", "Flamengo", "Athletico Paranaense", "Colo-Colo"]
  }
];
