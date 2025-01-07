// app/schools/ClientSchoolsList.tsx

"use client";  // <-- Important! Must be at the top for a Client Component.

import React, { useState } from 'react';

interface School {
  id: number;
  'school.name': string;
  'school.city': string;
  'school.state': string;
  'school.student.size': number;
}

interface ClientSchoolsListProps {
  initialSchools: School[];
  initialPage: number;
}

export default function ClientSchoolsList({
  initialSchools,
  initialPage,
}: ClientSchoolsListProps) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [page, setPage] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const perPage = 10;

  async function fetchSchools(newPage: number) {
    setLoading(true);
    setError(null);

    try {
      // Call our internal API route at /api/schools
      const res = await fetch(`/api/schools?page=${newPage}&per_page=${perPage}`);
      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }
      const data: School[] = await res.json();

      setSchools(data);
      setPage(newPage);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    fetchSchools(page + 1);
  }

  function handlePrevious() {
    if (page > 1) {
      fetchSchools(page - 1);
    }
  }

  return (
    <div className="container">
      <h1>Schools</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Failed to load schools: {error}</p>}

      {!loading && !error && schools.length > 0 && (
        <ul>
          {schools.map((school) => (
            <li key={school.id} style={{ border: '1px solid #ccc', margin: '10px 0' }}>
              <h2>{school['school.name']}</h2>
              <p>City: {school['school.city']}</p>
              <p>State: {school['school.state']}</p>
              <p>Student Size: {school['school.student.size']}</p>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && schools.length === 0 && (
        <p>No schools found.</p>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handlePrevious} disabled={page <= 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
