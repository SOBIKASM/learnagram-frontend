import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { io } from "socket.io-client";
import axios from "axios";

function DirectChat() {
  const { other_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  // Create a consistent room key (alphabetical so both users get same room)
  const roomKey = [user.user_id, other_id].sort().join('_');

  useEffect(() => {
    // Connect socket
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:7001";
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_dm", roomKey);

    socketRef.current.on("receive_dm", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Fetch history + other user info
    const init = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001/api';
        const [historyRes, userRes] = await Promise.all([
          axios.get(`${API_URL}/dm/${user.user_id}/${other_id}`,
            { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/users/${other_id}`,
            { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setMessages(historyRes.data.messages || []);
        setOtherUser(userRes.data.user);
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => socketRef.current.disconnect();
  }, [other_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (type = 'text', fileData = null) => {
    if (type === 'text' && !input.trim()) return;

    const messageData = {
      sender_id: user.user_id,
      receiver_id: other_id,
      content: fileData ? `Sent a file: ${fileData.name}` : input,
      type,
      file_url: fileData?.url,
      file_name: fileData?.name,
      file_type: fileData?.type
    };

    // Emit via socket for real-time
    socketRef.current.emit("send_dm", { ...messageData, roomKey });

    // Save to DB
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001/api';
      await axios.post(`${API_URL}/dm/send`, messageData,
        { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Failed to save message:', err);
    }

    if (type === 'text') setInput("");
  };

  if (loading) return <div style={{ color: '#8e8e8e', padding: '2rem', textAlign: 'center' }}>Loading chat...</div>;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '85vh',
      maxHeight: '85vh',
      background: '#f0f2f5', // Improved background for visibility
      color: '#262626',
      margin: '0 auto',
      maxWidth: '600px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #dbdbdb'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid #dbdbdb'
      }}>
        <Link to="/navigation/messages" style={{ color: '#262626', display: 'flex' }}>
          <IoChevronBack size={24} />
        </Link>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: '#efefef',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#262626',
          fontWeight: 'bold', fontSize: '1.2rem',
          border: '1px solid #dbdbdb'
        }}>
          {otherUser?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#262626', fontWeight: '600', fontSize: '1rem' }}>{otherUser?.username || other_id}</div>
          <div style={{ color: '#8e8e8e', fontSize: '0.75rem' }}>Active now</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.sender_id === user.user_id ? 'flex-end' : 'flex-start',
            marginBottom: '4px'
          }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '20px',
              maxWidth: '75%',
              background: msg.sender_id === user.user_id ? '#0095f6' : '#fff',
              color: msg.sender_id === user.user_id ? '#fff' : '#262626',
              fontSize: '14px',
              lineHeight: '1.4',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              borderBottomRightRadius: msg.sender_id === user.user_id ? '4px' : '20px',
              borderBottomLeftRadius: msg.sender_id === user.user_id ? '20px' : '4px'
            }}>
              {msg.type === 'file' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span role="img" aria-label="file">📎</span>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {msg.file_name}
                  </a>
                </div>
              ) : msg.content}
              <div style={{
                fontSize: '9px',
                opacity: 0.6,
                marginTop: '4px',
                textAlign: msg.sender_id === user.user_id ? 'right' : 'left',
                fontWeight: '400'
              }}>
                {new Date(msg.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        background: '#fff',
        borderTop: '1px solid #dbdbdb',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.4rem' }}>📎</span>
          <input 
            type="file" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) sendMessage('file', { name: file.name, url: 'dummy_url_' + file.name, type: file.type });
            }}
          />
        </label>
        <input
          type="text"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{
            flex: 1,
            padding: '12px 18px',
            background: '#fafafa',
            border: '1px solid #dbdbdb',
            borderRadius: '24px',
            color: '#262626',
            outline: 'none',
            fontSize: '14px'
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          style={{
            background: 'none',
            border: 'none',
            color: input.trim() ? '#0095f6' : '#b2dffc',
            cursor: input.trim() ? 'pointer' : 'default',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default DirectChat;