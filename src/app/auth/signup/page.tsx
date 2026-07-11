'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AUTH_PAGES } from '@/shared/routes';

export default function SignUpRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(AUTH_PAGES.SIGN_IN);
  }, [router]);

  return null;
}
