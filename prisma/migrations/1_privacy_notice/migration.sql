-- AlterTable
ALTER TABLE "Page" ADD COLUMN "privacyNoticeEnabled" BOOLEAN NOT NULL DEFAULT true;

-- Until now the notice was drawn on exactly the pages that run an enabled Meta
-- Pixel, and nowhere else. New pages start with the notice on, but pages that
-- already exist keep looking the way they do today: pages without a running
-- Pixel are switched off, so no customer's live page changes until the owner
-- chooses to turn it on. Pixel ids are stored as a JSON array of quoted
-- strings, so a '"' in the column means at least one id is present.
UPDATE "Page"
SET "privacyNoticeEnabled" = false
WHERE NOT ("fbPixelEnabled" AND COALESCE("fbPixelIds", '') LIKE '%"%');
