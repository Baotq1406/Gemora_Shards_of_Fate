-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerSubject" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerSubject_key" ON "AuthIdentity"("provider", "providerSubject");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_userId_provider_key" ON "AuthIdentity"("userId", "provider");

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
