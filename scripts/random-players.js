// scripts/random-players.js
const fs = require('fs');
const path = require('path');

// ⚙️ CONFIGURATION
const BACKUP_ENABLED = true; // Créer une sauvegarde avant de randomiser

const filePath = path.join(__dirname, '..', 'src', 'lib', 'players-data.ts');

console.log('🎲 RANDOMISATION DES JOUEURS');
console.log('=' .repeat(50));

// Lire le fichier
console.log('📖 Lecture du fichier players-data.ts...');
let content = fs.readFileSync(filePath, 'utf8');

// Extraire le tableau PLAYERS_DATA
const match = content.match(/export const PLAYERS_DATA: QuizPlayer\[\] = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('❌ Impossible de trouver PLAYERS_DATA dans le fichier');
    process.exit(1);
}

let players = JSON.parse(match[1]);

console.log(`📊 Nombre total de joueurs : ${players.length}`);

// ✅ Créer une sauvegarde
if (BACKUP_ENABLED) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = filePath.replace('.ts', `.backup-random-${timestamp}.ts`);
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`💾 Sauvegarde créée : ${path.basename(backupPath)}`);
}

// 🔀 Fonction de mélange (Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Mélanger les joueurs
console.log('🔄 Mélange des joueurs...');
const shuffledPlayers = shuffleArray(players);

// Réattribuer les IDs dans le nouvel ordre
const reindexedPlayers = shuffledPlayers.map((player, index) => ({
    ...player,
    playerId: index + 1
}));

console.log(`✅ ${reindexedPlayers.length} joueurs randomisés avec succès !`);

// Afficher les 10 premiers joueurs après randomisation
console.log('\n📋 Top 10 des joueurs après randomisation :');
reindexedPlayers.slice(0, 10).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (${p.career.length} clubs)`);
});

// Afficher les 5 derniers joueurs
console.log('\n📋 Bottom 5 des joueurs après randomisation :');
reindexedPlayers.slice(-5).forEach((p, i) => {
    const idx = reindexedPlayers.length - 5 + i + 1;
    console.log(`   ${idx}. ${p.name} (${p.career.length} clubs)`);
});

// Générer le nouveau contenu
const newContent = `export interface QuizPlayer {
  playerId: number;
  name: string;
  career: string[];
}

// FIFPro World XI 2024 - ${reindexedPlayers.length} joueurs
// Randomisé le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}
export const PLAYERS_DATA: QuizPlayer[] = ${JSON.stringify(reindexedPlayers, null, 2)};
`;

// Écrire le fichier
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('\n' + '=' .repeat(50));
console.log('✅ FICHIER RANDOMISÉ AVEC SUCCÈS !');
console.log(`📁 ${filePath}`);
console.log(`🎯 ${reindexedPlayers.length} joueurs dans un nouvel ordre aléatoire`);
console.log('\n📝 Pour restaurer la sauvegarde :');
console.log(`   copy ${path.basename(filePath.replace('.ts', `.backup-random-${new Date().toISOString().replace(/[:.]/g, '-')}.ts`))} ${path.basename(filePath)}`);