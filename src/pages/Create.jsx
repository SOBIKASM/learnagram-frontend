import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Create.css";

const Create = () => {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [visibility, setVisibility] = useState("Public");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(URL.createObjectURL(file));
      setMediaFile(file);
    }
  };

  const handleRemoveImage = () => {
    setMedia(null);
    setMediaFile(null);
    // Reset file input
    document.getElementById('file-upload').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setLoading(true);
    try {
      const post_id = `POST_${user.user_id}_${Date.now()}`;

      const response = await fetch('http://localhost:7001/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post_id,
          user_id: user.user_id,
          caption,
          image_url: media || null,
          visibility
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to create post');

      setCaption("");
      setMedia(null);
      setMediaFile(null);
      navigate("/navigation/home");
    } catch (err) {
      console.error(err);
      alert("Error creating post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <h2 className="create-header">Create Post</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <textarea
          className="create-textarea"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          required
        />

        <div className="file-upload-container">
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="create-file-input"
          />
          <label htmlFor="file-upload" className="file-upload-label">
            Choose Image
          </label>
          {mediaFile && <span className="file-name">{mediaFile.name}</span>}
        </div>

        {media && (
          <div className="image-preview">
            <img src={media} alt="Preview" />
            <button 
              type="button" 
              className="remove-image" 
              onClick={handleRemoveImage}
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        )}

        <div className="visibility-select">
          <label>
            <span>🌍 Visibility:</span>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Friends">Friends Only</option>
            </select>
          </label>
        </div>

        <button type="submit" className="create-submit-btn" disabled={loading || !caption.trim()}>
          {loading ? "✨Posting..." : "Share Post✨"}
        </button>
      </form>
    </div>
  );
};

export default Create;