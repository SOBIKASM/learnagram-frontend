import React, { useState, useEffect } from "react";
import "./Explore.css";
import axios from "axios";
import { postsAPI } from "../services/api";
import { IoTrashBinOutline, IoEllipsisVertical, IoBookmarkOutline } from "react-icons/io5";

const trendingTags = ["Data Structures", "AI", "Web Dev", "DBMS", "Cyber Security", "Java", "Python"];

function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const colors = ['#00ff00', '#ffff00', '#ff4d4d', '#cc00ff', '#00ccff'];
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:7001/api/posts/explore', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : res.data.posts || [];
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post_id) => {
    try {
      const response = await postsAPI.likePost(post_id, user.user_id);
      if (response.data && response.data.post) {
        setPosts(prev => prev.map(p => p.post_id === post_id ? { ...p, ...response.data.post } : p));
      } else {
        fetchPosts();
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleComment = async (post_id, text) => {
    if (!text.trim()) return;
    try {
      const response = await postsAPI.commentOnPost(post_id, user.user_id, text);
      if (response.data && response.data.post) {
        setPosts(prev => prev.map(p => p.post_id === post_id ? { ...p, ...response.data.post } : p));
      } else {
        fetchPosts();
      }
    } catch (err) {
      console.error('Answer failed:', err);
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

  const filtered = posts.filter(p => {
    const matchesSearch = p.caption?.toLowerCase().includes(search.toLowerCase()) ||
      p.user_id?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag
      ? p.caption?.toLowerCase().includes(activeTag.toLowerCase())
      : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="explore-container">

      {/* Search */}
      <div className="explore-search">
        <input
          type="text"
          placeholder="Search posts, users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Trending Tags */}
      <div className="trending-tags">
        {trendingTags.map((tag, i) => (
          <div
            key={i}
            className={`tag ${activeTag === tag ? 'active' : ''}`}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            style={{ cursor: 'pointer', opacity: activeTag && activeTag !== tag ? 0.5 : 1 }}
          >
            {tag}
          </div>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div style={{ color: '#8e8e8e', padding: '2rem', textAlign: 'center' }}>Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#8e8e8e', padding: '2rem', textAlign: 'center' }}>
          No posts found.
        </div>
      ) : (
        <div className="explore-feed">
          {filtered.map((post) => (
            <div className="post-card" key={post.post_id} style={{ background: '#fff', borderRadius: '8px', border: '1px solid #dbdbdb', overflow: 'hidden', padding: '12px' }}>
              {/* Post Header */}
              <div className="post-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', position: 'relative' }}>
                <img
                  src={post.profile_pic || `https://ui-avatars.com/api/?name=${post.username || post.user_id || 'User'}&background=random`}
                  alt=""
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #dbdbdb' }}
                />
                <div>
                  <div className="post-name" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#262626' }}>{post.username || post.user_id || "User"}</div>
                  <div className="post-username" style={{ fontSize: '0.75rem', color: '#8e8e8e' }}>
                    @{post.user_id} • {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
                <div style={{ position: 'absolute', right: 0 }}>
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

              {/* Content */}
              {post.image_url ? (
                <img src={post.image_url} alt="" className="post-image"
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
                />
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
                  textAlign: 'center',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}>
                  {post.caption}
                </div>
              )}

              {/* Caption */}
              {post.caption && post.image_url && (
                <div className="post-caption" style={{ fontSize: '0.9rem', color: '#262626', marginBottom: '10px' }}>
                  <strong>{post.username || post.user_id || "User"}</strong> {post.caption}
                </div>
              )}

              {/* Footer */}
              <div className="post-footer" style={{ borderTop: '1px solid #efefef', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <button
                    onClick={() => handleLike(post.post_id)}
                    className="like-btn"
                    style={{
                      background: 'none', border: 'none', padding: '0',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>
                      {post.likes?.includes(user.user_id) ? '❤️' : '🤍'}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#262626' }}>
                      {post.likes?.length || 0} Likes
                    </span>
                  </button>
                  <button className="save-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#262626' }}>
                    <IoBookmarkOutline size={24} />
                  </button>
                </div>

                 {/* Answers Display */}
                {post.comments && post.comments.length > 0 && (
                  <div className="comments-display" style={{ marginTop: '8px' }}>
                    {post.comments.map((c, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: '#262626', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>
                          <strong style={{ color: '#262626' }}>{c.username || c.user_id}</strong> {c.text}
                        </span>
                        {(c.user_id === user.user_id || post.user_id === user.user_id || user.user_id?.startsWith('MTR')) && (
                          <button
                            onClick={() => handleDeleteComment(post.post_id, c._id)}
                            style={{ background: 'none', border: 'none', color: '#8e8e8e', cursor: 'pointer', fontSize: '1.1rem', padding: '0 5px' }}
                            title="Delete Answer"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Input */}
                <input
                  type="text"
                  placeholder="Give answer..."
                  style={{
                    width: '100%', marginTop: '10px', padding: '8px 0',
                    background: 'transparent', border: 'none', borderTop: '1px solid #efefef',
                    color: '#262626', fontSize: '0.85rem'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(post.post_id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore;