// src/components/ReportAndAnalyse.jsx
import React, { useState } from "react";
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

// Register Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const ReportAndAnalyse = () => {
  // State for metrics (mock data)
  const [metrics] = useState({
    totalJobsCompleted: 120,
    totalRevenue: 15250.5,
    sparePartsUsed: 85,
  });

  // State for custom report
  const [customReport, setCustomReport] = useState({ title: "", description: "", image: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [reports, setReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

  // Chart data
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Jobs Completed",
        data: [20, 25, 30, 35, 40, 45],
        borderColor: "rgba(239, 68, 68, 1)", // Red to match theme
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: ["Oil Changes", "Brake Repairs", "Tire Services"],
    datasets: [
      {
        label: "Revenue Breakdown",
        data: [5000, 7500, 2750.5],
        backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(234, 179, 8, 0.8)"],
        borderColor: ["rgba(239, 68, 68, 1)", "rgba(16, 185, 129, 1)", "rgba(234, 179, 8, 1)"],
        borderWidth: 1,
      },
    ],
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