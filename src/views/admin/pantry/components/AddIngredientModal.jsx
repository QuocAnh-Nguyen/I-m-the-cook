import React, { useState, useEffect } from "react";
import { MdClose, MdOutlineSave } from "react-icons/md";
import { categories, units } from "../variables/mockData";

const EMPTY_FORM = {
  name: "",
  category: "Vegetables",
  quantity: "",
  unit: "g",
  expiry: "",
};

const AddIngredientModal = ({ isOpen, onClose, onSave, editItem }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        category: editItem.category,
        quantity: editItem.quantity,
        unit: editItem.unit,
        expiry: editItem.expiry,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
      errs.quantity = "Enter a valid quantity";
    if (!form.expiry) errs.expiry = "Expiry date is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({ ...form, quantity: Number(form.quantity) });
    onClose();
  };

  const field = (label, name, type = "text", placeholder = "") => (
    <div>
      <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
        {label}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-3 py-2 text-sm text-navy-700 outline-none transition dark:bg-navy-700 dark:text-white ${
          errors[name]
            ? "border-red-500 focus:border-red-500"
            : "border-gray-200 focus:border-brand-500 dark:border-white/10"
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/10">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white">
            {editItem ? "Edit Ingredient" : "Add Ingredient"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <MdClose className="h-5 w-5 text-gray-600 dark:text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex flex-col gap-4">
            {field("Ingredient Name", "name", "text", "e.g. Chicken Breast")}

            {/* Category Select */}
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
              >
                {categories
                  .filter((c) => c !== "All")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            {/* Quantity + Unit Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                  placeholder="e.g. 250"
                  className={`w-full rounded-xl border px-3 py-2 text-sm text-navy-700 outline-none transition dark:bg-navy-700 dark:text-white ${
                    errors.quantity
                      ? "border-red-500"
                      : "border-gray-200 focus:border-brand-500 dark:border-white/10"
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-700 dark:text-white">
                  Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {field("Expiry Date", "expiry", "date")}
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              <MdOutlineSave className="h-4 w-4" />
              {editItem ? "Save Changes" : "Add Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientModal;
