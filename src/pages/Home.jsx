import React, { useState, useEffect } from "react";
import LearnSnaps from "../components/LearnSnaps";
import { postsAPI } from '../services/api';
import axios from "axios";
import { IoTrashBinOutline, IoEllipsisVertical, IoBookmarkOutline } from "react-icons/io5";
import "./Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [requests, setRequests] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const colors = ['#00ff00', '#ffff00', '#ff4d4d', '#cc00ff', '#00ccff'];
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getHomePosts(user.user_id);
      setPosts(Array.isArray(response.data) ? response.data : response.data?.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/suggestions/${user.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/requests/${user.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
    fetchRequests();
  }, []);

  const handleFollow = async (target_user_id) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/follow`,
        { from_user_id: user.user_id, to_user_id: target_user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowStatus(prev => ({ ...prev, [target_user_id]: res.data.status }));
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleAccept = async (requester_id) => {
    try {
      await axios.post(
        '${import.meta.env.VITE_API_URL}/users/accept',
        { user_id: user.user_id, requester_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(prev => prev.filter(r => r.user_id !== requester_id));
    } catch (err) {
      console.error('Accept failed:', err);
    }
  };

  const handleDecline = async (requester_id) => {
    try {
      await axios.post(
        '${import.meta.env.VITE_API_URL}/api/users/decline',
        { user_id: user.user_id, requester_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(prev => prev.filter(r => r.user_id !== requester_id));
    } catch (err) {
      console.error('Decline failed:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await postsAPI.likePost(postId, user.user_id);
      if (response.data && response.data.post) {
        setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, ...response.data.post } : p));
      } else {
        fetchPosts();
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleComment = async (postId, text) => {
    if (!text) return;
    try {
      const response = await postsAPI.commentOnPost(postId, user.user_id, text);
      if (response.data && response.data.post) {
        setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, ...response.data.post } : p));
      } else {
        fetchPosts();
      }
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this answer?")) return;
    try {
      const response = await postsAPI.deleteComment(postId, commentId, user.user_id);
      if (response.data && response.data.post) {
        setPosts(prev => prev.map(p => p.post_id === postId ? { ...p, ...response.data.post } : p));
      } else {
        fetchPosts();
      }
    } catch (err) {
      console.error('Delete Answer failed:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await postsAPI.deletePost(postId, user.user_id);
      fetchPosts();
    } catch (err) {
      console.error('Delete post failed:', err);
    }
  };

  const getFollowLabel = (target_user_id, isPrivate) => {
    const status = followStatus[target_user_id];
    if (status === 'following') return 'Following';
    if (status === 'requested') return 'Requested';
    return isPrivate ? 'Request' : 'Follow';
  };

  const getFollowButtonClass = (target_user_id) => {
    const status = followStatus[target_user_id];
    if (status === 'following' || status === 'requested') return 'following';
    return 'follow';
  };

  return (
    <div style={{
      display: 'flex',
      gap: isMobile ? '0' : '28px',
      justifyContent: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '10px' : '20px'
    }}>
      {/* LEFT — Main Feed */}
      <div className="home-container" style={{
        flex: 1,
        maxWidth: isMobile ? '100%' : '600px',
        padding: isMobile ? '0' : '0',
        margin: '0 auto'
      }}>
        <LearnSnaps />
        <div className="posts-section">
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">No posts yet. Follow someone to see their posts!</div>
          ) : (
            posts.map((post) => (
              <div className="post-card" key={post.post_id}>
                <div className="post-header">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={post.profile_pic || `https://ui-avatars.com/api/?name=${post.username || post.user_id || 'User'}&background=random`}
                        alt=""
                        className="profile-pic"
                      />
                      <div>
                        <div className="post-name">{post.username || post.user_id || "User"}</div>
                        <div className="post-username">@{post.user_id}</div>
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === post.post_id ? null : post.post_id)}
                        className="more-options-btn"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8e8e' }}
                      >
                        <IoEllipsisVertical size={20} />
                      </button>
                      {activeDropdown === post.post_id && (
                        <div className="dropdown-menu" style={{
                          position: 'absolute', right: 0, top: '24px', background: 'white',
                          border: '1px solid #dbdbdb', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          zIndex: 10, minWidth: '100px'
                        }}>
                          {(user.user_id === post.user_id || user.user_id?.startsWith('MTR')) && (
                            <button
                              onClick={() => { handleDeletePost(post.post_id); setActiveDropdown(null); }}
                              style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', textAlign: 'left' }}
                            >
                              Delete
                            </button>
                          )}
                          <button
                            onClick={() => setActiveDropdown(null)}
                            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#262626', cursor: 'pointer', textAlign: 'left' }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {post.image_url ? (
                  <img src={post.image_url} alt="" className="post-image" />
                ) : (
                  <div className="text-post" style={{
                    backgroundColor: 'black',
                    color: colors[(post.caption?.length || 0) % colors.length],
                    padding: '40px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '200px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    {post.caption}
                  </div>
                )}

                {post.image_url && (
                  <div className="post-caption">
                    <strong>{post.username || "User"}</strong> {post.caption}
                  </div>
                )}

                <div className="post-footer">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <button onClick={() => handleLike(post.post_id)} className="like-btn">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill={post.likes?.includes(user.user_id) ? "#ed4956" : "none"} stroke={post.likes?.includes(user.user_id) ? "#ed4956" : "currentColor"}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {post.likes?.length || 0} likes
                    </button>
                    <button className="save-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#262626' }}>
                      <IoBookmarkOutline size={24} />
                    </button>
                  </div>

                   <div className="comments-display">
                    {post.comments?.map((c, i) => (
                      <div key={i} className="comment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                          <strong>{c.username || c.user_id}</strong> {c.text}
                        </div>
                        {(c.user_id === user.user_id || post.user_id === user.user_id || user.user_id?.startsWith('MTR')) && (
                          <button
                            onClick={() => handleDeleteComment(post.post_id, c._id)}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                            title="Delete Answer"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="comment-input-area">
                    <input
                      type="text"
                      placeholder="Give answer..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post.post_id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT — Suggestions Panel - Hidden on mobile */}
      {!isMobile && (
        <div className="suggestions-panel">
          {/* Current User */}
          <div className="current-user">
            <div className="current-user-avatar">
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="current-user-info">
              <div className="username">{user.username}</div>
              <div className="user-id">{user.user_id}</div>
            </div>
          </div>

          {/* Follow Requests */}
          {requests.length > 0 && (
            <div className="follow-requests">
              <div className="section-header">Follow Requests</div>
              {requests.map((req) => (
                <div key={req.user_id} className="request-item">
                  <div className="request-user">
                    <div className="request-avatar">
                      {req.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="request-info">
                      <div className="name">{req.username}</div>
                      <div className="handle">{req.user_id}</div>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button onClick={() => handleAccept(req.user_id)} className="accept-btn">
                      Accept
                    </button>
                    <button onClick={() => handleDecline(req.user_id)} className="decline-btn">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div className="suggestions-list">
            <div className="section-header">Suggested For You</div>
            {suggestions.length === 0 ? (
              <div className="no-suggestions">No suggestions available.</div>
            ) : (
              suggestions.map((s) => (
                <div key={s.user_id} className="suggestion-item">
                  <div className="suggestion-user">
                    <div className="suggestion-avatar">
                      {s.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="suggestion-info">
                      <div className="name">
                        {s.username}
                        {s.isPrivate && <span className="private-badge">🔒</span>}
                      </div>
                      <div className="handle">{s.name || s.user_id}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(s.user_id)}
                    disabled={!!followStatus[s.user_id]}
                    className={`follow-btn ${getFollowButtonClass(s.user_id)}`}
                  >
                    {getFollowLabel(s.user_id, s.isPrivate)}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;