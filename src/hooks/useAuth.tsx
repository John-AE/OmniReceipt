import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import posthog from 'posthog-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any;
  signUp: (email: string, password: string, artisanName: string, businessName: string, businessAddress: string, phone: string, referralSource: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithPhone: (phone: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const hasShownWelcome = useRef(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Fetch profile data when user signs in
        if (session?.user) {
          // Identify user in PostHog for session tracking
          posthog.identify(session.user.id, {
            email: session.user.email,
          });

          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          // Reset PostHog on sign out
          posthog.reset();
        }

        if (event === 'SIGNED_IN' && !hasShownWelcome.current) {
          // Don't show welcome toast if on public price list page
          if (!window.location.pathname.startsWith('/pricelist/')) {
            hasShownWelcome.current = true;
            toast({
              title: "Welcome to OmniReceipts!",
              description: "Successfully signed in",
            });
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signUp = async (email: string, password: string, artisanName: string, businessName: string, businessAddress: string, phone: string, referralSource: string) => {
    const normalizedPhone = phone.replace(/\s+/g, '');

    // Check if phone number already exists before attempting signup
    const { data: existingProfile } = await supabase
      .rpc('get_profile_by_phone', { phone_number: normalizedPhone });

    if (existingProfile && existingProfile.length > 0) {
      toast({
        title: "Sign up failed",
        description: "This phone number is already registered. Please try signing in instead.",
        variant: "destructive",
      });
      return { error: new Error("Phone number already exists") };
    }

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          artisan_name: artisanName,
          business_name: businessName,
          business_address: businessAddress,
          phone: normalizedPhone,
          referral_source: referralSource,
        }
      }
    });

    if (error) {
      // Check if error is related to duplicate phone or database constraint
      const isDuplicatePhone = error.message?.toLowerCase().includes('unique') ||
        error.message?.toLowerCase().includes('duplicate') ||
        error.message?.toLowerCase().includes('phone') ||
        error.message?.toLowerCase().includes('database error saving');

      toast({
        title: "Sign up failed",
        description: isDuplicatePhone
          ? "This phone number is already registered. Please try signing in instead."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "You are now signed in.",
      });

      // Send welcome email (fire and forget - don't block signup)
      supabase.functions.invoke('send-welcome-email', {
        body: {
          email: email,
          artisanName: artisanName,
          businessName: businessName,
        }
      }).then(({ error: emailError }) => {
        if (emailError) {
          console.error('Failed to send welcome email:', emailError);
        } else {
          console.log('Welcome email sent successfully');
        }
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signInWithPhone = async (phone: string, password: string) => {
    try {
      // Normalize the phone number by removing spaces
      const normalizedPhone = phone.replace(/\s+/g, '');

      console.log('Input phone:', phone);
      console.log('Normalized phone:', normalizedPhone);

      // Use the secure RPC function to find profile by phone
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_profile_by_phone', { phone_number: normalizedPhone });

      console.log('RPC query result:', profileData);
      console.log('RPC query error:', profileError);

      if (profileError) {
        console.error('Database error:', profileError);
        toast({
          title: "Sign in failed",
          description: "Database error occurred",
          variant: "destructive",
        });
        return { error: profileError };
      }

      if (!profileData || profileData.length === 0) {
        toast({
          title: "Sign in failed",
          description: "Phone number not found. Please check your phone number or register first.",
          variant: "destructive",
        });
        return { error: new Error("Phone number not found") };
      }

      const profile = profileData[0];
      console.log('Found profile:', profile);

      // Now sign in with email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

      if (error) {
        console.error('Auth error:', error);
        toast({
          title: "Sign in failed",
          description: "Invalid phone number or password",
          variant: "destructive",
        });
      } else {
        console.log('Successfully signed in!');
      }

      return { error };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };
  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      // Handle rate limit error with more user-friendly message
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast({
          title: "Too many requests",
          description: "Please wait 60 seconds before requesting another password reset email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link",
      });
    }

    return { error };
  };

  const signOut = async () => {
    // Immediately clear local state before awaiting signOut
    setUser(null);
    setSession(null);
    setProfile(null);
    hasShownWelcome.current = false;

    // Clear all Supabase-related localStorage keys to prevent session rehydration
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.startsWith('sb-') || key.includes('supabase')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Also clear sessionStorage
    const sessionKeysToRemove = Object.keys(sessionStorage).filter(key =>
      key.startsWith('sb-') || key.includes('supabase')
    );
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "Come back soon!",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      profile,
      signUp,
      signIn,
      signInWithPhone,
      resetPassword,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


