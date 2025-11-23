import { Request, Response } from 'express';
import { parseQuery } from '../lib/parseQuery';
import { GenreCache } from '../lib/genreCache';
import { decideIntent } from '../lib/decideIntent';
import { runIntent } from '../services/search.service';
import { mergeAndRank } from '../lib/rankResult';

const genreCache = new GenreCache((path, params) => import('../lib/tmdb').then(m => m.tmdb(path, params)));

export const searchController = {
    search: async (req: Request, res: Response) => {
        try {
            const q = String(req.query.q ?? '').trim();
            if (!q) return res.status(400).json('Missing query');

            const parsed = parseQuery(q);
            console.log(parsed);
            await genreCache.ensureFresh(parsed.lang ?? process.env.TMDB_LANG ?? 'fi-FI');

            const intents = decideIntent(parsed, genreCache);

            console.log(JSON.stringify(intents));
            const calls = intents.map(intent => runIntent(intent, { language: parsed.lang, adult: parsed.adult }));
            const responses = await Promise.all(calls);

            const results = mergeAndRank(responses, parsed.raw);
            const facets = {
                genres: [...new Set(results.flatMap((m: any) => m.genre_ids ?? []))],
                years: [...new Set(results.map((m: any) => (m.release_date || '').slice(0, 4)).filter(Boolean))].slice(0, 12),
                mediaTypes: [...new Set(results.map((m: any) => m.media_type || 'movie'))],
            }

            res.json({ query: parsed.raw, intents: intents.map(i => i.kind), count: results.length, facets, results });

        } catch (error) {
            return res.status(500).json('Error with searching information');
        }
    }
};