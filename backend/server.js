const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connecté !');
  console.log(`📦 Base de données: ${mongoose.connection.db.databaseName}`);
  console.log(`🔗 MongoDB URI: ${process.env.MONGODB_URI}`);
})
.catch((err) => {
  console.error('❌ Erreur MongoDB:', err.message);
  process.exit(1);
});

// ==================== MODÈLES ====================

// Player Model
const PlayerSchema = new mongoose.Schema({
  playerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  career: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});
const Player = mongoose.model('Player', PlayerSchema);

// UserSession Model
const UserSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  currentQuestion: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
});
const UserSession = mongoose.model('UserSession', UserSessionSchema);

// QuizResult Model
const QuizResultSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userName: { type: String, required: true },
  answers: {
    type: [{
      playerId: { type: Number, required: true },
      playerName: { type: String, required: true },
      userAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
      timeSpent: { type: Number, required: true },
    }],
    required: true,
    default: [],
  },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 10 },
  completedAt: { type: Date, default: Date.now },
});
const QuizResult = mongoose.model('QuizResult', QuizResultSchema);

// Leaderboard Model
const LeaderboardSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, default: 10 },
  avgTimePerQuestion: { type: Number, default: null },
  completedAt: { type: Date, default: Date.now },
});
const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);

// ==================== ROOM MODEL (multijoueur) ====================

const RoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  players: [{
    playerId: Number,
    name: String,
    career: [String],
  }],
  hostName: { type: String, default: null },
  participants: [{
    name: { type: String, required: true },
    score: { type: Number, default: null },
    totalQuestions: { type: Number, default: null },
    done: { type: Boolean, default: false },
  }],
  status: { type: String, default: 'waiting' },
  createdAt: { type: Date, default: Date.now, expires: 1800 },
});
const Room = mongoose.model('Room', RoomSchema);

// ==================== DONNÉES STATIQUES ====================

const PLAYERS_DATA = [
  { playerId: 1, name: 'Cristiano Ronaldo', career: ['Sporting CP', 'Manchester United', 'Real Madrid', 'Juventus FC', 'Manchester United', 'Al-Nassr FC'] },
  { playerId: 2, name: 'Lionel Messi', career: ['FC Barcelona', 'Paris Saint-Germain', 'Inter Miami'] },
  { playerId: 3, name: 'Zlatan Ibrahimović', career: ['Ajax', 'Juventus', 'Inter Milan', 'FC Barcelona', 'AC Milan', 'Paris Saint-Germain', 'Manchester United', 'LA Galaxy', 'AC Milan'] },
  { playerId: 4, name: 'Neymar Jr.', career: ['Santos', 'FC Barcelona', 'Paris Saint-Germain', 'Al-Hilal'] },
  { playerId: 5, name: 'Kylian Mbappé', career: ['AS Monaco', 'Paris Saint-Germain', 'Real Madrid'] },
  { playerId: 6, name: 'Robert Lewandowski', career: ['Lech Poznań', 'Borussia Dortmund', 'Bayern Munich', 'FC Barcelona'] },
  { playerId: 7, name: 'Erling Haaland', career: ['Molde FK', 'Red Bull Salzburg', 'Borussia Dortmund', 'Manchester City'] },
  { playerId: 8, name: 'Karim Benzema', career: ['Olympique Lyonnais', 'Real Madrid', 'Al-Ittihad'] },
  { playerId: 9, name: 'Luis Suárez', career: ['Ajax', 'Liverpool', 'FC Barcelona', 'Atlético Madrid', 'Inter Miami'] },
  { playerId: 10, name: 'Gareth Bale', career: ['Southampton', 'Tottenham Hotspur', 'Real Madrid', 'LAFC'] },
];

// ==================== ROUTES ====================

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: 'MongoDB', status: mongoose.connection.readyState });
});

// ✅ Seed players
app.post('/api/seed', async (req, res) => {
  try {
    const existing = await Player.find();
    if (existing.length > 0) {
      return res.json({ message: 'Players already seeded', count: existing.length });
    }
    await Player.insertMany(PLAYERS_DATA);
    res.json({ message: 'Players seeded successfully', count: PLAYERS_DATA.length });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed players' });
  }
});

// ✅ Get random players
app.get('/api/players', async (req, res) => {
  try {
    const allPlayers = await Player.aggregate([
      { $sample: { size: 10 } },
      { $project: { playerId: 1, name: 1, career: 1 } }
    ]);
    res.json({ players: allPlayers });
  } catch (error) {
    console.error('Players fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// ✅ Start quiz
app.post('/api/quiz/start', async (req, res) => {
  try {
    const { userName } = req.body;
    if (!userName || typeof userName !== 'string' || userName.trim().length < 3) {
      return res.status(400).json({ error: 'Le nom doit contenir au moins 3 caractères' });
    }

    const crypto = require('crypto');
    const sessionId = crypto.randomBytes(16).toString('hex');

    await UserSession.create({
      sessionId,
      userName: userName.trim(),
      currentQuestion: 0,
      status: 'active',
    });

    res.json({ sessionId, message: 'Quiz démarré' });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

// ✅ Complete quiz
app.post('/api/quiz/complete', async (req, res) => {
  try {
    const { sessionId, userName, answers } = req.body;
    if (!sessionId || !userName || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const score = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((acc, a) => acc + (a.timeSpent || 0), 0);
    const avgTime = answers.length > 0 ? totalTime / answers.length : 0;

    await QuizResult.create({
      sessionId,
      userName: userName.trim(),
      answers,
      score,
      totalQuestions: answers.length,
    });

    await UserSession.findOneAndUpdate(
      { sessionId },
      { status: 'completed', lastActivity: new Date() }
    );

    await Leaderboard.create({
      userName: userName.trim(),
      score,
      totalQuestions: answers.length,
      avgTimePerQuestion: avgTime,
    });

    res.json({ score, totalQuestions: answers.length, message: 'Quiz terminé' });
  } catch (error) {
    console.error('Complete quiz error:', error);
    res.status(500).json({ error: 'Failed to complete quiz' });
  }
});

// ✅ Verify quiz
app.post('/api/quiz/verify', async (req, res) => {
  try {
    const { sessionId, verifiedAnswers } = req.body;
    if (!sessionId || !verifiedAnswers || !Array.isArray(verifiedAnswers)) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const score = verifiedAnswers.filter(a => a.isCorrect).length;

    await QuizResult.findOneAndUpdate(
      { sessionId },
      { answers: verifiedAnswers, score }
    );

    res.json({ score, message: 'Score vérifié' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Failed to verify answers' });
  }
});

// ✅ Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const top10 = await Leaderboard.find()
      .sort({ score: -1, avgTimePerQuestion: 1 })
      .limit(10)
      .select('userName score totalQuestions avgTimePerQuestion completedAt');
    res.json({ leaderboard: top10 });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ==================== ROUTES MULTIJOUEUR ====================

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ✅ Créer une room multijoueur
app.post('/api/room/create', async (req, res) => {
  try {
    const { userName } = req.body;
    if (!userName || typeof userName !== 'string' || userName.trim().length < 3) {
      return res.status(400).json({ error: 'Le nom doit contenir au moins 3 caractères' });
    }

    const allPlayers = await Player.aggregate([
      { $sample: { size: 10 } },
      { $project: { _id: 0, playerId: 1, name: 1, career: 1 } }
    ]);

    if (allPlayers.length === 0) {
      return res.status(500).json({ error: 'Aucun joueur disponible' });
    }

    let code;
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await Room.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const trimmedName = userName.trim();
    const room = await Room.create({
      code,
      players: allPlayers,
      hostName: trimmedName,
      participants: [{ name: trimmedName, score: null, totalQuestions: null, done: false }],
      status: 'waiting',
    });

    res.json({
      code: room.code,
      quizPlayers: room.players,
      hostName: room.hostName,
      participants: room.participants.map(p => p.name),
      message: 'Room créée',
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Impossible de créer la room' });
  }
});

// ✅ Rejoindre une room existante
app.post('/api/room/join', async (req, res) => {
  try {
    const { code, userName } = req.body;
    if (!code || !userName || typeof userName !== 'string' || userName.trim().length < 3) {
      return res.status(400).json({ error: 'Données invalides' });
    }

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room introuvable. Vérifiez le code.' });
    }
    if (room.status === 'playing' || room.status === 'finished') {
      return res.status(409).json({ error: 'Cette partie est déjà en cours ou terminée.' });
    }

    const trimmedName = userName.trim();
    const alreadyIn = room.participants.some(p => p.name === trimmedName);
    if (!alreadyIn) {
      room.participants.push({ name: trimmedName, score: null, totalQuestions: null, done: false });
      await room.save();
    }

    res.json({
      code: room.code,
      quizPlayers: room.players,
      hostName: room.hostName,
      participants: room.participants.map(p => p.name),
      message: 'Vous avez rejoint la salle d\'attente',
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Impossible de rejoindre la room' });
  }
});

// ✅ L'hôte démarre la partie
app.post('/api/room/start', async (req, res) => {
  try {
    const { code, hostName } = req.body;
    if (!code || !hostName) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room introuvable' });
    }
    if (room.hostName !== hostName) {
      return res.status(403).json({ error: 'Seul l\'hôte peut démarrer la partie' });
    }
    if (room.status !== 'waiting') {
      return res.status(409).json({ error: 'La partie a déjà démarré' });
    }

    room.status = 'playing';
    await room.save();

    res.json({ message: 'Partie démarrée', status: 'playing' });
  } catch (error) {
    console.error('Start room error:', error);
    res.status(500).json({ error: 'Impossible de démarrer la partie' });
  }
});

// ✅ Sondage — état de la room
app.get('/api/room/:code', async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room introuvable' });
    }

    const allDone = room.participants.length > 0 && room.participants.every(p => p.done);
    if (allDone && room.status === 'playing') {
      room.status = 'finished';
      await room.save();
    }

    res.json({
      code: room.code,
      status: room.status,
      hostName: room.hostName,
      participants: room.participants.map(p => ({
        name: p.name,
        score: p.score,
        totalQuestions: p.totalQuestions,
        done: p.done,
      })),
      allDone,
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Impossible de récupérer la room' });
  }
});

// ✅ Soumettre le score d'un joueur en mode multijoueur
app.post('/api/room/score', async (req, res) => {
  try {
    const { code, playerName, score, totalQuestions } = req.body;
    if (!code || !playerName || score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ error: 'Room introuvable' });
    }

    const participant = room.participants.find(p => p.name === playerName);
    if (!participant) {
      return res.status(404).json({ error: 'Participant introuvable dans cette room' });
    }

    participant.score = score;
    participant.totalQuestions = totalQuestions;
    participant.done = true;

    const allDone = room.participants.every(p => p.done);
    if (allDone) {
      room.status = 'finished';
    }

    await room.save();

    res.json({ message: 'Score soumis', allDone });
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ error: 'Impossible de soumettre le score' });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ===================================');
    console.log('🔥 BACKEND SERVEUR LANCÉ !');
    console.log(`🚀 Serveur Express sur le port ${PORT}`);
    console.log(`📡 Port: http://localhost:${PORT}`);
    console.log(`🍃 MongoDB: ${process.env.MONGODB_URI}`);
    console.log('✅ Prêt à recevoir des requêtes !');
    console.log('===================================');
    console.log('');
  });
}