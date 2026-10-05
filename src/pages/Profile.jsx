import React from "react";
import { useAuth } from "../context/AuthContext";
import { Camera } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const handlePhotoClick = () => {
    alert("Profile photo upload will be available soon.");
  };

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h1>Profile</h1>
          <p>Your authenticated DocMind identity.</p>
        </div>
      </div>

      <section className="panel profile-panel">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            {(user?.username || "U").slice(0, 1).toUpperCase()}
          </div>

          <button
            type="button"
            className="profile-photo-button"
            onClick={handlePhotoClick}
            title="Change photo"
          >
            <Camera size={15} />
            Change photo
          </button>
        </div>

        <div>
          <h2>{user?.username || "User"}</h2>
          <p>{user?.email || "No email"}</p>
          <span className="role">{user?.role || "USER"}</span>
        </div>
      </section>
    </>
  );
}
