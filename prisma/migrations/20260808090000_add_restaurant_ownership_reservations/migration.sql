-- CreateEnum
CREATE TYPE "RestaurantOwnershipStatus" AS ENUM ('INVITED', 'ACCEPTED');

-- CreateTable
CREATE TABLE "RestaurantOwnership" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "provisioningId" TEXT NOT NULL,
    "ownerFirstName" TEXT NOT NULL,
    "ownerLastName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "status" "RestaurantOwnershipStatus" NOT NULL DEFAULT 'INVITED',
    "invitationId" TEXT NOT NULL,
    "ownerUserId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOwnership_restaurantId_key" ON "RestaurantOwnership"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOwnership_provisioningId_key" ON "RestaurantOwnership"("provisioningId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOwnership_ownerEmail_key" ON "RestaurantOwnership"("ownerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantOwnership_invitationId_key" ON "RestaurantOwnership"("invitationId");

-- CreateIndex
CREATE INDEX "RestaurantOwnership_status_updatedAt_idx" ON "RestaurantOwnership"("status", "updatedAt");

-- Enforce one active initial owner membership for each restaurant at the database layer.
CREATE UNIQUE INDEX "RestaurantUser_restaurantId_initial_owner_key"
ON "RestaurantUser"("restaurantId")
WHERE "role" = 'super_admin' AND "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "RestaurantOwnership" ADD CONSTRAINT "RestaurantOwnership_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "RestaurantInvitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantOwnership" ADD CONSTRAINT "RestaurantOwnership_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
