import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { classroomAPI } from "../services/classroomAPI";
import { useAuth } from "../context/AuthContext";
import "./ClassroomList.css";

const ClassroomList = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dept = params.get('dept');
    const sem = params.get('sem');
    fetchClassrooms({ department: dept, semester: sem });
  }, [window.location.search]);

  const fetchClassrooms = async (filter = {}) => {
    try {
      setLoading(true);
      const cleanFilter = Object.fromEntries(Object.entries(filter).filter(([_, v]) => v != null));
      const response = await classroomAPI.getClassrooms(cleanFilter);
      setClassrooms(response.data.classrooms || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
      setError("Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px', color: '#8e8e8e' }}>Loading classrooms...</div>;

  // Generate a random gradient for each class banner
  const gradients = [
    "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)"
  ];

  return (
    <div className="classroom-list-container">
      <div className="classroom-header">
        <h2>Your Classrooms</h2>
        {user?.user_id?.startsWith('MTR') && (
          <Link to="/navigation/classroom/create" className="create-btn">
            + Create Classroom
          </Link>
        )}
      </div>

      <div className="class-grid">
        {classrooms.length === 0 ? (
          <div className="no-classrooms" style={{ color: '#aaa', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            No classrooms found.
          </div>
        ) : (
          classrooms.map((cls, index) => {
            const gradient = gradients[index % gradients.length];
            const initial = cls.name ? cls.name.charAt(0).toUpperCase() : "C";
            return (
              <div key={cls.classroom_id} className="class-card-wrapper">
                <Link
                  to={`/navigation/classroom/${cls.classroom_id}`}
                  className="class-card"
                >
                  <div className="class-card-banner" style={{ background: gradient }}></div>
                  <div className="class-card-content">
                    <div className="class-icon-wrapper">
                      <div className="class-icon">{initial}</div>
                    </div>
                    <h3 className="class-title">{cls.name}</h3>
                    <div className="class-meta">
                      <div className="class-meta-item">
                        <span>👨‍🏫</span> <span>{cls.mentor_id}</span>
                      </div>
                      <div className="class-meta-item">
                        <span>👥</span> <span>{cls.student_ids?.length || 0} Students</span>
                      </div>
                    </div>
                    <div className="class-footer">
                      ID: {cls.classroom_id}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClassroomList;