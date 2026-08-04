// scripts/clean-players.js
const fs = require('fs');
const path = require('path');

// ⚙️ CONFIGURATION
const MIN_CAREER_LENGTH = 2; // Nombre minimum de clubs (garder les joueurs avec 2 clubs ou plus)
const MAX_CAREER_LENGTH = 9; // Nombre maximum de clubs (garder les joueurs avec 9 clubs ou moins)
const BACKUP_ENABLED = true; // Créer une sauvegarde

const filePath = path.join(__dirname, '..', 'src', 'lib', 'players-data.ts');

console.log('🧹 NETTOYAGE DU FICHIER PLAYERS-DATA');
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

console.log(`📊 Nombre total de joueurs avant nettoyage : ${players.length}`);

// ✅ Créer une sauvegarde
if (BACKUP_ENABLED) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = filePath.replace('.ts', `.backup-${timestamp}.ts`);
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`💾 Sauvegarde créée : ${path.basename(backupPath)}`);
}

// 🔍 Étape 1 : Supprimer les doublons (même nom)
console.log('\n🔍 Recherche des doublons...');
const seenNames = new Map();
const uniquePlayers = [];
const removedDuplicates = [];

players.forEach(player => {
    const normalizedName = player.name.toLowerCase().trim();
    if (seenNames.has(normalizedName)) {
        removedDuplicates.push({
            name: player.name,
            keptId: seenNames.get(normalizedName)
        });
    } else {
        seenNames.set(normalizedName, player.playerId);
        uniquePlayers.push(player);
    }
});

if (removedDuplicates.length > 0) {
    console.log(`🗑️ Doublons supprimés : ${removedDuplicates.length}`);
    removedDuplicates.forEach(d => {
        console.log(`   - ${d.name} (doublon supprimé)`);
    });
} else {
    console.log('✅ Aucun doublon trouvé');
}

// 📊 Étape 2 : Filtrer selon les conditions
console.log(`\n📊 Filtrage des joueurs (${MIN_CAREER_LENGTH} ≤ carrière ≤ ${MAX_CAREER_LENGTH} clubs)...`);

const filteredPlayers = uniquePlayers.filter(player => {
    const careerLength = player.career.length;
    return careerLength >= MIN_CAREER_LENGTH && careerLength <= MAX_CAREER_LENGTH;
});

// Statistiques
const removedTooShort = uniquePlayers.filter(p => p.career.length < MIN_CAREER_LENGTH);
const removedTooLong = uniquePlayers.filter(p => p.career.length > MAX_CAREER_LENGTH);
const totalRemoved = uniquePlayers.length - filteredPlayers.length;

console.log(`🧹 Joueurs supprimés (moins de ${MIN_CAREER_LENGTH} clubs) : ${removedTooShort.length}`);
console.log(`🧹 Joueurs supprimés (plus de ${MAX_CAREER_LENGTH} clubs) : ${removedTooLong.length}`);
console.log(`📊 Total supprimés : ${totalRemoved}`);
console.log(`📊 Joueurs conservés : ${filteredPlayers.length}`);

// Afficher les joueurs supprimés (trop courts)
if (removedTooShort.length > 0) {
    console.log('\n🗑️ Joueurs supprimés (carrière trop courte) :');
    removedTooShort.forEach(p => {
        console.log(`   - ${p.name} (${p.career.length} club${p.career.length > 1 ? 's' : ''})`);
    });
}

// Afficher les joueurs supprimés (trop longs)
if (removedTooLong.length > 0) {
    console.log('\n🗑️ Joueurs supprimés (carrière trop longue) :');
    removedTooLong.forEach(p => {
        console.log(`   - ${p.name} (${p.career.length} clubs)`);
    });
}

// 📝 Étape 3 : Réattribuer les IDs
console.log('\n🔄 Réattribution des IDs...');
const reindexedPlayers = filteredPlayers.map((player, index) => ({
    ...player,
    playerId: index + 1
}));

console.log(`✅ ${reindexedPlayers.length} joueurs conservés avec de nouveaux IDs (1 à ${reindexedPlayers.length})`);

// 📊 Résumé des modifications
console.log('\n📊 RÉSUMÉ :');
console.log(`   - Joueurs initiaux : ${players.length}`);
console.log(`   - Doublons supprimés : ${removedDuplicates.length}`);
console.log(`   - Carrière trop courte : ${removedTooShort.length}`);
console.log(`   - Carrière trop longue : ${removedTooLong.length}`);
console.log(`   - Joueurs conservés : ${reindexedPlayers.length}`);
console.log(`   - IDs réattribués : 1 → ${reindexedPlayers.length}`);

// 📝 Afficher les 10 premiers joueurs conservés
console.log('\n📋 Top 10 des joueurs conservés :');
reindexedPlayers.slice(0, 10).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (${p.career.length} clubs)`);
});

// 🔧 Étape 4 : Modifier le fichier directement (sans créer de nouveau contenu)
console.log('\n✏️ Mise à jour du fichier...');

// Remplacer le contenu du tableau dans le fichier original
const newContent = content.replace(
    /export const PLAYERS_DATA: QuizPlayer\[\] = \[[\s\S]*?\];/,
    `export const PLAYERS_DATA: QuizPlayer[] = ${JSON.stringify(reindexedPlayers, null, 2)};`
);

// Écrire le fichier
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('\n' + '=' .repeat(50));
console.log('✅ FICHIER NETTOYÉ AVEC SUCCÈS !');
console.log(`📁 ${filePath}`);
console.log(`🎯 ${reindexedPlayers.length} joueurs conservés sur ${players.length} initialement`);
console.log('\n📝 Pour restaurer la sauvegarde :');
console.log(`   copy ${path.basename(filePath.replace('.ts', `.backup-${new Date().toISOString().replace(/[:.]/g, '-')}.ts`))} ${path.basename(filePath)}`);