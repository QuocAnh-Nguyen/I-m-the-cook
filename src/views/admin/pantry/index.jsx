import React, { useState, useMemo, useRef } from "react";
import Card from "components/card";
import AddIngredientModal from "./components/AddIngredientModal";
import { initialPantryItems, categories } from "./variables/mockData";
import {
  MdOutlineAdd,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineInventory2,
  MdOutlineWarning,
  MdOutlineShoppingCart,
  MdOutlineAutoAwesome,
  MdClose,
  MdOutlineCloudUpload,
  MdOutlineImage,
} from "react-icons/md";

const isExpiringSoon = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
};

const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};

const categoryColors = {
  Proteins: "bg-blue-50 text-blue-600",
  Vegetables: "bg-green-50 text-green-600",
  Fruits: "bg-orange-50 text-orange-600",
  Dairy: "bg-amber-50 text-amber-600",
  Grains: "bg-yellow-50 text-yellow-700",
  "Oils & Condiments": "bg-teal-50 text-teal-600",
  Spices: "bg-red-50 text-red-600",
  Other: "bg-gray-100 text-gray-600",
};

// Mock AI shopping suggestions based on pantry
const generateShoppingSuggestions = (items) => {
  const pantryNames = items.map((i) => i.name.toLowerCase());
  const allSuggestions = [
    { name: "Greek Yogurt", reason: "Great for breakfast & protein goals", category: "Dairy", priority: "High" },
    { name: "Salmon Fillets", reason: "Omega-3 rich — aligns with your health goals", category: "Proteins", priority: "High" },
    { name: "Quinoa", reason: "Complete protein grain you're running low on", category: "Grains", priority: "Medium" },
    { name: "Avocados", reason: "Healthy fats, popular in your recent recipes", category: "Fruits", priority: "High" },
    { name: "Sweet Potatoes", reason: "Complex carbs for sustained energy", category: "Vegetables", priority: "Medium" },
    { name: "Broccoli", reason: "High fibre vegetable for weekly meal variety", category: "Vegetables", priority: "Medium" },
    { name: "Almond Milk", reason: "Dairy alternative based on dietary preferences", category: "Dairy", priority: "Low" },
    { name: "Blueberries", reason: "Antioxidant-rich snack option", category: "Fruits", priority: "Low" },
    { name: "Chickpeas", reason: "Plant protein to diversify your meals", category: "Proteins", priority: "Medium" },
    { name: "Whole Grain Bread", reason: "Stock up for quick breakfast and snacks", category: "Grains", priority: "High" },
  ];
  return allSuggestions.filter(
    (s) => !pantryNames.some((p) => p.includes(s.name.toLowerCase().split(" ")[0]))
  );
};

let nextId = 13;

// Pantry Image Upload Zone Component
const PantryImageUploadZone = ({ onItemsDetected }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setIsAnalyzing(true);
      // Simulate AI analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        // Mock detected items from receipt/ingredients photo
        onItemsDetected([
          { name: "Orange Juice", category: "Fruits", quantity: 1, unit: "L", expiry: "2026-05-20" },
          { name: "Cheddar Cheese", category: "Dairy", quantity: 200, unit: "g", expiry: "2026-05-25" },
          { name: "Whole Milk", category: "Dairy", quantity: 2, unit: "L", expiry: "2026-05-18" },
        ]);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clearImage = () => {
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${
            isDragOver
              ? "border-brand-500 bg-brand-50"
              : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50 dark:border-white/20 dark:bg-navy-700 dark:hover:border-brand-400"
          }`}
        >
          <MdOutlineCloudUpload className="mb-2 h-8 w-8 text-brand-500" />
          <p className="text-sm font-medium text-navy-700 dark:text-white">
            Snap a photo of your groceries or receipt
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            AI will auto-detect and add items to your pantry
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
          <img src={preview} alt="Grocery scan" className="h-36 w-full object-cover" />
          {isAnalyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <svg className="mb-2 h-8 w-8 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm font-semibold text-white">Analyzing image...</p>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-3">
            <MdOutlineImage className="h-4 w-4 text-white" />
            <span className="truncate text-xs text-white">{fileName}</span>
          </div>
          <button
            onClick={clearImage}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <MdClose className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const PantryManager = () => {
  const [items, setItems] = useState(initialPantryItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShopping, setShowShopping] = useState(false);
  const [detectedItems, setDetectedItems] = useState([]);
  const [showDetectedModal, setShowDetectedModal] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const shoppingSuggestions = useMemo(
    () => generateShoppingSuggestions(items),
    [items]
  );

  const handleAdd = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = (formData) => {
    if (editItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === editItem.id ? { ...i, ...formData } : i))
      );
    } else {
      setItems((prev) => [...prev, { id: nextId++, ...formData }]);
    }
  };

  const handleItemsDetected = (detected) => {
    setDetectedItems(detected);
    setShowDetectedModal(true);
  };

  const handleAddDetectedItems = () => {
    setItems((prev) => [
      ...prev,
      ...detectedItems.map((item) => ({ id: nextId++, ...item })),
    ]);
    setShowDetectedModal(false);
    setDetectedItems([]);
  };

  const expiringCount = items.filter((i) => isExpiringSoon(i.expiry)).length;
  const expiredCount = items.filter((i) => isExpired(i.expiry)).length;

  const priorityColor = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-green-50 text-green-600",
  };

  return (
    <div>
      {/* Summary Widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card extra="!flex-row flex-grow items-center rounded-[20px] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
            <MdOutlineInventory2 className="h-7 w-7 text-brand-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              {items.length}
            </h4>
          </div>
        </Card>

        <Card extra="!flex-row flex-grow items-center rounded-[20px] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-navy-700">
            <MdOutlineWarning className="h-7 w-7 text-amber-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              {expiringCount}
            </h4>
          </div>
        </Card>

        <Card extra="!flex-row flex-grow items-center rounded-[20px] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-navy-700">
            <MdOutlineWarning className="h-7 w-7 text-red-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Expired</p>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              {expiredCount}
            </h4>
          </div>
        </Card>
      </div>

      {/* Scan Groceries + Shopping Suggestions Row */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Scan Groceries Card */}
        <Card extra="p-5">
          <div className="mb-3 flex items-center gap-2">
            <MdOutlineCloudUpload className="h-5 w-5 text-brand-500" />
            <h3 className="text-base font-bold text-navy-700 dark:text-white">
              Scan Groceries
            </h3>
          </div>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Upload a photo of your groceries or receipt to automatically populate your pantry items.
          </p>
          <PantryImageUploadZone onItemsDetected={handleItemsDetected} />
        </Card>

        {/* Smart Shopping Suggestions */}
        <Card extra="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdOutlineAutoAwesome className="h-5 w-5 text-brand-500" />
              <h3 className="text-base font-bold text-navy-700 dark:text-white">
                Next Week's Grocery List
              </h3>
            </div>
            <button
              onClick={() => setShowShopping(!showShopping)}
              className="rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
            >
              {showShopping ? "Hide" : "Generate AI List"}
            </button>
          </div>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            AI-powered suggestions based on your dietary habits, goals, and current pantry inventory.
          </p>
          {showShopping && (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {shoppingSuggestions.slice(0, 8).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-navy-700"
                >
                  <div className="flex items-start gap-2">
                    <MdOutlineShoppingCart className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                    <div>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${priorityColor[item.priority]}`}
                  >
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!showShopping && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-6 dark:bg-navy-700">
              <MdOutlineShoppingCart className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click "Generate AI List" to get personalised suggestions
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Main Table */}
      <div className="mt-5">
        <Card extra="p-5">
          {/* Controls Row */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
              />
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                <MdOutlineAdd className="h-5 w-5" />
                Add Item
              </button>
            </div>
          </div>

          {/* Table or Empty State */}
          {items.length === 0 ? (
            /* Empty Pantry State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
                <MdOutlineInventory2 className="h-10 w-10 text-brand-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-navy-700 dark:text-white">
                Your pantry is empty
              </h3>
              <p className="mb-6 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
                Start adding ingredients to keep track of what you have at home.
              </p>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                <MdOutlineAdd className="h-5 w-5" />
                Add Your First Item
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Name", "Category", "Quantity", "Unit", "Expiry Date", "Status", "Actions"].map(
                      (col) => (
                        <th
                          key={col}
                          className="border-b border-gray-200 py-3 pr-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-white/10"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                      No ingredients found. Try a different search or category.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {["Name", "Category", "Quantity", "Unit", "Expiry Date", "Status", "Actions"].map(
                      (col) => (
                        <th
                          key={col}
                          className="border-b border-gray-200 py-3 pr-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-white/10"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const expired = isExpired(item.expiry);
                    const expiring = !expired && isExpiringSoon(item.expiry);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-navy-700"
                      >
                        <td className="py-3 pr-4 text-sm font-bold text-navy-700 dark:text-white">
                          {item.name}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              categoryColors[item.category] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                          {item.unit}
                        </td>
                        <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                          {item.expiry}
                        </td>
                        <td className="py-3 pr-4">
                          {expired ? (
                            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                              Expired
                            </span>
                          ) : expiring ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                              Expiring Soon
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                              Fresh
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 transition hover:bg-brand-100"
                            >
                              <MdOutlineEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                            >
                              <MdOutlineDelete className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Modal — with focus overlay */}
      <AddIngredientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editItem={editItem}
      />

      {/* Detected Items Modal */}
      {showDetectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                  Items Detected
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI found {detectedItems.length} items from your image
                </p>
              </div>
              <button
                onClick={() => setShowDetectedModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <MdClose className="h-5 w-5 text-gray-600 dark:text-white" />
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-2 mb-4">
                {detectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-navy-700"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} {item.unit} · {item.category}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                      Detected
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetectedModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDetectedItems}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <MdOutlineAdd className="h-4 w-4" />
                  Add All to Pantry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantryManager;
