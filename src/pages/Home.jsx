import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_EMAILS } from "../config/auth";
import { adminLogin } from "../api/adminAPI";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    if (parsedUser.role === "admin") navigate("/admin/dashboard");
  }, [navigate]);

  const handleLogin = () => {
    if (!googleReady || !window.google) return alert("Google login loading");
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.prompt();
  };

  const handleGoogleResponse = (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const role = ADMIN_EMAILS.includes(payload.email) ? "admin" : "user";

      const userData = {
        name: payload.name,
        email: payload.email,
        profilePic: payload.picture,
        role,
      };

      localStorage.setItem("authToken", response.credential);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      if (role === "admin") navigate("/admin/dashboard");
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await adminLogin(email, password);
      localStorage.setItem("authToken", res.access_token);
      localStorage.setItem("userData", JSON.stringify({ email, role: "admin" }));
      setUser({ email, role: "admin" });
      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.detail || "Admin login failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">EKABHUMI</div>
        <nav className="nav-links">
          {!user ? (
            <>
              <span className="nav-link" onClick={handleLogin}>Login with Google</span>
              <form onSubmit={handleAdminLogin} style={{ display: "inline" }}>
                <input name="email" placeholder="Admin Email" required />
                <input name="password" type="password" placeholder="Password" required />
                <button type="submit">Admin Login</button>
              </form>
            </>
          ) : (
            <span className="nav-link" onClick={handleLogout}>Logout</span>
          )}
        </nav>
      </header>
      <main>
        <h1>Welcome to EkaBhumi</h1>
        {user?.role === "user" && <p>You can now order products.</p>}
      </main>
    </>
  );
}

export default Home;
