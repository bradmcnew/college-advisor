// app/api/schools/route.ts

import { NextResponse } from 'next/server';

interface School {
  id: number;
  'school.name': string;
  'school.city': string;
  'school.state': string;
  'school.student.size': number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '10';

  // Use environment variable from .env.local
  const API_KEY = process.env.ED_API_KEY;
  const endpoint = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${API_KEY}&per_page=${perPage}&page=${page}&fields=id,school.name,school.city,school.state,school.student.size`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    }

    // The external API returns { results: [...] }, so extract `results`.
    const data = await response.json();
    const schools: School[] = data.results || [];

    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
