// tmdbService.tsx

/* =========================
   Shared API error contract
   (matches backend ErrorResponse convention)
========================= */

export type ApiErrorResponse = {
  status: number;
  error: string;
  message: string;
  details?: unknown;
};

class ApiError extends Error {
  public readonly status: number;
  public readonly payload?: ApiErrorResponse;

  constructor(status: number, message: string, payload?: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/* =========================
   Helpers
========================= */

function isValidPositiveInt(n: number): boolean {
  return Number.isFinite(n) && Number.isInteger(n) && n > 0;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  if (res.ok) {
    return (await res.json()) as T;
  }

  // Try parse ErrorResponse, fallback to generic
  let payload: ApiErrorResponse | undefined;
  try {
    payload = (await res.json()) as ApiErrorResponse;
  } catch {
    // ignore
  }

  const message =
    payload?.message ??
    `Request failed with status ${res.status} (${res.statusText})`;

  throw new ApiError(res.status, message, payload);
}

/* =========================
   Search (kept as-is; uses proxy raw response)
========================= */

export type IntentKind = "collection" | "person" | "title" | "multi";

export interface SearchFacets {
  genres: number[];
  years: string[]; // backend returns strings
  mediaTypes: Array<"movie" | "tv">;
}

type RawResult = {
  id: number;

  // movie fields
  title?: string;
  original_title?: string;
  release_date?: string;

  // tv fields
  name?: string;
  original_name?: string;
  first_air_date?: string;

  // shared
  overview?: string;
  genre_ids?: number[];
  poster_path?: string | null;
  media_type?: "movie" | "tv";
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
};

type TmdbSearchResponse = {
  intent?: IntentKind;
  facets?: SearchFacets;
  results: RawResult[];
};

// UI normalized search result (not the same as list DTO!)
export interface MovieResult {
  id: number;
  title: string;
  overview?: string;
  genre_ids?: number[];
  poster_path?: string | null;
  release_date?: string;
  media_type?: "movie" | "tv";
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
}

async function fetchSearch(query: string): Promise<TmdbSearchResponse | null> {
  const apiUrl = import.meta.env.VITE_API_URL;

  const q = query.trim();
  if (!q) return null;

  try {
    const data = await fetchJson<TmdbSearchResponse>(
      `${apiUrl}/api/search?query=${encodeURIComponent(q)}`
    );

    if (!Array.isArray(data.results)) return null;
    return data;
  } catch (err) {
    console.error("Fetching search failed", err);
    return null;
  }
}

export async function searchMovies(query: string): Promise<MovieResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const data = await fetchSearch(q);
    if (!data) return [];

    return data.results.map((r) => {
      const title =
        r.title ?? r.name ?? r.original_title ?? r.original_name ?? "Untitled";
      const date = r.release_date ?? r.first_air_date;
      const media_type =
        r.media_type ??
        (r.title || r.original_title || r.release_date
          ? "movie"
          : r.name || r.first_air_date
            ? "tv"
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
  } catch (err) {
    console.error("searchMovies failed:", err);
    return [];
  }
}

/* =========================
   Movie lists (OpenAPI-aligned DTOs)
   GET /api/movies/lists/{listType}?page=n
========================= */

export type MovieListType = "popular" | "top_rated" | "now_playing" | "upcoming";

export type MovieListItemDTO = {
  tmdbId: number;
  title: string;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null; // YYYY-MM-DD
  genreIds: number[];
  popularity?: number | null;
  voteAverage?: number | null;
  voteCount?: number | null;
};

export type MovieListResponseDTO = {
  listType: MovieListType;
  page: number;
  results: MovieListItemDTO[];
  totalPages: number;
  totalResults: number;
};

/**
 * Fetch ONE page of a movie list.
 * Contract: GET /api/movies/lists/{listType}?page=n -> MovieListResponseDTO
 */
export async function getMovieListPage(
  listType: MovieListType,
  page: number
): Promise<MovieListResponseDTO | null> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!isValidPositiveInt(page)) {
    console.error("Invalid page", page);
    return null;
  }

  try {
    const dto = await fetchJson<MovieListResponseDTO>(
      `${apiUrl}/api/movies/lists/${listType}?page=${page}`
    );
    

    // Lightweight runtime sanity checks (avoid silent UI corruption)
    if (
      dto.listType !== listType ||
      !isValidPositiveInt(dto.page) ||
      !Array.isArray(dto.results) ||
      !isValidPositiveInt(dto.totalPages) ||
      dto.totalResults < 0
    ) {
      console.error("Invalid MovieListResponseDTO shape", dto);
      return null;
    }

    return dto;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("getMovieListPage failed:", err.status, err.payload ?? err);
      return null;
    }
    console.error("getMovieListPage failed:", err);
    return null;
  }
}

/* =========================
   Single movie (OpenAPI-aligned DTO)
   GET /api/movies/{tmdbId} -> MovieResponseDTO
========================= */

export type MovieResponseDTO = {
  tmdbId: number;
  title: string;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null; // date
  runtimeMinutes: number | null;
  genres: string[]; // required by OpenAPI
};

export async function getMovie(tmdbId: number): Promise<MovieResponseDTO | null> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!isValidPositiveInt(tmdbId)) {
    console.error("Invalid tmdbId", tmdbId);
    return null;
  }

  try {
    const data = await fetchJson<MovieResponseDTO>(`${apiUrl}/api/movies/${tmdbId}`);

    // OpenAPI says: required ["tmdbId", "title", "genres"], additionalProperties false
    if (
      !isValidPositiveInt(data.tmdbId) ||
      typeof data.title !== "string" ||
      !Array.isArray(data.genres)
    ) {
      console.error("Invalid MovieResponseDTO shape", data);
      return null;
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("getMovie failed:", err.status, err.payload ?? err);
      return null;
    }
    console.error("getMovie failed:", err);
    return null;
  }
}

/* =========================
   Persons - kept
========================= */

export interface PersonResult {
  tmdbPersonId: number;
  name: string;
  profileUrl?: string | null;
  knownForDepartment?: string;
  popularity?: number;
}

type PeopleListResponse = {
  page: number;
  results: Array<{
    tmdbPersonId: number;
    name: string;
    profileUrl?: string | null;
    knownForDepartment?: string;
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
      console.error("People endpoint failed with status", response.status);
      return [];
    }

    const data = (await response.json()) as PeopleListResponse;

    if (!Array.isArray(data.results)) {
      console.error("People response missing results array");
      return [];
    }

    return data.results.map((p) => ({
      tmdbPersonId: p.tmdbPersonId,
      name: p.name,
      profileUrl: p.profileUrl ?? null,
      known_for_department: p.knownForDepartment,
      popularity: p.popularity,
    }));
  } catch (error) {
    console.error("Fetching trending people failed", error);
    return [];
  }
}

export type PersonDetails = {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  placeOfBirth?: string | null;
  knownForDepartment?: string;
  profileUrl?: string | null;
};

export async function getPerson(personId: number): Promise<PersonDetails | null> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!isValidPositiveInt(personId)) {
    console.error("Invalid personId", personId);
    return null;
  }

  try {
    const data = await fetchJson<PersonDetails>(`${apiUrl}/api/people/${personId}`);
    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("getPerson failed:", err.status, err.payload ?? err);
      return null;
    }
    console.error("getPerson failed:", err);
    return null;
  }
}
