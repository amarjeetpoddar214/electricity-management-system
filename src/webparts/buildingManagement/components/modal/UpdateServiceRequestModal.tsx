import * as React from 'react';
import { useState, useEffect } from 'react';
import { ServiceRequest } from '../../types';

interface UpdateServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: ServiceRequest) => void;
  request: ServiceRequest | null;
}

const UpdateServiceRequestModal: React.FC<UpdateServiceRequestModalProps> = ({ isOpen, onClose, onSubmit, request }) => {
  const [status, setStatus] = useState<ServiceRequest['status']>('Open');
  const [resolutionDate, setResolutionDate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setResolutionDate(request.resolutionDate || '');
      setResolutionNotes(request.resolutionNotes || '');
      setPaymentAmount(request.paymentAmount?.toString() || '');
      setPaymentDate(request.paymentDate || '');
      setPaymentMode(request.paymentMode || '');
      setError('');
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let updatedRequest: ServiceRequest = { ...request, status };

    if (status === 'Resolved') {
      const amount = parseFloat(paymentAmount);
      if (!resolutionDate) {
        setError('Please provide a resolution date.');
        return;
      }
      if (paymentAmount && (isNaN(amount) || amount < 0)) {
        setError('Please enter a valid payment amount.');
        return;
      }
      if (paymentAmount && !paymentDate) {
        setError('Please provide a payment date.');
        return;
      }
      if (paymentAmount && !paymentMode.trim()) {
        setError('Please provide a payment mode.');
        return;
      }
      updatedRequest = {
        ...updatedRequest,
        resolutionDate,
        resolutionNotes: resolutionNotes.trim() || undefined,
        paymentAmount: paymentAmount ? amount : undefined,
        paymentDate: paymentAmount ? paymentDate : undefined,
        paymentMode: paymentAmount ? paymentMode.trim() : undefined
      };
    } else {
      // Clear resolution details if status is not 'Resolved'
      updatedRequest = {
        ...updatedRequest,
        resolutionDate: undefined,
        resolutionNotes: undefined,
        paymentAmount: undefined,
        paymentDate: undefined,
        paymentMode: undefined
      };
    }

    onSubmit(updatedRequest);
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
            <h5 className="modal-title fw-bold">Update Service Request</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="p-3 bg-light border rounded mb-3 small">
                <p><strong>Request Date:</strong> {request.requestDate}</p>
                <p><strong>Category:</strong> {request.category}</p>
                <p><strong>Location:</strong> {request.location}</p>
                <p className="mb-0"><strong>Issue:</strong> {request.description}</p>
              </div>

              <div className="mb-3">
                <label htmlFor="update-status" className="form-label">
                  Status
                </label>
                <select
                  id="update-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ServiceRequest['status'])}
                  className="form-select"
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Cancelled</option>
                </select>
              </div>

              {status === 'Resolved' && (
                <div className="p-3 border border-success-subtle rounded bg-success-subtle d-flex flex-column gap-3">
                  <h6 className="fw-semibold text-dark">Resolution Details</h6>
                  <div>
                    <label htmlFor="resolution-date" className="form-label">
                      Resolution Date
                    </label>
                    <input
                      type="date"
                      id="resolution-date"
                      value={resolutionDate}
                      onChange={(e) => setResolutionDate(e.target.value)}
                      className="form-control"
                      required
                      max={today}
                    />
                  </div>
                  <div>
                    <label htmlFor="resolution-notes" className="form-label">
                      Resolution Notes
                    </label>
                    <textarea
                      id="resolution-notes"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="form-control"
                      placeholder="e.g., Replaced faulty component, tested."
                      rows={3}
                    />
                  </div>
                  <h6 className="fw-semibold text-dark pt-2">Payment Details (Optional)</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="payment-amount" className="form-label">
                        Payment Amount (₹)
                      </label>
                      <input
                        type="number"
                        id="payment-amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="form-control"
                        placeholder="e.g., 500.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="payment-date" className="form-label">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        id="payment-date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="form-control"
                        max={today}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="payment-mode" className="form-label">
                      Payment Mode
                    </label>
                    <input
                      type="text"
                      id="payment-mode"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="form-control"
                      placeholder="e.g., Cash, Online Transfer"
                    />
                  </div>
                </div>
              )}
              {error && <div className="alert alert-danger p-2 small mt-3">{error}</div>}
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
                className="btn btn-info"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateServiceRequestModal;