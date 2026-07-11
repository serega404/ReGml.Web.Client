'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  authService,
  getStorageAccessToken,
  removeStorageProfile,
  removeStorageRecloudIDAccessToken,
  removeStorageTokens,
} from '@/shared/services';
import { isTokenExpired } from '@/shared/lib/utils';
import { AUTH_PAGES } from '@/shared/routes';
import { Icons } from '@/shared/ui/icons';

function hasValidAccessToken() {
  try {
    return !isTokenExpired(getStorageAccessToken() || undefined);
  } catch {
    return false;
  }
}

export function AuthGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isActive = true;

    const authorize = async () => {
      if (hasValidAccessToken()) {
        if (isActive) setIsAuthorized(true);
        return;
      }

      try {
        await authService.refresh();
        if (isActive) setIsAuthorized(true);
      } catch {
        removeStorageProfile();
        removeStorageTokens();
        removeStorageRecloudIDAccessToken();
        if (isActive) router.replace(AUTH_PAGES.SIGN_IN);
      }
    };

    void authorize();

    return () => {
      isActive = false;
    };
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-svh items-center justify-center" role="status">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Проверка авторизации</span>
      </div>
    );
  }

  return children;
}
