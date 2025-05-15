import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import serviceCenterService from "../services/serviceCenter.service";

const ProfileTester = () => {
  const [user, setUser] = useState(null);
  const [firestoreData, setFirestoreData] = useState(null);
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");

  useEffect(() => {
    // Get current user
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchData(currentUser);
    } else {
      setError("No authenticated user found");
      setLoading(false);
    }
  }, []);

  const fetchData = async (currentUser) => {
    try {
      setLoading(true);
      
      // Fetch data from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setFirestoreData(userDocSnap.data());
      } else {
        console.log("No user document found in Firestore");
      }
      
      // Fetch data from backend API
      const apiResponse = await serviceCenterService.getServiceCenterProfile();
      
      if (apiResponse.success) {
        setBackendData(apiResponse.data);
      } else {
        console.log("Error fetching from API:", apiResponse.error);
      }
    } catch (err) {
      setError(`Error fetching data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProfileUpdate = async () => {
    try {
      setUpdateStatus("Testing profile update...");
      
      // Create test update data
      const testData = {
        name: "Test Update " + new Date().toISOString().slice(11, 19),
        phone: "123-456-7890",
        email: user.email,
        address: "123 Test St, Test City",
        certification: "CERT-1234",
        description: "Test description updated at " + new Date().toISOString(),
        serviceTypes: ["Oil Change", "Brake Service", "Tire Rotation"],
        website: "https://testupdate.com"
      };
      
      // Send update request
      const updateResponse = await serviceCenterService.updateServiceCenterProfile(testData);
      
      if (updateResponse.success) {
        setUpdateStatus("✅ Update successful! Refreshing data...");
        // Refresh data
        await fetchData(user);
      } else {
        setUpdateStatus(`❌ Update failed: ${updateResponse.error}`);
      }
    } catch (err) {
      setUpdateStatus(`❌ Update error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading profile data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Data Tester</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Info</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.uid}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Firestore Data</h2>
          <div className="bg-gray-100 p-4 rounded h-64 overflow-auto">
            <pre>{firestoreData ? JSON.stringify(firestoreData, null, 2) : "No data"}</pre>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Backend API Data</h2>
          <div className="bg-gray-100 p-4 rounded h-64 overflow-auto">
            <pre>{backendData ? JSON.stringify(backendData, null, 2) : "No data"}</pre>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <button
          onClick={testProfileUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Test Profile Update
        </button>
        <p className="mt-2">{updateStatus}</p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={() => fetchData(user)}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default ProfileTester;
