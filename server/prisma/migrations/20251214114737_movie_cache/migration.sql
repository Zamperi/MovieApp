/*
  Warnings:

  - You are about to drop the column `backdrop_path` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `poster_path` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `release_date` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `runtime` on the `Movie` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "backdrop_path",
DROP COLUMN "createdAt",
DROP COLUMN "poster_path",
DROP COLUMN "release_date",
DROP COLUMN "runtime",
ADD COLUMN     "backdropUrl" TEXT,
ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ADD COLUMN     "runtimeMinutes" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
