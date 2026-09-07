import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Password() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const updatePassword = async (e) => {
    e.preventDefault();

    try {
      await api.patch("/auth/password", {
        currentPassword,
        newPassword,
      });

      alert("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={updatePassword}>
        <h1>Update Password</h1>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Update Password</button>

        <button
          type="button"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </form>
    </div>
  );
}

export default Password;