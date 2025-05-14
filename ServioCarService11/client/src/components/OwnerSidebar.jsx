// src/components/OwnerSidebar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const OwnerSidebar = ({ activePath }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar toggle
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop sidebar collapse

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (!isSidebarOpen) {
      setIsSidebarCollapsed(false);
    }
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const sidebarItems = [
    { text: "Dashboard", path: "/owner-home", icon: <HomeIcon className="h-6 w-6" /> },
    { text: "Profile", path: "/edit-profile", icon: <UserIcon className="h-6 w-6" /> },
    { text: "Find Technicians", path: "/technicians", icon: <WrenchScrewdriverIcon className="h-6 w-6" /> },
    { text: "Service Centers", path: "/service-centers", icon: <CalendarIcon className="h-6 w-6" /> },
    { text: "Logout", path: "/logout", icon: <ArrowRightOnRectangleIcon className="h-6 w-6" /> },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out"
        onClick={toggleSidebar}
        aria-label="Open sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-gray-800 text-white transform transition-all duration-300 ease-in-out z-20
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0
          ${isSidebarCollapsed ? 'w-16' : 'w-64 md:min-w-[16rem]'}`}
      >
        <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} items-center mb-6 p-2`}>
          <h2
            className={`text-center text-xl font-extrabold font-[Poppins] tracking-tight transition-opacity duration-300 ${
              isSidebarCollapsed ? 'hidden' : 'block flex-1'
            }`}
          >
            Servio Dashboard
          </h2>
          {/* Mobile Close Button */}
          <button
            className="md:hidden text-2xl hover:text-red-500 transition-colors duration-200"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            ×
          </button>
          {/* Desktop Collapse Button */}
          <button
            className="hidden md:flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
            onClick={toggleSidebarCollapse}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
          </button>
        </div>
        <ul className="space-y-3">
          {sidebarItems.map((item) => (
            <li key={item.text} className="relative group">
              <a
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.text === "Logout") {
                    handleLogout();
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`flex items-center gap-2 py-3 px-4 hover:bg-gray-700 hover:text-red-500 transition-all duration-300 font-[Open Sans] text-sm tracking-wide ${
                  isSidebarCollapsed ? 'justify-center' : ''
                } ${activePath === item.path ? 'bg-gray-700 font-bold text-red-500 shadow-inner' : ''}`}
              >
                {item.icon}
                <span
                  className={`transition-opacity duration-300 ${
                    isSidebarCollapsed ? 'hidden' : 'block'
                  }`}
                >
                  {item.text}
                </span>
              </a>
              {isSidebarCollapsed && (
                <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {item.text}
                </span>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default OwnerSidebar;