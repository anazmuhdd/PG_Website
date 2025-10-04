// src/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "./assets/backgroundimg.jpg"; // your background image path

export default function Login() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const navigate = useNavigate();

  // Add favicon, apple-touch-icon, and manifest dynamically
  useEffect(() => {
    const linkFavicon = document.createElement("link");
    linkFavicon.rel = "icon";
    linkFavicon.type = "image/png";
    linkFavicon.href = "/logo.png";
    document.head.appendChild(linkFavicon);

    const linkApple = document.createElement("link");
    linkApple.rel = "apple-touch-icon";
    linkApple.href = "/logo.png";
    document.head.appendChild(linkApple);

    const linkManifest = document.createElement("link");
    linkManifest.rel = "manifest";
    linkManifest.href = "/manifest.json";
    document.head.appendChild(linkManifest);

    // Cleanup if component unmounts
    return () => {
      document.head.removeChild(linkFavicon);
      document.head.removeChild(linkApple);
      document.head.removeChild(linkManifest);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const MAX_RETRIES = 3;

    const fetchUsers = async (attempt = 1) => {
      setLoading(true);
      setFetchError("");

      try {
        const res = await fetch("https://pg-app-backend.onrender.com/users");
        if (!res.ok) {
          if (res.status === 500 && attempt < MAX_RETRIES) {
            console.warn(`Server error 500, retrying attempt ${attempt}...`);
            await new Promise(res => setTimeout(res, 1000));
            return fetchUsers(attempt + 1);
          }
          throw new Error(`Fetch failed: ${res.status}`);
        }

        const data = await res.json();
        if (!mounted) return;

        const list = Array.isArray(data?.users) ? data.users : [];
        setUsers(list);
        if (list.length > 0) setSelectedUserId(list[0].id);

      } catch (err) {
        console.error("Failed to load users:", err);
        if (mounted) setFetchError("Unable to load users. Try again later.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert("Please select a user.");
      return;
    }
    const selectedUser = users.find((u) => u.id === selectedUserId);
    const userName = selectedUser?.username || selectedUserId;
    const whatsapp_id = selectedUser?.whatsapp_id;

    // Save to localStorage before navigating
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ userName, whatsapp_id })
    );

    navigate("/dashboard", { state: { userid: selectedUserId, username: userName, whatsapp_id } });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-white/10 backdrop-blur-sm shadow-2xl rounded-3xl p-8 max-w-md w-full border border-white/20">
        
        {/* PG Logo on top */}
        <img
          src="/images/pg-logo.png"
          alt="PG Logo"
          className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg"
        />

        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-4">
          Vanakkam avarukale <span className="text-blue-600">RajaHamsam</span>
        </h2>
        <p className="text-center text-black-700 mb-6 text-sm">
          Ninte peru select aaaki login koduk!!
        </p>

        {loading ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2">
              <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-sm text-gray-600">Loading users…</span>
            </div>
          </div>
        ) : fetchError ? (
          <div className="text-center py-6 text-sm text-red-600">{fetchError}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-2">
                Choose user
              </label>
              <select
                id="userSelect"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 px-4 py-3 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              >
                {users.length === 0 && <option value="">No users available</option>}
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
            >
              Continue
            </button>
          </form>
        )}

        <p className="text-center text-black-500 mt-6 text-sm">
          Oru userine eduk kadayadikale. Kaanunillenkil Page refresh aaaku!!!
        </p>
      </div>
    </div>
  );
}
