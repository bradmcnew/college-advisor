// pages/api/schools.js
// app/api/schools/route.js

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '10';

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

    const data = await response.json();
    return NextResponse.json(data.results);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
