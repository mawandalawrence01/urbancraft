-- CreateEnum
CREATE TYPE "DesignOrigin" AS ENUM ('UNSET', 'OWN_WORK', 'REFERENCE');

-- CreateEnum
CREATE TYPE "EnquiryKind" AS ENUM ('PRODUCT', 'DESIGN');

-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN     "kind" "EnquiryKind" NOT NULL DEFAULT 'PRODUCT',
ADD COLUMN     "serviceSlug" TEXT,
ADD COLUMN     "spaceType" TEXT,
ADD COLUMN     "budgetBand" TEXT,
ADD COLUMN     "timeline" TEXT;

-- CreateTable
CREATE TABLE "DesignService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'FITOUT',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignImage" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "blurDataUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "origin" "DesignOrigin" NOT NULL DEFAULT 'UNSET',
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignService_slug_key" ON "DesignService"("slug");

-- CreateIndex
CREATE INDEX "DesignService_isPublished_position_idx" ON "DesignService"("isPublished", "position");

-- CreateIndex
CREATE INDEX "DesignService_kind_position_idx" ON "DesignService"("kind", "position");

-- CreateIndex
CREATE UNIQUE INDEX "DesignImage_url_key" ON "DesignImage"("url");

-- CreateIndex
CREATE INDEX "DesignImage_serviceId_position_idx" ON "DesignImage"("serviceId", "position");

-- CreateIndex
CREATE INDEX "DesignImage_origin_idx" ON "DesignImage"("origin");

-- CreateIndex
CREATE INDEX "DesignImage_needsReview_idx" ON "DesignImage"("needsReview");

-- CreateIndex
CREATE INDEX "Enquiry_kind_status_createdAt_idx" ON "Enquiry"("kind", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "DesignImage" ADD CONSTRAINT "DesignImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "DesignService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
