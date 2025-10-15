import * as React from 'react';
import { useState } from 'react';
import { Reading } from '../../types';

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, reading: number) => void;
  floorName: string;
  lastReading?: Reading;
}

const AddReadingModal: React.FC<AddReadingModalProps> = ({ isOpen, onClose, onSubmit, floorName, lastReading }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [readingValue, setReadingValue] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const newReading = parseFloat(readingValue);
    if (isNaN(newReading) || newReading <= 0) {
      setError('Please enter a valid positive reading value.');
      return;
    }

    if (lastReading) {
      if (newReading <= lastReading.reading) {
        setError(`Reading must be greater than the last reading of ${lastReading.reading}.`);
        return;
      }
      if (new Date(date) <= new Date(lastReading.date)) {
        setError(`Date must be after the last reading date of ${lastReading.date}.`);
        return;
      }
    }

    if (new Date(date) > new Date()) {
      setError("Cannot record a reading for a future date.");
      return;
    }

    onSubmit(date, newReading);
    setReadingValue('');
  };

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
      tabIndex={-1}
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Add New Reading for {floorName}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {lastReading && (
              <div className="alert alert-info small">
                <strong>Last Reading:</strong> {lastReading.reading} on {lastReading.date}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="reading" className="form-label">
                  Meter Reading (in Units)
                </label>
                <input
                  type="number"
                  id="reading"
                  value={readingValue}
                  onChange={(e) => setReadingValue(e.target.value)}
                  className="form-control"
                  placeholder="e.g., 12345"
                  required
                  min={lastReading ? lastReading.reading + 1 : 1}
                />
              </div>
              {error && <p className="text-danger small">{error}</p>}
              <div className="modal-footer pb-0 px-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-info"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReadingModal;