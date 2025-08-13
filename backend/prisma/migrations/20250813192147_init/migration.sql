-- CreateTable
CREATE TABLE "UserCV" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL,

    CONSTRAINT "UserCV_pkey" PRIMARY KEY ("id")
);
