'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { DASHBOARD_PAGES } from '@/shared/routes';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(DASHBOARD_PAGES.PROFILES);
  }, [router]);

  return null;
}
