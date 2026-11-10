-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'user',
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAudit" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseExpiresAt" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '365 days'),
    "licenseNeverExpires" BOOLEAN NOT NULL DEFAULT false,
    "themePreset" TEXT NOT NULL DEFAULT 'green-black',
    "tabTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "logoUrl" TEXT,
    "footerText" TEXT,
    "footerTextColor" TEXT,
    "colorOverrides" TEXT,
    "fbPixelIds" TEXT,
    "fbPixelCode" TEXT,
    "fbPixelEnabled" BOOLEAN NOT NULL DEFAULT true,
    "capiAccessToken" TEXT,
    "capiEndpointUrl" TEXT,
    "capiEventName" TEXT NOT NULL DEFAULT 'subscribe',
    "ctaLayout" TEXT NOT NULL DEFAULT 'horizontal',
    "landingUrl" TEXT,
    "whitepageRedirectUrl" TEXT,
    "cloakToLandingUrl" BOOLEAN NOT NULL DEFAULT false,
    "heroHeadline" TEXT,
    "heroSubtext" TEXT,
    "sections" TEXT NOT NULL DEFAULT '[]',
    "reviewsTitle" TEXT,
    "reviewsSubtitle" TEXT,
    "reviews" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AdminAudit_createdAt_idx" ON "AdminAudit"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_userId_idx" ON "Page"("userId");

-- CreateIndex
CREATE INDEX "Visit_pageId_day_idx" ON "Visit"("pageId", "day");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

