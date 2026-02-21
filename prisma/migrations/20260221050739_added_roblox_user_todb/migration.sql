-- CreateTable
CREATE TABLE "Roblox_Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "cookie" TEXT,

    CONSTRAINT "Roblox_Account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Roblox_Account" ADD CONSTRAINT "Roblox_Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
