-- CreateTable
CREATE TABLE "RestaurantInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "role" "RestaurantRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantInvitation_tokenHash_key" ON "RestaurantInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "RestaurantInvitation_restaurantId_email_idx" ON "RestaurantInvitation"("restaurantId", "email");

-- CreateIndex
CREATE INDEX "RestaurantInvitation_email_acceptedAt_revokedAt_idx" ON "RestaurantInvitation"("email", "acceptedAt", "revokedAt");

-- CreateIndex
CREATE INDEX "RestaurantUser_restaurantId_deletedAt_idx" ON "RestaurantUser"("restaurantId", "deletedAt");

-- CreateIndex
CREATE INDEX "RestaurantUser_userId_deletedAt_idx" ON "RestaurantUser"("userId", "deletedAt");

-- A user can belong to only one restaurant at a time in the current actor model.
CREATE UNIQUE INDEX "RestaurantUser_userId_active_key" ON "RestaurantUser"("userId") WHERE "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "RestaurantInvitation" ADD CONSTRAINT "RestaurantInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
