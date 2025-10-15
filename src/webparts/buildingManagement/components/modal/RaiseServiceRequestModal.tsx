import * as React from 'react';

import { useState } from 'react';
import { Floor, ServiceRequest } from '../../types';

interface RaiseServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<ServiceRequest, 'id' | 'status'>) => void;
  floors: Floor[];
}

const RaiseServiceRequestModal: React.FC<RaiseServiceRequestModalProps> = ({ isOpen, onClose, onSubmit, floors }) => {
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ServiceRequest['category']>('Electrical');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!location) {
      setError('Please select a location for the service request.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description of the issue.');
      return;
    }

    onSubmit({
      requestDate,
      category,
      location,
      description: description.trim(),
    });
    // Reset form
    setRequestDate(new Date().toISOString().split('T')[0]);
    setCategory('Electrical');
    setLocation('');
    setDescription('');

  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Raise a Service Request</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="request-date" className="form-label">
                    Request Date
                  </label>
                  <input
                    type="date"
                    id="request-date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="form-control"
                    required
                    max={today}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceRequest['category'])}
                    className="form-select"
                  >
                    <option>Electrical</option>
                    <option>Lift</option>
                    <option>Fire System</option>
                    <option>Plumbing</option>
                    <option>General Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="location" className="form-label">
                  Location / Section
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="" disabled>Select a location</option>
                  <option>Common Area</option>
                  {floors.map(floor => (
                    <option key={floor.id} value={floor.name}>{floor.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="form-label">
                  Description of Issue
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  placeholder="Provide a detailed description of the problem..."
                  rows={4}
                  required
                />
              </div>

              {error && <div className="alert alert-danger p-2 small">{error}</div>}
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
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseServiceRequestModal;