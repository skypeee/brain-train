import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const clientUrl = isSupabaseConfigured ? supabaseUrl : 'https://disabled.supabase.co';
const clientAnonKey = isSupabaseConfigured ? supabaseAnonKey : 'disabled-anon-key';

if (!isSupabaseConfigured && __DEV__) {
  console.warn('Supabase is not configured; auth and cloud sync are disabled');
}

export const supabase = createClient(clientUrl, clientAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
