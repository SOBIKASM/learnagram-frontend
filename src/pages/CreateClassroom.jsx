import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { classroomAPI } from "../services/api";
import "./Create.css"; // Reusing styles

const CreateClassroom = () => {
  const [name, setName] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [students, setStudents] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user?.user_id?.startsWith('MTR')) {
    return <div className="error">Access Denied: Only mentors can create classrooms.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const studentIds = students.split(",").map(id => id.trim()).filter(id => id);
      await classroomAPI.createClassroom({
        classroom_id: classroomId,
        name,
        mentor_id: user.user_id,
        student_ids: studentIds,
        user_id: user.user_id // For the isMentor middleware
      });
      navigate("/navigation/classroom");
    } catch (err) {
      console.error(err);
      alert("Error creating classroom: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <h2 className="create-header">Create New Classroom</h2>
      <form className="create-form" onSubmit={handleSubmit}>
        <input
          className="create-input"
          style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#333', border: 'none', borderRadius: '4px', color: '#fff' }}
          placeholder="Classroom ID (e.g. CSE_A_2026)"
          value={classroomId}
          onChange={(e) => setClassroomId(e.target.value)}
          required
        />
        <input
          className="create-input"
          style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#333', border: 'none', borderRadius: '4px', color: '#fff' }}
          placeholder="Classroom Name (e.g. Data Structures)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          className="create-textarea"
          placeholder="Student IDs (comma separated, e.g. 22CSE001, 22CSE002)"
          value={students}
          onChange={(e) => setStudents(e.target.value)}
          style={{ minHeight: '100px' }}
        />
        <button type="submit" className="create-submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Classroom"}
        </button>
      </form>
    </div>
  );
};

export default CreateClassroom;
