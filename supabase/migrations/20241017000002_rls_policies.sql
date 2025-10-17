-- Row Level Security (RLS) Policies for Fate Shift
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birth_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_readings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (handled by trigger, but allow for manual cases)
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- BIRTH DATA POLICIES
-- ============================================================================

-- Users can view their own birth data
CREATE POLICY "Users can view own birth data"
    ON public.birth_data
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own birth data
CREATE POLICY "Users can insert own birth data"
    ON public.birth_data
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own birth data
CREATE POLICY "Users can update own birth data"
    ON public.birth_data
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own birth data
CREATE POLICY "Users can delete own birth data"
    ON public.birth_data
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- CHART SNAPSHOTS POLICIES
-- ============================================================================

-- Users can view chart snapshots for their own birth data
CREATE POLICY "Users can view own chart snapshots"
    ON public.chart_snapshots
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.birth_data
            WHERE birth_data.id = chart_snapshots.birth_data_id
            AND birth_data.user_id = auth.uid()
        )
    );

-- Users can insert chart snapshots for their own birth data
CREATE POLICY "Users can insert own chart snapshots"
    ON public.chart_snapshots
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.birth_data
            WHERE birth_data.id = chart_snapshots.birth_data_id
            AND birth_data.user_id = auth.uid()
        )
    );

-- Users can delete their own chart snapshots
CREATE POLICY "Users can delete own chart snapshots"
    ON public.chart_snapshots
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.birth_data
            WHERE birth_data.id = chart_snapshots.birth_data_id
            AND birth_data.user_id = auth.uid()
        )
    );

-- ============================================================================
-- READINGS POLICIES
-- ============================================================================

-- Users can view their own readings
CREATE POLICY "Users can view own readings"
    ON public.readings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own readings
CREATE POLICY "Users can insert own readings"
    ON public.readings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own readings
CREATE POLICY "Users can update own readings"
    ON public.readings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own readings
CREATE POLICY "Users can delete own readings"
    ON public.readings
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- SHARED READINGS POLICIES
-- ============================================================================

-- Users can view shared readings they created
CREATE POLICY "Users can view own shared readings"
    ON public.shared_readings
    FOR SELECT
    USING (auth.uid() = shared_by);

-- Anyone can view public shared readings or with valid token (handled in app logic)
CREATE POLICY "Public can view public shared readings"
    ON public.shared_readings
    FOR SELECT
    USING (
        is_public = true
        OR auth.uid() = shared_by
    );

-- Users can create shared readings for their own readings
CREATE POLICY "Users can create shared readings"
    ON public.shared_readings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.readings
            WHERE readings.id = shared_readings.reading_id
            AND readings.user_id = auth.uid()
        )
    );

-- Users can update their own shared readings
CREATE POLICY "Users can update own shared readings"
    ON public.shared_readings
    FOR UPDATE
    USING (auth.uid() = shared_by)
    WITH CHECK (auth.uid() = shared_by);

-- Users can delete their own shared readings
CREATE POLICY "Users can delete own shared readings"
    ON public.shared_readings
    FOR DELETE
    USING (auth.uid() = shared_by);

-- ============================================================================
-- HELPER FUNCTIONS FOR SHARED ACCESS
-- ============================================================================

-- Function to check if a share token is valid
CREATE OR REPLACE FUNCTION public.is_valid_share_token(token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.shared_readings
        WHERE share_token = token
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count on shared readings
CREATE OR REPLACE FUNCTION public.increment_share_view_count(token TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.shared_readings
    SET view_count = view_count + 1
    WHERE share_token = token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.birth_data TO authenticated;
GRANT ALL ON public.chart_snapshots TO authenticated;
GRANT ALL ON public.readings TO authenticated;
GRANT ALL ON public.shared_readings TO authenticated;

-- Grant access to sequences (for auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Allow users to view their own profile';
COMMENT ON POLICY "Users can view own birth data" ON public.birth_data IS 'Allow users to view their own birth data';
COMMENT ON POLICY "Users can view own readings" ON public.readings IS 'Allow users to view their own readings';
