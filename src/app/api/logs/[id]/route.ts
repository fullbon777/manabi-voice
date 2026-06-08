import { prisma } from "@/lib/prisma";
import { toLearningLogView } from "@/lib/logs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await prisma.learningLog.findUnique({ where: { id } });

  if (!log) {
    return Response.json({ error: "Log not found" }, { status: 404 });
  }

  return Response.json({ log: toLearningLogView(log) });
}
