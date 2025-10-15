import * as React from 'react';


interface HeaderProps {
  currentView: 'floors' | 'dashboard';
  onToggleView: () => void;
  onAddBulkReadings: () => void;
  onRaiseServiceRequest: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onToggleView, onAddBulkReadings, onRaiseServiceRequest }) => {
  return (
    <header className="bg-dark text-white shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="text-info" style={{ height: '2rem', width: '2rem' }} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <h1 className="h4 mb-0 fw-bold">
            Electricity Management System
          </h1>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success d-flex align-items-center gap-2"
            disabled
            title="Adding new floors is currently disabled"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="d-none d-sm-inline">Add Floor</span>
          </button>
          <button
            onClick={onRaiseServiceRequest}
            className="btn btn-danger d-flex align-items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="d-none d-sm-inline">Raise Request</span>
          </button>
          <button
            onClick={onAddBulkReadings}
            className="btn btn-primary d-flex align-items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="d-none d-sm-inline">Add Readings</span>
          </button>
          <button
            onClick={onToggleView}
            className="btn btn-secondary d-flex align-items-center gap-2"
          >
            {currentView === 'floors' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="d-none d-sm-inline">Dashboard</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="d-none d-sm-inline">Floors</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;