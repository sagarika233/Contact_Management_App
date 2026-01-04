import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setError(null);
        } catch (err) {
          setError('Failed to update auth state');
          console.error('Auth state change error:', err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      try {
        if (error) {
          setError('Failed to get session');
          console.error('Session error:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        setError('Failed to process session');
        console.error('Session processing error:', err);
      } finally {
        setIsLoading(false);
      }
    }).catch((err) => {
      setError('Failed to retrieve session');
      console.error('Session retrieval error:', err);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
  };
};
