import connectDB from "@/db/mongodb";
import { Player } from "@/models/Player";
import { PLAYERS_DATA } from "@/lib/players-data";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectDB();

    // Effacer les anciens joueurs et recharger la base avec les données locales
    await Player.deleteMany({});
    await Player.insertMany(PLAYERS_DATA);

    console.log(`✅ Base de données rechargée avec ${PLAYERS_DATA.length} joueurs locaux.`);

    return Response.json({ 
      message: "Base de données rechargée avec succès !", 
      count: PLAYERS_DATA.length 
    });
  } catch (error) {
    console.error("❌ Seed error:", error);
    return Response.json({ error: "Échec du rechargement des joueurs" }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}