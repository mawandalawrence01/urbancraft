-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "heroRank" INTEGER;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "needsReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewNote" TEXT;

-- CreateIndex
CREATE INDEX "ProductImage_needsReview_idx" ON "ProductImage"("needsReview");
