-- CreateTable
CREATE TABLE "people_cache" (
    "tmdb_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "profile_url" TEXT,
    "known_for_department" TEXT,
    "birthday" DATE,
    "deathday" DATE,
    "place_of_birth" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "people_cache_pkey" PRIMARY KEY ("tmdb_id")
);

-- CreateTable
CREATE TABLE "trending_people_cache" (
    "key" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "total_pages" INTEGER NOT NULL,
    "total_results" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trending_people_cache_pkey" PRIMARY KEY ("key")
);
