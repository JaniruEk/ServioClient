import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/solid";
import ServiceCenterSidebar from "../components/ServiceCenterSidebar";
import Footer from "../components/Footer";

const SparePartsInventory = () => {
  const [parts, setParts] = useState([
    { id: 1, name: "Oil Filter", category: "Engine", quantity: 45, price: 15.99, threshold: 10, image: "https://m.media-amazon.com/images/I/71cJ6UWFdTL._AC_UF894,1000_QL80_.jpg" },
    { id: 2, name: "Brake Pad Set", category: "Brakes", quantity: 12, price: 45.50, threshold: 5, image: "https://m.media-amazon.com/images/I/71eTWRPbiGL._AC_UF894,1000_QL80_.jpg" },
    { id: 3, name: "Air Filter", category: "Engine", quantity: 30, price: 12.99, threshold: 8, image: "https://m.media-amazon.com/images/I/81kou0ZS7sL._AC_UF894,1000_QL80_.jpg" },
    { id: 4, name: "Spark Plugs", category: "Ignition", quantity: 8, price: 7.99, threshold: 10, image: "https://m.media-amazon.com/images/I/41drotzZZTL._AC_.jpg" },
  ]);
  
  const [categories, setCategories] = useState(["All Categories", "Engine", "Brakes", "Ignition", "Suspension"]);
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPart, setNewPart] = useState({
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    threshold: 0,
    image: "",
  });
  
  const filteredParts = filterCategory === "All Categories" 
    ? parts 
    : parts.filter(part => part.category === filterCategory);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPart({ ...newPart, [name]: value });
  };

  const handleAddOrUpdatePart = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing part
      setParts(parts.map(part => 
        part.id === newPart.id ? { ...newPart } : part
      ));
      setIsEditing(false);
    } else {
      // Add new part
      setParts([...parts, { ...newPart, id: Date.now() }]);
    }
    
    // Reset form and close modal
    setNewPart({
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      threshold: 0,
      image: "",
    });
    setShowAddModal(false);
  };

  const handleEditPart = (part) => {
    setNewPart({ ...part });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDeletePart = (id) => {
    if (window.confirm("Are you sure you want to delete this part?")) {
      setParts(parts.filter(part => part.id !== id));
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-900 text-white font-sans bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40"></div>
      <div className="flex flex-1 relative z-10">
        <ServiceCenterSidebar activePath="/service-center/spare-parts" />

        <main className="flex-1 max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <header className="bg-white/10 backdrop-blur-md text-white p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
            <div>
              <h1 className="text-3xl font-extrabold font-[Poppins] tracking-tight">Spare Parts Inventory</h1>
              <p className="text-sm mt-1 font-[Open Sans] text-gray-300">Manage your spare parts stock</p>
            </div>
            <Link
              to="/service-center-home"
              className="group flex items-center gap-2 text-red-500 hover:text-red-400 transition-all duration-200 ease-in-out"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-[Open Sans]">Back to Dashboard</span>
            </Link>
          </header>

          {/* Parts Management */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h2 className="text-2xl font-bold text-white font-[Poppins]">Parts Management</h2>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2 rounded-md border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-[Open Sans]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 hover:scale-110 transition-all duration-200 ease-in-out flex items-center gap-1"
                >
                  <PlusIcon className="h-5 w-5" /> Add Part
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-md">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Name</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Category</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Quantity</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Price</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Image</th>
                    <th className="border border-gray-700/50 p-3 text-left font-[Raleway]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part) => (
                    <tr key={part.id} className="hover:bg-gray-700/50">
                      <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{part.name}</td>
                      <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">{part.category}</td>
                      <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">
                        <span className={part.quantity <= part.threshold ? "text-red-500 animate-pulse" : ""}>{part.quantity}</span>
                      </td>
                      <td className="border border-gray-700/50 p-3 font-[Open Sans] text-gray-300">${part.price.toFixed(2)}</td>
                      <td className="border border-gray-700/50 p-3">
                        <img
                          src={part.image}
                          alt={part.name}
                          className="h-12 w-12 object-cover rounded-md"
                          onError={(e) => (e.target.src = "https://via.placeholder.com/50x50?text=Image+Not+Found")}
                        />
                      </td>
                      <td className="border border-gray-700/50 p-3 flex gap-2">
                        <button
                          onClick={() => handleEditPart(part)}
                          className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="text-red-500 hover:text-red-400 hover:scale-125 transition-all duration-200 ease-in-out"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isEditing || showAddModal ? "" : "hidden"}`}>
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md bg-gray-800 text-white">
                <h3 className="text-xl font-semibold mb-4 font-[Raleway] text-white">{isEditing ? "Edit Spare Part" : "Add New Spare Part"}</h3>
                <form onSubmit={handleAddOrUpdatePart} className="space-y-4 font-[Open Sans]">
                  <div>
                    <label className="block mb-1 text-gray-300">Part Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newPart.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Oil Filter"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={newPart.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Engine"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={newPart.quantity}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 50"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={newPart.price}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 15.99"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Threshold</label>
                    <input
                      type="number"
                      name="threshold"
                      value={newPart.threshold}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., 20"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Image URL (optional)</label>
                    <input
                      type="text"
                      name="image"
                      value={newPart.image}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setIsEditing(false);
                        setNewPart({
                          name: "",
                          category: "",
                          quantity: 0,
                          price: 0,
                          threshold: 0,
                          image: "",
                        });
                      }}
                      className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 hover:scale-105 transition-all duration-200 ease-in-out transform"
                    >
                      {isEditing ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SparePartsInventory;