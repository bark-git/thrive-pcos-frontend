import { createClient } from '@supabase/supabase-js';

// These are public keys, safe to expose in frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://omfexjytievmkqurfxgr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZmV4anl0aWV2bWtxdXJmeGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MjkxNDcsImV4cCI6MjA1MTAwNTE0N30.jFKgmRFVpWmMJ2i-4oGVAnnRUCeHDBf8UtsujGnZ9Z4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Social auth providers
export type SocialProvider = 'google' | 'apple';

export const signInWithSocial = async (provider: SocialProvider) => {
  const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : 'http://localhost:3000/auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      queryParams: provider === 'google' ? {
        access_type: 'offline',
        prompt: 'consent',
      } : undefined
    }
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};
