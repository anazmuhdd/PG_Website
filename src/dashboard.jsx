// src/DashboardPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DashboardPage({ username: propUserName, whatsapp_id: propWhatsappId } = {}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get user info from navigation state or props
  const usernameFromNav = location?.state?.username || propUserName;
  const whatsappIdFromNav = location?.state?.whatsapp_id || propWhatsappId;

  // Also try from localStorage in case of page reload
  const savedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const userName = usernameFromNav || savedUser?.userName;
  const whatsappId = whatsappIdFromNav || savedUser?.whatsapp_id;

  // Redirect to login if not logged in
  useEffect(() => {
    if (!userName || !whatsappId) {
      navigate("/login");
    } else {
      // Save to localStorage so refresh keeps the user logged in
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({ userName, whatsapp_id: whatsappId })
      );
    }
  }, [userName, whatsappId, navigate]);

  const defaultMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [totals, setTotals] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    amount: 0
  });

 const fetchOrders = async (month, attempt = 1) => {
  if (!whatsappId) return;

  const MAX_RETRIES = 3; // Maximum retry attempts
  try {
    setLoading(true);
    setError("");

    const res = await fetch(`https://pg-app-backend-7pq9.onrender.com/orders/${whatsappId}/${month}`);

    if (!res.ok) {
      if (res.status === 500 && attempt < MAX_RETRIES) {
        console.warn(`Server error 500, retrying attempt ${attempt}...`);
        return fetchOrders(month, attempt + 1); // retry
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to fetch orders (status: ${res.status})`);
    }

    const data = await res.json();

    // Sort orders by date descending
    const sortedOrders = (data.orders || []).sort(
      (a, b) => new Date(b.order_date) - new Date(a.order_date)
    );
    setOrders(sortedOrders);

    // Calculate totals only for non-cancelled orders
    const nonCancelledOrders = sortedOrders.filter(o => !o.canceled);
    setTotals({
      breakfast: nonCancelledOrders.filter(o => o.breakfast).length,
      lunch: nonCancelledOrders.filter(o => o.lunch).length,
      dinner: nonCancelledOrders.filter(o => o.dinner).length,
      amount: nonCancelledOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    });

  } catch (err) {
    console.error("Error fetching orders:", err);
    setError(err.message);
    setOrders([]);
    setTotals({ breakfast: 0, lunch: 0, dinner: 0, amount: 0 });
  } finally {
    setLoading(false);
  }
  };


  useEffect(() => {
    if (whatsappId) fetchOrders(selectedMonth);
  }, [selectedMonth, whatsappId]);

  return (
    <main className="min-h-screen bg-white p-4 sm:p-6 relative">
      {/* Full-screen Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Fetching orders…</p>
        </div>
      )}

      {/* Header */}
      <header className="max-w-4xl mx-auto mb-6">
        <div className="rounded-2xl p-5 bg-gradient-to-r from-white to-gray-50 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Welcome, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-600">Orders for the month</p>

          {/* Month picker + Summary Cards */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="month" className="sr-only">Select month</label>
              <input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-44 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                onClick={() => setSelectedMonth(defaultMonth)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                Current month
              </button>
            </div>

            {/* Summary Cards */}
            <div className="flex flex-wrap gap-3 ml-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 min-w-[100px] text-center">
                <p className="text-xs text-gray-500">Breakfasts</p>
                <p className="text-lg font-bold text-blue-600">{totals.breakfast}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 min-w-[100px] text-center">
                <p className="text-xs text-gray-500">Lunches</p>
                <p className="text-lg font-bold text-green-600">{totals.lunch}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 min-w-[100px] text-center">
                <p className="text-xs text-gray-500">Dinners</p>
                <p className="text-lg font-bold text-yellow-600">{totals.dinner}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 min-w-[100px] text-center">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-purple-600">₹{totals.amount}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-4xl mx-auto">
        {error ? (
          <div className="text-center py-12 text-sm text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">No orders found for this month.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((o, idx) => (
              <article
                key={idx}
                className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 flex flex-col justify-between"
              >
                {/* Top row: date + amount + status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{o.order_date}</h3>
                    <p className="text-xs text-gray-500">{o.created_at}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">₹{o.total_amount}</div>
                    <div className={`mt-1 text-xs font-medium ${o.canceled ? "text-red-600" : "text-green-600"}`}>
                      {o.canceled ? "Canceled" : "Active"}
                    </div>
                  </div>
                </div>

                {/* Meals */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Breakfast</span>
                    <span>{o.breakfast ? "✅" : "❌"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Lunch</span>
                    <span>{o.lunch ? "✅" : "❌"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Dinner</span>
                    <span>{o.dinner ? "✅" : "❌"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
