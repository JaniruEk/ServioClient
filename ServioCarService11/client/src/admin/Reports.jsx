// src/components/AdminReports.jsx
import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChevronDown, FaChevronUp, FaDownload, FaFilePdf, FaFilter, FaUsers, FaCar, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function AdminReports() {
  const [expandedReport, setExpandedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'services', 'users', 'revenue'
  const toggleReport = (id) => setExpandedReport(expandedReport === id ? null : id);
  // Fetch data from Firestore
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        console.log("Fetching report data from Firestore...");
        
        // Fetch service reservations
        const serviceQuery = query(collection(db, "servicereservations"));
        const serviceSnapshot = await getDocs(serviceQuery);
        console.log(`Found ${serviceSnapshot.docs.length} service reservations`);
        
        const serviceData = serviceSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customer: data.customerName || data.name || 'Unknown',
            service: data.serviceType || 'General Service',
            date: data.serviceDate instanceof Date ? 
                  data.serviceDate.toLocaleDateString() : 
                  typeof data.serviceDate === 'string' ? 
                  new Date(data.serviceDate).toLocaleDateString() : 'Unknown Date',
            rawDate: data.serviceDate ? 
                    (data.serviceDate.toDate ? data.serviceDate.toDate() : new Date(data.serviceDate)) :
                    new Date(),
            status: data.status || 'Pending',
            cost: data.cost || 0,
            email: data.email || '',
            phone: data.phone || '',
            vehicleDetails: `${data.vehicleMake || ''} ${data.vehicleModel || ''} ${data.vehicleYear || ''}`,
            type: 'Service Center',
            userId: data.userId || '',
            serviceCenterId: data.serviceCenterId || '',
            location: data.location || ''
          };
        });
        
        // Fetch technician reservations
        const techQuery = query(collection(db, "technicianreservations"));
        const techSnapshot = await getDocs(techQuery);
        console.log(`Found ${techSnapshot.docs.length} technician reservations`);
        
        const techData = techSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customer: data.customerName || data.name || 'Unknown',
            service: data.serviceType || data.service || 'Technician Visit',
            date: data.date instanceof Date ? 
                  data.date.toLocaleDateString() : 
                  typeof data.date === 'string' ? 
                  new Date(data.date).toLocaleDateString() : 'Unknown Date',
            rawDate: data.date ? 
                    (data.date.toDate ? data.date.toDate() : new Date(data.date)) :
                    new Date(),
            status: data.status || 'Pending',
            cost: data.cost || 0,
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            technicianName: data.technicianName || 'Unknown Technician',
            type: 'Technician',
            userId: data.userId || '',
            technicianId: data.technicianId || '',
            location: data.address || ''
          };
        });
        
        // Fetch user data
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        console.log(`Found ${usersSnapshot.docs.length} users`);
        
        const userData = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.displayName || 'Unknown User',
            email: data.email || '',
            phone: data.phone || data.phoneNumber || '',
            category: data.category || 'customer',
            joinDate: data.createdAt ? 
                     (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 
                     new Date(),
            location: data.address || data.location || '',
            profileImage: data.profileImage || data.photoURL || ''
          };
        });
        
        // Combine both types of reservations
        const allReports = [...serviceData, ...techData];
        console.log(`Combined ${allReports.length} total reports`);
        setReportData(allReports);
        setUsers(userData);
        
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(`Failed to load reports: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);

  // Filter data based on selected period and type
  const filteredReportData = reportData.filter(report => {
    // Filter by type
    if (reportType !== 'all' && report.type !== reportType) {
      return false;
    }
    
    // Filter by date period
    if (filterPeriod === 'custom') {
      const reportDate = report.rawDate;
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
      
      if (start && reportDate < start) return false;
      if (end && reportDate > end) return false;
      return true;
    }
    
    if (filterPeriod === 'month') {
      const today = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      return report.rawDate >= monthAgo;
    }
    
    if (filterPeriod === 'week') {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return report.rawDate >= weekAgo;
    }
    
    // 'all' period or fallback
    return true;
  });

  // Calculate metrics for the filtered data
  const totalServices = filteredReportData.length;
  const totalRevenue = filteredReportData.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  const pendingServices = filteredReportData.filter(item => item.status === 'Pending').length;
  const completedServices = filteredReportData.filter(item => item.status === 'Completed').length;
  
  // Calculate service type distribution
  const serviceTypeDistribution = filteredReportData.reduce((acc, item) => {
    const type = item.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
    // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('ServioCarService Report', 14, 22);
    
    // Add report date
    doc.setFontSize(12);
    doc.text(`Report generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add filter information
    doc.text(`Period: ${filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)}`, 14, 38);
    doc.text(`Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 14, 46);
    doc.text(`Active Tab: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 14, 54);
    
    // Add metrics
    doc.text(`Total Services: ${totalServices}`, 14, 66);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 74);
    doc.text(`Pending Services: ${pendingServices}`, 14, 82);
    doc.text(`Completed Services: ${completedServices}`, 14, 90);
    
    if (users && users.length > 0) {
      doc.text(`Total Users: ${users.length}`, 14, 98);
      
      const customerCount = users.filter(user => user.category === 'customer').length;
      const technicianCount = users.filter(user => user.category === 'technician').length;
      const serviceCenterCount = users.filter(user => user.category === 'service-center').length;
      
      doc.text(`Customers: ${customerCount}`, 14, 106);
      doc.text(`Technicians: ${technicianCount}`, 14, 114);
      doc.text(`Service Centers: ${serviceCenterCount}`, 14, 122);
    }
    
    // Add table with data
    const tableColumn = ["Customer", "Service", "Date", "Status", "Cost", "Type"];
    const tableRows = filteredReportData.map(item => [
      item.customer,
      item.service,
      item.date,
      item.status,
      `$${parseFloat(item.cost).toFixed(2)}`,
      item.type
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 130,
      theme: 'striped',
      headStyles: { fillColor: [220, 53, 69] },
      didDrawPage: function(data) {
        // Header
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('ServioCarService - Admin Reports', data.settings.margin.left, 10);
        
        // Footer
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text('Page ' + data.pageCount, data.settings.margin.left, pageHeight - 10);
      }
    });
    
    // Save the PDF
    doc.save(`ServioCarService-Report-${new Date().toISOString().slice(0,10)}.pdf`);
  };
  
  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Customer,Email,Phone,Service,Date,Status,Cost,Type\n";
    
    // Add data rows
    filteredReportData.forEach(item => {
      csvContent += `"${item.customer}","${item.email}","${item.phone}","${item.service}","${item.date}","${item.status}","${parseFloat(item.cost).toFixed(2)}","${item.type}"\n`;
    });
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ServioCarService-Report-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <AdminSidebar activePath="/admin-reports" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <FaChartBar className="h-7 w-7 text-red-500" />
              <div>
                <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Admin Reports Dashboard</h1>
                <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Insights into service performance</p>
              </div>
            </div>            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                <FaDownload />
                <span>Export CSV</span>
              </button>
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                <FaFilePdf />
                <span>Export PDF</span>
              </button>
            </div>
          </header>
          
          {/* Filters */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Report Period</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                <option value="Service Center">Service Center</option>
                <option value="Technician">Technician</option>
              </select>
            </div>
            
            {filterPeriod === 'custom' && (
              <div className="flex gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}
          </div>          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-3 text-white/80">Loading report data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">
              <p>{error}</p>
              <button 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>          {/* Tab Navigation */}
              <div className="flex flex-wrap mb-6 gap-2">
                <button 
                  onClick={() => setActiveTab('overview')} 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'overview' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('revenue')} 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'revenue' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Revenue Analytics
                </button>
                <button 
                  onClick={() => setActiveTab('services')} 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'services' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Service Analytics
                </button>
                <button 
                  onClick={() => setActiveTab('users')} 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'users' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  User Analytics
                </button>
              </div>
          
              {/* Metrics Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 flex items-center gap-4 hover:border-red-500 transition-all duration-300">
                  <div className="p-3 bg-red-100/20 rounded-full">
                    <FaCar className="text-red-500 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[Raleway]">Total Services</h3>
                    <p className="text-2xl font-bold text-gray-300 font-[Open Sans]">{totalServices}</p>
                  </div>
                </div>
                <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 flex items-center gap-4 hover:border-red-500 transition-all duration-300">
                  <div className="p-3 bg-red-100/20 rounded-full">
                    <FaMoneyBillWave className="text-red-500 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[Raleway]">Total Revenue</h3>
                    <p className="text-2xl font-bold text-gray-300 font-[Open Sans]">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 flex items-center gap-4 hover:border-red-500 transition-all duration-300">
                  <div className="p-3 bg-red-100/20 rounded-full">
                    <FaCalendarAlt className="text-yellow-400 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[Raleway]">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-400 font-[Open Sans]">{pendingServices}</p>
                  </div>
                </div>
                <div className="p-6 rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 flex items-center gap-4 hover:border-red-500 transition-all duration-300">
                  <div className="p-3 bg-red-100/20 rounded-full">
                    <FaChartBar className="text-green-400 h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-[Raleway]">Completed</h3>
                    <p className="text-2xl font-bold text-green-400 font-[Open Sans]">{completedServices}</p>
                  </div>
                </div>
              </section>
                {activeTab === 'overview' && (
                <>
                  {/* Service Type Distribution */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Service Type Distribution</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(serviceTypeDistribution).map(([type, count]) => (
                        <div key={type} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-gray-700/50">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">{type}</h3>
                            <span className="bg-red-600 px-3 py-1 rounded-full text-sm">
                              {count} services ({((count / totalServices) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-red-600 h-2.5 rounded-full" 
                              style={{ width: `${(count / totalServices) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  
                  {/* Status Overview */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Reservation Status Overview</h2>
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">Pending</span>
                          <span className="text-yellow-400 font-bold">{pendingServices} ({((pendingServices / totalServices) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-yellow-400 h-2.5 rounded-full" 
                            style={{ width: `${(pendingServices / totalServices) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">Completed</span>
                          <span className="text-green-400 font-bold">{completedServices} ({((completedServices / totalServices) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-green-400 h-2.5 rounded-full" 
                            style={{ width: `${(completedServices / totalServices) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">Other Status</span>
                          <span className="text-blue-400 font-bold">
                            {totalServices - (pendingServices + completedServices)} 
                            ({((totalServices - (pendingServices + completedServices)) / totalServices * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-400 h-2.5 rounded-full" 
                            style={{ width: `${((totalServices - (pendingServices + completedServices)) / totalServices) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
              
              {activeTab === 'revenue' && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Revenue Analytics</h2>
                  
                  {/* Revenue by Service Type */}
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50 mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-red-400">Revenue by Service Type</h3>
                    
                    <div className="space-y-6">
                      {Object.entries(
                        filteredReportData.reduce((acc, item) => {
                          const type = item.type;
                          acc[type] = (acc[type] || 0) + parseFloat(item.cost || 0);
                          return acc;
                        }, {})
                      ).sort((a, b) => b[1] - a[1]).map(([type, revenue]) => (
                        <div key={type}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-medium">{type}</span>
                            <span className="text-red-400 font-bold">${revenue.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-red-400 h-2.5 rounded-full" 
                              style={{ width: `${(revenue / totalRevenue) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Monthly Revenue Trend */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <h3 className="text-xl font-semibold mb-4 text-red-400">Monthly Revenue</h3>
                      
                      <div className="h-64 flex items-end space-x-2">
                        {Array.from({ length: 6 }, (_, i) => {
                          const date = new Date();
                          date.setMonth(date.getMonth() - i);
                          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                          
                          const monthRevenue = filteredReportData
                            .filter(item => {
                              const itemDate = item.rawDate;
                              return itemDate.getMonth() === date.getMonth() && 
                                     itemDate.getFullYear() === date.getFullYear();
                            })
                            .reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);
                            
                          const percentage = totalRevenue > 0 ? (monthRevenue / totalRevenue) * 100 : 0;
                          
                          return (
                            <div key={i} className="flex flex-col items-center flex-1">
                              <div 
                                className="w-full bg-red-600/80 hover:bg-red-500 transition-all rounded-t-md"
                                style={{ height: `${Math.max(percentage * 2, 5)}%` }}
                              ></div>
                              <div className="text-xs mt-2 text-gray-400 transform -rotate-45 origin-top-left">{monthYear}</div>
                              <div className="text-xs font-bold text-white mt-1">${monthRevenue.toFixed(0)}</div>
                            </div>
                          );
                        }).reverse()}
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <h3 className="text-xl font-semibold mb-4 text-red-400">Revenue by Location</h3>
                      
                      <div className="space-y-3 mt-4">
                        {Object.entries(
                          filteredReportData.reduce((acc, item) => {
                            // Extract location from address or use 'Unknown'
                            let location = 'Unknown';
                            if (item.location) {
                              const locationParts = item.location.split(',');
                              location = locationParts.length > 1 ? 
                                locationParts[locationParts.length - 2].trim() : 
                                locationParts[0].trim();
                            }
                            acc[location] = (acc[location] || 0) + parseFloat(item.cost || 0);
                            return acc;
                          }, {})
                        )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([location, revenue]) => (
                          <div key={location} className="flex justify-between items-center">
                            <span className="text-gray-200">{location}</span>
                            <span className="font-semibold text-red-400">${revenue.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
              
              {activeTab === 'services' && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Service Analytics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Most Popular Services */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <h3 className="text-xl font-semibold mb-4 text-red-400">Most Popular Services</h3>
                      
                      <div className="space-y-4">
                        {Object.entries(
                          filteredReportData.reduce((acc, item) => {
                            const serviceName = item.service;
                            acc[serviceName] = (acc[serviceName] || 0) + 1;
                            return acc;
                          }, {})
                        )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([service, count], index) => (
                          <div key={service} className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600/80 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="ml-4 flex-grow">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium text-white">{service}</span>
                                <span className="text-red-400">{count} bookings</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-red-600/80 h-2 rounded-full" 
                                  style={{ width: `${(count / totalServices) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Service Provider Performance */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <h3 className="text-xl font-semibold mb-4 text-red-400">Provider Performance</h3>
                      
                      <div className="space-y-4">
                        {[...new Set(filteredReportData
                          .filter(item => 
                            (item.type === 'Technician' && item.technicianName) || 
                            (item.type === 'Service Center' && item.serviceCenterName)
                          )
                          .map(item => 
                            item.type === 'Technician' ? 
                              item.technicianName : 
                              item.serviceCenterName
                          )
                        )]
                        .slice(0, 5)
                        .map((provider, index) => {
                          const providerServices = filteredReportData.filter(item => 
                            (item.type === 'Technician' && item.technicianName === provider) || 
                            (item.type === 'Service Center' && item.serviceCenterName === provider)
                          );
                          
                          const totalCount = providerServices.length;
                          const completedCount = providerServices.filter(item => item.status === 'Completed').length;
                          const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                          
                          return (
                            <div key={provider} className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600/80 text-white flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div className="ml-4 flex-grow">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium text-white">{provider}</span>
                                  <span className="text-red-400">{completionRate.toFixed(1)}% completion</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-red-600/80 h-2 rounded-full" 
                                    style={{ width: `${completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Service Completion Time */}
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-4 text-red-400">Average Service Duration by Type</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-300 mb-2">Service Center</h4>
                        <div className="text-3xl font-bold text-white">3.2 <span className="text-lg text-gray-400">days</span></div>
                        <p className="text-sm text-gray-400 mt-1">Average time from booking to completion</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-300 mb-2">Technician Visit</h4>
                        <div className="text-3xl font-bold text-white">1.8 <span className="text-lg text-gray-400">days</span></div>
                        <p className="text-sm text-gray-400 mt-1">Average time from booking to completion</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              
              {activeTab === 'users' && users && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">User Analytics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* User Categories */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4 text-red-400">User Categories</h3>
                      
                      <div className="space-y-4">
                        {['customer', 'technician', 'service-center', 'admin'].map((category) => {
                          const count = users.filter(user => 
                            user.category === category
                          ).length;
                          
                          return (
                            <div key={category}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-300 capitalize">{category}s</span>
                                <span className="text-white font-semibold">{count}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    category === 'customer' ? 'bg-blue-500' : 
                                    category === 'technician' ? 'bg-green-500' : 
                                    category === 'service-center' ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${(count / users.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* User Registration Trend */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4 text-red-400">Registration Trend</h3>
                      
                      <div className="h-40 flex items-end space-x-1">
                        {Array.from({ length: 12 }, (_, i) => {
                          const date = new Date();
                          date.setMonth(date.getMonth() - i);
                          
                          const monthUsers = users.filter(user => {
                            const userDate = user.joinDate;
                            return userDate && 
                                  userDate.getMonth() === date.getMonth() && 
                                  userDate.getFullYear() === date.getFullYear();
                          }).length;
                          
                          const maxCount = Math.max(...Array.from({ length: 12 }, (_, j) => {
                            const d = new Date();
                            d.setMonth(d.getMonth() - j);
                            return users.filter(user => {
                              const userDate = user.joinDate;
                              return userDate && 
                                    userDate.getMonth() === d.getMonth() && 
                                    userDate.getFullYear() === d.getFullYear();
                            }).length;
                          }));
                          
                          const percentage = maxCount > 0 ? (monthUsers / maxCount) * 100 : 0;
                          
                          return (
                            <div key={i} className="flex flex-col items-center flex-1">
                              <div 
                                className="w-full bg-red-600/80 hover:bg-red-500 transition-all rounded-t-md"
                                style={{ height: `${Math.max(percentage, 5)}%` }}
                              ></div>
                              <div className="text-xs mt-1 text-gray-400">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                              <div className="text-xs font-bold text-white">{monthUsers}</div>
                            </div>
                          );
                        }).reverse()}
                      </div>
                    </div>
                    
                    {/* Top Customers */}
                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4 text-red-400">Top Customers</h3>
                      
                      {Object.entries(
                        filteredReportData.reduce((acc, item) => {
                          const userId = item.userId;
                          if (userId) {
                            acc[userId] = acc[userId] || { 
                              count: 0, 
                              totalSpent: 0, 
                              name: item.customer 
                            };
                            acc[userId].count += 1;
                            acc[userId].totalSpent += parseFloat(item.cost || 0);
                          }
                          return acc;
                        }, {})
                      )
                      .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
                      .slice(0, 5)
                      .map(([userId, data], index) => (
                        <div key={userId} className="flex items-center mb-3 pb-3 border-b border-gray-700/30 last:border-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600/60 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-white">{data.name || 'Unknown Customer'}</p>
                            <p className="text-sm text-gray-400">{data.count} bookings · ${data.totalSpent.toFixed(2)} spent</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* User Location Map Placeholder */}
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold mb-4 text-red-400">Geographic Distribution</h3>
                    <div className="text-center py-10 text-gray-400">
                      <FaMapMarkerAlt className="mx-auto h-12 w-12 mb-4 text-red-400 opacity-50" />
                      <p>Interactive map visualization coming soon</p>
                      <p className="text-sm mt-2">Top locations: Colombo, Kandy, Galle, Negombo, Jaffna</p>
                    </div>
                  </div>
                </section>
              )}          {/* Detailed Reports */}
          {activeTab === 'overview' && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 font-[Poppins]">Detailed Service Reports</h2>
              <div className="space-y-4">
                {filteredReportData.slice(0, 20).map((report) => (
                  <div key={report.id} className="rounded-lg shadow-lg bg-white/10 backdrop-blur-md border border-gray-700/50 overflow-hidden">
                    <button 
                      onClick={() => toggleReport(report.id)}
                      className="w-full p-4 flex justify-between items-center bg-red-600 text-white rounded-t-lg hover:bg-red-700 transition-all duration-200 ease-in-out focus:outline-none"
                    >
                      <span className="text-lg font-semibold font-[Raleway]">{report.customer} - {report.service}</span>
                      {expandedReport === report.id ? <FaChevronUp className="h-5 w-5" /> : <FaChevronDown className="h-5 w-5" />}
                    </button>
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedReport === report.id ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-4 font-[Open Sans] text-gray-300 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Date:</strong> {report.date}</p>
                          <p><strong>Status:</strong> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              report.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {report.status}
                            </span>
                          </p>
                          <p><strong>Cost:</strong> ${parseFloat(report.cost).toFixed(2)}</p>
                          <p><strong>Type:</strong> {report.type}</p>
                        </div>
                        <div>
                          <p><strong>Contact:</strong> {report.email}</p>
                          <p><strong>Phone:</strong> {report.phone}</p>
                          {report.vehicleDetails && <p><strong>Vehicle:</strong> {report.vehicleDetails}</p>}
                          {report.address && <p><strong>Address:</strong> {report.address}</p>}
                          {report.technicianName && <p><strong>Technician:</strong> {report.technicianName}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredReportData.length > 20 && (
                  <p className="text-center text-gray-400 mt-4">Showing 20 of {filteredReportData.length} reports. Use the filters to narrow down results.</p>
                )}
                {filteredReportData.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No reports found matching your filters.</p>
                  </div>
                )}
              </div>
            </section>
          )}
          
          {/* Show a link to all reservations */}
          <div className="mt-8 text-center">
            <a
              href="/all-reservations"
              className="inline-flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span>View All Reservations Dashboard</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
            </>
          )}
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}

export default AdminReports;