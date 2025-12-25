/*
  Warnings:

  - You are about to drop the column `contactType` on the `Ad` table. All the data in the column will be lost.
  - You are about to drop the column `relationshipTypes` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "location" TEXT,
    "eventDate" DATETIME,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Ad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ad" ("content", "createdAt", "id", "isActive", "location", "title", "userId") SELECT "content", "createdAt", "id", "isActive", "location", "title", "userId" FROM "Ad";
DROP TABLE "Ad";
ALTER TABLE "new_Ad" RENAME TO "Ad";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "gender" TEXT NOT NULL,
    "birthDate" DATETIME,
    "height" INTEGER,
    "location" TEXT,
    "bio" TEXT,
    "photos" TEXT,
    "lookingFor" TEXT,
    "interests" TEXT,
    "personalTraits" TEXT,
    "partnerTraits" TEXT,
    "isSmoker" BOOLEAN NOT NULL DEFAULT false,
    "voiceCallAllowed" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'NONE'
);
INSERT INTO "new_User" ("bio", "birthDate", "createdAt", "email", "gender", "height", "id", "interests", "isSmoker", "location", "lookingFor", "name", "partnerTraits", "password", "personalTraits", "photos", "updatedAt", "voiceCallAllowed") SELECT "bio", "birthDate", "createdAt", "email", "gender", "height", "id", "interests", "isSmoker", "location", "lookingFor", "name", "partnerTraits", "password", "personalTraits", "photos", "updatedAt", "voiceCallAllowed" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
