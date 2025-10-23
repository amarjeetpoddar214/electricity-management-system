import { useState, useEffect } from 'react';
import { Floor, Bill, ServiceRequest } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/modal/Header';
import FloorCard from './components/modal/FloorCard';
import AddReadingModal from './components/modal/AddReadingModal';
import Dashboard from './components/modal/Dashboard';
import BulkAddReadingModal from './components/modal/BulkAddReadingModal';
import UploadBillModal from './components/modal/UploadBillModal';
import UpdateBillModal from './components/modal/UpdateBillModal';
import RaiseServiceRequestModal from './components/modal/RaiseServiceRequestModal';
import UpdateServiceRequestModal from './components/modal/UpdateServiceRequestModal';
import * as React from 'react';
import { Web } from "sp-pnp-js";

const webURL = 'https://smalsusinfolabs.sharepoint.com/sites/Smalsus';
const serviceRequestListId = "2cbcadca-df0f-43ef-8cf5-f7d58671e2bd";
// const floorsListId = "a930f9c4-27d5-4e7a-9bc4-fbb8dd605565";


const App: React.FC = () => {
  const [floors, setFloors] = useLocalStorage<Floor[]>('floors', [
    {
      id: 1, name: 'Basement', readings: [
        { id: 101, date: '2024-06-15', reading: 23000, unitsConsumed: 0 },
        { id: 102, date: '2024-06-28', reading: 23150, unitsConsumed: 150 },
        { id: 103, date: '2024-07-10', reading: 23280, unitsConsumed: 130 },
        { id: 104, date: '2024-07-25', reading: 23410, unitsConsumed: 130 },
        { id: 105, date: '2024-08-05', reading: 23562, unitsConsumed: 152 },
      ]
    },
    {
      id: 2, name: 'Ground Floor', readings: [
        { id: 201, date: '2024-06-15', reading: 112000, unitsConsumed: 0 },
        { id: 202, date: '2024-06-29', reading: 112350, unitsConsumed: 350 },
        { id: 203, date: '2024-07-12', reading: 112700, unitsConsumed: 350 },
        { id: 204, date: '2024-07-28', reading: 113140, unitsConsumed: 440 },
        { id: 205, date: '2024-08-08', reading: 113500, unitsConsumed: 360 },
      ]
    },
    {
      id: 3, name: '1st Floor', readings: [
        { id: 301, date: '2024-06-16', reading: 87000, unitsConsumed: 0 },
        { id: 302, date: '2024-06-30', reading: 87250, unitsConsumed: 250 },
        { id: 303, date: '2024-07-14', reading: 87555, unitsConsumed: 305 },
        { id: 304, date: '2024-07-29', reading: 87855, unitsConsumed: 300 },
        { id: 305, date: '2024-08-09', reading: 88130, unitsConsumed: 275 },
      ]
    },
    {
      id: 4, name: '2nd Floor', readings: [
        { id: 401, date: '2024-06-14', reading: 92000, unitsConsumed: 0 },
        { id: 402, date: '2024-06-28', reading: 92205, unitsConsumed: 205 },
        { id: 403, date: '2024-07-11', reading: 92410, unitsConsumed: 205 },
        { id: 404, date: '2024-07-26', reading: 92635, unitsConsumed: 225 },
        { id: 405, date: '2024-08-07', reading: 92815, unitsConsumed: 180 },
      ]
    },
    {
      id: 5, name: '3rd Floor', readings: [
        { id: 501, date: '2024-06-18', reading: 76000, unitsConsumed: 0 },
        { id: 502, date: '2024-06-29', reading: 76210, unitsConsumed: 210 },
        { id: 503, date: '2024-07-15', reading: 76515, unitsConsumed: 305 },
        { id: 504, date: '2024-07-30', reading: 76800, unitsConsumed: 285 },
        { id: 505, date: '2024-08-10', reading: 76965, unitsConsumed: 165 },
      ]
    },
    {
      id: 6, name: '4th Floor', readings: [
        { id: 601, date: '2024-06-13', reading: 65000, unitsConsumed: 0 },
        { id: 602, date: '2024-06-27', reading: 65210, unitsConsumed: 210 },
        { id: 603, date: '2024-07-13', reading: 65510, unitsConsumed: 300 },
        { id: 604, date: '2024-07-28', reading: 65820, unitsConsumed: 310 },
        { id: 605, date: '2024-08-09', reading: 65990, unitsConsumed: 170 },
      ]
    },
    {
      id: 7, name: 'Lift', readings: [
        { id: 701, date: '2024-06-15', reading: 150000, unitsConsumed: 0 },
        { id: 702, date: '2024-06-30', reading: 150145, unitsConsumed: 145 },
        { id: 703, date: '2024-07-16', reading: 150300, unitsConsumed: 155 },
        { id: 704, date: '2024-07-31', reading: 150450, unitsConsumed: 150 },
        { id: 705, date: '2024-08-11', reading: 150592, unitsConsumed: 142 },
      ]
    },
    {
      id: 8, name: 'Pump Room', readings: [
        { id: 801, date: '2024-06-15', reading: 55000, unitsConsumed: 0 },
        { id: 802, date: '2024-06-29', reading: 55200, unitsConsumed: 200 },
        { id: 803, date: '2024-07-17', reading: 55540, unitsConsumed: 340 },
        { id: 804, date: '2024-07-30', reading: 55830, unitsConsumed: 290 },
        { id: 805, date: '2024-08-12', reading: 56050, unitsConsumed: 220 },
      ]
    },
    {
      id: 9, name: 'Charging Station', readings: [
        { id: 901, date: '2024-06-15', reading: 4000, unitsConsumed: 0 },
        { id: 902, date: '2024-06-28', reading: 4450, unitsConsumed: 450 },
        { id: 903, date: '2024-07-15', reading: 5100, unitsConsumed: 650 },
        { id: 904, date: '2024-07-29', reading: 5620, unitsConsumed: 520 },
        { id: 905, date: '2024-08-10', reading: 6200, unitsConsumed: 580 },
      ]
    },
  ]);
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', [
    {
      monthYear: '2024-08',
      fileName: 'august_bill_sample.pdf',
      dataUrl: '#',
      totalAmount: 24100.00,
      totalReading: 2350,
      status: 'Pending',
    },
    {
      monthYear: '2024-07',
      fileName: 'july_bill_sample.pdf',
      dataUrl: '#',
      totalAmount: 22500.75,
      totalReading: 2100,
      status: 'Paid',
      paymentDate: '2024-08-05',
      paymentMode: 'Online Banking'
    },
    {
      monthYear: '2024-06',
      fileName: 'june_bill_sample.pdf',
      dataUrl: '#',
      totalAmount: 19850.50,
      totalReading: 1850,
      status: 'Paid',
      paymentDate: '2024-07-08',
      paymentMode: 'Credit Card'
    }
  ]);




  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    fetchServiceRequestList();
  }, [])

  const fetchServiceRequestList = async () => {
    try {
      const web = new Web(webURL);
      const res = await web.lists.getById(serviceRequestListId).items.select(
        "Id",
        "requestDate",
        "category",
        "location/Id",
        "location/Title",
        "descriptionIssue",
        "status",
        "paymentAmount",
        "Title",
        "resolutionDate",
        "resolutionNotes",
        "paymentDate",
        "paymentMode"
      ).expand("location").getAll();
      console.log('Service Request List', res);

      const mappedRequests: ServiceRequest[] = res.map((item: any) => ({
        id: item.Id.toString(),
        requestDate: item.requestDate
          ? new Date(item.requestDate).toISOString().split("T")[0]
          : "",
        category: item.category ?? "",
        location: item.location?.Title ?? "",
        description: item.descriptionIssue ?? "",
        status: item.status ?? "",
        paymentAmount: item.paymentAmount != null ? Number(item.paymentAmount) : 0,
      }));
      console.log('After Mapping Service Request List', res);


      // 🔹 Step 5: Update state
      setServiceRequests(mappedRequests);
    } catch (error) {
      console.error(error);
    }
  }






  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [view, setView] = useState<'floors' | 'dashboard'>('floors');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isUpdateBillModalOpen, setIsUpdateBillModalOpen] = useState(false);
  const [billToUpdate, setBillToUpdate] = useState<Bill | null>(null);
  const [isRaiseRequestModalOpen, setIsRaiseRequestModalOpen] = useState(false);
  const [isUpdateRequestModalOpen, setIsUpdateRequestModalOpen] = useState(false);
  const [requestToUpdate, setRequestToUpdate] = useState<ServiceRequest | null>(null);

  const openAddReadingModal = (floorId: number) => {
    setSelectedFloorId(floorId);
    setIsModalOpen(true);
  };

  const closeAddReadingModal = () => {
    setSelectedFloorId(null);
    setIsModalOpen(false);
  };

  const handleAddReading = (date: string, readingValue: number) => {
    if (selectedFloorId === null) return;

    setFloors(prevFloors => {
      return prevFloors.map(floor => {
        if (floor.id === selectedFloorId) {
          const lastReading = floor.readings.length > 0 ? floor.readings[floor.readings.length - 1] : null;
          const unitsConsumed = lastReading ? readingValue - lastReading.reading : 0;

          const newReading = {
            id: Date.now(),
            date,
            reading: readingValue,
            unitsConsumed: unitsConsumed > 0 ? unitsConsumed : 0,
          };

          const updatedReadings = [...floor.readings, newReading].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          return { ...floor, readings: updatedReadings };
        }
        return floor;
      });
    });

    closeAddReadingModal();
  };

  const toggleView = () => setView(prev => prev === 'floors' ? 'dashboard' : 'floors');

  const openBulkModal = () => setIsBulkModalOpen(true);
  const closeBulkModal = () => setIsBulkModalOpen(false);

  const handleBulkAddReadings = (date: string, readings: { [floorId: number]: number }) => {
    setFloors(prevFloors => {
      return prevFloors.map(floor => {
        if (readings[floor.id] !== undefined) {
          const readingValue = readings[floor.id];
          const lastReading = floor.readings.length > 0 ? floor.readings[floor.readings.length - 1] : null;
          const unitsConsumed = lastReading ? readingValue - lastReading.reading : 0;

          const newReading = {
            id: Date.now() + floor.id,
            date,
            reading: readingValue,
            unitsConsumed: unitsConsumed > 0 ? unitsConsumed : 0,
          };

          const updatedReadings = [...floor.readings, newReading].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { ...floor, readings: updatedReadings };
        }
        return floor;
      });
    });
    closeBulkModal();
  };

  const openBillModal = () => setIsBillModalOpen(true);
  const closeBillModal = () => setIsBillModalOpen(false);

  const handleBillUpload = (
    monthYear: string,
    file: File,
    totalAmount: number,
    totalReading: number,
    status: 'Paid' | 'Pending',
    paymentDate?: string,
    paymentMode?: string
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newBill: Bill = {
          monthYear,
          fileName: file.name,
          dataUrl: event.target.result as string,
          totalAmount,
          totalReading,
          status,
          paymentDate,
          paymentMode,
        };
        setBills(prevBills => [...prevBills, newBill].sort((a, b) => b.monthYear.localeCompare(a.monthYear)));
        closeBillModal();
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("There was an error uploading the file.");
    };
    reader.readAsDataURL(file);
  };

  const openUpdateBillModal = (bill: Bill) => {
    setBillToUpdate(bill);
    setIsUpdateBillModalOpen(true);
  };

  const closeUpdateBillModal = () => {
    setBillToUpdate(null);
    setIsUpdateBillModalOpen(false);
  };

  const handleUpdateBill = (
    monthYear: string,
    status: 'Paid' | 'Pending',
    paymentDate?: string,
    paymentMode?: string
  ) => {
    setBills(prevBills =>
      prevBills.map(bill =>
        bill.monthYear === monthYear
          ? { ...bill, status, paymentDate, paymentMode }
          : bill
      )
    );
    closeUpdateBillModal();
  };

  // Replace your existing handleRaiseServiceRequest with this async version
  const handleRaiseServiceRequest = async (request: Omit<ServiceRequest, 'id' | 'status'>) => {
    try {
      const web = new Web(webURL);

      await web.lists.getById(serviceRequestListId).items.add({
        Title: "Service Request",
        requestDate: request.requestDate,
        category: request.category,
        descriptionIssue: request.description,
        locationId: Number(request.location), // ensure ID is numeric
        status: "Pending"
      });


      alert("Service request submitted successfully!");
      await fetchServiceRequestList(); // refresh list
      setIsRaiseRequestModalOpen(false);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. See console for details.");
    }
  };



  // Inside App.tsx or parent component
  const web = new Web(webURL); // use the same web URL you already have

  const handleUpdateServiceRequest = async (updatedRequest: ServiceRequest) => {
    try {
      console.log("Updating request:", updatedRequest);

      // Step 1: Prepare the update payload
      const payload: any = {
        status: updatedRequest.status,
        resolutionDate: updatedRequest.resolutionDate || null,
        resolutionNotes: updatedRequest.resolutionNotes || null,
        paymentAmount: updatedRequest.paymentAmount || null,
        paymentDate: updatedRequest.paymentDate || null,
        paymentMode: updatedRequest.paymentMode || null
      };

      // Step 2: Update the item in SharePoint list
      await web.lists
        .getById(serviceRequestListId)
        .items.getById(updatedRequest.id)
        .update(payload);

      alert("✅ Service request updated successfully!");

      // Step 3: Optionally refetch data or update your local state
      fetchServiceRequestList();
      setIsUpdateRequestModalOpen(false);


    } catch (error) {
      console.error("❌ Error updating service request:", error);
      alert("Failed to update service request. Check console for details.");
    }
  };


  const openUpdateRequestModal = (request: ServiceRequest) => {
    setRequestToUpdate(request);
    setIsUpdateRequestModalOpen(true);
  }

  const selectedFloor = floors.find(f => f.id === selectedFloorId);
  const lastReadingForModal = selectedFloor?.readings.length ? selectedFloor.readings[selectedFloor.readings.length - 1] : undefined;

  return (
    <div className="min-vh-100 bg-light">
      <Header
        currentView={view}
        onToggleView={toggleView}
        onAddBulkReadings={openBulkModal}
        onRaiseServiceRequest={() => setIsRaiseRequestModalOpen(true)}
      />
      <main className="container-fluid p-3 p-md-4">
        {view === 'floors' ? (
          <>
            <div className="row g-4 row-cols-1 row-cols-lg-2 row-cols-xl-3">
              {floors.map(floor => (
                <div className="col" key={floor.id}>
                  <FloorCard floor={floor} onAddReading={() => openAddReadingModal(floor.id)} />
                </div>
              ))}
            </div>
            {floors.length === 0 && (
              <div className="text-center py-5 bg-white rounded shadow-sm">
                <h2 className="h2 fw-semibold text-dark">No Floors Added Yet</h2>
                <p className="text-muted mt-2">Add floors to get started.</p>
              </div>
            )}
          </>
        ) : (
          <Dashboard
            floors={floors}
            bills={bills}
            serviceRequests={serviceRequests}
            onUploadBill={openBillModal}
            onUpdateBill={openUpdateBillModal}
            onUpdateRequest={openUpdateRequestModal}
          />
        )}

      </main>
      {isModalOpen && selectedFloor && (
        <AddReadingModal
          isOpen={isModalOpen}
          onClose={closeAddReadingModal}
          onSubmit={handleAddReading}
          floorName={selectedFloor.name}
          lastReading={lastReadingForModal}
        />
      )}
      {isBulkModalOpen && (
        <BulkAddReadingModal
          isOpen={isBulkModalOpen}
          onClose={closeBulkModal}
          onSubmit={handleBulkAddReadings}
          floors={floors}
        />
      )}
      {isBillModalOpen && (
        <UploadBillModal
          isOpen={isBillModalOpen}
          onClose={closeBillModal}
          onSubmit={handleBillUpload}
        />
      )}
      {isUpdateBillModalOpen && billToUpdate && (
        <UpdateBillModal
          isOpen={isUpdateBillModalOpen}
          onClose={closeUpdateBillModal}
          onSubmit={handleUpdateBill}
          bill={billToUpdate}
        />
      )}
      {isRaiseRequestModalOpen && (
        <RaiseServiceRequestModal
          isOpen={isRaiseRequestModalOpen}
          onClose={() => setIsRaiseRequestModalOpen(false)}
          onSubmit={handleRaiseServiceRequest}
          floors={floors}
        />
      )}
      {isUpdateRequestModalOpen && requestToUpdate && (
        <UpdateServiceRequestModal
          isOpen={isUpdateRequestModalOpen}
          onClose={() => setIsUpdateRequestModalOpen(false)}
          onSubmit={handleUpdateServiceRequest}
          request={requestToUpdate}
        />
      )}
    </div>
  );
};

export default App;