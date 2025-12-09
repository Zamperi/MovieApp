import { tmdb } from './tmdb';
import { MovieCreateDTO } from '../schemas/movie.schema';

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbMovieResponse {
  id: number;
  title: string;
  release_date: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  runtime: number | null;
  genres: TmdbGenre[] | null;
}

export async function fetchTmdbMovieById(tmdbId: number): Promise<MovieCreateDTO> {
  const data = await tmdb(`/movie/${tmdbId}`, { language: 'en-US' }) as TmdbMovieResponse;

  return {
    tmdbId: data.id,
    title: data.title,
    release_date: data.release_date ?? undefined,
    overview: data.overview ?? undefined,
    poster_path: data.poster_path ?? undefined,
    backdrop_path: data.backdrop_path ?? undefined,
    runtime: data.runtime ?? undefined,
    genres: data.genres?.map(g => g.name) ?? undefined,
  };
}
