'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ProfilePage } from './Profile';

import { DASHBOARD_PAGES } from '@/shared/routes';
import { Icons } from '@/shared/ui/icons';

type ProfileRouteState = {
  profileName: string;
  initialTab: string;
};

const PROFILE_PATH = `${DASHBOARD_PAGES.PROFILE}/`;

export function ProfileRoute() {
  const router = useRouter();
  const [route, setRoute] = useState<ProfileRouteState | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const profilePath = path.startsWith(PROFILE_PATH) ? path.slice(PROFILE_PATH.length) : '';
    const encodedName = profilePath.endsWith('/') ? profilePath.slice(0, -1) : profilePath;

    if (!encodedName || encodedName.includes('/')) {
      router.replace(DASHBOARD_PAGES.PROFILES);
      return;
    }

    try {
      const profileName = decodeURIComponent(encodedName);
      if (!profileName) throw new Error('Empty profile name');

      const initialTab = new URL(window.location.href).searchParams.get('tab') || 'main';
      setRoute({ profileName, initialTab });
    } catch {
      router.replace(DASHBOARD_PAGES.PROFILES);
    }
  }, [router]);

  useEffect(() => {
    if (!route) return;

    const title = `Настройка профиля ${route.profileName}`;
    const applyTitle = () => {
      if (document.title !== title) document.title = title;
    };
    const observer = new MutationObserver(applyTitle);

    applyTitle();
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [route]);

  if (!route) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Загрузка профиля</span>
      </div>
    );
  }

  return <ProfilePage profileName={route.profileName} initialTab={route.initialTab} />;
}
