import * as React from 'react';

import { useEffect, useState } from 'react';
import { Web } from 'sp-pnp-js';
import { Floor, ServiceRequest } from '../../types';

interface RaiseServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<ServiceRequest, 'id' | 'status'>) => void;
  floors: Floor[];
}

const webURL = 'https://smalsusinfolabs.sharepoint.com/sites/Smalsus';
const serviceRequestListId = "2cbcadca-df0f-43ef-8cf5-f7d58671e2bd";
const floorsListId = "a930f9c4-27d5-4e7a-9bc4-fbb8dd605565";

const RaiseServiceRequestModal: React.FC<RaiseServiceRequestModalProps> = ({ isOpen, onClose, onSubmit, floors }) => {
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ServiceRequest['category']>('Electrical');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);


  useEffect(() => {
    if (!isOpen) return; // only fetch when modal opens

    const web = new Web(webURL);

    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        // Fetch category choices
        const categoryField: any = await web.lists
          .getById(serviceRequestListId)
          .fields.getByInternalNameOrTitle('category')
          .get();

        setCategoryOptions(categoryField?.Choices || []);

        // Fetch locations (floors)
        const locations: any[] = await web.lists
          .getById(floorsListId)
          .items.select('Id', 'Title')
          .getAll();

        setLocationOptions(locations.map(item => ({ id: item.Id, title: item.Title })));
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        setFetchError('Failed to load dropdown data from SharePoint.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);


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
                    required
                  >
                    {loading && <option>Loading categories...</option>}
                    {!loading && categoryOptions.length > 0 ? (
                      categoryOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))
                    ) : (
                      <option value="">No categories found</option>
                    )}
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
                  {loading && <option>Loading locations...</option>}
                  {!loading && locationOptions.length > 0 ? (
                    locationOptions.map(loc => (
                      <option key={loc.id} value={loc.id.toString()}>{loc.title}</option>
                    ))
                  ) : (
                    <option value="">No locations found</option>
                  )}
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
              {fetchError && <div className="alert alert-danger">{fetchError}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseServiceRequestModal;