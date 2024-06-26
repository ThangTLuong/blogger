import React, { useEffect, useState } from 'react';
import "./styles/nav.css";

import home from "../resources/home.png";
import upload from "../resources/upload/upload.png";
import avatar from "../resources/default avatar.jpg";
import fetchSessions from "../services/fetch-sessions";
import logout from "../services/logout-service";

export default function Nav() {
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      const { auth, username } = await fetchSessions();

      if (isMounted) {
        setAuth(auth);
        setUsername(username);
      }
    }

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <nav id="navbar">
      <div className="nav-left">
        <div className="home-button-container">
          <a href="/">
            <div className="home-button-overlay">
              <div className="home-button">
                <img className="home-button-icon" src={home} alt="Home" />
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="nav-fill">
        <input
          className="form-control me-2 center-align"
          type="search"
          placeholder="Search"
          aria-label="Search"
        />
        <button
          className="btn btn-outline-success center-align nav-submit"
          type="submit"
        >
          Search
        </button>
      </div>
      <div className="nav-right">
        {auth ? (
          <>
            <div id="upload" className="right-option">
              <div className="nav-upload-container">
                <a href="/upload">
                  <div className="nav-upload-overlay">
                    <img
                      className="nav-upload-icon"
                      src={upload}
                      alt="Upload icon"
                    />
                  </div>
                </a>
              </div>
            </div>
            <div id="profile" className="right-option">
              <div className="nav-profile-container nav-profile-dropdown">
                <div className="nav-profile-overlay">
                  <img
                    className="nav-profile-icon"
                    src={avatar}
                    alt="Profile icon"
                  />
                </div>
                <div className="nav-profile-dropdown-content">
                  <div className="nav-profile-dropdown-item">
                    <a href={`/profile/${username}`}>{username}</a>
                  </div>
                  <div className="nav-profile-dropdown-item">
                    <a href="/settings">Settings</a>
                  </div>
                  <div className="nav-profile-dropdown-item">
                    <a href="/" onClick={logout}>
                      Logout
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div id="register" className="right-option">
              <a href="/registration">Register</a>
            </div>
            <div id="log-in" className="right-option">
              <a href="/login">Log in</a>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};