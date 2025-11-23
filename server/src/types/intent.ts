export type Year = number | [number, number];

export type Intent = 
    | { kind: "genre"; genreId: number }
    | { kind: "collection"; name: string }
    | { kind: "person"; name: string; role?: 'actor' | 'director' }
    | { kind: 'keyword'; keyword: string}
    | { kind: 'title'; title: string; year?: Year}
    | { kind: 'multi'; query: string; year?: Year}

export interface ParsedQuery {
    raw: string;
    tokens: string[];
    power: Record<string, string>;
    year?: Year;
    lang?: string;
    adult?: boolean;
}