-- CreateEnum
CREATE TYPE "MovieListType" AS ENUM ('popular', 'top_rated', 'now_playing', 'upcoming');

-- CreateTable
CREATE TABLE "movie_list_cache" (
    "id" SERIAL NOT NULL,
    "list_type" "MovieListType" NOT NULL,
    "page" INTEGER NOT NULL,
    "payload_json" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movie_list_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movie_list_cache_list_type_page_key" ON "movie_list_cache"("list_type", "page");
