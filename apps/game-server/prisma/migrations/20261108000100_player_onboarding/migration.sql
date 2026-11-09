BEGIN;

-- Existing profiles stay incomplete. Never infer a public player name from Google.
ALTER TABLE "PlayerProfile"
    ADD COLUMN "playerName" VARCHAR(16),
    ADD COLUMN "normalizedPlayerName" VARCHAR(32),
    ADD COLUMN "avatarKey" VARCHAR(32),
    ADD COLUMN "onboardingCompletedAt" TIMESTAMPTZ(3);

CREATE UNIQUE INDEX "PlayerProfile_normalizedPlayerName_key"
    ON "PlayerProfile"("normalizedPlayerName");

-- Either no confirmed identity or a complete one; drafts stay client-side.
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_onboarding_complete_check" CHECK (
    ("playerName" IS NULL AND "normalizedPlayerName" IS NULL
        AND "avatarKey" IS NULL AND "onboardingCompletedAt" IS NULL)
    OR
    ("playerName" IS NOT NULL AND "normalizedPlayerName" IS NOT NULL
        AND "avatarKey" IS NOT NULL AND "onboardingCompletedAt" IS NOT NULL)
);

-- The API additionally validates Unicode letters/marks and reserved names.
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_playerName_check" CHECK (
    "playerName" IS NULL OR (
        char_length("playerName") BETWEEN 3 AND 16
        AND "playerName" = normalize("playerName", NFC)
        AND "playerName" = btrim("playerName")
        AND position('  ' in "playerName") = 0
        AND "playerName" !~ '[[:cntrl:]]'
    )
);

ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_normalizedPlayerName_check" CHECK (
    "normalizedPlayerName" IS NULL
    OR "normalizedPlayerName" = lower(normalize("playerName", NFC) COLLATE "pg_catalog"."pg_c_utf8")
);

ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_avatarKey_check" CHECK (
    "avatarKey" IS NULL
    OR "avatarKey" IN ('crystal-dragon', 'moon', 'sun', 'leaf', 'crystal')
);

COMMIT;
