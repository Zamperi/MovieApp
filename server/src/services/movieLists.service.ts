import { tmdb } from "../lib/tmdb";

export const movieList = {

    popular: () => {
        return tmdb('/movie/popular', {
            language: process.env.TMDB_LANG,
            page: 1,
        });
    },

    nowPlaying: () => {
        return tmdb('/movie/now_playing', {
            language: process.env.TMDB_LANG,
            page: 1,
        });
    },
    upcoming: () => {
        return tmdb('/movie/upcoming', {
            language: process.env.TMDB_LANG,
            page: 1,
        });
    },
    topRated: () => {
        return tmdb('/movie/top_rated', {
            language: process.env.TMDB_LANG,
            page: 1,
        });
    }
}