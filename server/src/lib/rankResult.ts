export function mergeAndRank(responses: any[], query: string) {
  const all = responses.flatMap(r => r?.results ?? []);
  const seen = new Set<string>();
  const dedup = all.filter((m: any) => {
    const key = `${m.media_type || 'movie'}:${m.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const q = query.toLowerCase();
  const score = (m: any) => {
    const t = (m.title || m.name || '').toLowerCase();
    let s = 0;
    if (t === q) s += 30;
    if (t.includes(q)) s += 15;
    const pop = Number(m.popularity ?? 0);
    s += Math.min(20, Math.log10(pop + 1) * 6);
    return s;
  };

  return dedup.sort((a, b) => score(b) - score(a));
}
