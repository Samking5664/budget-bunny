import React, { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function Dashboard({ expenses, onDeleteExpense }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All"); // "All" or YYYY-MM
  const [monthlyBudget, setMonthlyBudget] = useState(10000);

  // Extract unique categories
  const categories = ["All", ...new Set(expenses.map((e) => e.category))];

  // Extract unique months (YYYY-MM) from transaction dates for the filter dropdown
  const availableMonths = [
    "All",
    ...new Set(
      expenses
        .map((e) => (e.transaction_date ? e.transaction_date.slice(0, 7) : ""))
        .filter(Boolean)
    ),
  ]
    .sort()
    .reverse();

  // Filter expenses based on month, search term, and category
  const filteredExpenses = expenses.filter((expense) => {
    const expenseMonth = expense.transaction_date
      ? expense.transaction_date.slice(0, 7)
      : "";
    const matchesMonth =
      selectedMonth === "All" || expenseMonth === selectedMonth;
    const matchesSearch = expense.merchant_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || expense.category === selectedCategory;
    return matchesMonth && matchesSearch && matchesCategory;
  });

  // Calculate total spending for filtered items
  const totalSpent = filteredExpenses.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0
  );

  // Calculate overall spending for the selected month (or total if "All" is chosen) for budget progress
  const activeMonthSpent = filteredExpenses.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0
  );
  const budgetPercentage =
    monthlyBudget > 0
      ? Math.min((activeMonthSpent / monthlyBudget) * 100, 100)
      : 0;

  const getProgressColor = () => {
    if (budgetPercentage >= 90) return "bg-red-500";
    if (budgetPercentage >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Group filtered expenses by category for the Doughnut chart
  const categoryTotals = filteredExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount || 0);
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#f87171",
          "#fb923c",
          "#facc15",
          "#4ade80",
          "#60a5fa",
          "#c084fc",
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Summary & Budget Tracker Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {selectedMonth === "All"
                ? "Total Spending"
                : `Spending for ${selectedMonth}`}
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              ₹{totalSpent.toFixed(2)}
            </h2>
          </div>

          {/* Budget Configurator & Month Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Month:
              </span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 font-semibold text-slate-900"
              >
                {availableMonths.map((m, idx) => (
                  <option key={idx} value={m}>
                    {m === "All" ? "All Time" : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Budget:
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-700">₹</span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 font-bold text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">
              Spent: ₹{activeMonthSpent.toFixed(2)} / ₹{monthlyBudget}
            </span>
            <span
              className={`${
                budgetPercentage >= 90 ? "text-red-500" : "text-slate-500"
              }`}
            >
              {budgetPercentage.toFixed(0)}% used
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${budgetPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {filteredExpenses.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-center">
          <div className="w-64 h-64">
            <Doughnut data={doughnutData} />
          </div>
        </div>
      )}

      {/* Expense List Table with Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Transactions</h3>

          {/* Search & Category Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No matching transactions found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-6 font-semibold">Merchant</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Amount</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {expense.merchant_name}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">{expense.transaction_date}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      ₹{Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
