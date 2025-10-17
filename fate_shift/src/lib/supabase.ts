import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface BirthData {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  birth_time: string | null;
  birth_timezone: string;
  birth_location_lat: number | null;
  birth_location_lng: number | null;
  birth_location_name: string | null;
  is_time_known: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChartSnapshot {
  id: string;
  birth_data_id: string;
  chart_type: string;
  calculation_date: string;
  chart_data: any; // JSONB
  created_at: string;
}

export interface Reading {
  id: string;
  user_id: string;
  birth_data_id: string | null;
  reading_type: string;
  title: string;
  content: any; // JSONB
  is_favorite: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SharedReading {
  id: string;
  reading_id: string;
  shared_by: string;
  share_token: string;
  is_public: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}

// Helper functions for common operations

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getBirthData(userId: string) {
  const { data, error } = await supabase
    .from('birth_data')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BirthData[];
}

export async function createBirthData(birthData: Omit<BirthData, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('birth_data')
    .insert([birthData])
    .select()
    .single();

  if (error) throw error;
  return data as BirthData;
}

export async function getReadings(userId: string) {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Reading[];
}

export async function createReading(reading: Omit<Reading, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('readings')
    .insert([reading])
    .select()
    .single();

  if (error) throw error;
  return data as Reading;
}

export async function calculateChart(birthDataId: string, chartType: string = 'natal') {
  const { data, error } = await supabase.functions.invoke('calculate-chart', {
    body: { birthDataId, chartType },
  });

  if (error) throw error;
  return data;
}

export async function getEphemeris(endpoint: string, when: {
  year: number;
  month: number;
  day: number;
  hour: number;
  tz?: string | null;
}) {
  const { data, error } = await supabase.functions.invoke('get-ephemeris', {
    body: { endpoint, when },
  });

  if (error) throw error;
  return data;
}

// Auth helpers
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
