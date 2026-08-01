import connectDB from "@/db/mongodb";
import { Player } from "@/models/Player";
import { PLAYERS_DATA } from "@/lib/players-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Récupérer les IDs à exclure depuis les query params
  const { searchParams } = new URL(request.url);
  const excludeParam = searchParams.get("exclude");
  const excludeIds: number[] = excludeParam
    ? excludeParam.split(",").map(Number).filter((n) => !isNaN(n) && n > 0)
    : [];

  try {
    await connectDB();

    // Récupérer 10 joueurs aléatoires depuis MongoDB (hors exclus)
    const matchStage = excludeIds.length > 0
      ? { $match: { playerId: { $nin: excludeIds } } }
      : { $match: {} };

    let players = await Player.aggregate([
      matchStage,
      { $sample: { size: 10 } },
      {
        $project: {
          playerId: 1,
          name: 1,
          career: 1,
        },
      },
    ]);

    // Si la base de données est vide, utiliser les données locales
    if (!players || players.length === 0) {
      console.log("ℹ️ Base MongoDB vide, sélection depuis les joueurs locaux...");
      const filtered = PLAYERS_DATA.filter((p) => !excludeIds.includes(p.playerId));
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      players = shuffled.slice(0, 10);
    }

    return Response.json({ players, total: PLAYERS_DATA.length });
  } catch (error) {
    console.warn("⚠️ Connexion MongoDB indisponible, bascule sur les joueurs locaux:", error);
    const filtered = PLAYERS_DATA.filter((p) => !excludeIds.includes(p.playerId));
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const players = shuffled.slice(0, 10);
    return Response.json({ players, total: PLAYERS_DATA.length });
  }
}