'use client';

import { useRouter } from 'next/navigation';

export function RefreshButton() {
  const router = useRouter();
  return (
    <button className="refresh-btn" onClick={() => router.refresh()}>
      Refresh
    </button>
  );
}
