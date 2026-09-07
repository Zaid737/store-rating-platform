import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Admin() {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [role, setRole] = useState("");

  const [storeSearch, setStoreSearch] = useState("");

  const [userSortBy, setUserSortBy] = useState("name");
  const [userOrder, setUserOrder] = useState("asc");

  const [storeSortBy, setStoreSortBy] = useState("name");
  const [storeOrder, setStoreOrder] = useState("asc");

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] =
    useState(false);

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingStores, setLoadingStores] =
    useState(true);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [creatingUser, setCreatingUser] =
    useState(false);

  const [creatingStore, setCreatingStore] =
    useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  // =========================
  // DASHBOARD
  // =========================

  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);

      const response = await api.get(
        "/admin/dashboard"
      );

      setDashboard(response.data);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  // =========================
  // USERS
  // =========================

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await api.get("/admin/users", {
        params: {
          search: userSearch,
          role: role || undefined,
          sortBy: userSortBy,
          order: userOrder,
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // =========================
  // STORES
  // =========================

  const fetchStores = async () => {
    try {
      setLoadingStores(true);

      const response = await api.get("/admin/stores", {
        params: {
          search: storeSearch,
          sortBy: storeSortBy,
          order: storeOrder,
        },
      });

      setStores(response.data);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load stores"
      );
    } finally {
      setLoadingStores(false);
    }
  };

  // =========================
  // SORTING
  // =========================

  const toggleSort = (type, field) => {
    if (type === "user") {
      if (userSortBy === field) {
        setUserOrder(
          userOrder === "asc" ? "desc" : "asc"
        );
      } else {
        setUserSortBy(field);
        setUserOrder("asc");
      }
    }

    if (type === "store") {
      if (storeSortBy === field) {
        setStoreOrder(
          storeOrder === "asc" ? "desc" : "asc"
        );
      } else {
        setStoreSortBy(field);
        setStoreOrder("asc");
      }
    }
  };

  const sortArrow = (active, order) => {
    if (!active) return "";

    return order === "asc" ? " ↑" : " ↓";
  };

  // =========================
  // VIEW USER
  // =========================

  const viewUser = async (id) => {
    try {
      setLoadingDetails(true);
      setShowUserDetails(true);
      setSelectedUser(null);

      const response = await api.get(
        `/admin/users/${id}`
      );

      setSelectedUser(response.data);
    } catch (error) {
      console.error(error);

      setShowUserDetails(false);

      alert(
        error.response?.data?.message ||
          "Failed to load user details"
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  // =========================
  // CREATE USER
  // =========================

  const createUser = async (e) => {
    e.preventDefault();

    if (
      userForm.name.length < 20 ||
      userForm.name.length > 60
    ) {
      alert(
        "Name must be between 20 and 60 characters"
      );
      return;
    }

    if (userForm.address.length > 400) {
      alert(
        "Address cannot exceed 400 characters"
      );
      return;
    }

    if (
      userForm.password.length < 8 ||
      userForm.password.length > 16 ||
      !/[A-Z]/.test(userForm.password) ||
      !/[^A-Za-z0-9]/.test(userForm.password)
    ) {
      alert(
        "Password must be 8-16 characters and contain an uppercase letter and special character"
      );
      return;
    }

    try {
      setCreatingUser(true);

      await api.post("/admin/users", userForm);

      alert("User created successfully");

      setUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });

      await fetchUsers();
      await loadDashboard();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create user"
      );
    } finally {
      setCreatingUser(false);
    }
  };

  // =========================
  // CREATE STORE
  // =========================

  const createStore = async (e) => {
    e.preventDefault();

    if (
      storeForm.name.length < 20 ||
      storeForm.name.length > 60
    ) {
      alert(
        "Store name must be between 20 and 60 characters"
      );
      return;
    }

    if (storeForm.address.length > 400) {
      alert(
        "Store address cannot exceed 400 characters"
      );
      return;
    }

    const ownerId = Number(storeForm.ownerId);

    if (!Number.isInteger(ownerId) || ownerId <= 0) {
      alert(
        "Please enter the ID of a STORE_OWNER from the Users table."
      );
      return;
    }

    try {
      setCreatingStore(true);

      await api.post("/admin/stores", {
        ...storeForm,
        ownerId,
      });

      alert("Store created successfully");

      setStoreForm({
        name: "",
        email: "",
        address: "",
        ownerId: "",
      });

      await fetchStores();
      await loadDashboard();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create store"
      );
    } finally {
      setCreatingStore(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  // =========================
  // EFFECTS
  // =========================

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [
    userSearch,
    role,
    userSortBy,
    userOrder,
  ]);

  useEffect(() => {
    fetchStores();
  }, [
    storeSearch,
    storeSortBy,
    storeOrder,
  ]);

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>

        <div>
          <button
            onClick={() => navigate("/password")}
          >
            Update Password
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}

      <div className="stats">

        <div className="stat-card">
          <h3>Total Users</h3>

          <p>
            {loadingDashboard
              ? "..."
              : dashboard.totalUsers}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Stores</h3>

          <p>
            {loadingDashboard
              ? "..."
              : dashboard.totalStores}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Ratings</h3>

          <p>
            {loadingDashboard
              ? "..."
              : dashboard.totalRatings}
          </p>
        </div>

      </div>

      {/* ================= CREATE USER ================= */}

      <section className="admin-section">
        <h2>Add User</h2>

        <form
          onSubmit={createUser}
          className="admin-form"
        >
          <input
            type="text"
            placeholder="Name (20-60 characters)"
            value={userForm.name}
            onChange={(e) =>
              setUserForm({
                ...userForm,
                name: e.target.value,
              })
            }
            minLength={20}
            maxLength={60}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({
                ...userForm,
                email: e.target.value,
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({
                ...userForm,
                password: e.target.value,
              })
            }
            minLength={8}
            maxLength={16}
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={userForm.address}
            onChange={(e) =>
              setUserForm({
                ...userForm,
                address: e.target.value,
              })
            }
            maxLength={400}
            required
          />

          <div className="select-wrapper">
            <select
              value={userForm.role}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  role: e.target.value,
                })
              }
            >
              <option value="USER">
                Normal User
              </option>

              <option value="ADMIN">
                Admin
              </option>

              <option value="STORE_OWNER">
                Store Owner
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={creatingUser}
          >
            {creatingUser
              ? "Creating..."
              : "Create User"}
          </button>
        </form>
      </section>

      {/* ================= CREATE STORE ================= */}

      <section className="admin-section">
        <h2>Add Store</h2>

        <form
          onSubmit={createStore}
          className="admin-form"
        >
          <input
            type="text"
            placeholder="Store Name (20-60 characters)"
            value={storeForm.name}
            onChange={(e) =>
              setStoreForm({
                ...storeForm,
                name: e.target.value,
              })
            }
            minLength={20}
            maxLength={60}
            required
          />

          <input
            type="email"
            placeholder="Store Email"
            value={storeForm.email}
            onChange={(e) =>
              setStoreForm({
                ...storeForm,
                email: e.target.value,
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Store Address"
            value={storeForm.address}
            onChange={(e) =>
              setStoreForm({
                ...storeForm,
                address: e.target.value,
              })
            }
            maxLength={400}
            required
          />

          <div className="owner-id-field">
            <label htmlFor="store-owner-id">
              Store Owner ID
            </label>

            <input
              id="store-owner-id"
              type="number"
              placeholder="Enter ID from Users table"
              value={storeForm.ownerId}
              onChange={(e) =>
                setStoreForm({
                  ...storeForm,
                  ownerId: e.target.value,
                })
              }
              min="1"
              required
            />

            <small>
              Enter the ID of a user whose role is{" "}
              <strong>STORE_OWNER</strong>.
              The ID is shown in the Users table below.
            </small>
          </div>

          <button
            type="submit"
            disabled={creatingStore}
          >
            {creatingStore
              ? "Creating..."
              : "Create Store"}
          </button>
        </form>
      </section>

      {/* ================= USERS ================= */}

      <section className="admin-section">
        <h2>Users</h2>

        <div className="filters">

          <input
            type="text"
            placeholder="Search by name, email or address"
            value={userSearch}
            onChange={(e) =>
              setUserSearch(e.target.value)
            }
          />

          <div className="select-wrapper">
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="">
                All Roles
              </option>

              <option value="USER">
                Normal User
              </option>

              <option value="ADMIN">
                Admin
              </option>

              <option value="STORE_OWNER">
                Store Owner
              </option>
            </select>
          </div>

        </div>

        {loadingUsers ? (
          <p className="loading">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>

                <th>ID</th>

                <th
                  onClick={() =>
                    toggleSort("user", "name")
                  }
                >
                  Name
                  {sortArrow(
                    userSortBy === "name",
                    userOrder
                  )}
                </th>

                <th
                  onClick={() =>
                    toggleSort("user", "email")
                  }
                >
                  Email
                  {sortArrow(
                    userSortBy === "email",
                    userOrder
                  )}
                </th>

                <th
                  onClick={() =>
                    toggleSort("user", "address")
                  }
                >
                  Address
                  {sortArrow(
                    userSortBy === "address",
                    userOrder
                  )}
                </th>

                <th
                  onClick={() =>
                    toggleSort("user", "role")
                  }
                >
                  Role
                  {sortArrow(
                    userSortBy === "role",
                    userOrder
                  )}
                </th>

                <th>Actions</th>

              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>

                  <td>
                    <strong>{user.id}</strong>
                  </td>

                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td>{user.address}</td>

                  <td>{user.role}</td>

                  <td>
                    <button
                      onClick={() =>
                        viewUser(user.id)
                      }
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ================= STORES ================= */}

      <section className="admin-section">
        <h2>Stores</h2>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by name, email or address"
            value={storeSearch}
            onChange={(e) =>
              setStoreSearch(e.target.value)
            }
          />
        </div>

        {loadingStores ? (
          <p className="loading">
            Loading stores...
          </p>
        ) : stores.length === 0 ? (
          <p>No stores found.</p>
        ) : (
          <table>
            <thead>
              <tr>

                <th
                  onClick={() =>
                    toggleSort("store", "name")
                  }
                >
                  Name
                  {sortArrow(
                    storeSortBy === "name",
                    storeOrder
                  )}
                </th>

                <th
                  onClick={() =>
                    toggleSort("store", "email")
                  }
                >
                  Email
                  {sortArrow(
                    storeSortBy === "email",
                    storeOrder
                  )}
                </th>

                <th
                  onClick={() =>
                    toggleSort(
                      "store",
                      "address"
                    )
                  }
                >
                  Address
                  {sortArrow(
                    storeSortBy === "address",
                    storeOrder
                  )}
                </th>

                <th
                  onClick={() =>
                    toggleSort(
                      "store",
                      "rating"
                    )
                  }
                >
                  Rating
                  {sortArrow(
                    storeSortBy === "rating",
                    storeOrder
                  )}
                </th>

              </tr>
            </thead>

            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>

                  <td>{store.name}</td>

                  <td>{store.email}</td>

                  <td>{store.address}</td>

                  <td>
                    {store.rating === 0
                      ? "No ratings"
                      : store.rating}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ================= USER DETAILS MODAL ================= */}

      {showUserDetails && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">
              <h2>User Details</h2>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {loadingDetails ? (
              <p className="loading">
                Loading user details...
              </p>
            ) : selectedUser ? (
              <>
                <div className="user-details">

                  <p>
                    <strong>ID:</strong>{" "}
                    {selectedUser.id}
                  </p>

                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedUser.name}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedUser.email}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {selectedUser.address}
                  </p>

                  <p>
                    <strong>Role:</strong>{" "}
                    {selectedUser.role}
                  </p>

                </div>

                {/* STORE OWNER INFORMATION */}

                {selectedUser.role ===
                  "STORE_OWNER" && (
                  <div className="owner-details">

                    <h3>
                      Store Information
                    </h3>

                    {selectedUser.stores?.length >
                    0 ? (
                      selectedUser.stores.map(
                        (store) => (
                          <div
                            key={store.id}
                            className="store-owner-info"
                          >

                            <p>
                              <strong>
                                Store:
                              </strong>{" "}
                              {store.name}
                            </p>

                            <p>
                              <strong>
                                Email:
                              </strong>{" "}
                              {store.email}
                            </p>

                            <p>
                              <strong>
                                Address:
                              </strong>{" "}
                              {store.address}
                            </p>

                            <p>
                              <strong>
                                Average Rating:
                              </strong>{" "}
                              {store.averageRating ===
                              0
                                ? "No ratings"
                                : store.averageRating}
                            </p>

                            <p>
                              <strong>
                                Total Ratings:
                              </strong>{" "}
                              {store.totalRatings}
                            </p>

                          </div>
                        )
                      )
                    ) : (
                      <p>
                        No stores assigned to
                        this owner.
                      </p>
                    )}

                  </div>
                )}
              </>
            ) : null}

            <button
              className="modal-button"
              onClick={closeModal}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;