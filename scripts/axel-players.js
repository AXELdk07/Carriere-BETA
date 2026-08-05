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

// 🔥 Nettoyer les caractères spéciaux AVANT le parsing JSON
function cleanContent(raw) {
    let cleaned = raw
        // Supprimer les caractères invisibles
        .replace(/\u00A0/g, ' ') // espaces insécables
        .replace(/\u200B/g, '') // espaces invisibles
        .replace(/\u200C/g, '')
        .replace(/\u200D/g, '')
        .replace(/\uFEFF/g, '') // BOM
        // Nettoyer les tabulations
        .replace(/\t/g, ' ')
        // Nettoyer les retours à la ligne dans les chaînes
        .replace(/\n/g, ' ')
        .replace(/\r/g, '')
        // Supprimer les espaces multiples
        .replace(/\s{2,}/g, ' ')
        // Nettoyer les virgules doubles
        .replace(/,\s*,/g, ',')
        // Nettoyer avant fermeture
        .replace(/,\s*\]/g, ']')
        // Nettoyer après ouverture
        .replace(/\[\s*,/g, '[');
    
    return cleaned;
}

// Extraire le tableau PLAYERS_DATA
let match = content.match(/export const PLAYERS_DATA: QuizPlayer\[\] = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('❌ Impossible de trouver PLAYERS_DATA dans le fichier');
    process.exit(1);
}

let rawArray = match[1];

// 🔥 Méthode 1: Essayer de parser directement
let players = null;
let parsed = false;

try {
    // Nettoyer le contenu avant parsing
    let cleanedArray = cleanContent(rawArray);
    players = JSON.parse(cleanedArray);
    parsed = true;
    console.log('✅ Fichier lu avec succès');
} catch (error) {
    console.log('⚠️ Erreur de parsing JSON, tentative de nettoyage avancé...');
    
    // 🔥 Méthode 2: Nettoyage ligne par ligne
    try {
        const lines = rawArray.split('\n');
        const cleanedLines = lines.map(line => {
            let cleanedLine = line
                .replace(/\u00A0/g, ' ')
                .replace(/\u200B/g, '')
                .replace(/\u200C/g, '')
                .replace(/\u200D/g, '')
                .replace(/\uFEFF/g, '')
                .replace(/\t/g, ' ')
                .replace(/\r/g, '')
                // Supprimer les espaces en trop
                .replace(/\s{2,}/g, ' ')
                // Nettoyer les guillemets dans les chaînes
                .replace(/\\"/g, '"') // remplacer les guillemets échappés
                .replace(/"/g, '"') // normaliser les guillemets
                .replace(/"/g, '"')
                .replace(/"/g, '"')
                .replace(/"/g, '"')
                .replace(/"/g, '"')
                // Nettoyer les virgules
                .replace(/,\s*,/g, ',')
                .replace(/,\s*\]/g, ']')
                .replace(/\[\s*,/g, '[');
            
            return cleanedLine;
        });
        
        let cleanedArray = cleanedLines.join('\n');
        
        // Nettoyage final
        cleanedArray = cleanContent(cleanedArray);
        
        players = JSON.parse(cleanedArray);
        parsed = true;
        console.log('✅ Nettoyage réussi !');
    } catch (error2) {
        console.error('❌ Erreur de parsing après nettoyage :', error2.message);
        console.log('\n🔍 Détails de l\'erreur :');
        console.log(`   Position: ${error2.message.match(/position (\d+)/)?.[1] || 'inconnue'}`);
        
        // 🔥 Méthode 3: Extraire manuellement les données
        console.log('\n🔄 Tentative d\'extraction manuelle...');
        try {
            // Extraire chaque joueur manuellement
            const playerRegex = /\{\s*"playerId"\s*:\s*(\d+)\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"career"\s*:\s*\[([^\]]*)\]\s*\}/g;
            const matches = [...rawArray.matchAll(playerRegex)];
            
            if (matches.length > 0) {
                players = matches.map((match, index) => {
                    const careerItems = match[3]
                        .split(',')
                        .map(item => item.trim().replace(/^"|"$/g, ''))
                        .filter(item => item.length > 0);
                    
                    return {
                        playerId: index + 1,
                        name: match[2].trim(),
                        career: careerItems
                    };
                });
                parsed = true;
                console.log(`✅ Extrait ${players.length} joueurs manuellement`);
            } else {
                throw new Error('Aucun joueur extrait');
            }
        } catch (error3) {
            console.error('❌ Échec de l\'extraction manuelle :', error3.message);
            process.exit(1);
        }
    }
}

if (!players || !Array.isArray(players) || players.length === 0) {
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

// 📊 Étape 1 : Nettoyer les doublons dans les carrières
console.log('\n🧹 Nettoyage des doublons dans les carrières...');
const cleanedPlayers = players.map(player => {
    // Supprimer les doublons dans la carrière
    const uniqueCareer = [...new Set(player.career)];
    // Filtrer les entrées vides
    const filteredCareer = uniqueCareer.filter(club => club && club.trim().length > 0);
    return {
        ...player,
        career: filteredCareer
    };
});

// 📊 Étape 2 : Supprimer les joueurs avec une seule équipe
console.log('\n🗑️ Suppression des joueurs avec une seule équipe...');
const playersWithMultipleClubs = cleanedPlayers.filter(player => player.career.length >= 2);
const removedSingleClub = cleanedPlayers.filter(player => player.career.length < 2);

if (removedSingleClub.length > 0) {
    console.log(`   Joueurs supprimés (1 seule équipe) : ${removedSingleClub.length}`);
    removedSingleClub.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (${p.career.length} équipe${p.career.length > 1 ? 's' : ''})`);
    });
    if (removedSingleClub.length > 10) {
        console.log(`   ... et ${removedSingleClub.length - 10} autres`);
    }
} else {
    console.log('   ✅ Aucun joueur avec une seule équipe trouvé');
}

// 📊 Étape 3 : Réattribuer les IDs correctement
console.log('\n🔄 Réattribution des IDs...');
const reindexedPlayers = playersWithMultipleClubs.map((player, index) => ({
    ...player,
    playerId: index + 1
}));

console.log(`✅ ${reindexedPlayers.length} joueurs conservés avec de nouveaux IDs (1 à ${reindexedPlayers.length})`);

// 📝 Vérifier les IDs
console.log('\n🔍 Vérification des IDs...');
let hasError = false;
reindexedPlayers.forEach((player, index) => {
    const expectedId = index + 1;
    if (player.playerId !== expectedId) {
        console.log(`   ❌ Erreur : ${player.name} a l'ID ${player.playerId} mais devrait avoir ${expectedId}`);
        hasError = true;
        player.playerId = expectedId;
    }
});

if (!hasError) {
    console.log('   ✅ Tous les IDs sont corrects');
} else {
    console.log('   ✅ IDs corrigés');
}

// 📊 Résumé des modifications
console.log('\n📊 RÉSUMÉ :');
console.log(`   - Joueurs initiaux : ${players.length}`);
console.log(`   - Doublons supprimés dans les carrières : ${players.length - cleanedPlayers.length > 0 ? players.length - cleanedPlayers.length : 0}`);
console.log(`   - Joueurs supprimés (1 seule équipe) : ${removedSingleClub.length}`);
console.log(`   - Joueurs conservés : ${reindexedPlayers.length}`);
console.log(`   - IDs réattribués : 1 → ${reindexedPlayers.length}`);

// 📋 Afficher les 10 premiers joueurs
console.log('\n📋 Top 10 des joueurs conservés :');
reindexedPlayers.slice(0, 10).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (${p.career.length} clubs)`);
});

// 🔧 Étape 4 : Écrire le fichier
console.log('\n✏️ Mise à jour du fichier...');

const newContent = `export interface QuizPlayer {
  playerId: number;
  name: string;
  career: string[];
}

// ${reindexedPlayers.length} joueurs - IDs réattribués le ${new Date().toLocaleDateString()}
export const PLAYERS_DATA: QuizPlayer[] = ${JSON.stringify(reindexedPlayers, null, 2)};
`;

fs.writeFileSync(filePath, newContent, 'utf8');

console.log('\n' + '='.repeat(50));
console.log('✅ FICHIER CORRIGÉ AVEC SUCCÈS !');
console.log(`📁 ${filePath}`);
console.log(`🎯 ${reindexedPlayers.length} joueurs conservés sur ${players.length} initialement`);