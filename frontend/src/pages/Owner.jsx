import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Owner() {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/owner/dashboard");
      setStores(response.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Store Owner Dashboard</h1>

        <div>
          <button onClick={() => navigate("/password")}>
            Update Password
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {stores.map((store) => (
        <div key={store.id} className="owner-store">
          <h2>{store.name}</h2>

          <div className="stats">
            <div className="stat-card">
              <h3>Average Rating</h3>
              <p>{store.averageRating}</p>
            </div>

            <div className="stat-card">
              <h3>Total Ratings</h3>
              <p>{store.totalRatings}</p>
            </div>
          </div>

          <h2>Users Who Rated Your Store</h2>

          {store.users.length === 0 ? (
            <p>No ratings yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                </tr>
              </thead>

              <tbody>
                {store.users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {stores.length === 0 && (
        <p>No stores found.</p>
      )}
    </div>
  );
}

export default Owner;