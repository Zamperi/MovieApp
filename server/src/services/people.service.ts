import { tmdb } from "../lib/tmdb";

export const people = {
    trending: () => {
        return tmdb('/trending/person/week', {
            language: process.env.TMDB_LANG,
            page: 1,
        });
    },

    getPerson: (person_id: number) => {
        return tmdb(`/person/${person_id}`, {
            language: process.env.TMDB_LANG,
        })
    }
};
