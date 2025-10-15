import * as React from 'react';
import { useState, useEffect } from 'react';
import { Floor } from '../../types';

interface BulkAddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, readings: { [floorId: number]: number }) => void;
  floors: Floor[];
}

const BulkAddReadingModal: React.FC<BulkAddReadingModalProps> = ({ isOpen, onClose, onSubmit, floors }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [readings, setReadings] = useState<{ [key: number]: string }>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setReadings({});
      setErrors({});
      setDateError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateReading = (floorId: number, value: string, currentDate: string) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return 'Floor not found.';

    const lastReading = floor.readings.length > 0 ? floor.readings[floor.readings.length - 1] : null;
    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || numericValue <= 0) {
      return 'Invalid number.';
    }
    if (lastReading) {
      if (numericValue <= lastReading.reading) {
        return `Must be > ${lastReading.reading}.`;
      }
      if (new Date(currentDate) <= new Date(lastReading.date)) {
        return `Date must be after ${lastReading.date}.`;
      }
    }
    return '';
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (new Date(newDate) > new Date()) {
      setDateError("Date cannot be in the future.");
    } else {
      setDateError('');
    }

    // Re-validate all entered readings with the new date
    const newErrors: { [key: number]: string } = {};
    Object.keys(readings).forEach(floorIdStr => {
      const floorId = parseInt(floorIdStr);
      const value = readings[floorId];
      if (value) {
        const error = validateReading(floorId, value, newDate);
        if (error) newErrors[floorId] = error;
      }
    });
    setErrors(newErrors);
  };


  const handleReadingChange = (floorId: number, value: string) => {
    setReadings(prev => ({ ...prev, [floorId]: value }));

    if (value === '') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[floorId];
        return newErrors;
      });
      return;
    }

    const error = validateReading(floorId, value, date);
    setErrors(prev => ({ ...prev, [floorId]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (dateError) return;

    const validReadings = Object.entries(readings).filter(([_, value]) => value !== '');
    if (validReadings.length === 0) {
      onClose();
      return;
    }

    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) return;

    const finalReadings: { [floorId: number]: number } = {};
    validReadings.forEach(([floorId, value]) => {
      finalReadings[parseInt(floorId)] = parseFloat(value);
    });

    onSubmit(date, finalReadings);
  };

  const hasInputErrors = Object.values(errors).some(e => e);

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Add All Section Readings</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p className="small text-muted mt-0 mb-3">Enter new meter readings for one or more sections.</p>
              <div className="mb-4">
                <label htmlFor="bulk-date" className="form-label fw-bold">
                  Reading Date
                </label>
                <input
                  type="date"
                  id="bulk-date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`form-control ${dateError ? 'is-invalid' : ''}`}
                  required
                />
                {dateError && <div className="invalid-feedback d-block small">{dateError}</div>}
              </div>

              <div className="d-flex flex-column gap-3">
                {floors.map(floor => {
                  const lastReading = floor.readings.length > 0 ? floor.readings[floor.readings.length - 1] : null;
                  const error = errors[floor.id];
                  return (
                    <div key={floor.id}>
                      <label htmlFor={`reading-${floor.id}`} className="form-label fw-bold mb-0">
                        {floor.name}
                      </label>
                      <div className="small text-muted mb-1">
                        Last: {lastReading ? `${lastReading.reading} on ${lastReading.date}` : 'N/A'}
                      </div>
                      <input
                        type="number"
                        id={`reading-${floor.id}`}
                        value={readings[floor.id] || ''}
                        onChange={(e) => handleReadingChange(floor.id, e.target.value)}
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        placeholder={`New reading for ${floor.name}`}
                      />
                      {error && <div className="invalid-feedback d-block small">{error}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={hasInputErrors || !!dateError}
                className="btn btn-info"
              >
                Save Readings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkAddReadingModal;