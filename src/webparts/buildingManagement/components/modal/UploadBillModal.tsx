import * as React from 'react';

import { useState } from 'react';

interface UploadBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    monthYear: string,
    file: File,
    totalAmount: number,
    totalReading: number,
    status: 'Paid' | 'Pending',
    paymentDate?: string,
    paymentMode?: string
  ) => void;
}

const UploadBillModal: React.FC<UploadBillModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [monthYear, setMonthYear] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [totalReading, setTotalReading] = useState<string>('');
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Pending');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(totalAmount);
    const reading = parseFloat(totalReading);

    if (!monthYear) {
      setError('Please select a month and year for the bill.');
      return;
    }
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid, positive total amount.');
      return;
    }
    if (isNaN(reading) || reading < 0) {
      setError('Please enter a valid, non-negative total reading.');
      return;
    }
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
      monthYear,
      selectedFile,
      amount,
      reading,
      status,
      status === 'Paid' ? paymentDate : undefined,
      status === 'Paid' ? paymentMode.trim() : undefined
    );
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().split('T')[0];

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
            <h5 className="modal-title fw-bold">Upload Monthly Bill</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="month" className="form-label">
                    Bill Month & Year
                  </label>
                  <input
                    type="month"
                    id="month"
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    className="form-control"
                    required
                    max={currentMonth}
                  />
                </div>
                <div className="col-md-6">
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
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="amount" className="form-label">
                    Total Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="form-control"
                    placeholder="e.g., 15000.50"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="total-reading" className="form-label">
                    Total Reading (Units)
                  </label>
                  <input
                    type="number"
                    id="total-reading"
                    value={totalReading}
                    onChange={(e) => setTotalReading(e.target.value)}
                    className="form-control"
                    placeholder="e.g., 2500"
                    required
                    min="0"
                  />
                </div>
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

              <div>
                <label htmlFor="file" className="form-label">
                  Bill File (PDF, JPG, PNG)
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                {selectedFile && <p className="small text-muted mt-2">Selected: {selectedFile.name}</p>}
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
                  Upload Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBillModal;