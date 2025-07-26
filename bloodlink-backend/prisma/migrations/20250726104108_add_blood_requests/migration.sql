-- CreateTable
CREATE TABLE "blood_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "healthCenterId" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "unitsNeeded" INTEGER NOT NULL,
    "unitsReceived" INTEGER NOT NULL DEFAULT 0,
    "urgency" TEXT NOT NULL,
    "procedure" TEXT NOT NULL,
    "patientAge" INTEGER,
    "notes" TEXT,
    "expectedTimeframe" TEXT NOT NULL,
    "expectedFulfillmentDate" DATETIME NOT NULL,
    "contactPreference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "blood_requests_healthCenterId_fkey" FOREIGN KEY ("healthCenterId") REFERENCES "health_centers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "donor_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bloodRequestId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "availableTime" TEXT,
    "notes" TEXT,
    "confirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "donor_responses_bloodRequestId_fkey" FOREIGN KEY ("bloodRequestId") REFERENCES "blood_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "donor_responses_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "donor_responses_bloodRequestId_donorId_key" ON "donor_responses"("bloodRequestId", "donorId");
