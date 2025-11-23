// filterConfig.ts
export type PageKey = 'movies' | 'search' | 'groups' | 'people';

export type SortOption = {
    value: string;
    label: string;
};

export type FilterField =
    | {
        type: 'select';
        key: string;
        label: string;
        options: { value: string; label: string }[];
    }
    | {
        type: 'range';
        key: string;
        label: string;
        min: number;
        max: number;
        step?: number;
    }
    | {
        type: 'boolean';
        key: string;
        label: string;
        default: boolean;
    }
    | {
        type: 'multiSelect';
        key: string;
        label: string;
        options: { value: number; label: string }[];
    };

export type FilterConfig = {
    sortOptions: SortOption[];
    filterFields: FilterField[];
};

export type GenreOption = {
    value: number;
    label: string;
};

export const genreOptions: GenreOption[] = [
    { label: 'Action', value: 28 },
    { label: 'Adventure', value: 12 },
    { label: 'Animation', value: 16 },
    { label: 'Comedy', value: 35 },
    { label: 'Crime', value: 80 },
    { label: 'Documentary', value: 99 },
    { label: 'Drama', value: 18 },
    { label: 'Family', value: 10751 },
    { label: 'Fantasy', value: 14 },
    { label: 'History', value: 36 },
    { label: 'Horror', value: 27 },
    { label: 'Music', value: 10402 },
    { label: 'Mystery', value: 9648 },
    { label: 'Romance', value: 10749 },
    { label: 'Science Fiction', value: 878 },
    { label: 'TV Movie', value: 10770 },
    { label: 'Thriller', value: 53 },
    { label: 'War', value: 10752 },
    { label: 'Western', value: 37 },
];


export const filterConfigByPage: Record<PageKey, FilterConfig> = {
    movies: {
        sortOptions: [
            { value: 'popular', label: 'Popular' },
            { value: 'now_playing', label: 'Now Playing' },
            { value: 'top_rated', label: 'Top Rated' },
            { value: 'upcoming', label: 'Upcoming' },
        ],
        filterFields: [
            {
                type: 'boolean',
                key: 'hasPoster',
                label: 'Has poster',
                default: false,
            },
            {
                type: 'multiSelect',
                key: 'genres',
                label: 'Genres',
                options: genreOptions,
            },
        ],
    },
    groups: {
        sortOptions: [
            { value: 'name_asc', label: 'Name (A–Z)' },
            { value: 'name_desc', label: 'Name (Z–A)' },
            { value: 'created_newest', label: 'Newest' },
            { value: 'created_oldest', label: 'Oldest' },
        ],
        filterFields: [],
    },
    search: {
        sortOptions: [
            { value: 'relevance', label: 'Relevance' },
            { value: 'popular', label: 'Popular' },
            { value: 'release_date', label: 'Release date' },
        ],
        filterFields: [
            {
                type: 'boolean',
                key: 'hasPoster',
                label: 'Has poster',
                default: true,
            },
        ],
    },
    people: {
        sortOptions: [
            {value: 'name_asc', label: 'Name (A-Z)'},
            {value: 'name_desc', label: 'Name (Z-A)'},
            {value: 'popularity', label: 'Popularity'}
        ],
        filterFields: [],
    },
};
