/*
  Warnings:

  - You are about to drop the column `projectId` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Song` table. All the data in the column will be lost.
  - Added the required column `project_id` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "current_phase" TEXT DEFAULT '1',
    CONSTRAINT "Song_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Song" ("created_at", "id", "title", "updated_at") SELECT "created_at", "id", "title", "updated_at" FROM "Song";
DROP TABLE "Song";
ALTER TABLE "new_Song" RENAME TO "Song";
CREATE INDEX "Song_project_id_idx" ON "Song"("project_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
