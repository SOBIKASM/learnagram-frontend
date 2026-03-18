import React, { useState, useEffect } from "react";
import "./Notification.css";

import { IoNotificationsOutline, IoPersonAddOutline, IoBookOutline, IoChatbubbleOutline, IoHeartOutline } from "react-icons/io5";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/classrooms/notifications/${user.user_id}`);
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user.user_id]);

  const getIcon = (type) => {
    switch (type) {
      case 'follow': return <IoPersonAddOutline size={22} color="#0095f6" />;
      case 'assignment': return <IoBookOutline size={22} color="#faad14" />;
      case 'message': return <IoChatbubbleOutline size={22} color="#52c41a" />;
      case 'like': return <IoHeartOutline size={22} color="#ff4d4d" />;
      default: return <IoNotificationsOutline size={22} color="#8e8e8e" />;
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', padding: '50px', color: '#8e8e8e' }}>Loading notifications...</div>;

  return (
    <div className="notification-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 className="notification-header" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#262626' }}>Notifications</h2>
      <div className="notification-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div style={{ color: '#8e8e8e', textAlign: 'center', marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <IoNotificationsOutline size={48} opacity={0.3} />
            <p>No new notifications yet.</p>
          </div>
        ) : (
          notifications.map((note, index) => (
            <div key={index} className="notification-card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px', 
              padding: '12px 16px', 
              background: '#fff', 
              borderRadius: '12px', 
              border: '1px solid #efefef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div className="notification-icon">
                {getIcon(note.type)}
              </div>
              <div style={{ flex: 1 }}>
                <p className="notification-message" style={{ margin: 0, fontSize: '0.9rem', color: '#262626' }}>
                  {note.content}
                </p>
                <small style={{ color: '#8e8e8e', fontSize: '0.75rem' }}>
                  {new Date(note.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </small>
              </div>
              {!note.read && <div style={{ width: '8px', height: '8px', background: '#0095f6', borderRadius: '50%' }}></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;