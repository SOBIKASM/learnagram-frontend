import React, { useState, useEffect } from "react";
import "./Message.css";
import { IoCreateOutline, IoChevronBack, IoClose, IoSearch } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Message() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followerSearch, setFollowerSearch] = useState("");
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dm/conversations/${user.user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const openNewModal = async () => {
    setShowNewModal(true);
    setLoadingFollowers(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${user.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fullUser = res.data.user;

      // Only mutual followers (you follow them AND they follow you)
      const mutuals = fullUser.followers?.filter(f => fullUser.following?.includes(f)) || [];

      const profiles = await Promise.all(
        mutuals.map(uid =>
          axios.get(`${import.meta.env.VITE_API_URL}/users/${uid}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(r => r.data.user).catch(() => ({ user_id: uid, username: uid }))
        )
      );
      setFollowers(profiles);
    } catch (err) {
      console.error('Failed to fetch followers:', err);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const startChat = (other_user_id) => {
    setShowNewModal(false);
    navigate(`/navigation/dm/${other_user_id}`);
  };

  const filtered = conversations.filter((c) =>
    c.username?.toLowerCase().includes(search.toLowerCase()) ||
    c.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFollowers = followers.filter(f =>
    f.username?.toLowerCase().includes(followerSearch.toLowerCase()) ||
    f.user_id?.toLowerCase().includes(followerSearch.toLowerCase())
  );

  return (
    <div className="message-container">
      {/* HEADER */}
      <div className="message-header">
        <div className="header-left">
          <IoChevronBack className="back-icon" />
          <h2 className="username">{user.user_id}</h2>
        </div>
        <IoCreateOutline
          className="create-msg-icon"
          onClick={openNewModal}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* SEARCH BAR */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CHAT LIST */}
      <div className="chat-list">
        <div className="list-header">
          <h3>Direct Messages</h3>
        </div>

        {loading ? (
          <div style={{ color: '#aaa', padding: '20px' }}>Loading messages...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>
            No conversations yet.<br />
            <span
              onClick={openNewModal}
              style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Start a new message
            </span>
          </div>
        ) : (
          filtered.map((conv) => (
            <Link
              key={conv.user_id}
              to={`/navigation/dm/${conv.user_id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="chat-item">
                <div className="avatar-wrapper">
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: '#444', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontSize: '1.2rem'
                  }}>
                    {conv.username?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="chat-info">
                  <span className="chat-name">{conv.username}</span>
                  <div className="chat-meta">
                    <span className="last-msg">{conv.last_message || 'No messages yet'}</span>
                    {conv.last_time && (
                      <>
                        <span className="dot">•</span>
                        <span className="time">{new Date(conv.last_time).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* NEW MESSAGE MODAL */}
      {showNewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a1a', borderRadius: '12px', width: '90%',
            maxWidth: '400px', maxHeight: '70vh', display: 'flex',
            flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', borderBottom: '1px solid #333'
            }}>
              <IoClose
                size={24} style={{ cursor: 'pointer', color: '#fff' }}
                onClick={() => setShowNewModal(false)}
              />
              <h3 style={{ color: '#fff', margin: 0 }}>New Message</h3>
              <div style={{ width: 24 }} />
            </div>

            {/* Search inside modal */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #333' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#333', borderRadius: '8px', padding: '8px 12px'
              }}>
                <IoSearch color="#aaa" />
                <input
                  type="text"
                  placeholder="Search followers..."
                  value={followerSearch}
                  onChange={(e) => setFollowerSearch(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', flex: 1, fontSize: '0.9rem'
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Followers List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loadingFollowers ? (
                <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>
                  Loading followers...
                </div>
              ) : filteredFollowers.length === 0 ? (
                <div style={{ color: '#aaa', padding: '20px', textAlign: 'center' }}>
                  No mutual followers found.
                </div>
              ) : (
                filteredFollowers.map((f) => (
                  <div
                    key={f.user_id}
                    onClick={() => startChat(f.user_id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', cursor: 'pointer',
                      borderBottom: '1px solid #222',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: '#444', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: '#fff', fontSize: '1.1rem',
                      flexShrink: 0
                    }}>
                      {f.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '500' }}>{f.username}</div>
                      <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{f.name || f.user_id}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Message;