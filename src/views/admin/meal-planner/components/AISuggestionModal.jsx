/**
 * AISuggestionModal — Preview AI-generated meal plan suggestions before applying.
 * Shows suggested meals for empty slots, allows user to accept/reject per day.
 */
import React, { useState, useEffect } from "react";
import {
  MdClose,
  MdOutlineAutoAwesome,
  MdOutlineCheck,
  MdOutlineLocalFireDepartment,
} from "react-icons/md";
import { suggestMealPlan } from "services/aiService";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AISuggestionModal = ({ weeklyPlan, onApply, onClose, pantryItems }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(new Set(DAYS));
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        const res = await suggestMealPlan({
          pantryItems: pantryItems.map((p) => ({
            name: p.name,
            category: p.category,
            quantity: p.quantity,
            unit: p.unit,
            daysUntilExpiry: Math.ceil(
              (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24)
            ),
          })),
          existingPlan: weeklyPlan,
          familySize: 2,
        });
        setSuggestions(res.data?.suggestions || {});
      } catch (err) {
        // Fallback: generate mock Vietnamese suggestions
        const mockSuggestions = {};
        const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        DAYS.forEach((day, idx) => {
          if (idx < todayIdx) return; // Skip past days
          mockSuggestions[day] = {};
          ["Lunch", "Dinner"].forEach((mt) => {
            const key = `${day}-${mt}`;
            if (!weeklyPlan[key]) {
              mockSuggestions[day][mt] = {
                dishes: [
                  { customName: "Steamed Jasmine Rice (Cơm trắng)", calories: 200, protein: 4, carbs: 44, fat: 0 },
                  { customName: mt === "Lunch" ? "Tomato Egg Soup (Canh cà chua trứng)" : "Braised Pork (Thịt kho)", calories: mt === "Lunch" ? 110 : 350, protein: mt === "Lunch" ? 7 : 25, carbs: mt === "Lunch" ? 8 : 10, fat: mt === "Lunch" ? 5 : 22 },
                  { customName: idx % 2 === 0 ? "Stir-fried Morning Glory (Rau muống xào)" : "Fried Tofu with Lemongrass", calories: idx % 2 === 0 ? 80 : 160, protein: idx % 2 === 0 ? 3 : 10, carbs: 6, fat: idx % 2 === 0 ? 5 : 10 },
                ],
              };
            }
          });
          if (!weeklyPlan[`${day}-Breakfast`]) {
            const breakfasts = ["Chicken Pho (Phở gà)", "Sticky Rice (Xôi)", "Banh Mi Sandwich", "Rice Porridge (Cháo)"];
            mockSuggestions[day]["Breakfast"] = {
              dishes: [
                { customName: breakfasts[idx % breakfasts.length], calories: 380, protein: 22, carbs: 48, fat: 10 },
              ],
            };
          }
          // Remove day if no suggestions
          if (Object.keys(mockSuggestions[day]).length === 0) {
            delete mockSuggestions[day];
          }
        });
        setSuggestions(mockSuggestions);
        setError("Could not reach AI service. Showing sample suggestions instead.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [pantryItems, weeklyPlan]);

  const toggleDay = (day) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleApply = () => {
    if (!suggestions) return;
    const filtered = {};
    Object.entries(suggestions).forEach(([day, meals]) => {
      if (selectedDays.has(day)) {
        filtered[day] = meals;
      }
    });
    onApply(filtered);
  };

  const suggestedDays = suggestions ? Object.keys(suggestions) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-white/10 dark:bg-navy-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20">
              <MdOutlineAutoAwesome className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                AI Meal Plan Suggestions
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vietnamese "Mâm cơm" style • Select days to apply
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <MdClose className="h-5 w-5 text-gray-600 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="mb-4 h-12 w-12 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-base font-bold text-navy-700 dark:text-white">
                Generating your Vietnamese meal plan...
              </p>
              <p className="mt-1 text-sm text-gray-500">
                AI is creating balanced multi-dish meals from your pantry 🍲
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  {error}
                </div>
              )}

              {suggestedDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="mb-2 text-3xl">✅</span>
                  <p className="text-base font-bold text-navy-700 dark:text-white">
                    All slots are filled!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Your meal plan is already complete for this week.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestedDays.map((day) => {
                    const meals = suggestions[day];
                    const isSelected = selectedDays.has(day);
                    return (
                      <div
                        key={day}
                        className={`rounded-xl border-2 p-4 transition ${
                          isSelected
                            ? "border-purple-400 bg-purple-50/30 dark:bg-purple-900/10"
                            : "border-gray-200 bg-gray-50 opacity-50 dark:border-white/10 dark:bg-navy-700"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleDay(day)}
                              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
                                isSelected
                                  ? "border-purple-500 bg-purple-500 text-white"
                                  : "border-gray-300 bg-white dark:border-white/20 dark:bg-navy-800"
                              }`}
                            >
                              {isSelected && <MdOutlineCheck className="h-4 w-4" />}
                            </button>
                            <h3 className="text-sm font-bold text-navy-700 dark:text-white">
                              {day}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {Object.entries(meals).map(([mealType, data]) => (
                            <div
                              key={mealType}
                              className="rounded-lg bg-white p-3 dark:bg-navy-800"
                            >
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {mealType}
                              </p>
                              <div className="space-y-1">
                                {(data.dishes || []).map((dish, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5">
                                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-navy-700 dark:text-white truncate">
                                        {dish.customName || dish.name}
                                      </p>
                                      <p className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                        <MdOutlineLocalFireDepartment className="h-2.5 w-2.5" />
                                        {dish.calories} kcal
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isLoading && suggestedDays.length > 0 && (
          <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white px-6 py-4 dark:border-white/10 dark:bg-navy-800">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedDays.size === 0}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition ${
                selectedDays.size === 0
                  ? "cursor-not-allowed bg-purple-300"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              <MdOutlineAutoAwesome className="h-4 w-4" />
              Apply {selectedDays.size} Day{selectedDays.size !== 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestionModal;