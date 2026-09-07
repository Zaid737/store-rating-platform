import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Stores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [ratings, setRatings] = useState({});

  const navigate = useNavigate();

  const fetchStores = async () => {
    try {
      const response = await api.get("/stores", {
        params: {
          search,
        },
      });

      setStores(response.data);

      const initialRatings = {};

      response.data.forEach((store) => {
        initialRatings[store.id] = store.myRating || "";
      });

      setRatings(initialRatings);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load stores");
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search]);

  const handleRating = async (storeId) => {
    const rating = Number(ratings[storeId]);

    if (!rating || rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5");
      return;
    }

    try {
      await api.post(`/stores/${storeId}/rating`, {
        rating,
      });

      alert("Rating submitted successfully");
      fetchStores();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to submit rating");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Stores</h1>

        <div>
          <button onClick={() => navigate("/password")}>
            Update Password
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by store name or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="store-list">
        {stores.length === 0 ? (
          <p>No stores found.</p>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="store-card">
              <h2>{store.name}</h2>

              <p>
                <strong>Address:</strong> {store.address}
              </p>

              <p>
                <strong>Overall Rating:</strong>{" "}
                {store.averageRating}
              </p>

              <p>
                <strong>Your Rating:</strong>{" "}
                {store.myRating || "Not rated"}
              </p>

              <div className="rating-section">
                <select
                  value={ratings[store.id] || ""}
                  onChange={(e) =>
                    setRatings({
                      ...ratings,
                      [store.id]: e.target.value,
                    })
                  }
                >
                  <option value="">Select rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>

                <button onClick={() => handleRating(store.id)}>
                  {store.myRating ? "Modify Rating" : "Submit Rating"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Stores;