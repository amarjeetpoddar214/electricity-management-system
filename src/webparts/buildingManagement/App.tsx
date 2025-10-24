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
const readingListId = "7bd5408f-b950-4609-adf2-ea11c2a14e22";
const floorsListId = "a930f9c4-27d5-4e7a-9bc4-fbb8dd605565";

const App: React.FC = () => {
  const [floors, setFloors] = useLocalStorage<Floor[]>('floors', []);
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


  // helper to convert SharePoint item to a reading object used in UI
  const mapSPReadingToLocal = (item: any) => ({
    id: item.Id ? String(item.Id) : String(Date.now()),
    date: item.readingDate ? new Date(item.readingDate).toISOString().split('T')[0] : '',
    reading: item.readingValue != null ? Number(item.readingValue) : 0,
    unitsConsumed: item.unitsConsumed != null ? Number(item.unitsConsumed) : 0,
  });

  const fetchFloorsAndReadings = async () => {
    try {
      const web = new Web(webURL);

      // 1) fetch floors (lookup list)
      const floorsRes: any[] = await web.lists.getById(floorsListId).items.select("Id", "Title").getAll();

      // build a map of floors
      const floorsMap: { [id: number]: { id: number; name: string; readings: any[] } } = {};
      floorsRes.forEach(f => {
        floorsMap[f.Id] = { id: f.Id, name: f.Title, readings: [] };
      });

      // 2) fetch readings and expand lookup field
      // Ensure you select floorLookup/Id and floorLookup/Title and the reading fields
      const readingsRes: any[] = await web.lists
        .getById(readingListId)
        .items.select("Id", "Title", "readingDate", "readingValue", "unitsConsumed", "floorLookup/Id", "floorLookup/Title")
        .expand("floorLookup")
        .getAll();

      // 3) assign readings to their floors
      readingsRes.forEach(r => {
        const floorId = r.floorLookup?.Id;
        if (floorId && floorsMap[floorId]) {
          floorsMap[floorId].readings.push(mapSPReadingToLocal(r));
        }
      });

      // 4) create sorted floors array
      const floorsArr = Object.values(floorsMap).map(f => ({
        id: f.id,
        name: f.name,
        readings: f.readings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }));

      // update state (and localStorage)
      setFloors(floorsArr);

    } catch (error) {
      console.error("Error fetching floors/readings:", error);
    }
  };

  // fetch on mount
  useEffect(() => {
    fetchFloorsAndReadings();
    fetchServiceRequestList(); // keep your existing service request fetch
  }, []);




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

  const handleAddReading = async (date: string, readingValue: number) => {
    if (selectedFloorId === null) return;

    try {
      const web = new Web(webURL);

      // Find the selected floor in state
      const selectedFloor = floors.find(floor => floor.id === selectedFloorId);
      if (!selectedFloor) {
        alert("Floor not found!");
        return;
      }

      // Get the last reading to calculate units consumed
      const lastReading = selectedFloor.readings.length > 0
        ? selectedFloor.readings[selectedFloor.readings.length - 1]
        : null;

      const unitsConsumed = lastReading ? readingValue - lastReading.reading : 0;

      console.log('unitsConsumed', unitsConsumed);


      // Prepare the payload for SharePoint
      const newReadingItem = {
        Title: `Reading for ${selectedFloor.name}`,
        floorLookupId: selectedFloorId,     // 🔹 lookup column name + 'Id'
        readingDate: date,                  // 🔹 DateTime column
        readingValue: readingValue,         // 🔹 Number column
        unitsConsumed: unitsConsumed > 0 ? unitsConsumed : 0, // 🔹 Number column
      };


      // Add to SharePoint list
      const addedItem = await web.lists.getById(readingListId).items.add(newReadingItem);

      console.log("✅ Reading added successfully:", addedItem);

      // Optional: refresh floors & readings from SharePoint
      await fetchFloorsAndReadings();

      alert("✅ Reading added successfully!");
    } catch (error) {
      console.error("❌ Error adding reading:", error);
      alert("Failed to add reading. See console for details.");
    }

    closeAddReadingModal();
  };


  const toggleView = () => setView(prev => prev === 'floors' ? 'dashboard' : 'floors');

  const openBulkModal = () => setIsBulkModalOpen(true);
  const closeBulkModal = () => setIsBulkModalOpen(false);

  const handleBulkAddReadings = async (date: string, readings: { [floorId: number]: number }) => {
    try {
      const web = new Web(webURL);

      // Loop through each floor and add reading if provided
      const promises = floors.map(async (floor) => {
        const readingValue = readings[floor.id];
        if (readingValue === undefined) return; // skip floors with no reading entered

        const lastReading = floor.readings.length > 0
          ? floor.readings[floor.readings.length - 1]
          : null;

        const unitsConsumed = lastReading ? readingValue - lastReading.reading : 0;

        // Prepare item for SharePoint
        const newReadingItem = {
          Title: `Reading for ${floor.name}`,
          floorLookupId: floor.id, // lookup column id
          readingDate: date,
          readingValue: readingValue,
          unitsConsumed: unitsConsumed > 0 ? unitsConsumed : 0,
        };

        // Add item into SharePoint
        await web.lists.getById(readingListId).items.add(newReadingItem);
      });

      // Wait for all async add operations to complete
      await Promise.all(promises);

      // Refresh readings after saving
      await fetchFloorsAndReadings();

      alert("✅ Bulk readings added successfully!");
    } catch (error) {
      console.error("❌ Error adding bulk readings:", error);
      alert("Failed to add some readings. Check console for details.");
    }

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