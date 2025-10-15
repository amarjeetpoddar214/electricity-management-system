import * as React from 'react';

import { useState, useEffect } from 'react';
import { Bill } from '../../types';

interface UpdateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    monthYear: string,
    status: 'Paid' | 'Pending',
    paymentDate?: string,
    paymentMode?: string
  ) => void;
  bill: Bill | null;
}

const UpdateBillModal: React.FC<UpdateBillModalProps> = ({ isOpen, onClose, onSubmit, bill }) => {
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Pending');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (bill) {
      setStatus(bill.status);
      setPaymentDate(bill.paymentDate || '');
      setPaymentMode(bill.paymentMode || '');
    }
  }, [bill]);

  if (!isOpen || !bill) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (status === 'Paid') {
      if (!paymentDate) {
        setError('Please enter a payment date for paid bills.');
        return;
      }
      if (!paymentMode.trim()) {
        setError('Please enter a payment mode for paid bills.');
        return;
      }
    }

    onSubmit(
      bill.monthYear,
      status,
      status === 'Paid' ? paymentDate : undefined,
      status === 'Paid' ? paymentMode.trim() : undefined
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const formattedMonth = new Date(bill.monthYear + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Update Bill Payment</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">

            <div className="mb-4 p-3 bg-light border rounded small">
              <p><strong>Month:</strong> {formattedMonth}</p>
              <p><strong>File:</strong> {bill.fileName}</p>
              <p className="mb-0"><strong>Amount:</strong> {bill.totalAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Paid' | 'Pending')}
                  className="form-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {status === 'Paid' && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="paymentDate" className="form-label">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      id="paymentDate"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="form-control"
                      required={status === 'Paid'}
                      max={today}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="paymentMode" className="form-label">
                      Payment Mode
                    </label>
                    <input
                      type="text"
                      id="paymentMode"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="form-control"
                      placeholder="e.g., Online, Cheque"
                      required={status === 'Paid'}
                    />
                  </div>
                </div>
              )}

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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBillModal;