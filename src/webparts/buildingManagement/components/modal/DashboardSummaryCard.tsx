import * as React from 'react';


interface DashboardSummaryCardProps {
    title: string;
    value: string | number;
    icon: string;
}

const DashboardSummaryCard: React.FC<DashboardSummaryCardProps> = ({ title, value, icon }) => {
    return (
        <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center gap-3">
                <div className="bg-info-subtle p-3 rounded-circle d-flex align-items-center justify-content-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-info" style={{ width: '2rem', height: '2rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                </div>
                <div>
                    <p className="small text-muted fw-medium mb-1">{title}</p>
                    <p className="h5 fw-bold text-dark mb-0">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummaryCard;