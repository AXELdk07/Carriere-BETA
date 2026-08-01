import connectDB from "@/db/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ ok: true, database: "MongoDB" });
  } catch (error) {
    console.error("Health check error:", error);
    return Response.json({ ok: false, error: "Database connection failed" }, { status: 500 });
  }
}