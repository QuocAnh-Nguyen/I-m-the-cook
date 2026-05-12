/*
  Warnings:

  - You are about to drop the column `calories` on the `meal_slots` table. All the data in the column will be lost.
  - You are about to drop the column `customName` on the `meal_slots` table. All the data in the column will be lost.
  - You are about to drop the column `recipeId` on the `meal_slots` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "meal_slot_dishes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealSlotId" TEXT NOT NULL,
    "recipeId" TEXT,
    "customName" TEXT,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "protein" INTEGER NOT NULL DEFAULT 0,
    "carbs" INTEGER NOT NULL DEFAULT 0,
    "fat" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meal_slot_dishes_mealSlotId_fkey" FOREIGN KEY ("mealSlotId") REFERENCES "meal_slots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meal_slot_dishes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_meal_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "day" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meal_slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_meal_slots" ("createdAt", "day", "id", "mealType", "synced", "updatedAt", "userId", "weekStart") SELECT "createdAt", "day", "id", "mealType", "synced", "updatedAt", "userId", "weekStart" FROM "meal_slots";
DROP TABLE "meal_slots";
ALTER TABLE "new_meal_slots" RENAME TO "meal_slots";
CREATE INDEX "meal_slots_userId_weekStart_idx" ON "meal_slots"("userId", "weekStart");
CREATE UNIQUE INDEX "meal_slots_userId_weekStart_day_mealType_key" ON "meal_slots"("userId", "weekStart", "day", "mealType");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "calorieGoal" INTEGER NOT NULL DEFAULT 2000,
    "proteinGoal" INTEGER NOT NULL DEFAULT 150,
    "carbsGoal" INTEGER NOT NULL DEFAULT 250,
    "fatGoal" INTEGER NOT NULL DEFAULT 65,
    "dietaryPreferences" TEXT NOT NULL DEFAULT '[]',
    "cuisinePreferences" TEXT NOT NULL DEFAULT '[]',
    "allergies" TEXT NOT NULL DEFAULT '[]',
    "familySize" INTEGER NOT NULL DEFAULT 2,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatarUrl", "calorieGoal", "carbsGoal", "createdAt", "email", "fatGoal", "id", "name", "passwordHash", "proteinGoal", "updatedAt") SELECT "avatarUrl", "calorieGoal", "carbsGoal", "createdAt", "email", "fatGoal", "id", "name", "passwordHash", "proteinGoal", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "meal_slot_dishes_mealSlotId_idx" ON "meal_slot_dishes"("mealSlotId");
