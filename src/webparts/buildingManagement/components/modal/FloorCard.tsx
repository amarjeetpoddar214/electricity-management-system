import * as React from 'react';

import { Floor } from '../../types';
import ReadingsChart from './ReadingsChart';

interface FloorCardProps {
  floor: Floor;
  onAddReading: () => void;
}

const FloorCard: React.FC<FloorCardProps> = ({ floor, onAddReading }) => {
  const lastReading = floor.readings.length > 0 ? floor.readings[floor.readings.length - 1] : null;
  // Correctly calculate total consumption by summing units consumed from the second reading onwards
  const totalConsumption = floor.readings.slice(1).reduce((sum, r) => sum + r.unitsConsumed, 0);

  return (
    <div className="card shadow h-100 d-flex flex-column">
      <div className="card-header bg-dark text-white p-3">
        <h2 className="h4 card-title mb-0">{floor.name}</h2>
        <p className="text-white-50 mb-0 small">Meter Readings & Consumption</p>
      </div>

      <div className="card-body p-3 d-flex flex-column flex-grow-1">
        <div className="row g-3 mb-4 text-center">
          <div className="col bg-light p-3 rounded">
            <p className="small text-muted fw-medium mb-1">Latest Reading</p>
            <p className="h4 fw-bold text-dark mb-0">{lastReading ? lastReading.reading.toLocaleString() : 'N/A'}</p>
          </div>
          <div className="col bg-light p-3 rounded">
            <p className="small text-muted fw-medium mb-1">Total Consumption</p>
            <p className="h4 fw-bold text-dark mb-0">{totalConsumption.toLocaleString()} Units</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="h5 fw-semibold text-dark mb-2">Monthly Consumption Trend</h3>
          <div style={{ height: '12rem', width: '100%' }}>
            <ReadingsChart data={floor.readings} />
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column">
          <h3 className="h5 fw-semibold text-dark mb-2">Readings History</h3>
          <div className="border rounded overflow-auto flex-grow-1" style={{ maxHeight: '12rem' }}>
            {floor.readings.length > 0 ? (
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light text-uppercase small position-sticky top-0">
                  <tr>
                    <th scope="col" className="px-3 py-2">Date</th>
                    <th scope="col" className="px-3 py-2">Reading</th>
                    <th scope="col" className="px-3 py-2">Units Used</th>
                  </tr>
                </thead>
                <tbody>
                  {[...floor.readings].reverse().map((reading, index, arr) => (
                    <tr key={reading.id}>
                      <td className="px-3 py-2">{reading.date}</td>
                      <td className="px-3 py-2">{reading.reading.toLocaleString()}</td>
                      <td className="px-3 py-2 fw-medium text-info">
                        {/* The very first reading has no previous reading to compare against */}
                        {index === arr.length - 1 ? '—' : reading.unitsConsumed.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-5 text-muted">
                No readings recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer bg-light p-3 mt-auto">
        <button
          onClick={onAddReading}
          className="btn btn-info w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem' }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          <span>Add New Reading</span>
        </button>
      </div>
    </div>
  );
};

export default FloorCard;