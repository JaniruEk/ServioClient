// src/components/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import Footer from '../components/Footer';
import AdminSidebar from '../components/AdminSidebar';
import { db } from '../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';

function ManageUsers({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', category: 'customer' });
  const [editUser, setEditUser] = useState(null);
  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log("Fetching users from Firebase...");
        
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        console.log(`Found ${usersSnapshot.docs.length} users`);
        
        const userData = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("User data:", data);
          return {
            id: doc.id,
            name: data.name || data.fullName || data.displayName || 'Unknown',
            email: data.email || '',
            phone: data.phone || data.contactNumber || '',
            category: data.category || 'customer',
            profileImage: data.profileImage || data.photoURL || '',
            address: data.address || '',
            createdAt: data.createdAt ? 
                      (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 
                      new Date(),
            rawData: data
          };
        });
        
        setUsers(userData);
        
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(`Failed to load users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'All' || user.category === filterRole;
    
    const searchMatch = 
      searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));
    
    return roleMatch && searchMatch;
  });

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate a unique ID
      const newId = doc(collection(db, "users")).id;
      
      // Create user object
      const userObj = { 
        ...newUser,
        createdAt: new Date() 
      };
      
      // Save to Firestore
      await setDoc(doc(db, "users", newId), userObj);
      
      // Update local state
      setUsers([...users, { ...userObj, id: newId }]);
      setNewUser({ name: '', email: '', phone: '', category: 'customer' });
      setShowAddModal(false);
      
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user. Please try again.");
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update in Firestore
      const userRef = doc(db, "users", editUser.id);
      
      // Create update object (exclude id and rawData)
      const { id, rawData, ...updateData } = editUser;
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editUser.id ? editUser : user
      ));
      setEditUser(null);
      setShowEditModal(false);
      
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, "users", id));
        
        // Update local state
        setUsers(users.filter(user => user.id !== id));
        
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user. Please try again.");
      }
    }
  };
  
  const handleEditClick = (user) => {
    setEditUser({ ...user });
    setShowEditModal(true);
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
        <AdminSidebar activePath="/manage-users" />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Manage Users</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Administer user accounts for Servio</p>
            </div>
          </header>          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Customers</h3>
              <p className="text-3xl font-bold text-blue-400">{users.filter(u => u.category === 'customer').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Technicians</h3>
              <p className="text-3xl font-bold text-green-400">{users.filter(u => u.category === 'technician').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Service Centers</h3>
              <p className="text-3xl font-bold text-red-400">{users.filter(u => u.category === 'service-center').length}</p>
            </div>
          </div>

          {/* User Management */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-2xl font-bold text-white font-[Poppins]">User List</h2>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                    <option value="technician">Technician</option>
                    <option value="service-center">Service Center</option>
                  </select>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 pl-8 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <FaFilter className="absolute left-2.5 top-3 text-gray-400" />
                </div>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out flex items-center gap-1"
                >
                  <FaUsers className="h-5 w-5" /> Add User
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-3 text-white/80">Loading users...</p>
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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Name</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Email</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Phone</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Role</th>
                      <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-white/70 border border-gray-700/50">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700/50">
                          <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{user.name}</td>
                          <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{user.email}</td>
                          <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{user.phone}</td>
                          <td className="border border-gray-700/50 p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-[Open Sans] ${
                                user.category === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.category === 'technician' ? 'bg-green-100 text-green-800' :
                                user.category === 'service-center' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.category === 'service-center' ? 'Service Center' : 
                               user.category.charAt(0).toUpperCase() + user.category.slice(1)}
                            </span>
                          </td>
                          <td className="border border-gray-700/50 p-3 flex gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="text-blue-500 hover:text-blue-400 hover:scale-125 transition-all duration-200 ease-in-out"
                              title="Edit"
                            >
                              <FaEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                              title="Delete"
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Add User Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">Add New User</h3>
                <form onSubmit={handleAddUserSubmit} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Phone</label>
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., +1234567890"
                      required
                    />
                  </div>                  <div>
                    <label className="block mb-1 text-gray-300">Role</label>
                    <select
                      value={newUser.category}
                      onChange={(e) => setNewUser({ ...newUser, category: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="technician">Technician</option>
                      <option value="service-center">Service Center</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && editUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">Edit User</h3>
                <form onSubmit={handleEditUserSubmit} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Name</label>
                    <input
                      type="text"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Email</label>
                    <input
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Phone</label>
                    <input
                      type="tel"
                      value={editUser.phone}
                      onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>                  <div>
                    <label className="block mb-1 text-gray-300">Role</label>
                    <select
                      value={editUser.category}
                      onChange={(e) => setEditUser({ ...editUser, category: e.target.value })}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="technician">Technician</option>
                      <option value="service-center">Service Center</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer - Full Width */}
      <Footer />
    </div>
  );
}

export default ManageUsers;