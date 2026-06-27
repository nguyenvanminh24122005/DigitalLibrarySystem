import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, updateProfile } from '../services/catalogApi';

const PROFILE_CACHE_KEY = 'digilib:user-profile';

const defaultUser = {
  name: 'Độc giả',
  role: 'Độc giả',
  avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"%3E%3Crect width="160" height="160" rx="80" fill="%230b63f6"/%3E%3Ctext x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="48" font-weight="700" fill="white"%3EDG%3C/text%3E%3C/svg%3E',
  email: '',
  phone: '',
  studentCode: '',
  readerCode: '',
  faculty: '',
  className: '',
  joinedAt: '',
  cardExpiredAt: '',
  status: 'Đang hoạt động'
};

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
    const raw = localStorage.getItem('digilib_user') || localStorage.getItem(PROFILE_CACHE_KEY);
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
  const merged = { ...defaultUser, ...(data || {}) };
  const name = merged.name || merged.fullName || merged.FullName || merged.username || merged.email || defaultUser.name;
  return {
    name,
    fullName: name,
    role: merged.role || merged.roleName || merged.Role || merged.RoleName || defaultUser.role,
    avatar: merged.avatar || merged.Avatar || defaultUser.avatar,
    email: merged.email || merged.Email || defaultUser.email,
    phone: merged.phone || merged.Phone || defaultUser.phone,
    studentCode: merged.studentCode || merged.StudentCode || defaultUser.studentCode,
    readerCode: merged.readerCode || merged.ReaderCode || defaultUser.readerCode,
    faculty: merged.faculty || merged.Faculty || defaultUser.faculty,
    className: merged.className || merged.ClassName || defaultUser.className,
    joinedAt: formatDate(merged.joinedAt || merged.JoinedAt) || defaultUser.joinedAt,
    cardExpiredAt: formatDate(merged.cardExpiredAt || merged.CardExpiredAt) || defaultUser.cardExpiredAt,
    status: merged.status || merged.Status || defaultUser.status,
    address: merged.address || merged.Address || defaultUser.address || '',
    gender: merged.gender || merged.Gender || defaultUser.gender || '',
    dateOfBirth: formatDate(merged.dateOfBirth || merged.DateOfBirth) || defaultUser.dateOfBirth || ''
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
  const [profile, setProfileState] = useState(cached ? mapProfile(cached) : defaultUser);
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
