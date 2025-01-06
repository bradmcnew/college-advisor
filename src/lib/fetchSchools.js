// lib/fetchSchools.js

export async function fetchSchools(page = 1, perPage = 10) {
    const API_KEY = process.env.ED_API_KEY;
    const endpoint = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${API_KEY}&per_page=${perPage}&page=${page}&fields=id,school.name,school.city,school.state,school.student.size`;
  
    try {
      const res = await fetch(endpoint);
  
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }
  
      const data = await res.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  }
  