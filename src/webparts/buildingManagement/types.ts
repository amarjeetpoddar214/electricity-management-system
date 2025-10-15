export interface Reading {
  id: number;
  date: string; // YYYY-MM-DD
  reading: number;
  unitsConsumed: number;
}

export interface Floor {
  id: number;
  name: string;
  readings: Reading[];
}

export interface Bill {
  monthYear: string; // YYYY-MM
  fileName: string;
  dataUrl: string; // Base64 encoded file
  totalAmount?: number;
  totalReading?: number;
  status: 'Paid' | 'Pending';
  paymentDate?: string; // YYYY-MM-DD
  paymentMode?: string;
}

export interface ServiceRequest {
  id: number;
  requestDate: string; // YYYY-MM-DD
  category: 'Electrical' | 'Lift' | 'Fire System' | 'Plumbing' | 'General Maintenance';
  location: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Cancelled';
  resolutionDate?: string;
  resolutionNotes?: string;
  paymentAmount?: number;
  paymentDate?: string;
  paymentMode?: string;
}
