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
        },
    },
};
