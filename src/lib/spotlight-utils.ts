import type { SpotlightAction } from "@/types";

export function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase(),
    t = target.toLowerCase();
  if (t === q) return 3;
  if (t.startsWith(q)) return 2.5;
  if (t.includes(q)) return 2;
  let qi = 0,
    score = 0,
    cons = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      qi++;
      cons++;
      score += cons * 0.1;
    } else cons = 0;
  }
  return qi === q.length ? score : 0;
}

export function filterActions(
  actions: SpotlightAction[],
  query: string,
  limit = 9,
): SpotlightAction[] {
  if (!query.trim()) return actions.slice(0, limit);
  return actions
    .map((a) => ({
      a,
      s: Math.max(
        fuzzyScore(query, a.label) * 2,
        fuzzyScore(query, a.description ?? "") * 1,
        ...(a.keywords ?? []).map((k) => fuzzyScore(query, k) * 1.5),
      ),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.a);
}

export function groupBy(
  actions: SpotlightAction[],
): Map<string, SpotlightAction[]> {
  const m = new Map<string, SpotlightAction[]>();
  for (const a of actions) {
    const g = a.group ?? "";
    if (!m.has(g)) m.set(g, []);
    m.get(g)!.push(a);
  }
  return m;
}
