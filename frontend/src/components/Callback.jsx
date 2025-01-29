import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract the query parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const userId = urlParams.get("user_id");  // Internal user ID
    const googleUserId = urlParams.get("google_user_id");  // Google user ID
    const username = urlParams.get("username");  // Username

    if (accessToken && userId && username) {
      // Store the access token in localStorage
      localStorage.setItem("access_token", accessToken);

      // Store user_id (internal) and google_user_id
      localStorage.setItem("user_id", userId); // Store internal user ID
      if (googleUserId) {
        localStorage.setItem("google_user_id", googleUserId); // Store Google user ID
      }

      // Store the username in localStorage
      localStorage.setItem("username", username);

      // Navigate to the dashboard
      message.success("Login successful! Redirecting to dashboard...");
      navigate("/dashboard");
    } else {
      // Handle missing data or error
      message.error("Failed to fetch user data. Redirecting to login...");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20%" }}>
      <h2>Processing your login...</h2>
      <p>Please wait while we redirect you to your dashboard.</p>
    </div>
  );
};

export default Callback;
