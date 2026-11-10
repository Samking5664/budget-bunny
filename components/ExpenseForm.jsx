import React, { useState } from "react";

export default function ExpenseForm({ onAddExpense }) {
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [smsText, setSmsText] = useState("");
  const [smsParsedMsg, setSmsParsedMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!merchantName || !amount) return;

    onAddExpense({
      merchant_name: merchantName,
      amount: parseFloat(amount),
      category,
      transaction_date: transactionDate,
    });

    // Reset form fields
    setMerchantName("");
    setAmount("");
    setCategory("Food");
    setTransactionDate(new Date().toISOString().split("T")[0]);
  };

  // Smart UPI SMS Parser function using regex
  const handleParseSms = () => {
    if (!smsText) return;

    // 1. Extract Amount (Looks for Rs, INR, ₹ followed by numbers)
    const amountMatch = smsText.match(
      /(?:rs|inr|₹)\.?\s*([0-9]+(?:\.[0-9]+)?)/i
    );

    // 2. Extract Merchant (Looks for 'to [Merchant]' or 'at [Merchant]')
    const merchantMatch = smsText.match(
      /(?:to|at|paid to|sent to)\s+([A-Za-z0-9\s]+?)(?:\s+via|\s+ref|\s+on|\.|$)/i
    );

    let foundAmount = amountMatch ? amountMatch[1] : "";
    let foundMerchant = merchantMatch ? merchantMatch[1].trim() : "";

    if (foundAmount || foundMerchant) {
      if (foundAmount) setAmount(foundAmount);
      if (foundMerchant) setMerchantName(foundMerchant);
      setSmsParsedMsg("Successfully extracted details from SMS! ✨");
      setSmsText("");
    } else {
      setSmsParsedMsg(
        "Could not detect amount or merchant. Try a clearer format."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* UPI SMS Quick-Parser Box */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          ⚡ Quick UPI SMS Parser
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Paste a bank or UPI transaction SMS below to autofill the form:
        </p>
        <textarea
          rows="2"
          placeholder="e.g. Paid ₹450 to Coffee Shop via UPI Ref 123456"
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none mb-2"
        />
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleParseSms}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Parse SMS
          </button>
          {smsParsedMsg && (
            <p
              className={`text-xs font-medium ${
                smsParsedMsg.includes("Could")
                  ? "text-red-500"
                  : "text-emerald-600"
              }`}
            >
              {smsParsedMsg}
            </p>
          )}
        </div>
      </div>

      {/* Manual Expense Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Add Expense</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Starbucks, Amazon"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="Food">Food 🍔</option>
              <option value="Groceries">Groceries 🛒</option>
              <option value="Transport">Transport 🚗</option>
              <option value="Shopping">Shopping 🛍️</option>
              <option value="Bills">Bills 💡</option>
              <option value="Entertainment">Entertainment 🎬</option>
              <option value="Other">Other 📦</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm"
          >
            Add Expense 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
