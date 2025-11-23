import type { ParsedQuery, Year } from '../types/intent';

const YEAR_RE = /\b(19|20)\d{2}\b/g;
const RANGE_RE = /\b(19|20)\d{2}-(19|20)\d{2}\b/;

export function parseQuery(input: string): ParsedQuery {
  const raw = input.trim();
  const power: Record<string, string> = {};
  const parts = raw.split(/\s+/); //Pilkotaan osiin

  //Etsitään avain-arvo parit
  for (const tok of parts) {
    const m = tok.match(/^([A-Za-z]+):(.*)$/);
    if (m) power[m[1].toLowerCase()] = m[2];
  }

  //Lisätään vuosi tai vuodet mukaan
  let year: Year | undefined;
  const range = raw.match(RANGE_RE);
  if (range) {
    const [a, b] = range[0].split('-').map(Number);
    year = [a, b];
  } else {
    const ys = raw.match(YEAR_RE);
    if (ys && ys.length) year = Number(ys[ys.length - 1]);
  }

  //Lisätään tokeneihin avainsanat
  const tokens = parts.filter(t => !/^([A-Za-z]+:).*$/.test(t) && t.length > 0);
  const lang = power.lang?.toLowerCase();
  const adult = power.adult ? power.adult.toLowerCase() === 'true' : undefined;

  return { raw, tokens, power, year, lang, adult };
}
