import type { OpenAPIV3 } from "openapi-types";

export const openapi: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: {
        title: "MovieApp API",
        version: "0.1.0",
    },
    servers: [{ url: "http://localhost:3000", description: "Local" }],
    paths: {
        "/api/health": {
            get: {
                operationId: "healthCheck",
                summary: "Health check",
                responses: {
                    "200": {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    additionalProperties: false,
                                    properties: { ok: { type: "boolean" } },
                                    required: ["ok"],
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/movies/{tmdbId}": {
            get: {
                operationId: "getMovieByTmdbId",
                summary: "Get movie by TMDB id",
                parameters: [
                    {
                        name: "tmdbId",
                        in: "path",
                        required: true,
                        schema: { type: "integer", minimum: 1 },
                    },
                ],
                responses: {
                    "200": {
                        description: "Movie fetched successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/MovieResponseDTO" },
                            },
                        },
                    },

                    "400": {
                        description: "Invalid TMDB id",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    validationError: {
                                        value: {
                                            error: "VALIDATION_ERROR",
                                            message: "tmdbId must be a positive integer",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "404": {
                        description: "Movie not found in TMDB",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    notFound: {
                                        value: {
                                            error: "MOVIE_NOT_FOUND",
                                            message: "Movie not found",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "502": {
                        description: "Upstream TMDB error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    upstreamError: {
                                        value: {
                                            error: "UPSTREAM_TMDB_ERROR",
                                            message: "Failed to fetch movie from TMDB",
                                        },
                                    },
                                    schemaMismatch: {
                                        value: {
                                            error: "UPSTREAM_SCHEMA_MISMATCH",
                                            message: "TMDB response did not match expected schema",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Internal database error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    dbError: {
                                        value: {
                                            error: "DB_ERROR",
                                            message: "Database operation failed",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/movies/lists/{listType}": {
            get: {
                operationId: "getMovieListByType",
                summary: "Get a paginated movie list from TMDB (cached)",
                parameters: [
                    {
                        name: "listType",
                        in: "path",
                        required: true,
                        schema: {
                            type: "string",
                            enum: ["popular", "top_rated", "now_playing", "upcoming"],
                        },
                    },
                    {
                        name: "page",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            default: 1,
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Movie list fetched successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/MovieListResponseDTO" },
                            },
                        },
                    },

                    "400": {
                        description: "Invalid listType or page",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    validationError: {
                                        value: {
                                            error: "VALIDATION_ERROR",
                                            message:
                                                "listType must be one of: popular, top_rated, now_playing, upcoming; page must be an integer >= 1",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "502": {
                        description: "Upstream TMDB error or schema mismatch",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },

                    "500": {
                        description: "Internal database error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
        },
    },


    components: {
        schemas: {
            MovieResponseDTO: {
                type: "object",
                additionalProperties: false,
                required: ["tmdbId", "title", "genres"],
                properties: {
                    tmdbId: { type: "integer" },
                    title: { type: "string" },
                    overview: { type: "string", nullable: true },
                    posterUrl: { type: "string", nullable: true },
                    backdropUrl: { type: "string", nullable: true },
                    releaseDate: { type: "string", nullable: true, format: "date" },
                    runtimeMinutes: { type: "integer", nullable: true },
                    genres: { type: "array", items: { type: "string" } },
                },
            },

            ErrorResponse: {
                type: "object",
                additionalProperties: false,
                required: ["error", "message"],
                properties: {
                    error: { type: "string" },
                    message: { type: "string" },
                    details: {
                        type: "object",
                        nullable: true,
                        additionalProperties: true,
                    },
                },
            },
            MovieListItemDTO: {
                type: "object",
                additionalProperties: false,
                required: ["tmdbId", "title", "genreIds"],
                properties: {
                    tmdbId: { type: "integer" },
                    title: { type: "string" },
                    overview: { type: "string", nullable: true },
                    posterUrl: { type: "string", nullable: true },
                    backdropUrl: { type: "string", nullable: true },
                    releaseDate: { type: "string", nullable: true, format: "date" },
                    genreIds: { type: "array", items: { type: "integer" } },
                    popularity: { type: "number", nullable: true },
                    voteAverage: { type: "number", nullable: true },
                    voteCount: { type: "integer", nullable: true },
                },
            },

            MovieListResponseDTO: {
                type: "object",
                additionalProperties: false,
                required: ["listType", "page", "results", "totalPages", "totalResults"],
                properties: {
                    listType: {
                        type: "string",
                        enum: ["popular", "top_rated", "now_playing", "upcoming"],
                    },
                    page: { type: "integer", minimum: 1 },
                    results: {
                        type: "array",
                        items: { $ref: "#/components/schemas/MovieListItemDTO" },
                    },
                    totalPages: { type: "integer", minimum: 1 },
                    totalResults: { type: "integer", minimum: 0 },
                },
            },

        },
    },

};
