-- Fate Shift Initial Database Schema
-- Creates core tables for astrology application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birth data table
CREATE TABLE public.birth_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME,
    birth_timezone TEXT DEFAULT 'UTC',
    birth_location_lat DECIMAL(10, 8),
    birth_location_lng DECIMAL(11, 8),
    birth_location_name TEXT,
    is_time_known BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chart snapshots table (cached calculations)
CREATE TABLE public.chart_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    birth_data_id UUID REFERENCES public.birth_data(id) ON DELETE CASCADE NOT NULL,
    chart_type TEXT NOT NULL, -- 'natal', 'transit', 'progression', etc.
    calculation_date TIMESTAMPTZ NOT NULL,
    chart_data JSONB NOT NULL, -- Store full chart calculation results
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readings table
CREATE TABLE public.readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    birth_data_id UUID REFERENCES public.birth_data(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL, -- 'natal', 'compatibility', 'transit', 'life_path'
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- Structured reading data
    is_favorite BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared readings table
CREATE TABLE public.shared_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reading_id UUID REFERENCES public.readings(id) ON DELETE CASCADE NOT NULL,
    shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    share_token TEXT UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_birth_data_user_id ON public.birth_data(user_id);
CREATE INDEX idx_chart_snapshots_birth_data_id ON public.chart_snapshots(birth_data_id);
CREATE INDEX idx_chart_snapshots_calculation_date ON public.chart_snapshots(calculation_date);
CREATE INDEX idx_readings_user_id ON public.readings(user_id);
CREATE INDEX idx_readings_birth_data_id ON public.readings(birth_data_id);
CREATE INDEX idx_readings_created_at ON public.readings(created_at DESC);
CREATE INDEX idx_shared_readings_share_token ON public.shared_readings(share_token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.birth_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.readings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'Extended user profile information';
COMMENT ON TABLE public.birth_data IS 'Birth chart information for individuals';
COMMENT ON TABLE public.chart_snapshots IS 'Cached astrological chart calculations';
COMMENT ON TABLE public.readings IS 'Generated astrological readings and interpretations';
COMMENT ON TABLE public.shared_readings IS 'Shareable links for readings';
