// app/schools/page.tsx

import React, { useState } from 'react';
import SchoolsList from '../../components/SchoolsList';

interface School {
  id: number;
  'school.name': string;
  'school.city': string;
  'school.state': string;
  'school.student.size': number;
}

interface SchoolsPageProps {
  initialSchools: School[];
  initialPage: number;
}

const SchoolsPage: React.FC<SchoolsPageProps> = ({ initialSchools, initialPage }) => {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [page, setPage] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const perPage = 10;

  const fetchSchools = async (newPage: number) => {
    setLoading(true);
    setError(null);
    try {
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
  };

  const handleNext = () => {
    fetchSchools(page + 1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      fetchSchools(page - 1);
    }
  };

  return (
    <div>
      <SchoolsList
        schools={schools}
        page={page}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { page = '1', per_page = '10' } = context.query;

  // Validate query parameters
  const pageNumber = parseInt(page, 10);
  const perPageNumber = parseInt(per_page, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(perPageNumber) ||
    pageNumber < 1 ||
    perPageNumber < 1
  ) {
    return {
      props: {
        initialSchools: [],
        initialPage: 1,
      },
    };
  }

  const API_URL = `http://localhost:3000/api/schools?page=${pageNumber}&per_page=${perPageNumber}`;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    const data: School[] = await res.json();
    return {
      props: {
        initialSchools: data,
        initialPage: pageNumber,
      },
    };
  } catch (error) {
    console.error('getServerSideProps Error:', error);
    return {
      props: {
        initialSchools: [],
        initialPage: pageNumber,
      },
    };
  }
}

export default SchoolsPage;
