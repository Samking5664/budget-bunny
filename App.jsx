import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import ExpenseForm from "./components/ExpenseForm";
import CsvUploader from "./components/CsvUploader";

export default function App() {
  const [session, setSession] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchExpenses(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchExpenses(session.user.id);
      else {
        setExpenses([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchExpenses = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });

    if (error) console.error("Error fetching expenses:", error);
    else setExpenses(data || []);
    setLoading(false);
  };

  const handleAddExpense = async (newExpense) => {
    if (!session) return;
    const { data, error } = await supabase
      .from("expenses")
      .insert([{ ...newExpense, user_id: session.user.id }])
      .select();

    if (error) console.error("Error adding expense:", error);
    else if (data) setExpenses([data[0], ...expenses]);
  };

  const handleBatchAdd = async (newExpenses) => {
    if (!session) return;
    const expensesWithUser = newExpenses.map((e) => ({
      ...e,
      user_id: session.user.id,
    }));

    const { data, error } = await supabase
      .from("expenses")
      .insert(expensesWithUser)
      .select();

    if (error) console.error("Error batch adding expenses:", error);
    else if (data) setExpenses([...data, ...expenses]);
  };

  const handleDeleteExpense = async (id) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) console.error("Error deleting expense:", error);
    else setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Loading Budget Bunny... 🐰
      </div>
    );
  }

  // If user is not logged in, show Auth component
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐰</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Budget Bunny
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms & Uploaders */}
        <div className="lg:col-span-1 space-y-6">
          <ExpenseForm onAddExpense={handleAddExpense} />
          <CsvUploader onBatchAdd={handleBatchAdd} />
        </div>

        {/* Right Column: Dashboard & Charts */}
        <div className="lg:col-span-2">
          <Dashboard
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </main>
    </div>
  );
}
