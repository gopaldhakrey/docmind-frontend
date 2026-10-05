import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Camera, Trash2 } from "lucide-react";
import client from "../api/client";

export default function Profile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [photoUrl, setPhotoUrl] = useState(user?.profilePhotoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const initial = (user?.username || "U").slice(0, 1).toUpperCase();

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile photo must be smaller than 5 MB.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await client.post("/profile/photo", formData);

      const newPhotoUrl = response.data.profilePhotoUrl;

      setPhotoUrl(newPhotoUrl);

      const storedUser = localStorage.getItem("docmind_user");

      if (storedUser) {
        const updatedUser = {
          ...JSON.parse(storedUser),
          profilePhotoUrl: newPhotoUrl,
        };

        localStorage.setItem(
          "docmind_user",
          JSON.stringify(updatedUser)
        );
      }

      alert("Profile photo updated successfully.");
    } catch (error) {
      console.error("Profile photo upload failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoUrl) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile photo?"
    );

    if (!confirmed) return;

    try {
      setRemoving(true);

      await client.delete("/profile/photo");

      setPhotoUrl("");

      const storedUser = localStorage.getItem("docmind_user");

      if (storedUser) {
        const updatedUser = {
          ...JSON.parse(storedUser),
          profilePhotoUrl: "",
        };

        localStorage.setItem(
          "docmind_user",
          JSON.stringify(updatedUser)
        );
      }

      alert("Profile photo removed successfully.");
    } catch (error) {
      console.error("Profile photo removal failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to remove profile photo."
      );
    } finally {
      setRemoving(false);
    }
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
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="profile-avatar-image"
              />
            ) : (
              initial
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            style={{ display: "none" }}
          />

          <button
            type="button"
            className="profile-photo-button"
            onClick={handlePhotoClick}
            disabled={uploading || removing}
          >
            <Camera size={15} />

            {uploading
              ? "Uploading..."
              : photoUrl
              ? "Change photo"
              : "Add photo"}
          </button>

          {photoUrl && (
            <button
              type="button"
              className="profile-remove-photo"
              onClick={handleRemovePhoto}
              disabled={uploading || removing}
            >
              <Trash2 size={14} />
              {removing ? "Removing..." : "Remove photo"}
            </button>
          )}
        </div>

        <div>
          <h2>{user?.username || "User"}</h2>
          <p>{user?.email || "No email"}</p>
          <span className="role">
            {user?.role || "USER"}
          </span>
        </div>
      </section>
    </>
  );
}
