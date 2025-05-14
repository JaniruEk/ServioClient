// FirestoreDataTest.jsx
// This file is for testing purposes only
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";

const FirestoreDataTest = () => {
  const [user, setUser] = useState(null);
  const [serviceCenterId, setServiceCenterId] = useState(null);
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if current user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUser(user);
          
          // Get service center ID from user's profile
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists() && userSnap.data().serviceCenterId) {
            setServiceCenterId(userSnap.data().serviceCenterId);
            console.log("Service Center ID:", userSnap.data().serviceCenterId);
          } else {
            console.log("No service center ID found for this user");
          }
        } else {
          console.log("No user is signed in");
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError(err.message);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch data if service center ID is available
  useEffect(() => {
    if (serviceCenterId) {
      fetchJobsData();
    }
  }, [serviceCenterId]);

  // Function to get date range for last 6 months
  const getLastSixMonthsRange = () => {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    return {
      start: Timestamp.fromDate(sixMonthsAgo),
      end: Timestamp.fromDate(now)
    };
  };

  // Fetch jobs data
  const fetchJobsData = async () => {
    try {
      const { start, end } = getLastSixMonthsRange();
      
      // Create query for completed jobs
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef, 
        where("serviceCenterId", "==", serviceCenterId),
        where("completionDate", ">=", start),
        where("completionDate", "<=", end),
        where("status", "==", "completed")
      );
      
      // Execute query
      console.log("Fetching jobs data...");
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} jobs`);
      
      // Process results
      const jobs = [];
      let totalRevenue = 0;
      let totalParts = 0;
      
      querySnapshot.forEach((docSnapshot) => {
        const job = docSnapshot.data();
        jobs.push(job);
        
        // Calculate total revenue
        if (job.cost) {
          totalRevenue += parseFloat(job.cost);
        }
        
        // Count spare parts
        if (job.partsUsed && Array.isArray(job.partsUsed)) {
          totalParts += job.partsUsed.length;
        }
      });
      
      // Update state with results
      setJobsData(jobs);
      console.log("Total Revenue:", totalRevenue);
      console.log("Total Parts Used:", totalParts);
      console.log("Jobs:", jobs);
      setLoading(false);
      
    } catch (err) {
      console.error("Error fetching jobs data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Firestore Data Test</h2>
      
      <div className="mb-4">
        <h3 className="font-bold">User:</h3>
        <p>Email: {user?.email}</p>
        <p>UID: {user?.uid}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-bold">Service Center ID:</h3>
        <p>{serviceCenterId || "N/A"}</p>
      </div>
      
      <div>
        <h3 className="font-bold mb-2">Jobs Data:</h3>
        <div className="border p-4 rounded bg-gray-100">
          {jobsData.length > 0 ? (
            <ul>
              {jobsData.slice(0, 5).map((job, index) => (
                <li key={index} className="mb-2 pb-2 border-b">
                  <div><strong>Job ID:</strong> {job.jobId || "N/A"}</div>
                  <div><strong>Service Type:</strong> {job.serviceType || "N/A"}</div>
                  <div><strong>Cost:</strong> ${job.cost || "0"}</div>
                  <div><strong>Parts Used:</strong> {job.partsUsed?.length || 0}</div>
                </li>
              ))}
              {jobsData.length > 5 && (
                <li className="text-gray-500">...and {jobsData.length - 5} more jobs</li>
              )}
            </ul>
          ) : (
            <p>No jobs data found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirestoreDataTest;
