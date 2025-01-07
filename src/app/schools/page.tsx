// app/schools/page.tsx

import React from 'react';
import ClientSchoolsList from './ClientSchoolsList';

// Server Component: by default, files in `app/` are Server Components
// unless we add "use client" at the top.
export default async function SchoolsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string };
}) {
  const searchParams2 = await searchParams;
  const page =  searchParams2?.page ? parseInt(searchParams2.page, 10) : 1;
  const perPage = searchParams2?.per_page ? parseInt(searchParams2.per_page, 10) : 10;

  // Construct the URL to our internal API route
  const protocol = process.env.VERCEL ? 'https' : 'http';  // or detect dynamically if needed
  const host = process.env.VERCEL_URL || 'localhost:3000';

  // If running locally, ensure the correct base URL
  const apiURL = `${protocol}://${host}/api/schools?page=${page}&per_page=${perPage}`;

  // Fetch data on the server side
  const res = await fetch(apiURL, { cache: 'no-store' });
  if (!res.ok) {
    // In a real app, you'd handle this gracefully (redirect, error message, etc.)
    throw new Error(`Failed to fetch data: ${res.statusText}`);
  }

  const initialSchools = await res.json();

  return (
    <div style={{ padding: '20px' }}>
      <ClientSchoolsList initialSchools={initialSchools} initialPage={page} />
    </div>
  );
}
