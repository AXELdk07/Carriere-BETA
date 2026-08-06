// scripts/axel-players.js
const fs = require('fs');
const path = require('path');

// ⚙️ CONFIGURATION
const BACKUP_ENABLED = true;
const filePath = path.join(__dirname, '..', 'src', 'lib', 'players-data.ts');

console.log('🔧 FIX DES JOUEURS');
console.log('='.repeat(50));

// Lire le fichier
console.log('📖 Lecture du fichier players-data.ts...');
let content = fs.readFileSync(filePath, 'utf8');

// Extraire le tableau PLAYERS_DATA
let match = content.match(/export const PLAYERS_DATA: QuizPlayer\[\] = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('❌ Impossible de trouver PLAYERS_DATA dans le fichier');
    process.exit(1);
}

let rawArray = match[1];
let players = null;

// Essayer de parser le JSON
try {
    // Nettoyage minimal
    let cleaned = rawArray
        .replace(/\u00A0/g, ' ')
        .replace(/\u200B/g, '')
        .replace(/\uFEFF/g, '')
        .replace(/\t/g, ' ')
        .replace(/,\s*,/g, ',')
        .replace(/,\s*]/g, ']')
        .replace(/\[\s*,/g, '[');

    players = JSON.parse(cleaned);
    console.log('✅ Fichier lu avec succès');
} catch (error) {
    console.error('❌ Erreur de parsing JSON :', error.message);
    process.exit(1);
}

if (!Array.isArray(players) || players.length === 0) {
    console.error('❌ Les données ne sont pas un tableau valide');
    process.exit(1);
}

console.log(`📊 Nombre total de joueurs avant correction : ${players.length}`);

// ✅ Créer une sauvegarde
if (BACKUP_ENABLED) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = filePath.replace('.ts', `.backup-fix-${timestamp}.ts`);
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`💾 Sauvegarde créée : ${path.basename(backupPath)}`);
}

// ============================================
// 1. SUPPRIMER LES DOUBLONS DE NOMS
// ============================================
console.log('\n🧹 Suppression des joueurs en double (même nom)...');

const seenNames = new Set();
const uniquePlayers = [];

players.forEach(player => {
    const name = player.name?.trim();
    if (!name) return;

    if (!seenNames.has(name)) {
        seenNames.add(name);
        uniquePlayers.push(player);
    } else {
        console.log(`   🗑️  Doublon supprimé : ${name}`);
    }
});

console.log(`✅ ${players.length - uniquePlayers.length} doublon(s) supprimé(s)`);

// ============================================
// 2. SUPPRIMER LES JOUEURS AVEC 1 SEULE ÉQUIPE
// ============================================
console.log('\n🗑️ Suppression des joueurs avec une seule équipe...');

const playersWithMultipleClubs = uniquePlayers.filter(player => {
    const careerLength = Array.isArray(player.career) ? player.career.filter(c => c && c.trim()).length : 0;
    return careerLength >= 2;
});

const removedSingleClub = uniquePlayers.filter(player => {
    const careerLength = Array.isArray(player.career) ? player.career.filter(c => c && c.trim()).length : 0;
    return careerLength < 2;
});

if (removedSingleClub.length > 0) {
    console.log(`   Joueurs supprimés (1 seule équipe) : ${removedSingleClub.length}`);
    removedSingleClub.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name}`);
    });
    if (removedSingleClub.length > 10) {
        console.log(`   ... et ${removedSingleClub.length - 10} autres`);
    }
} else {
    console.log('   ✅ Aucun joueur avec une seule équipe trouvé');
}

// ============================================
// 3. RÉATTRIBUER LES IDs CORRECTEMENT
// ============================================
console.log('\n🔄 Réattribution des IDs...');

const finalPlayers = playersWithMultipleClubs.map((player, index) => ({
    ...player,
    playerId: index + 1
}));

console.log(`✅ IDs réattribués de 1 à ${finalPlayers.length}`);

// ============================================
// RÉSUMÉ
// ============================================
console.log('\n📊 RÉSUMÉ :');
console.log(` - Joueurs initiaux              : ${players.length}`);
console.log(` - Doublons de noms supprimés    : ${players.length - uniquePlayers.length}`);
console.log(` - Joueurs avec 1 équipe supprimés: ${removedSingleClub.length}`);
console.log(` - Joueurs finaux                : ${finalPlayers.length}`);
console.log(` - IDs                           : 1 → ${finalPlayers.length}`);

// Afficher les 10 premiers
console.log('\n📋 Top 10 des joueurs :');
finalPlayers.slice(0, 10).forEach((p, i) => {
    console.log(` ${i + 1}. ${p.name} (${p.career?.length || 0} clubs)`);
});

// ============================================
// ÉCRIRE LE FICHIER
// ============================================
console.log('\n✏️ Mise à jour du fichier...');

const newContent = `export interface QuizPlayer {
  playerId: number;
  name: string;
  career: string[];
}

// ${finalPlayers.length} joueurs - IDs corrigés le ${new Date().toLocaleDateString()}
export const PLAYERS_DATA: QuizPlayer[] = ${JSON.stringify(finalPlayers, null, 2)};
`;

fs.writeFileSync(filePath, newContent, 'utf8');

console.log('\n' + '='.repeat(50));
console.log('✅ FICHIER CORRIGÉ AVEC SUCCÈS !');
console.log(`📁 ${filePath}`);
console.log(`🎯 ${finalPlayers.length} joueurs conservés`);