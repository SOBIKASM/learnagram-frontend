import React, { useState, useEffect } from 'react';
import './Profile.css';
import { IoGridOutline, IoBookmarkOutline, IoPersonCircleOutline } from "react-icons/io5";
import axios from 'axios';

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  const [userData, setUserData] = useState(storedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${storedUser.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setUserData(response.data.user);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (storedUser.user_id) fetchProfile();
    else setLoading(false);
  }, []);

  if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading profile...</div>;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="avatar-section">
          {userData.profile_pic ? (
            <img
              src={userData.profile_pic}
              alt="profile"
              className="profile-photo"
            />
          ) : (
            <div className="profile-photo placeholder" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#efefef', fontSize: '4rem', color: '#8e8e8e', fontWeight: 'bold'
            }}>
              {userData.username ? userData.username[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>

        <section className="info-section">
          <div className="user-settings">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h2 className="username" style={{ fontWeight: '600', margin: 0 }}>{userData.name || userData.username}</h2>
              <span style={{ fontSize: '0.9rem', color: '#8e8e8e' }}>@{userData.user_id}</span>
            </div>
            <button className="edit-btn">Edit Profile</button>
            <button className="archive-btn">View Archive</button>
          </div>

          <div className="stats">
            <span><strong>{userData.posts?.length || 0}</strong> posts</span>
            <span><strong>{userData.followers?.length || 0}</strong> followers</span>
            <span><strong>{userData.following?.length || 0}</strong> following</span>
          </div>

          <div className="bio">
            {userData.department && (
              <span style={{ display: 'block', fontSize: '0.9rem', opacity: 0.8 }}>
                {userData.department} {userData.year ? `• Year ${userData.year}` : ''}
              </span>
            )}
            <pre className="bio-text">{userData.bio || "No bio yet."}</pre>
          </div>
        </section>
      </header>

      <div className="profile-tabs">
        <div className="tab active"><IoGridOutline /> POSTS</div>
        <div className="tab"><IoBookmarkOutline /> SAVED</div>
        <div className="tab"><IoPersonCircleOutline /> TAGGED</div>
      </div>

      <div className="post-grid">
        {userData.posts?.length > 0 ? (
          userData.posts.map((post, i) => (
            <div key={i} className="grid-item" style={{ 
              backgroundImage: post.image_url ? `url(${post.image_url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: post.image_url ? '#efefef' : 'black',
              color: post.image_url ? 'inherit' : ['#00ff00', '#ffff00', '#ff4d4d', '#cc00ff', '#00ccff'][(post.caption?.length || 0) % 5]
            }}>
              {!post.image_url && <div style={{ padding: '20px', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', wordBreak: 'break-word' }}>{post.caption?.length > 50 ? post.caption.substring(0, 50) + '...' : post.caption}</div>}
              <div className="overlay">
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ❤️ {post.likes?.length || 0} 💬 {post.comments?.length || 0}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#8e8e8e' }}>
            No posts yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;