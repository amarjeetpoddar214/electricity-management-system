import * as React from 'react';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Floor, Bill, ServiceRequest } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Legend as PieLegend } from 'recharts';
import DashboardSummaryCard from './DashboardSummaryCard';

interface DashboardProps {
    floors: Floor[];
    bills: Bill[];
    serviceRequests: ServiceRequest[];
    onUploadBill: () => void;
    onUpdateBill: (bill: Bill) => void;
    onUpdateRequest: (request: ServiceRequest) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#db7093', '#20b2aa'];

const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
        case 'Open': return 'bg-primary-subtle text-primary-emphasis';
        case 'In Progress': return 'bg-warning-subtle text-warning-emphasis';
        case 'Resolved': return 'bg-success-subtle text-success-emphasis';
        case 'Cancelled': return 'bg-secondary-subtle text-secondary-emphasis';
        default: return 'bg-secondary-subtle text-secondary-emphasis';
    }
};

const Dashboard: React.FC<DashboardProps> = ({ floors, bills, serviceRequests, onUploadBill, onUpdateBill, onUpdateRequest }) => {

    if (!floors || floors.length === 0) {
        return (
            <div className="text-center py-5 bg-white rounded shadow-sm">
                <h2 className="h2 fw-semibold text-dark">No Data Available</h2>
                <p className="text-muted mt-2">Add floors and readings to see the dashboard.</p>
            </div>
        );
    }

    const allReadings = floors.flatMap(f => f.readings);

    const totalBuildingConsumption = useMemo(() => floors.reduce((total, floor) =>
        total + floor.readings.slice(1).reduce((sum, r) => sum + r.unitsConsumed, 0), 0), [floors]);

    const totalBillPayments = useMemo(() =>
        bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        [bills]);

    const totalServicePayments = useMemo(() =>
        serviceRequests.reduce((sum, req) => sum + (req.paymentAmount || 0), 0),
        [serviceRequests]);

    const latestReadingDate = allReadings.length > 0
        ? allReadings.reduce((latest, r) => new Date(r.date) > new Date(latest.date) ? r : latest).date
        : 'N/A';

    const buildingChartData = useMemo(() => {
        const monthlyData = allReadings.slice(1).reduce((acc, reading) => {
            const date = new Date(reading.date);
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!acc[monthYear]) {
                acc[monthYear] = {
                    name: monthYear,
                    'Total Units Consumed': 0,
                    dateObj: new Date(date.getFullYear(), date.getMonth(), 1)
                };
            }
            acc[monthYear]['Total Units Consumed'] += reading.unitsConsumed;
            return acc;
        }, {} as { [key: string]: { name: string; 'Total Units Consumed': number; dateObj: Date } });
        return Object.values(monthlyData).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [allReadings]);

    const breakdownData = useMemo(() => floors.map(floor => ({
        name: floor.name,
        value: floor.readings.slice(1).reduce((sum, r) => sum + r.unitsConsumed, 0)
    })).filter(d => d.value > 0), [floors]);

    const paymentsChartData = useMemo(() => {
        const monthlyPayments = bills
            .filter(b => b.status === 'Paid' && b.totalAmount)
            .reduce((acc, bill) => {
                const date = new Date(bill.monthYear + '-02'); // Use second day to avoid timezone issues
                const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

                if (!acc[monthYear]) {
                    acc[monthYear] = {
                        name: monthYear,
                        'Amount Paid': 0,
                        dateObj: new Date(date.getFullYear(), date.getMonth(), 1)
                    };
                }
                acc[monthYear]['Amount Paid'] += bill.totalAmount!;
                return acc;
            }, {} as { [key: string]: { name: string; 'Amount Paid': number; dateObj: Date } });

        return Object.values(monthlyPayments).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [bills]);

    const availableMonths = useMemo(() => {
        const monthSet = new Set<string>();
        allReadings.slice(1).forEach(r => {
            const date = new Date(r.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthSet.add(key);
        });
        return Array.from(monthSet).sort().reverse().map(key => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            return {
                key,
                label: date.toLocaleString('default', { month: 'long', year: 'numeric' })
            }
        });
    }, [allReadings]);

    const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0]?.key || 'overall');

    const comparisonData = useMemo(() => {
        if (selectedMonth === 'overall') {
            const floorDetails = floors.map(floor => {
                const totalConsumption = floor.readings.slice(1).reduce((sum, r) => sum + r.unitsConsumed, 0);
                const lastReading = floor.readings.length > 0 ? floor.readings[floor.readings.length - 1] : null;
                return {
                    id: floor.id,
                    name: floor.name,
                    consumption: totalConsumption,
                    lastReadingValue: lastReading ? lastReading.reading : null,
                    lastReadingDate: lastReading ? lastReading.date : null,
                    percentage: totalBuildingConsumption > 0 ? (totalConsumption / totalBuildingConsumption) * 100 : 0
                };
            }).sort((a, b) => b.consumption - a.consumption);
            return {
                title: 'Overall Consumption Comparison',
                totalConsumption: totalBuildingConsumption,
                data: floorDetails
            }
        }

        const [year, month] = selectedMonth.split('-').map(Number);
        const totalForMonth = floors.reduce((total, floor) => {
            return total + floor.readings.filter(r => {
                const d = new Date(r.date);
                return d.getFullYear() === year && d.getMonth() + 1 === month;
            }).reduce((sum, r) => sum + r.unitsConsumed, 0);
        }, 0);

        const floorDetails = floors.map(floor => {
            const consumption = floor.readings.filter(r => {
                const d = new Date(r.date);
                return d.getFullYear() === year && d.getMonth() + 1 === month;
            }).reduce((sum, r) => sum + r.unitsConsumed, 0);
            return {
                id: floor.id,
                name: floor.name,
                consumption: consumption,
                percentage: totalForMonth > 0 ? (consumption / totalForMonth) * 100 : 0,
            }
        }).sort((a, b) => b.consumption - a.consumption);

        return {
            title: `Consumption Comparison for ${availableMonths.find(m => m.key === selectedMonth)?.label}`,
            totalConsumption: totalForMonth,
            data: floorDetails,
        }
    }, [floors, selectedMonth, totalBuildingConsumption, availableMonths]);

    const handleExport = () => {
        let dataToExport;
        let fileName;
        const selectedLabel = selectedMonth === 'overall' ? 'Overall' : availableMonths.find(m => m.key === selectedMonth)?.label.replace(' ', '_');

        if (selectedMonth === 'overall') {
            dataToExport = comparisonData.data.map((row: any) => ({
                'Section Name': row.name,
                'Total Consumption (Units)': row.consumption,
                'Latest Reading': row.lastReadingValue ?? 'N/A',
                'Latest Date': row.lastReadingDate ?? 'N/A',
                'Share of Total (%)': parseFloat(row.percentage.toFixed(2)),
            }));
            dataToExport.push({
                'Section Name': 'Total',
                'Total Consumption (Units)': comparisonData.totalConsumption,
                'Latest Reading': '',
                'Latest Date': '',
                'Share of Total (%)': 100.00,
            });
        } else {
            dataToExport = comparisonData.data.map((row: any) => ({
                'Section Name': row.name,
                'Monthly Consumption (Units)': row.consumption,
                'Share of Total (%)': parseFloat(row.percentage.toFixed(2)),
            }));
            dataToExport.push({
                'Section Name': 'Total',
                'Monthly Consumption (Units)': comparisonData.totalConsumption,
                'Share of Total (%)': 100.00,
            });
        }

        fileName = `Consumption_Comparison_${selectedLabel}.xlsx`;
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Consumption Data");
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="d-flex flex-column gap-4">
            {/* Summary Cards */}
            <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-5">
                <div className="col">
                    <DashboardSummaryCard
                        title="Total Consumption"
                        value={`${totalBuildingConsumption.toLocaleString()} Units`}
                        icon="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                    />
                </div>
                <div className="col">
                    <DashboardSummaryCard
                        title="Total Bill Payments"
                        value={totalBillPayments.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.21 12.75 11 12 11c-.75 0-1.536.21-2.121.782L9 12m9 9a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </div>
                <div className="col">
                    <DashboardSummaryCard
                        title="Total Service Payments"
                        value={totalServicePayments.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        icon="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.05.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.003-.827c.293-.24.438-.613.438-.995s-.145-.755-.438-.995l-1.003-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.073-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </div>
                <div className="col">
                    <DashboardSummaryCard
                        title="Sections Monitored"
                        value={floors.length}
                        icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                </div>
                <div className="col">
                    <DashboardSummaryCard
                        title="Most Recent Reading"
                        value={latestReadingDate}
                        icon="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18"
                    />
                </div>
            </div>

            {/* Charts */}
            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card shadow-sm h-100">
                        <div className="card-body p-3">
                            <h3 className="h5 fw-semibold text-dark mb-3">Building Monthly Consumption Trend</h3>
                            <div style={{ height: '20rem', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={buildingChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5, }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                        <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '0.5rem' }} />
                                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                                        <Bar dataKey="Total Units Consumed" fill="#0ea5e9" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card shadow-sm h-100">
                        <div className="card-body p-3">
                            <h3 className="h5 fw-semibold text-dark mb-3">Overall Consumption Breakdown</h3>
                            <div style={{ height: '20rem', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                            {breakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <PieLegend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Payments Chart */}
            <div className="card shadow-sm">
                <div className="card-body p-3">
                    <h3 className="h5 fw-semibold text-dark mb-3">Monthly Bill Payments</h3>
                    <div style={{ height: '20rem', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5, }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} stroke="#6b7280" />
                                <Tooltip
                                    formatter={(value: number) => [value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), 'Amount Paid']}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc', borderRadius: '0.5rem' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="Amount Paid" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Service Requests Section */}
            <div className="card shadow-sm">
                <div className="card-header bg-white p-3">
                    <h3 className="h5 fw-semibold text-dark mb-0">Building Maintenance Service Requests</h3>
                </div>
                {serviceRequests.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0">
                            <thead className="table-light small text-uppercase">
                                <tr>
                                    <th scope="col" className="px-3 py-2">Date</th>
                                    <th scope="col" className="px-3 py-2">Category</th>
                                    <th scope="col" className="px-3 py-2">Location</th>
                                    <th scope="col" className="px-3 py-2">Issue</th>
                                    <th scope="col" className="px-3 py-2">Status</th>
                                    <th scope="col" className="px-3 py-2 text-end">Payment</th>
                                    <th scope="col" className="px-3 py-2 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-3 py-2">{req.requestDate}</td>
                                        <td className="px-3 py-2 fw-medium">{req.category}</td>
                                        <td className="px-3 py-2">{req.location}</td>
                                        <td className="px-3 py-2 text-truncate" style={{ maxWidth: '200px' }} title={req.description}>{req.description}</td>
                                        <td className="px-3 py-2">
                                            <span className={`badge rounded-pill ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-end fw-semibold">
                                            {req.paymentAmount ? req.paymentAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 text-end">
                                            <button
                                                onClick={() => onUpdateRequest(req)}
                                                className="btn btn-link btn-sm text-decoration-none p-0"
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-5 text-muted">
                        No service requests have been raised yet.
                    </div>
                )}
            </div>

            {/* Detailed Table */}
            <div className="card shadow-sm">
                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <h3 className="h5 fw-semibold text-dark mb-0">{comparisonData.title}</h3>
                    <div className="d-flex align-items-center gap-3">
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="form-select form-select-sm"
                        >
                            <option value="overall">Overall</option>
                            {availableMonths.map(month => (
                                <option key={month.key} value={month.key}>{month.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleExport}
                            className="btn btn-sm btn-success d-flex align-items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            <span>Export Excel</span>
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-sm mb-0">
                        <thead className="table-light small text-uppercase">
                            <tr>
                                <th scope="col" className="px-3 py-2">Section Name</th>
                                <th scope="col" className="px-3 py-2 text-end">{selectedMonth === 'overall' ? 'Total Consumption' : 'Monthly Consumption'}</th>
                                {selectedMonth === 'overall' && (
                                    <>
                                        <th scope="col" className="px-3 py-2 text-end">Latest Reading</th>
                                        <th scope="col" className="px-3 py-2">Latest Date</th>
                                    </>
                                )}
                                <th scope="col" className="px-3 py-2 text-end">Share of Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.data.map(floor => (
                                <tr key={floor.id}>
                                    <td className="px-3 py-2 fw-medium">{floor.name}</td>
                                    <td className="px-3 py-2 text-end fw-semibold text-info">{floor.consumption.toLocaleString()} Units</td>
                                    {selectedMonth === 'overall' && (
                                        <>
                                            <td className="px-3 py-2 text-end">{(floor as any).lastReadingValue?.toLocaleString() ?? 'N/A'}</td>
                                            <td className="px-3 py-2">{(floor as any).lastReadingDate ?? 'N/A'}</td>
                                        </>
                                    )}
                                    <td className="px-3 py-2 text-end">{floor.percentage.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-group-divider fw-bold text-dark">
                            <tr>
                                <td className="px-3 py-2">Total</td>
                                <td className="px-3 py-2 text-end">{comparisonData.totalConsumption.toLocaleString()} Units</td>
                                {selectedMonth === 'overall' && <td colSpan={2}></td>}
                                <td className="px-3 py-2 text-end">100.00%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Monthly Bills Section */}
            <div className="card shadow-sm">
                <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <h3 className="h5 fw-semibold text-dark mb-0">Monthly Bill Records</h3>
                    <button
                        onClick={onUploadBill}
                        className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" />
                        </svg>
                        <span>Upload Monthly Bill</span>
                    </button>
                </div>
                {bills.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0">
                            <thead className="table-light small text-uppercase">
                                <tr>
                                    <th scope="col" className="px-3 py-2">Month</th>
                                    <th scope="col" className="px-3 py-2">Status</th>
                                    <th scope="col" className="px-3 py-2 text-end">Total Amount</th>
                                    <th scope="col" className="px-3 py-2 text-end">Total Reading</th>
                                    <th scope="col" className="px-3 py-2">Payment Date</th>
                                    <th scope="col" className="px-3 py-2">Payment Mode</th>
                                    <th scope="col" className="px-3 py-2">File Name</th>
                                    <th scope="col" className="px-3 py-2 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map(bill => (
                                    <tr key={bill.monthYear}>
                                        <td className="px-3 py-2 fw-medium">
                                            {new Date(bill.monthYear + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={`badge rounded-pill ${bill.status === 'Paid' ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-end fw-semibold">
                                            {bill.totalAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) ?? 'N/A'}
                                        </td>
                                        <td className="px-3 py-2 text-end fw-semibold">
                                            {bill.totalReading?.toLocaleString() ?? 'N/A'} Units
                                        </td>
                                        <td className="px-3 py-2">{bill.paymentDate ?? 'N/A'}</td>
                                        <td className="px-3 py-2">{bill.paymentMode ?? 'N/A'}</td>
                                        <td className="px-3 py-2">{bill.fileName}</td>
                                        <td className="px-3 py-2 text-end">
                                            <a
                                                href={bill.dataUrl}
                                                download={bill.fileName}
                                                className="btn btn-link btn-sm text-info text-decoration-none p-0"
                                            >
                                                View/Download
                                            </a>
                                            {bill.status === 'Pending' && (
                                                <button
                                                    onClick={() => onUpdateBill(bill)}
                                                    className="btn btn-link btn-sm text-decoration-none p-0 ms-2"
                                                >
                                                    Update Payment
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-5 text-muted">
                        No bills have been uploaded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;