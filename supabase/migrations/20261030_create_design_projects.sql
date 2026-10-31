-- ==============================================================================
-- YClick Complete Supabase Setup: Database Table + Storage + RLS Policies
-- Paste this ENTIRE script into Supabase SQL Editor and click "Run".
-- (Make sure NO text is highlighted/selected before clicking Run)
-- ==============================================================================

-- 1. Create design_projects table with JSONB structures
CREATE TABLE IF NOT EXISTS public.design_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    original_photo_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    scene_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    selected_variant_id TEXT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_design_projects_user_id ON public.design_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_created_at ON public.design_projects(created_at DESC);

-- 3. Enable Row Level Security (RLS) on design_projects
ALTER TABLE public.design_projects ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for design_projects: Support Firebase Third-Party JWTs using (auth.jwt() ->> 'sub')
DROP POLICY IF EXISTS "Users can view their own design projects" ON public.design_projects;
DROP POLICY IF EXISTS "Users can insert their own design projects" ON public.design_projects;
DROP POLICY IF EXISTS "Users can update their own design projects" ON public.design_projects;
DROP POLICY IF EXISTS "Users can delete their own design projects" ON public.design_projects;

CREATE POLICY "Users can view their own design projects"
    ON public.design_projects
    FOR SELECT
    USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can insert their own design projects"
    ON public.design_projects
    FOR INSERT
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update their own design projects"
    ON public.design_projects
    FOR UPDATE
    USING ((auth.jwt() ->> 'sub') = user_id)
    WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can delete their own design projects"
    ON public.design_projects
    FOR DELETE
    USING ((auth.jwt() ->> 'sub') = user_id);

-- 5. Private Storage Bucket Setup: 'room-photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-photos', 'room-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 6. Storage Object RLS Policies
-- Enforces path format: {firebase_uid}/{project_id}/{filename}
DROP POLICY IF EXISTS "Users can read own room photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own room photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own room photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own room photos" ON storage.objects;

CREATE POLICY "Users can read own room photos"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'room-photos'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
    );

CREATE POLICY "Users can upload own room photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'room-photos'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
    );

CREATE POLICY "Users can update own room photos"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'room-photos'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
    )
    WITH CHECK (
        bucket_id = 'room-photos'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
    );

CREATE POLICY "Users can delete own room photos"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'room-photos'
        AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub')
    );
