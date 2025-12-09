// --- Yleiset tyypit vastaukselle --- //

export type IntentKind = 'collection' | 'person' | 'title' | 'multi';

export interface SearchFacets {
  genres: number[];
  years: string[];       // huom: palvelu palauttaa stringejä
  mediaTypes: Array<'movie' | 'tv'>;
}

export type RawResult = {
  // yhteiset
  id: number;
  adult?: boolean;
  genre_ids?: number[];
  overview?: string;
  popularity?: number;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  original_language?: string;
  media_type?: 'movie' | 'tv';

  // elokuva-kentät
  title?: string;
  original_title?: string;
  release_date?: string;

  // tv-kentät
  name?: string;
  original_name?: string;
  first_air_date?: string;
};

export interface SearchResponse {
  query: string;
  intents: IntentKind[];
  count: number;
  facets: SearchFacets;
  results: RawResult[];
}

// --- UI:lle sopiva normalisoitu "MovieResult" --- //

export interface MovieResult {
  id: number;
  title: string;             // yhdistetään title/name
  overview?: string;
  genre_ids?: number[];
  poster_path?: string;
  release_date?: string;     // yhdistetään release_date/first_air_date
  media_type?: 'movie' | 'tv';
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
}

// --- API-kutsu: palauttaa koko vastauksen sellaisenaan --- //

export async function fetchSearch(query: string): Promise<SearchResponse | null> {
  const api_url = import.meta.env.VITE_API_URL;
  const q = query.trim();
  if (!q) return null;

  const res = await fetch(`${api_url}/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    throw new Error(`Search failed with status ${res.status}`);
  }

  const data = (await res.json()) as SearchResponse;

  // Kevyt rakennevalidointi: varmistetaan että kriittiset kentät löytyvät
  if (
    typeof data.query !== 'string' ||
    !Array.isArray(data.intents) ||
    typeof data.count !== 'number' ||
    !data.facets ||
    !Array.isArray(data.results)
  ) {
    console.warn('Unexpected search response structure:', data);
    return null;
  }

  return data;
}

// --- Apufunktio: normalisoi results-listan UI:lle --- //

// tmdbService.tsx
export async function searchMovies(query: string): Promise<MovieResult[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const data = await fetchSearch(q);       // voi heittää
    if (!data) return [];
    return data.results.map((r) => {
      const title = r.title ?? r.name ?? r.original_title ?? r.original_name ?? 'Untitled';
      const date = r.release_date ?? r.first_air_date;
      const media_type =
        r.media_type ??
        (r.title || r.original_title || r.release_date ? 'movie' : (r.name || r.first_air_date ? 'tv' : undefined));
      return {
        id: r.id,
        title,
        overview: r.overview,
        genre_ids: r.genre_ids,
        poster_path: r.poster_path,
        release_date: date,
        media_type,
        popularity: r.popularity,
        vote_average: r.vote_average,
        vote_count: r.vote_count,
      };
    });
  } catch (err) {
    console.error('searchMovies failed:', err);
    return [];
  }
}

export type MovieListType = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

type TmdbListResponse = {
  page: number;
  results: RawResult[];
  total_pages: number;
  total_results: number;
};

export async function getMovies(listType: MovieListType): Promise<MovieResult[]> {
  const api_url = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${api_url}/api/movies/${listType}`);

    if (!response.ok) {
      console.error(`Movies endpoint failed for ${listType} with status`, response.status);
      return [];
    }

    const data = (await response.json()) as TmdbListResponse;

    if (!Array.isArray(data.results)) {
      console.error('Movies response missing results array for', listType);
      return [];
    }

    return data.results.map((r) => {
      const title = r.title ?? r.name ?? r.original_title ?? r.original_name ?? 'Untitled';
      const date = r.release_date ?? r.first_air_date;
      const media_type =
        r.media_type ??
        (r.title || r.original_title || r.release_date
          ? 'movie'
          : r.name || r.first_air_date
            ? 'tv'
            : undefined);

      return {
        id: r.id,
        title,
        overview: r.overview,
        genre_ids: r.genre_ids,
        poster_path: r.poster_path,
        release_date: date,
        media_type,
        popularity: r.popularity,
        vote_average: r.vote_average,
        vote_count: r.vote_count,
      };
    });
  } catch (error) {
    console.error('Fetching movies failed for', listType, error);
    return [];
  }
}

export async function getMovie(tmdbId: Number) {
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/movies/${tmdbId}`);

    if (!response.ok) {
      console.error('Movies endpoint failed with status', response.status);
      return null;
    }

    const data = await response.json();

    return {
      tmdbId: data.tmdbId as number,
      title: data.title as string,
      release_date: data.release_date as string ?? undefined,
      poster_path: data.poster_path ?? undefined,
      backdrop_path: data.backdrop_path ?? undefined,
      overview: data.overview ?? undefined,
      runtime: data.runtime ?? undefined,
      genres: data.genres ?? undefined,
    }

  } catch (error) {
    console.error('Fetching movie failed')
    return null;
  }
}

export type MovieType = {
  tmdbId: number,
  title: string,
  release_date: string,
  poster_path?: string,
  backdrop_path?: string,
  overview?: string,
  runtime: number,
  genres: string[],
}

// --- Uudet tyypit ja funktiot ihmisille --- //

export interface PersonResult {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department?: string;
  popularity?: number;
}

type PeopleListResponse = {
  page: number;
  results: Array<{
    id: number;
    name: string;
    profile_path?: string | null;
    known_for_department?: string;
    popularity?: number;
  }>;
  total_pages: number;
  total_results: number;
};

export async function getTrendingPeople(): Promise<PersonResult[]> {
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/people/trending`);

    if (!response.ok) {
      console.error('People endpoint failed with status', response.status);
      return [];
    }

    const data = (await response.json()) as PeopleListResponse;

    if (!Array.isArray(data.results)) {
      console.error('People response missing results array');
      return [];
    }

    return data.results.map((p) => ({
      id: p.id,
      name: p.name,
      profile_path: p.profile_path ?? null,
      known_for_department: p.known_for_department,
      popularity: p.popularity,
    }));
  } catch (error) {
    console.error('Fetching trending people failed', error);
    return [];
  }
}

// --- Yksittäisen henkilön haku /api/person/:id --- //

export interface PersonDetails {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  known_for_department?: string;
  profile_path?: string | null;
  homepage?: string | null;
  imdb_id?: string | null;
  popularity?: number;
  also_known_as?: string[];
}

export async function getPerson(personId: number): Promise<PersonDetails | null> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!Number.isFinite(personId) || personId <= 0) {
    console.error("Invalid person id", personId);
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/api/people/${personId}`);

    if (!response.ok) {
      console.error("Person endpoint failed with status", response.status);
      return null;
    }

    const data = (await response.json()) as PersonDetails;
    return data;
  } catch (error) {
    console.error("Fetching person failed", error);
    return null;
  }
}
