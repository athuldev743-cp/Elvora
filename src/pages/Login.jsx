import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setErr("Missing REACT_APP_GOOGLE_CLIENT_ID in .env");
      return;
    }

    if (!window.google?.accounts?.id) {
      setErr("Google script not loaded. Add gsi script in public/index.html");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp) => {
        try {
          // ✅ You will move this to backend verification
          // For now: send to backend if endpoint exists, else do a lightweight local decode fallback.

          const API = process.env.REACT_APP_API_URL; // optional
          if (API) {
            // Recommended: backend verifies credential and returns your user object
            const r = await fetch(`${API}/auth/google/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: resp.credential }),
            });

            if (!r.ok) throw new Error("Backend verification failed");
            const userObj = await r.json();

            localStorage.setItem("userData", JSON.stringify(userObj));
            navigate("/", { replace: true });
            return;
          }

          // Fallback (frontend-only): decode basic profile from JWT (NOT secure; temporary)
          const payload = JSON.parse(atob(resp.credential.split(".")[1]));
          const userObj = {
            name: payload.name,
            email: payload.email,
            profile_pic: payload.picture,
            isAdmin: false,
          };

          localStorage.setItem("userData", JSON.stringify(userObj));
          navigate("/", { replace: true });
        } catch (e) {
          console.error(e);
          setErr("Login failed. Check console.");
        }
      },
    });

    // render button
    if (btnRef.current) btnRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: 340 }}>
        <h2 style={{ marginBottom: 12 }}>Login</h2>
        <div ref={btnRef} />
        {err && <p style={{ marginTop: 12, color: "crimson" }}>{err}</p>}
      </div>
    </div>
  );
}