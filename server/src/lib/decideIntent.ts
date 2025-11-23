import type { Intent, ParsedQuery } from '../types/intent';

export function decideIntent(
  p: ParsedQuery,
  genreLex: { has: (t: string) => boolean; getId: (t: string) => number | undefined }
): Intent[] {
  const intents: Intent[] = [];

  // Power-syntaksi ensin
  if (p.power.genre) {
    const gid = genreLex.getId(p.power.genre);
    if (gid != null) intents.push({ kind: 'genre', genreId: gid });
  }
  if (p.power.actor) intents.push({ kind: 'person', name: p.power.actor, role: 'actor' });
  if (p.power.director) intents.push({ kind: 'person', name: p.power.director, role: 'director' });
  if (p.power.keyword) intents.push({ kind: 'keyword', keyword: p.power.keyword });

  // Suora genresana koko syötteestä
  if (genreLex.has(p.raw)) intents.push({ kind: 'genre', genreId: genreLex.getId(p.raw)! });

  // Kokoelmaehdokas
  if (p.tokens.length >= 2) intents.push({ kind: 'collection', name: p.raw });

  // Henkilönimi – kevyt heuristiikka
  if (p.tokens.length >= 2 && /^[A-Za-zÅÄÖà-ÿ'.-]+ [A-Za-zÅÄÖà-ÿ'.-]+$/.test(p.raw))
    intents.push({ kind: 'person', name: p.raw });

  // Otsikko + vuosi
  intents.push({ kind: 'title', title: p.raw, year: p.year });

  // Fallback
  intents.push({ kind: 'multi', query: p.raw, year: p.year });

  return intents.slice(0, 4);
}
