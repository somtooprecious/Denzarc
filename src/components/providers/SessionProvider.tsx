'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Profile } from '@/types';

interface SessionContextValue {
  user: { id: string; email?: string; fullName?: string } | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!clerkUser?.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data as Profile);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [clerkUser?.id]);

  async function refreshProfile() {
    setProfileLoading(true);
    await fetchProfile();
  }

  useEffect(() => {
    if (!isLoaded) return;
    fetchProfile();
  }, [fetchProfile, isLoaded]);

  const loading = !isLoaded || profileLoading;
  const user = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        fullName: clerkUser.fullName ?? undefined,
      }
    : null;

  return (
    <SessionContext.Provider
      value={{ user, profile, loading, refreshProfile }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function SessionProviderNoAuth({ children }: { children: React.ReactNode }) {
  async function refreshProfile() {
    return;
  }

  return (
    <SessionContext.Provider
      value={{ user: null, profile: null, loading: false, refreshProfile }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (ctx === undefined) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
