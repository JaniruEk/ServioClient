// src/ServiceCenetrs/ReportsAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowPathIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentChartBarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import ServiceCenterSidebar from '../components/ServiceCenterSidebar';
import Footer from '../components/Footer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
// Import Firebase
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsAnalytics = () => {
  const [isReloading, setIsReloading] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('revenue');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceCenterId, setServiceCenterId] = useState('');
  
  // State for Firebase data
  const [revenueData, setRevenueData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [ratingData, setRatingData] = useState([]);
  const [completionTimeData, setCompletionTimeData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: '$0',
    totalServices: '0',
    avgRating: '0',
    avgCompletionTime: '0 hours',
    monthlyGrowth: '0%',
    popularService: 'N/A',
    mostRequested: 'N/A',
  });
  
  // Get current user and service center ID
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
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
  
  // Fetch data when service center ID changes or time range changes
  useEffect(() => {
    if (serviceCenterId) {
      fetchReportData();
    }
  }, [serviceCenterId, timeRange]);
  
  // Function to fetch all report data
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchRevenueData(),
        fetchServiceTypeData(),
        fetchCustomerSatisfactionData(),
        fetchCompletionTimeData(),
        fetchSummaryStats()
      ]);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data. Please try again later.");
      setLoading(false);
    }
  };
  
  // Get date range based on selected timeRange
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch(timeRange) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1); // Default to month
    }
    
    return {
      start: Timestamp.fromDate(start),
      end: Timestamp.fromDate(now)
    };
  };
  
  // Fetch revenue data
  const fetchRevenueData = async () => {
    try {
      const { start, end } = getDateRange();
      
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
      const data = [];
      let totalRevenue = 0;
      
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        if (job.cost) {
          totalRevenue += parseFloat(job.cost);
          data.push({
            date: job.completionDate.toDate(),
            revenue: job.cost
          });
        }
      });
      
      // Process data for chart
      const processedData = processRevenueData(data);
      setRevenueData(processedData);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalRevenue: `$${totalRevenue.toLocaleString()}`
      }));
      
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      throw err;
    }
  };
  
  // Process revenue data based on time range
  const processRevenueData = (data) => {
    const labels = [];
    const values = [];
    
    if (data.length === 0) return { labels, datasets: [{ label: 'Revenue ($)', data: values, backgroundColor: 'rgba(220, 38, 38, 0.7)', borderColor: 'rgb(220, 38, 38)', borderWidth: 1 }] };
    
    // Group data based on time range
    const groupedData = {};
    
    switch(timeRange) {
      case 'week':
        // Group by day
        data.forEach(item => {
          const dayStr = item.date.toLocaleDateString('en-US', { weekday: 'short' });
          if (!groupedData[dayStr]) groupedData[dayStr] = 0;
          groupedData[dayStr] += parseFloat(item.revenue);
        });
        
        // Sort days of week
        const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOrder.forEach(day => {
          if (groupedData[day] !== undefined) {
            labels.push(day);
            values.push(groupedData[day]);
          } else {
            labels.push(day);
            values.push(0);
          }
        });
        break;
        
      case 'month':
        // Group by day of month
        data.forEach(item => {
          const day = item.date.getDate();
          if (!groupedData[day]) groupedData[day] = 0;
          groupedData[day] += parseFloat(item.revenue);
        });
        
        // Get last 30 days
        const now = new Date();
        for (let i = 30; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const day = d.getDate();
          labels.push(day);
          values.push(groupedData[day] || 0);
        }
        break;
        
      case 'quarter':
        // Group by week
        data.forEach(item => {
          const weekNum = Math.ceil((item.date.getDate() + new Date(item.date.getFullYear(), item.date.getMonth(), 1).getDay()) / 7);
          const monthName = item.date.toLocaleDateString('en-US', { month: 'short' });
          const weekLabel = `${monthName} W${weekNum}`;
          
          if (!groupedData[weekLabel]) groupedData[weekLabel] = 0;
          groupedData[weekLabel] += parseFloat(item.revenue);
        });
        
        Object.keys(groupedData).forEach(week => {
          labels.push(week);
          values.push(groupedData[week]);
        });
        break;
        
      case 'year':
        // Group by month
        data.forEach(item => {
          const month = item.date.toLocaleDateString('en-US', { month: 'short' });
          if (!groupedData[month]) groupedData[month] = 0;
          groupedData[month] += parseFloat(item.revenue);
        });
        
        // Ensure all months are included
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach(month => {
          labels.push(month);
          values.push(groupedData[month] || 0);
        });
        break;
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data: values,
          backgroundColor: 'rgba(220, 38, 38, 0.7)',
          borderColor: 'rgb(220, 38, 38)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Fetch service type data
  const fetchServiceTypeData = async () => {
    try {
      const { start, end } = getDateRange();
      
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef, 
        where("serviceCenterId", "==", serviceCenterId),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      );
      
      const querySnapshot = await getDocs(q);
      const serviceTypes = {};
      let totalServices = 0;
      
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        if (job.serviceType) {
          if (!serviceTypes[job.serviceType]) {
            serviceTypes[job.serviceType] = 0;
          }
          serviceTypes[job.serviceType]++;
          totalServices++;
        }
      });
      
      // Find most popular service
      let popularService = 'N/A';
      let maxCount = 0;
      
      Object.keys(serviceTypes).forEach(type => {
        if (serviceTypes[type] > maxCount) {
          maxCount = serviceTypes[type];
          popularService = type;
        }
      });
      
      // Process for chart
      const labels = Object.keys(serviceTypes);
      const values = labels.map(label => serviceTypes[label]);
      
      // Generate colors
      const colors = [
        'rgba(220, 38, 38, 0.8)',   // Red
        'rgba(234, 88, 12, 0.8)',   // Orange
        'rgba(234, 179, 8, 0.8)',   // Yellow
        'rgba(22, 163, 74, 0.8)',   // Green
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(139, 92, 246, 0.8)',  // Purple
      ];
      
      // If more services than colors, repeat colors
      const backgroundColor = labels.map((_, index) => colors[index % colors.length]);
      
      setServiceData({
        labels,
        datasets: [
          {
            label: 'Number of Services',
            data: values,
            backgroundColor,
            borderWidth: 1,
          },
        ],
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalServices: totalServices.toString(),
        popularService
      }));
      
    } catch (err) {
      console.error("Error fetching service type data:", err);
      throw err;
    }
  };
  
  // Fetch customer satisfaction data
  const fetchCustomerSatisfactionData = async () => {
    try {
      const { start, end } = getDateRange();
      
      const reviewsRef = collection(db, "reviews");
      const q = query(
        reviewsRef, 
        where("serviceCenterId", "==", serviceCenterId),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      );
      
      const querySnapshot = await getDocs(q);
      const ratings = {
        '5': 0,
        '4': 0,
        '3': 0,
        '2': 0,
        '1': 0
      };
      
      let totalRating = 0;
      let ratingCount = 0;
      
      querySnapshot.forEach((doc) => {
        const review = doc.data();
        if (review.rating) {
          const rating = Math.round(review.rating);
          if (ratings[rating] !== undefined) {
            ratings[rating]++;
            totalRating += review.rating;
            ratingCount++;
          }
        }
      });
      
      // Calculate average rating
      const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
      
      // Process for chart
      const labels = ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];
      const values = [ratings['5'], ratings['4'], ratings['3'], ratings['2'], ratings['1']];
      
      // Calculate percentages for display
      const totalReviews = values.reduce((sum, val) => sum + val, 0);
      const percentages = totalReviews > 0 
        ? values.map(v => Math.round((v / totalReviews) * 100)) 
        : [0, 0, 0, 0, 0];
      
      setRatingData({
        labels,
        datasets: [
          {
            label: 'Ratings Count',
            data: values,
            backgroundColor: [
              'rgba(22, 163, 74, 0.8)',   // Green for 5 stars
              'rgba(34, 197, 94, 0.8)',   // Light green for 4 stars
              'rgba(234, 179, 8, 0.8)',   // Yellow for 3 stars
              'rgba(234, 88, 12, 0.8)',   // Orange for 2 stars
              'rgba(220, 38, 38, 0.8)',   // Red for 1 star
            ],
            borderWidth: 1,
          },
        ],
        percentages
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        avgRating
      }));
      
    } catch (err) {
      console.error("Error fetching customer satisfaction data:", err);
      throw err;
    }
  };
  
  // Fetch job completion time data
  const fetchCompletionTimeData = async () => {
    try {
      const { start, end } = getDateRange();
      
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef, 
        where("serviceCenterId", "==", serviceCenterId),
        where("status", "==", "completed"),
        where("completionDate", ">=", start),
        where("completionDate", "<=", end)
      );
      
      const querySnapshot = await getDocs(q);
      const completionTimes = [];
      let totalTime = 0;
      let jobCount = 0;
      
      querySnapshot.forEach((doc) => {
        const job = doc.data();
        if (job.startDate && job.completionDate) {
          const startTime = job.startDate.toDate();
          const endTime = job.completionDate.toDate();
          const timeDiff = (endTime - startTime) / (1000 * 60 * 60); // hours
          
          completionTimes.push({
            date: job.completionDate.toDate(),
            time: timeDiff
          });
          
          totalTime += timeDiff;
          jobCount++;
        }
      });
      
      // Calculate average completion time
      const avgTime = jobCount > 0 ? (totalTime / jobCount).toFixed(1) : 0;
      
      // Process data for chart based on time range
      const processed = processCompletionTimeData(completionTimes);
      
      setCompletionTimeData(processed);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        avgCompletionTime: `${avgTime} hours`
      }));
      
    } catch (err) {
      console.error("Error fetching completion time data:", err);
      throw err;
    }
  };
  
  // Process completion time data based on time range
  const processCompletionTimeData = (data) => {
    const labels = [];
    const values = [];
    
    if (data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Average Time (Hours)',
            data: [0],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            tension: 0.3,
          }
        ]
      };
    }
    
    // Group data based on time range
    const groupedData = {};
    let dateFormat = '';
    
    switch(timeRange) {
      case 'week':
        dateFormat = { weekday: 'short' }; // e.g., "Mon"
        break;
      case 'month':
        dateFormat = { day: '2-digit' }; // e.g., "01"
        break;
      case 'quarter':
        dateFormat = { month: 'short', day: '2-digit' }; // e.g., "Jan 01"
        break;
      case 'year':
        dateFormat = { month: 'short' }; // e.g., "Jan"
        break;
    }
    
    data.forEach(item => {
      const dateKey = item.date.toLocaleDateString('en-US', dateFormat);
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = { total: 0, count: 0 };
      }
      groupedData[dateKey].total += item.time;
      groupedData[dateKey].count++;
    });
    
    // Calculate averages and prepare for chart
    Object.keys(groupedData).forEach(date => {
      const avg = groupedData[date].total / groupedData[date].count;
      labels.push(date);
      values.push(parseFloat(avg.toFixed(1)));
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Average Time (Hours)',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          tension: 0.3,
        }
      ]
    };
  };
  
  // Calculate summary stats
  const fetchSummaryStats = async () => {
    try {
      // Monthly growth calculation
      const currentMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(currentMonth.getMonth() - 1);
      
      // Get current month revenue
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const currentJobsQ = query(
        collection(db, "jobs"),
        where("serviceCenterId", "==", serviceCenterId),
        where("completionDate", ">=", Timestamp.fromDate(currentMonthStart)),
        where("completionDate", "<=", Timestamp.fromDate(currentMonthEnd)),
        where("status", "==", "completed")
      );
      
      // Get last month revenue
      const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      
      const lastJobsQ = query(
        collection(db, "jobs"),
        where("serviceCenterId", "==", serviceCenterId),
        where("completionDate", ">=", Timestamp.fromDate(lastMonthStart)),
        where("completionDate", "<=", Timestamp.fromDate(lastMonthEnd)),
        where("status", "==", "completed")
      );
      
      const [currentSnap, lastSnap] = await Promise.all([
        getDocs(currentJobsQ),
        getDocs(lastJobsQ)
      ]);
      
      let currentRevenue = 0;
      let lastRevenue = 0;
      
      currentSnap.forEach(doc => {
        const job = doc.data();
        if (job.cost) currentRevenue += parseFloat(job.cost);
      });
      
      lastSnap.forEach(doc => {
        const job = doc.data();
        if (job.cost) lastRevenue += parseFloat(job.cost);
      });
      
      // Calculate growth percentage
      let growthPercentage = 0;
      if (lastRevenue > 0) {
        growthPercentage = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
      } else if (currentRevenue > 0) {
        growthPercentage = 100; // If last month was 0, it's 100% growth
      }
      
      const growthStr = growthPercentage >= 0 
        ? `+${growthPercentage.toFixed(1)}%` 
        : `${growthPercentage.toFixed(1)}%`;
      
      // Get most requested part/service
      const partsQ = query(
        collection(db, "parts"),
        where("serviceCenterId", "==", serviceCenterId),
        orderBy("requestCount", "desc"),
        limit(1)
      );
      
      const partsSnap = await getDocs(partsQ);
      let mostRequestedPart = "N/A";
      
      if (!partsSnap.empty) {
        mostRequestedPart = partsSnap.docs[0].data().name || "N/A";
      }
      
      // Update stats with growth and most requested part
      setStats(prev => ({
        ...prev,
        monthlyGrowth: growthStr,
        mostRequested: mostRequestedPart
      }));
      
    } catch (err) {
      console.error("Error calculating summary stats:", err);
      // Don't throw here - we can still show other data
    }
  };
  
  const refreshData = () => {
    setIsReloading(true);
    fetchReportData()
      .finally(() => {
        setIsReloading(false);
      });
  };
  
  // Sample data (fallback data if Firebase fails)
  const monthlyRevenue = revenueData.labels?.length ? revenueData : {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 14500, 11000, 15000, 16800, 17200, 18000, 19500, 20000, 21500, 19800, 22000],
        backgroundColor: 'rgba(220, 38, 38, 0.7)', // Red - matches Servio theme
        borderColor: 'rgb(220, 38, 38)',
        borderWidth: 1,
      },
    ],
  };
  
  const serviceTypeData = serviceData.labels?.length ? serviceData : {
    labels: ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Repair', 'A/C Service', 'Battery Service'],
    datasets: [
      {
        label: 'Number of Services',
        data: [350, 240, 280, 170, 210, 190],
        backgroundColor: [
          'rgba(220, 38, 38, 0.8)',   // Red
          'rgba(234, 88, 12, 0.8)',   // Orange
          'rgba(234, 179, 8, 0.8)',   // Yellow
          'rgba(22, 163, 74, 0.8)',   // Green
          'rgba(59, 130, 246, 0.8)',  // Blue
          'rgba(139, 92, 246, 0.8)',  // Purple
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const customerSatisfactionData = ratingData.labels?.length ? ratingData : {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [
      {
        label: 'Ratings Count',
        data: [420, 270, 110, 40, 20],
        backgroundColor: [
          'rgba(22, 163, 74, 0.8)',   // Green for 5 stars
          'rgba(34, 197, 94, 0.8)',   // Light green for 4 stars
          'rgba(234, 179, 8, 0.8)',   // Yellow for 3 stars
          'rgba(234, 88, 12, 0.8)',   // Orange for 2 stars
          'rgba(220, 38, 38, 0.8)',   // Red for 1 star
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const jobCompletionTimeData = completionTimeData.labels?.length ? completionTimeData : {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Average Time (Hours)',
        data: [4.2, 4.0, 3.8, 3.5],
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: custom => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: custom * 0.2 }
    }),
    hover: { scale: 1.01, transition: { duration: 0.3 } }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e5e5'
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        ticks: { color: '#e5e5e5' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: '#e5e5e5' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-1 relative z-10"
      >
        <ServiceCenterSidebar activePath="/report-and-analyse" />

        <motion.main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight flex items-center">
                <DocumentChartBarIcon className="h-8 w-8 mr-3 text-red-500" />
                Reports & Analytics
              </h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">
                Track performance, revenue, and customer satisfaction metrics
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={isReloading || loading}
              className={`flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium 
                ${(isReloading || loading) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'} 
                transition-all duration-300 no-underline font-[Open Sans]`}
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${(isReloading || loading) ? 'animate-spin' : ''}`} />
              {isReloading ? 'Refreshing...' : loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </header>

          {/* Error message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-600/80 backdrop-blur-md p-4 mb-6 rounded-lg text-white flex items-center"
            >
              <ExclamationCircleIcon className="h-6 w-6 mr-2" />
              <p>{error}</p>
            </motion.div>
          )}

          {/* Loading state */}
          {loading && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">Loading analytics data...</p>
            </motion.div>
          )}

          {/* Main content - only show when not loading */}
          {!loading && !error && (
            <>
              {/* Time Range Selector */}
              <motion.div variants={itemVariants} className="mb-6 flex justify-start">
                <div className="bg-white/10 backdrop-blur-md rounded-full inline-flex p-1">
                  {['week', 'month', 'quarter', 'year'].map((range) => (
                    <button
                      key={range}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${timeRange === range 
                          ? 'bg-red-600 text-white' 
                          : 'text-gray-300 hover:text-white'}`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Summary Cards */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="mb-8"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
                  >
                    <CurrencyDollarIcon className="h-10 w-10 text-green-500 mb-2" />
                    <p className="text-xl font-bold">{stats.totalRevenue}</p>
                    <p className="font-[Open Sans] text-gray-300 text-sm">Total Revenue</p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
                  >
                    <WrenchScrewdriverIcon className="h-10 w-10 text-red-500 mb-2" />
                    <p className="text-xl font-bold">{stats.totalServices}</p>
                    <p className="font-[Open Sans] text-gray-300 text-sm">Total Services</p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
                  >
                    <UserGroupIcon className="h-10 w-10 text-blue-500 mb-2" />
                    <p className="text-xl font-bold">{stats.avgRating}</p>
                    <p className="font-[Open Sans] text-gray-300 text-sm">Avg. Rating</p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
                  >
                    <ClockIcon className="h-10 w-10 text-yellow-500 mb-2" />
                    <p className="text-xl font-bold">{stats.avgCompletionTime}</p>
                    <p className="font-[Open Sans] text-gray-300 text-sm">Avg. Completion Time</p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
                  >
                    <ChartBarIcon className="h-10 w-10 text-purple-500 mb-2" />
                    <p className="text-xl font-bold">{stats.monthlyGrowth}</p>
                    <p className="font-[Open Sans] text-gray-300 text-sm">Monthly Growth</p>
                  </motion.div>
                  
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-lg flex flex-col items-center justify-center"
                  >
                    <CheckCircleIcon className="h-10 w-10 text-orange-500 mb-2" />
                    <p className="text-xl font-bold">{stats.popularService}</p>
                    <p className="font-[Open Sans] text-gray-300 text-sm">Most Popular Service</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <motion.div variants={sectionVariants} className="mb-6">
                <div className="border-b border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    {['revenue', 'services', 'satisfaction', 'performance'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-1 text-sm font-medium transition-all duration-300 border-b-2
                          ${activeTab === tab 
                            ? 'border-red-500 text-red-500' 
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-400'}`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>

              {/* Chart Sections */}
              {activeTab === 'revenue' && (
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover="hover"
                  className="bg-white/10 backdrop-blur-md p-6 rounded-xl h-96"
                >
                  <h2 className="text-xl font-bold font-[Poppins] mb-6">Revenue Trends</h2>
                  <div className="h-[calc(100%-50px)]">
                    <Bar data={monthlyRevenue} options={chartOptions} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'services' && (
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover="hover"
                  className="bg-white/10 backdrop-blur-md p-6 rounded-xl"
                >
                  <h2 className="text-xl font-bold font-[Poppins] mb-6">Service Distribution</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-72">
                      <Pie data={serviceTypeData} />
                    </div>
                    <div className="h-72">
                      <Bar data={serviceTypeData} options={chartOptions} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'satisfaction' && (
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover="hover"
                  className="bg-white/10 backdrop-blur-md p-6 rounded-xl"
                >
                  <h2 className="text-xl font-bold font-[Poppins] mb-6">Customer Satisfaction</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-72">
                      <Doughnut data={customerSatisfactionData} />
                    </div>
                    <div className="h-72 flex flex-col justify-center items-center">
                      <div className="text-center mb-6">
                        <h3 className="text-gray-300 mb-2">Average Rating</h3>
                        <div className="text-4xl font-bold text-yellow-500">{stats.avgRating}/5.0</div>
                      </div>
                      <div className="w-full grid grid-cols-5 gap-1">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex flex-col items-center">
                            <div className="text-lg font-semibold">{star}★</div>
                            <div className="h-20 w-full bg-gray-700 rounded relative overflow-hidden">                          <div 
                            className={`absolute bottom-0 w-full 
                            ${star === 5 ? 'bg-green-600' : 
                              star === 4 ? 'bg-green-500' : 
                              star === 3 ? 'bg-yellow-500' : 
                              star === 2 ? 'bg-orange-500' : 'bg-red-600'}`}
                            style={{
                              height: customerSatisfactionData.percentages ? 
                                `${customerSatisfactionData.percentages[5-star]}%` : 
                                (star === 5 ? '80%' : 
                                 star === 4 ? '60%' : 
                                 star === 3 ? '30%' : 
                                 star === 2 ? '15%' : '5%')
                            }}
                          ></div>
                            </div>                        <div className="text-xs mt-1">
                          {customerSatisfactionData.percentages ? 
                            `${customerSatisfactionData.percentages[5-star]}%` : 
                            (star === 5 ? '48%' : 
                             star === 4 ? '32%' : 
                             star === 3 ? '13%' : 
                             star === 2 ? '5%' : '2%')
                          }
                        </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'performance' && (
                <motion.div
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover="hover"
                  className="bg-white/10 backdrop-blur-md p-6 rounded-xl h-96"
                >
                  <h2 className="text-xl font-bold font-[Poppins] mb-6">Average Job Completion Time</h2>
                  <div className="h-[calc(100%-50px)]">
                    <Line data={jobCompletionTimeData} options={chartOptions} />
                  </div>
                </motion.div>
              )}
            </>
          )}

        </motion.main>
      </motion.div>

      <Footer />
    </div>
  );
};

export default ReportsAnalytics;
