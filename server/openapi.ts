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
        "/api/people/{tmdbPersonId}": {
            get: {
                operationId: "getPersonByTmdbPersonId",
                summary: "Get person by TMDB id",
                parameters: [
                    {
                        name: "tmdbPersonId",
                        in: "path",
                        required: true,
                        schema: { type: "integer", minimum: 1 },
                    },
                ],
                responses: {
                    "200": {
                        description: "Person fetched successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/PersonResponseDTO" },
                            },
                        },
                    },

                    "400": {
                        description: "Invalid TMDB person id",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    validationError: {
                                        value: {
                                            error: "VALIDATION_ERROR",
                                            message: "tmdbPersonId must be a positive integer",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "404": {
                        description: "Person not found in TMDB",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    notFound: {
                                        value: {
                                            error: "PERSON_NOT_FOUND",
                                            message: "Person not found",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "502": {
                        description: "TMDB upstream error or payload schema mismatch",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    upstreamTmdbError: {
                                        value: {
                                            error: "UPSTREAM_TMDB_ERROR",
                                            message: "TMDB upstream error",
                                        },
                                    },
                                    upstreamSchemaMismatch: {
                                        value: {
                                            error: "UPSTREAM_SCHEMA_MISMATCH",
                                            message: "TMDB response schema mismatch",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Database error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    dbError: {
                                        value: {
                                            error: "DB_ERROR",
                                            message: "Database error",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        "/api/people/trending": {
            get: {
                operationId: "getTrendingPeople",
                summary: "Get trending people (day)",
                responses: {
                    "200": {
                        description: "Trending people fetched successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/TrendingPeopleResponseDTO" },
                            },
                        },
                    },

                    "502": {
                        description: "TMDB upstream error or payload schema mismatch",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    upstreamTmdbError: {
                                        value: {
                                            error: "UPSTREAM_TMDB_ERROR",
                                            message: "TMDB upstream error",
                                        },
                                    },
                                    upstreamSchemaMismatch: {
                                        value: {
                                            error: "UPSTREAM_SCHEMA_MISMATCH",
                                            message: "TMDB response schema mismatch",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Database error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    dbError: {
                                        value: {
                                            error: "DB_ERROR",
                                            message: "Database error",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },

        // --------------------------------------
        // Groups
        // --------------------------------------

        "/api/groups/all": {
            get: {
                operationId: "getAllGroups",
                summary: "Get all groups",
                responses: {
                    "200": {
                        description: "Public groups fetched succesfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/GroupsResponseDTO" },
                            }
                        },
                    },
                    "500": {
                        description: "Database error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/componenents/schemas/ErrorResponse" },
                                examples: {
                                    dbError: {
                                        value: {
                                            error: "DB_ERROR",
                                            message: "Database error",
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
        },
        "/api/groups/{groupId}": {
            parameters: [
                {
                    name: "groupId",
                    in: "path",
                    required: true,
                    schema: { type: "integer", minimum: 1 },
                },
            ],
            get: {
                operationId: "getSingleGroup",
                summary: "Get single group",
                responses: {
                    "200": {
                        description: "A group fetched successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/GroupResponseDTO" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid groupId",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Requester is not allowed to access this group.",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "404": {
                        description: "Group does not exist",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "500": {
                        description: "Server error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
            delete: {
                operationId: "deleteGroup",
                summary: "Delete a group",
                responses: {
                    "200": {
                        description: "A group deleted successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/DeleteGroupResponseDTO" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid groupId",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "401": {
                        description: "Missing authentication",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden. Requester is not a group owner.",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "404": {
                        description: "Group does not exist or is already deleted",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                    "500": {
                        description: "Server error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
        },

        "/api/groups/{groupId}/join-requests": {
            parameters: [
                {
                    name: "groupId",
                    in: "path",
                    required: true,
                    schema: { type: "integer", minimum: 1 },
                },
            ],
            post: {
                operationId: "createGroupJoinRequest",
                summary: "Create a join request for a public group",
                responses: {
                    "201": {
                        description: "Join request created",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/JoinRequestDTO" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid groupId",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    validationError: {
                                        value: {
                                            error: "VALIDATION_ERROR",
                                            message: "groupId must be a positive integer",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized (missing or invalid authentication)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    unauthorized: {
                                        value: {
                                            error: "UNAUTHORIZED",
                                            message: "Authentication required",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden (group is not public OR requester is the group owner)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    groupNotPublic: {
                                        value: {
                                            error: "FORBIDDEN",
                                            message: "Group is not public",
                                        },
                                    },
                                    ownerCannotJoin: {
                                        value: {
                                            error: "FORBIDDEN",
                                            message: "Owner cannot request to join",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Group not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    groupNotFound: {
                                        value: {
                                            error: "NOT_FOUND",
                                            message: "Group not found",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Conflict (already a member OR join request already pending)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    alreadyMember: {
                                        value: {
                                            error: "CONFLICT",
                                            message: "Already a member",
                                        },
                                    },
                                    pendingExists: {
                                        value: {
                                            error: "CONFLICT",
                                            message: "Join request already pending",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Database operation failed",
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

        "/api/groups/{groupId}/join-requests/{requestId}/approve": {
            parameters: [
                {
                    name: "groupId",
                    in: "path",
                    required: true,
                    schema: { type: "integer", minimum: 1 },
                },
                {
                    name: "requestId",
                    in: "path",
                    required: true,
                    schema: { type: "integer", minimum: 1 },
                },
            ],
            post: {
                operationId: "approveGroupJoinRequest",
                summary: "Approve a pending join request (group owner only)",
                responses: {
                    "200": {
                        description: "Join request approved",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/JoinRequestDTO" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid groupId or requestId",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    validationError: {
                                        value: {
                                            error: "VALIDATION_ERROR",
                                            message: "groupId and requestId must be positive integers",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized (missing or invalid authentication)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    unauthorized: {
                                        value: {
                                            error: "UNAUTHORIZED",
                                            message: "Authentication required",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden (requester is not the group owner)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    notOwner: {
                                        value: {
                                            error: "FORBIDDEN",
                                            message: "Not group owner",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Group not found OR join request not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    groupNotFound: {
                                        value: {
                                            error: "NOT_FOUND",
                                            message: "Group not found",
                                        },
                                    },
                                    requestNotFound: {
                                        value: {
                                            error: "NOT_FOUND",
                                            message: "Join request not found",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Conflict (join request is not in pending state)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    notPending: {
                                        value: {
                                            error: "CONFLICT",
                                            message: "Request not pending",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Database operation failed",
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

        "/api/groups/{groupId}/join-requests/{requestId}/decline": {
            parameters: [
                {
                    name: "groupId",
                    in: "path",
                    required: true,
                    schema: { type: "integer", minimum: 1 },
                },
                {
                    name: "requestId",
                    in: "path",
                    required: true,
                    schema: { type: "integer", minimum: 1 },
                },
            ],
            post: {
                operationId: "declineGroupJoinRequest",
                summary: "Decline a pending join request (group owner only)",
                responses: {
                    "200": {
                        description: "Join request declined",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/JoinRequestDTO" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid groupId or requestId",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    validationError: {
                                        value: {
                                            error: "VALIDATION_ERROR",
                                            message: "groupId and requestId must be positive integers",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized (missing or invalid authentication)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    unauthorized: {
                                        value: {
                                            error: "UNAUTHORIZED",
                                            message: "Authentication required",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "403": {
                        description: "Forbidden (requester is not the group owner)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    notOwner: {
                                        value: {
                                            error: "FORBIDDEN",
                                            message: "Not group owner",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Group not found OR join request not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    groupNotFound: {
                                        value: {
                                            error: "NOT_FOUND",
                                            message: "Group not found",
                                        },
                                    },
                                    requestNotFound: {
                                        value: {
                                            error: "NOT_FOUND",
                                            message: "Join request not found",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "409": {
                        description: "Conflict (join request is not in pending state)",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    notPending: {
                                        value: {
                                            error: "CONFLICT",
                                            message: "Request not pending",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Database operation failed",
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

        "/api/groups": {
            post: {
                operationId: "CreateGroup",
                summary: "Create a group",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CreateGroupRequestDTO" },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Group created successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/GroupDTO" },
                            },
                        },
                    },

                    "400": {
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    validationError: {
                                        value: {
                                            error: "VALIDATION_ERROR",
                                            message: "name must be a non-empty string; public must be boolean",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    unauthorized: {
                                        value: {
                                            error: "UNAUTHORIZED",
                                            message: "Authentication required",
                                        },
                                    },
                                },
                            },
                        },
                    },

                    "500": {
                        description: "Database error",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    dbError: {
                                        value: {
                                            error: "DB_ERROR",
                                            message: "Database error",
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

            // ------------------------------------------
            // People
            // ------------------------------------------

            PersonResponseDTO: {
                type: "object",
                additionalProperties: false,
                required: ["tmdbPersonId", "name"],
                properties: {
                    tmdbPersonId: { type: "integer", minimum: 1 },
                    name: { type: "string" },
                    biography: { type: "string", nullable: true },
                    profileUrl: { type: "string", nullable: true },
                    knownForDepartment: { type: "string", nullable: true },
                    birthday: { type: "string", nullable: true },      // YYYY-MM-DD
                    deathday: { type: "string", nullable: true },      // YYYY-MM-DD
                    placeOfBirth: { type: "string", nullable: true },
                },
            },

            TrendingPersonDTO: {
                type: "object",
                additionalProperties: false,
                required: ["tmdbPersonId", "name"],
                properties: {
                    tmdbPersonId: { type: "integer", minimum: 1 },
                    name: { type: "string" },
                    profileUrl: { type: "string", nullable: true },
                    knownForDepartment: { type: "string", nullable: true },
                    popularity: { type: "number", nullable: true },
                },
            },

            TrendingPeopleResponseDTO: {
                type: "object",
                additionalProperties: false,
                required: ["page", "results", "totalPages", "totalResults"],
                properties: {
                    page: { type: "integer", minimum: 1 },
                    results: {
                        type: "array",
                        items: { $ref: "#/components/schemas/TrendingPersonDTO" },
                    },
                    totalPages: { type: "integer", minimum: 1 },
                    totalResults: { type: "integer", minimum: 0 },
                },
            },

            //-----------------------------------
            // Groups
            //-----------------------------------

            GroupListItemDTO: {
                type: "object",
                additionalProperties: false,
                required: ["groupId", "groupName"],
                properties: {
                    groupId: { type: "integer", minimum: 1 },
                    groupName: { type: "string", minLength: 1 },
                },
            },

            GroupsResponseDTO: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/GroupListItemDTO",
                },
            },

            GroupDTO: {
                type: "object",
                additionalProperties: false,
                required: ["groupId", "groupName", "isPublic", "createdAt"],
                properties: {
                    groupId: { type: "integer", minimum: 1 },
                    groupName: { type: "string", minLength: 1 },
                    isPublic: { type: "boolean" },
                    createdAt: { type: "string", format: "date-time" },
                },
            },

            GroupWithMembersDTO: {
                type: "object",
                additionalProperties: false,
                required: ["groupId", "groupName", "isPublic", "members", "createdAt"],
                properties: {
                    groupId: { type: "integer", minimum: 1 },
                    groupName: { type: "string", minLength: 1 },
                    isPublic: { type: "boolean" },
                    members: {
                        type: "array",
                        items: {
                            type: "integer",
                            minimum: 1,
                        },
                    },
                    createdAt: { type: "string", format: "date-time" },
                },
            },

            CreateGroupRequestDTO: {
                type: "object",
                additionalProperties: false,
                required: ["groupName", "isPublic"],
                properties: {
                    groupName: { type: "string", minLength: 1 },
                    isPublic: { type: "boolean" },
                },
            },

            JoinRequestDTO: {
                type: "object",
                additionalProperties: false,
                required: ["requestId", "groupId", "userId", "status", "createdAt"],
                properties: {
                    requestId: { type: "integer", minimum: 1 },
                    groupId: { type: "integer", minimum: 1 },
                    userId: { type: "integer", minimum: 1 },
                    status: {
                        type: "string",
                        enum: ["pending", "approved", "rejected"],
                    },
                    createdAt: { type: "string", format: "date-time" },
                    decidedAt: { type: "string", format: "date-time" },
                },
            },

            LeaveGroupResponseDTO: {
                type: "object",
                additionalProperties: false,
                required: ["groupId", "userId", "leftAt"],
                properties: {
                    groupId: { type: "integer", minimum: 1 },
                    userId: { type: "integer", minimum: 1 },
                    leftAt: { type: "string", format: "date-time" },
                },
            },

            DeleteGroupResponseDTO: {
                type: "object",
                additionalProperties: false,
                required: ["groupId", "deletedAt"],
                properties: {
                    groupId: { type: "integer", minimum: 1 },
                    deletedAt: { type: "string", format: "date-time" },
                },
            },



            // -----------------------------------
            // Error
            // -----------------------------------

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
