import React, { useState, useEffect, useRef } from "react";
import "./Classroom.css";
import { useParams } from "react-router-dom";
import { classroomAPI } from "../services/api";
import { io } from "socket.io-client";

const Classroom = () => {
  const { classId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [classroomInfo, setClassroomInfo] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:7001";
    socketRef.current = io(SOCKET_URL);

    // Join classroom room
    socketRef.current.emit("join_classroom", classId);

    // Listen for messages
    socketRef.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Fetch classroom info and message history
    const fetchData = async () => {
      try {
        const [infoRes, messagesRes] = await Promise.all([
          classroomAPI.getClassroom(classId),
          classroomAPI.getMessages(classId)
        ]);
        setClassroomInfo(infoRes.data || infoRes);
        // Correctly handle the message array from the response
        const messagesData = Array.isArray(messagesRes.data) ? messagesRes.data : messagesRes.data.messages || [];
        setMessages(messagesData);
      } catch (err) {
        console.error("Fetch Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      socketRef.current.disconnect();
    };
  }, [classId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageData = {
      classroom_id: classId,
      sender_id: user.user_id,
      sender_name: user.username,
      content: input,
      timestamp: new Date().toISOString()
    };

    // Emit via socket
    socketRef.current.emit("send_message", messageData);

    // Persist to DB
    try {
      await classroomAPI.sendMessage(classId, messageData);
    } catch (err) {
      console.error("Failed to save message:", err);
    }

    setInput("");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="loading">Entering classroom...</div>;

  return (
    <div className="classroom-container">
      <div className="classroom-main">
        {/* Classroom Header */}
        <div className="classroom-header">
          <div className="classroom-title">
            <h1>
              {classroomInfo?.emoji || '📚'} {classroomInfo?.name || `Classroom ${classId}`}
            </h1>
            <span className="classroom-code">{classId}</span>
          </div>
          <div className="classroom-stats">
            <div className="stat-item">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span><strong>{classroomInfo?.student_ids?.length || 0}</strong> students</span>
            </div>
            <div className="stat-item">
              <svg viewBox="0 0 24 24">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
              </svg>
              <span><strong>{classroomInfo?.assignments || 0}</strong> assignments</span>
            </div>
          </div>
        </div>

        {/* Teacher Info */}
        <div className="teacher-info-bar">
          <div className="teacher-avatar-large">
            {classroomInfo?.mentor_id?.[0] || 'T'}
          </div>
          <div className="teacher-details">
            <div className="label">Class Mentor</div>
            <div className="name">{classroomInfo?.mentor_id || 'Mentor Name'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="classroom-tabs">
          <div
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </div>
          <div
            className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </div>
          <div
            className={`tab ${activeTab === 'people' ? 'active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            People
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'chat' && (
          <div className="chat-section">
            <div className="chat-header">
              <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <h2>Classroom Chat</h2>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message-wrapper ${msg.sender_id === user.user_id ? 'own' : ''}`}
                  >
                    {msg.sender_id !== user.user_id && (
                      <div className="message-sender">
                        {msg.sender_name || msg.sender_id}
                      </div>
                    )}
                    <div className={`message-bubble ${msg.sender_id === user.user_id ? 'own-message' : ''}`}>
                      <div className="message-content">
                        {msg.content}
                        {msg.type === 'file' && (
                          <div className="file-attachment" style={{ marginTop: '8px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'underline' }}>{msg.file_name}</a>
                          </div>
                        )}
                      </div>
                      <div className="message-time">
                        {formatTime(msg.timestamp || new Date())}
                      </div>
                      {msg.type === 'assignment' && (
// ... (keep existing assignment snippet)
                        <div className="assignment-message">
                          <div className="assignment-header">
                            <svg viewBox="0 0 24 24">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            New Assignment Posted
                          </div>
                          <div className="assignment-title">{msg.assignmentTitle}</div>
                          <div className="assignment-due">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                            </svg>
                            Due: {msg.dueDate}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <label className="file-upload-label" style={{ cursor: 'pointer', padding: '10px' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#8e8e8e">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-1.5z" />
                </svg>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const messageData = {
                      classroom_id: classId,
                      sender_id: user.user_id,
                      sender_name: user.username,
                      content: `Sent a file: ${file.name}`,
                      type: 'file',
                      file_name: file.name,
                      file_url: 'dummy_url_' + file.name,
                      timestamp: new Date().toISOString()
                    };
                    socketRef.current.emit("send_message", messageData);
                    try {
                      await classroomAPI.sendMessage(classId, messageData);
                    } catch (err) {
                      console.error("Failed to save message:", err);
                    }
                  }}
                />
              </label>
              <input
                type="text"
                className="chat-input"
                placeholder="Message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="send-button"
                disabled={!input.trim()}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab === 'assignments' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8e8e8e' }}>
            Assignments coming soon...
          </div>
        )}

        {activeTab === 'people' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8e8e8e' }}>
            People list coming soon...
          </div>
        )}
      </div>
    </div>
  );
};

export default Classroom;