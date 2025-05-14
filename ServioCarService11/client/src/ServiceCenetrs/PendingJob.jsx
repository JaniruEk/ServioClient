// src/components/PendingJob.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import ServiceCenterSidebar from "../components/ServiceCenterSidebar"; // Import the sidebar
import Footer from "../components/Footer"; // Assuming you have a Footer component

const PendingJob = () => {
  // Filter jobs to show only those with "Pending" status
  const pendingJobs = [
    {
      id: "J1235",
      vehicle: "Ford Focus",
      customer: "Suneth Herath",
      service: "Oil Change",
      status: "Pending",
    },
    // Add more pending jobs as needed (in a real app, this would come from an API)
  ];

  // Animation variants matching JobList.jsx
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  // Placeholder functions for Accept and Decline actions
  const handleAccept = (jobId) => {
    console.log(`Accepted job with ID: ${jobId}`);
    // In a real app, this would update the job status to "In Progress" via an API call
  };

  const handleDecline = (jobId) => {
    console.log(`Declined job with ID: ${jobId}`);
    // In a real app, this would update the job status or delete the job via an API call
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
        <ServiceCenterSidebar activePath="/pending-jobs" />

        {/* Main Content */}
        <main className="flex-1 ml-64 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Pending Jobs</h1>
            </div>
            <Link
              to="/job-list"
              className="group flex items-center gap-2 text-red-500 hover:text-red-400 transition-all duration-200 ease-in-out font-[Open Sans]"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Job List
            </Link>
          </header>

          {/* Job List Section */}
          <section className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center font-[Poppins]">
              <WrenchScrewdriverIcon className="h-6 w-6 text-red-500 mr-2" />
              Pending Job Requests
            </h2>

            {/* Table for Larger Screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md font-[Open Sans] text-gray-300">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">
                      <input type="checkbox" className="mr-2 text-red-500 focus:ring-red-500" />
                    </th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Job ID</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Vehicle</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Customer</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Service</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Status</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway] text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingJobs.length > 0 ? (
                    pendingJobs.map((job, index) => (
                      <motion.tr
                        key={job.id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className="hover:bg-gray-700/50"
                      >
                        <td className="border border-gray-700/50 p-3">
                          <input type="checkbox" className="mr-2 text-red-500 focus:ring-red-500" />
                        </td>
                        <td className="border border-gray-700/50 p-3 text-sm">{job.id}</td>
                        <td className="border border-gray-700/50 p-3 text-sm flex items-center">{job.vehicle}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">{job.customer}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">{job.service}</td>
                        <td className="border border-gray-700/50 p-3 text-sm">
                          <span className="flex items-center">
                            <span
                              className={`w-3 h-3 rounded-full mr-2 ${
                                job.status === "Pending" ? "bg-red-500" : "bg-green-500"
                              }`}
                            ></span>
                            {job.status}
                          </span>
                        </td>
                        <td className="border border-gray-700/50 p-3 flex space-x-2">
                          <button
                            onClick={() => handleAccept(job.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm"
                          >
                            <CheckIcon className="h-5 w-5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(job.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm"
                          >
                            <XMarkIcon className="h-5 w-5" />
                            Decline
                          </button>
                          <Link
                            to={`/job-details/${job.id}`}
                            className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm no-underline"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                            View Details
                          </Link>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-400 font-[Open Sans]">
                        No pending jobs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Card Layout for Mobile Screens */}
            <div className="md:hidden space-y-4">
              {pendingJobs.length > 0 ? (
                pendingJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg"
                  >
                    <div className="flex items-center mb-3">
                      <input type="checkbox" className="mr-3 text-red-500 focus:ring-red-500" />
                      <div>
                        <p className="text-base font-semibold text-white font-[Poppins]">{job.vehicle}</p>
                        <p className="text-sm text-gray-300 font-[Open Sans]">Job ID: {job.id}</p>
                      </div>
                    </div>
                    <div className="space-y-2 font-[Open Sans] text-gray-300">
                      <p className="text-sm">
                        Customer: <span className="font-medium">{job.customer}</span>
                      </p>
                      <p className="text-sm">
                        Service: <span className="font-medium">{job.service}</span>
                      </p>
                      <p className="text-sm">
                        Status:{" "}
                        <span className="flex items-center">
                          <span
                            className={`w-3 h-3 rounded-full mr-2 ${
                              job.status === "Pending" ? "bg-red-500" : "bg-green-500"
                            }`}
                          ></span>
                          <span className="font-medium">{job.status}</span>
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleAccept(job.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm"
                      >
                        <CheckIcon className="h-5 w-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(job.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Decline
                      </button>
                      <Link
                        to={`/job-details/${job.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 hover:scale-105 transition-all duration-200 ease-in-out flex items-center gap-1 font-[Open Sans] text-sm no-underline"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400 font-[Open Sans]">
                  No pending jobs found.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PendingJob;