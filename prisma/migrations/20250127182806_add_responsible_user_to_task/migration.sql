-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'Średni',
    "start_date" DATETIME,
    "end_date" DATETIME,
    "due_date" DATETIME,
    "phase_id" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,
    "song_id" INTEGER,
    "created_by" TEXT NOT NULL,
    "responsible_user" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_responsible_user_fkey" FOREIGN KEY ("responsible_user") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("created_at", "created_by", "description", "due_date", "end_date", "id", "phase_id", "priority", "project_id", "song_id", "start_date", "status", "title", "updated_at") SELECT "created_at", "created_by", "description", "due_date", "end_date", "id", "phase_id", "priority", "project_id", "song_id", "start_date", "status", "title", "updated_at" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
