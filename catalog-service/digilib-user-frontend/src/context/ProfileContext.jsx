import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, updateProfile } from '../services/catalogApi';
import { mockUser } from '../data/mockData';

const PROFILE_CACHE_KEY = 'digilib:user-profile';

function formatDate(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('vi-VN');
  } catch {
    return String(value);
  }
}

function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheProfile(profile) {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch {}
}

export function mapProfile(data = {}) {
  const merged = { ...mockUser, ...(data || {}) };
  return {
    name: merged.name || merged.fullName || merged.FullName || mockUser.name,
    fullName: merged.name || merged.fullName || merged.FullName || mockUser.name,
    role: merged.role || merged.Role || mockUser.role,
    avatar: merged.avatar || merged.Avatar || mockUser.avatar,
    email: merged.email || merged.Email || mockUser.email,
    phone: merged.phone || merged.Phone || mockUser.phone,
    studentCode: merged.studentCode || merged.StudentCode || mockUser.studentCode,
    readerCode: merged.readerCode || merged.ReaderCode || mockUser.readerCode,
    faculty: merged.faculty || merged.Faculty || mockUser.faculty,
    className: merged.className || merged.ClassName || mockUser.className,
    joinedAt: formatDate(merged.joinedAt || merged.JoinedAt) || mockUser.joinedAt,
    cardExpiredAt: formatDate(merged.cardExpiredAt || merged.CardExpiredAt) || mockUser.cardExpiredAt,
    status: merged.status || merged.Status || mockUser.status,
    address: merged.address || merged.Address || mockUser.address || '',
    gender: merged.gender || merged.Gender || mockUser.gender || '',
    dateOfBirth: formatDate(merged.dateOfBirth || merged.DateOfBirth) || mockUser.dateOfBirth || ''
  };
}

function toApiPayload(profile) {
  return {
    FullName: profile.name || profile.fullName,
    Role: profile.role,
    Avatar: profile.avatar,
    Email: profile.email,
    Phone: profile.phone,
    StudentCode: profile.studentCode,
    ReaderCode: profile.readerCode,
    Faculty: profile.faculty,
    ClassName: profile.className,
    Status: profile.status || 'Đang hoạt động',
    Address: profile.address,
    Gender: profile.gender,
    DateOfBirth: profile.dateOfBirth || null
  };
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const cached = getCachedProfile();
  const [profile, setProfileState] = useState(cached ? mapProfile(cached) : mockUser);
  const [loading, setLoading] = useState(false);

  const setProfile = useCallback((nextProfile) => {
    const normalized = mapProfile(nextProfile);
    setProfileState(normalized);
    cacheProfile(normalized);
    window.dispatchEvent(new CustomEvent('digilib:profile-updated', { detail: normalized }));
    return normalized;
  }, []);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      return setProfile(data);
    } finally {
      setLoading(false);
    }
  }, [setProfile]);

  const saveProfile = useCallback(async (form) => {
    const optimistic = setProfile({ ...profile, ...form, name: form.name || form.fullName || profile.name });
    const saved = await updateProfile(undefined, toApiPayload(optimistic));
    return setProfile(saved);
  }, [profile, setProfile]);

  useEffect(() => {
    refreshProfile().catch(() => {});

    const onUpdate = (event) => {
      if (event?.detail) setProfileState(mapProfile(event.detail));
    };
    const onStorage = (event) => {
      if (event.key === PROFILE_CACHE_KEY && event.newValue) {
        try { setProfileState(mapProfile(JSON.parse(event.newValue))); } catch {}
      }
    };
    window.addEventListener('digilib:profile-updated', onUpdate);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('digilib:profile-updated', onUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshProfile]);

  const value = useMemo(() => ({ profile, loading, refreshProfile, setProfile, saveProfile }), [profile, loading, refreshProfile, setProfile, saveProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used inside ProfileProvider');
  return context;
}
