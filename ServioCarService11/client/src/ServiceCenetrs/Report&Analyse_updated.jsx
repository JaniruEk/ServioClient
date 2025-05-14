// src/components/ReportAndAnalyse.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";
import AdminSidebar from "../components/ServiceCenterSidebar"; // Assuming this exists
import Footer from "../components/Footer";

// Import Firebase
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy, Timestamp } from 'firebase/firestore';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const ReportAndAnalyse = () => {
  // State for authentication and loading
  const [currentUser, setCurrentUser] = useState(null);
  const [serviceCenterId, setServiceCenterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for metrics (real data from Firestore)
  const [metrics, setMetrics] = useState({
    totalJobsCompleted: 0,
    totalRevenue: 0,
    sparePartsUsed: 0,
  });

  // State for charts
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Jobs Completed",
        data: [],
        borderColor: "rgba(239, 68, 68, 1)", // Red to match theme
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Revenue Breakdown",
        data: [],
        backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(234, 179, 8, 0.8)"],
        borderColor: ["rgba(239, 68, 68, 1)", "rgba(16, 185, 129, 1)", "rgba(234, 179, 8, 1)"],
        borderWidth: 1,
      },
    ],
  });

  // State for custom report
  const [customReport, setCustomReport] = useState({ title: "", description: "", image: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [reports, setReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  // Effect to get the current user and service center ID
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
        setCurrentUser(user);
        
        // Get service center ID from user's profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().serviceCenterId) {
          setServiceCenterId(userSnap.data().serviceCenterId);
        } else {
          throw new Error('No service center found for this user');
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Effect to fetch data when service center ID is available
  useEffect(() => {
    if (serviceCenterId) {
      fetchAllData();
    }
  }, [serviceCenterId]);

  // Function to fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchJobsCompletedData(),
        fetchRevenueData(),
        fetchSparePartsData()
      ]);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
  };

  // Get date range for last 6 months
  const getLastSixMonthsRange = () => {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    return {
      start: Timestamp.fromDate(sixMonthsAgo),
      end: Timestamp.fromDate(now)
    };
  };

  // Fetch jobs completed data for line chart
  const fetchJobsCompletedData = async () => {
    try {
      const { start, end } = getLastSixMonthsRange();
      
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef, 
        where("serviceCenterId", "==", serviceCenterId),
        where("completionDate", ">=", start),
        where("completionDate", "<=", end),
        where("status", "==", "completed"),
        orderBy("completionDate", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      let totalCompleted = 0;
      const monthlyData = {};
      
      // Initialize monthly data with zeros
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthYear = d.toLocaleString('default', { month: 'short' });
        monthlyData[monthYear] = 0;
      }
      
      // Fill in actual data
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        const completionDate = job.completionDate.toDate();
        const monthYear = completionDate.toLocaleString('default', { month: 'short' });
        
        if (monthlyData[monthYear] !== undefined) {
          monthlyData[monthYear]++;
        }
        
        totalCompleted++;
      });
      
      // Convert to arrays for chart
      const labels = Object.keys(monthlyData).reverse();
      const values = labels.map(label => monthlyData[label]);
      
      setLineChartData({
        labels,
        datasets: [
          {
            label: "Jobs Completed",
            data: values,
            borderColor: "rgba(239, 68, 68, 1)",
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalJobsCompleted: totalCompleted
      }));
      
    } catch (err) {
      console.error("Error fetching jobs completed data:", err);
      throw err;
    }
  };

  // Fetch revenue data for pie chart
  const fetchRevenueData = async () => {
    try {
      const { start, end } = getLastSixMonthsRange();
      
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef, 
        where("serviceCenterId", "==", serviceCenterId),
        where("completionDate", ">=", start),
        where("completionDate", "<=", end),
        where("status", "==", "completed")
      );
      
      const querySnapshot = await getDocs(q);
      const serviceTypeRevenue = {};
      let totalRevenue = 0;
      
      // Process revenue by service type
      querySnapshot.forEach((docSnapshot) => {
        const job = docSnapshot.data();
        if (job.cost && job.serviceType) {
          const cost = parseFloat(job.cost);
          if (!serviceTypeRevenue[job.serviceType]) {
            serviceTypeRevenue[job.serviceType] = 0;
          }
          serviceTypeRevenue[job.serviceType] += cost;
          totalRevenue += cost;
        }
      });
      
      // Convert to arrays for chart (top 3 services by revenue)
      const sortedServices = Object.entries(serviceTypeRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const labels = sortedServices.map(([type]) => type);
      const values = sortedServices.map(([_, revenue]) => revenue);
      
      setPieChartData({
        labels,
        datasets: [
          {
            label: "Revenue Breakdown",
            data: values,
            backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(234, 179, 8, 0.8)"],
            borderColor: ["rgba(239, 68, 68, 1)", "rgba(16, 185, 129, 1)", "rgba(234, 179, 8, 1)"],
            borderWidth: 1,
          },
        ],
      });
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalRevenue
      }));
      
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      throw err;
    }
  };

  // Fetch spare parts data
  const fetchSparePartsData = async () => {
    try {
      const { start, end } = getLastSixMonthsRange();
      
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef, 
        where("serviceCenterId", "==", serviceCenterId),
        where("completionDate", ">=", start),
        where("completionDate", "<=", end),
        where("status", "==", "completed")
      );
      
      const querySnapshot = await getDocs(q);
      let totalParts = 0;
      
      querySnapshot.forEach((docSnapshot) => {
        const job = docSnapshot.data();
        if (job.partsUsed && Array.isArray(job.partsUsed)) {
          totalParts += job.partsUsed.length;
        }
      });
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        sparePartsUsed: totalParts
      }));
      
    } catch (err) {
      console.error("Error fetching spare parts data:", err);
      throw err;
    }
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 14, family: "Open Sans" }, color: "#fff" } },
      tooltip: { backgroundColor: "rgba(0, 0, 0, 0.8)", titleFont: { size: 14 }, bodyFont: { size: 12 } },
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { ticks: { color: "#fff" } },
    },
  };

  // Handle input changes for the custom report form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomReport((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setNewImage(file);
      setCustomReport((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  // Generate a custom report
  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (!customReport.title || !customReport.description || !customReport.image) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    const id = reports.length > 0 ? Math.max(...reports.map((report) => report.id)) + 1 : 1;
    setReports([...reports, { id, ...customReport }]);
    alert("Custom report generated successfully!");
    setCustomReport({ title: "", description: "", image: "" });
    setPreviewImage(null);
    setNewImage(null);
    setShowReportModal(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>
        <div className="flex flex-1 relative z-10 justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Reports & Analytics...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>
        <div className="flex flex-1 relative z-10 justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Reports</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <AdminSidebar activePath="/report-and-analyse" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Reports & Analytics</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Analyze performance and generate reports</p>
            </div>
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 text-red-500 hover:text-red-400 transition-all duration-200 ease-in-out"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-[Open Sans]">Back to Dashboard</span>
            </Link>
          </header>

          {/* Key Metrics Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <DocumentChartBarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Total Jobs Completed</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">{metrics.totalJobsCompleted}</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <CurrencyDollarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Total Revenue</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg text-center bg-white/10 backdrop-blur-md border border-gray-700/50 hover:border-red-500 transition-all duration-300">
              <WrenchScrewdriverIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-[Raleway]">Spare Parts Used</h3>
              <p className="text-gray-300 font-[Open Sans] text-2xl font-bold">{metrics.sparePartsUsed}</p>
            </div>
          </section>

          {/* Charts Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white font-[Poppins] mb-4">Data Visualization</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 font-[Raleway]">Jobs Completed Over Time</h3>
                <div className="h-64">
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 font-[Raleway]">Revenue Breakdown</h3>
                <div className="h-64">
                  <Pie data={pieChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </section>

          {/* Custom Report Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white font-[Poppins]">Generated Reports</h2>
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out flex items-center gap-1"
              >
                <DocumentTextIcon className="h-5 w-5" /> Generate Report
              </button>
            </div>
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Title</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Description</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-700/50">
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{report.title}</td>
                        <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300 line-clamp-2">{report.description}</td>
                        <td className="border border-gray-700/50 p-3">
                          <img
                            src={report.image}
                            alt={report.title}
                            className="h-12 w-12 object-cover rounded-md"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/50x50?text=Image+Not+Found")}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-300 font-[Open Sans]">No reports generated yet.</p>
            )}
          </section>

          {/* Custom Report Modal */}
          {showReportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">Generate Custom Report</h3>
                <form onSubmit={handleGenerateReport} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Report Title</label>
                    <input
                      type="text"
                      name="title"
                      value={customReport.title}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter report title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Description</label>
                    <textarea
                      name="description"
                      value={customReport.description}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter report description"
                      rows="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Image</label>
                    <label className="bg-red-600 text-white p-2 rounded-md cursor-pointer hover:bg-red-700 transition-all duration-200 ease-in-out flex items-center gap-2">
                      <ArrowUpTrayIcon className="h-5 w-5" />
                      <span>Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {previewImage && (
                      <img src={previewImage} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-md" />
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomReport({ title: "", description: "", image: "" });
                        setPreviewImage(null);
                        setNewImage(null);
                        setShowReportModal(false);
                      }}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Generate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ReportAndAnalyse;
