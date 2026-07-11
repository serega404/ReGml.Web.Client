'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { authService, getStorageAccessToken } from '@/shared/services';
import { isTokenExpired } from '@/shared/lib/utils';
import { DASHBOARD_PAGES } from '@/shared/routes';

function hasValidAccessToken() {
  try {
    return !isTokenExpired(getStorageAccessToken() || undefined);
  } catch {
    return false;
  }
}

export function PublicAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const redirectAuthenticatedUser = async () => {
      if (!hasValidAccessToken()) {
        try {
          await authService.refresh();
        } catch {
          return;
        }
      }

      if (isActive) router.replace(DASHBOARD_PAGES.HOME);
    };

    void redirectAuthenticatedUser();

    return () => {
      isActive = false;
    };
  }, [router]);

  return null;
}
