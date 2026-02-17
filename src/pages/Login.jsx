// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_EMAILS } from "../config/auth";
import { convertGoogleToJWT } from "../api/adminAPI";

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

    // Ensure script is loaded (no need to edit index.html)
    const ensureScript = () =>
      new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) return resolve(true);

        if (document.getElementById("gsi-script")) {
          // wait a bit for existing script to load
          const t = setInterval(() => {
            if (window.google?.accounts?.id) {
              clearInterval(t);
              resolve(true);
            }
          }, 50);
          setTimeout(() => {
            clearInterval(t);
            if (!window.google?.accounts?.id) reject(new Error("Google script not loaded"));
          }, 4000);
          return;
        }

        const script = document.createElement("script");
        script.id = "gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error("Failed to load Google script"));
        document.body.appendChild(script);
      });

    const init = async () => {
      try {
        await ensureScript();

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp) => {
            try {
              // decode basic profile (same as your working Home logic)
              const payload = JSON.parse(atob(resp.credential.split(".")[1]));
              const userEmail = payload.email;

              const isAdmin = ADMIN_EMAILS.includes(userEmail);
              const role = isAdmin ? "admin" : "user";

              const userData = {
                name: payload.name,
                email: userEmail,
                profile_pic: payload.picture,
                role,
                isAdmin,
              };

              // store same keys as your working code
              localStorage.setItem("userToken", resp.credential);
              localStorage.setItem("userData", JSON.stringify(userData));

              // optional: convert google credential to backend JWT (admin token)
              try {
                const jwtResponse = await convertGoogleToJWT(resp.credential);
                if (jwtResponse?.access_token) {
                  localStorage.setItem("adminToken", jwtResponse.access_token);
                }
              } catch (jwtError) {
                console.error("JWT conversion failed:", jwtError);
              }

              navigate("/", { replace: true });
            } catch (e) {
              console.error(e);
              setErr("Login failed. Check console.");
            }
          },
        });

        if (btnRef.current) btnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
        });

        // optional one-tap prompt
        window.google.accounts.id.prompt();
      } catch (e) {
        console.error(e);
        setErr("Google script not loaded.");
      }
    };

    init();
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