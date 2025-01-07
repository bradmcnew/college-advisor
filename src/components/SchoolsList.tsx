// src/components/SchoolsList.js

import React from 'react';
import PropTypes from 'prop-types';

// src/components/SchoolsList.tsx
interface SchoolsListProps {
  schools: School[];
  page: number; // Add this line
  handleNext: () => void;
  handlePrevious: () => void;
  loading: boolean;
  error: string | null;
}

interface School {
    id: number;
    'school.name': string;
    'school.city': string;
    'school.state': string;
    'school.student.size': number;
}

const SchoolsList = ({ schools, page, handleNext, handlePrevious, loading, error }: SchoolsListProps) => {
  return (
    <div>
      <h1>Schools</h1>
      {schools && schools.length > 0 ? (
        <ul>
          {schools.map((school) => (
            <li key={school.id}>
              <h2>{school['school.name']}</h2>
              <p>City: {school['school.city']}</p>
              <p>State: {school['school.state']}</p>
              <p>Student Size: {school['school.student.size']}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No schools found.</p>
      )}
      <style jsx>{`
        div {
          padding: 20px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          border: 1px solid #ccc;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
};

SchoolsList.propTypes = {
  schools: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      'school.name': PropTypes.string.isRequired,
      'school.city': PropTypes.string.isRequired,
      'school.state': PropTypes.string.isRequired,
      'school.student.size': PropTypes.number.isRequired,
    })
  ).isRequired,
  page: PropTypes.number.isRequired,
};

export default SchoolsList;
