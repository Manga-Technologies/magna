-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "transports" TEXT[],

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);
