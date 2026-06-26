import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const dailyGeminiLimit = 5;
const usageDirectory = join(tmpdir(), "manabi-voice");
const usageFile = join(usageDirectory, "gemini-usage.json");

type UsageState = {
  date: string;
  count: number;
};

async function readUsage(): Promise<UsageState | null> {
  try {
    const raw = await readFile(usageFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<UsageState>;

    if (typeof parsed.date === "string" && typeof parsed.count === "number") {
      return { date: parsed.date, count: parsed.count };
    }
  } catch {
    return null;
  }

  return null;
}

async function writeUsage(state: UsageState) {
  await mkdir(usageDirectory, { recursive: true });
  await writeFile(usageFile, JSON.stringify(state), "utf8");
}

export async function getGeminiDailyUse(date: string) {
  const current = await readUsage();
  const state = current?.date === date ? current : { date, count: 0 };

  if (state.count >= dailyGeminiLimit) {
    return { allowed: false, count: state.count, limit: dailyGeminiLimit };
  }

  return { allowed: true, count: state.count, limit: dailyGeminiLimit };
}

export async function recordGeminiDailyUse(date: string) {
  const current = await readUsage();
  const state = current?.date === date ? current : { date, count: 0 };
  const next = { date, count: state.count + 1 };

  await writeUsage(next);

  return { allowed: true, count: next.count, limit: dailyGeminiLimit };
}
