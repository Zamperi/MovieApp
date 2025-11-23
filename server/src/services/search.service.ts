import { tmdb } from '../lib/tmdb';
import type { Intent } from '../types/intent';

export async function runIntent(intent: Intent, opts: { language?: string; adult?: boolean } = {}) {
    const common = {
        language: opts.language ?? process.env.TMDB_LANG ?? 'fi-FI',
        include_adult: opts.adult ?? (process.env.TMDB_INCLUDE_ADULT === 'true')
    }

    if (intent.kind === 'genre') {
        return tmdb('/discover/movie', { ...common, with_genres: intent.genreId, sort_by: 'popularity.desc' });
    }

    // PERSON
    if (intent.kind === 'person') {
        const p = await tmdb('/search/person', { ...common, query: intent.name });
        const personId = p?.results?.[0]?.id;
        if (!personId) return { results: [] };

        if (!intent.role || intent.role === 'actor') {
            return tmdb('/discover/movie', {
                ...common,
                with_people: personId,
                sort_by: 'popularity.desc',
            });
        }

        if (intent.role === 'director') {
            const cc = await tmdb(`/person/${personId}/combined_credits`, common);
            const directed = (cc.crew ?? [])
                .filter((c: any) => c.department === 'Directing' && c.media_type === 'movie');
            return { results: directed };
        }
    }

    // TITLE
    if (intent.kind === 'title') {
        const params: any = { ...common, query: intent.title };
        if (typeof intent.year === 'number') params.primary_release_year = intent.year;
        if (Array.isArray(intent.year)) {
            params['primary_release_date.gte'] = `${intent.year[0]}-01-01`;
            params['primary_release_date.lte'] = `${intent.year[1]}-12-31`;
        }
        return tmdb('/search/movie', params);
    }

    // MULTI
    if (intent.kind === 'multi') {
        return tmdb('/search/multi', { ...common, query: intent.query });
    }

};