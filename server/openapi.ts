import type { OpenAPIV3 } from "openapi-types";

export const openapi: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: {
        title: "MovieApp API",
        version: "0.1.0",
    },
    servers: [
        { url: "http://localhost:3000", description: "Local" }
    ],
    paths: {
        "/api/health": {
            get: {
                summary: "Health check",
                responses: {
                    "200": {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { ok: { type: "boolean" } },
                                    required: ["ok"],
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/movie/:id": {
            get: {
                summary: "Get movie by id",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" }
                    }
                ],
                responses: {
                    "200": {
                        description: "Movie",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Movie" }
                            }
                        }
                    },
                    "404": {
                        description: "Not found"
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            Movie: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    title: { type: "string" },
                    releaseDate: { type: "string", nullable: true}
                }
            }
        }
    }
}