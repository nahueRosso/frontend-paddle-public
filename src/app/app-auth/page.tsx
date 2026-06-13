'use client';

import { useEffect } from 'react';

export default function AppAuthPage() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const search = window.location.search.slice(1);
    const params = hash || search;
    console.log('[app-auth] hash:', hash);
    console.log('[app-auth] search:', search);
    console.log('[app-auth] params:', params);
    if (params) {
      const deepLink = 'miclubpadel://oauth?' + params;
      console.log('[app-auth] redirecting to:', deepLink);
      window.location.replace(deepLink);
    }
  }, []);

  return null;
}
