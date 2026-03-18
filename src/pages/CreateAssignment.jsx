import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { classroomAPI } from "../services/api";
import "./Assignment.css";

const CreateAssignment = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [formData, setFormData] = useState({
        assignment_id: 'ASN_' + Date.now(),
        classroom_id: '',
        title: '',
        description: '',
        due_date: '',
        points: 100
    });
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyClasses = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classrooms/my-classrooms/${user.user_id}`);
                const data = await res.json();
                setClassrooms(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, classroom_id: data[0].classroom_id }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchMyClasses();
    }, [user.user_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Find classroom to get enrolled students
            const classObj = classrooms.find(c => c.classroom_id === formData.classroom_id);
            const enrolled_students = classObj ? classObj.student_ids : [];

            const payload = {
                ...formData,
                mentor_id: user.user_id,
                user_id: user.user_id, // For isMentor middleware
                enrolled_students
            };

            const res = await classroomAPI.createAssignment(payload);
            if (res.status === 200) {
                alert("Assignment created successfully!");
                navigate("/navigation/assignments");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="assignment-container">
            <div className="assignment-page-header">
                <h2 className="assignment-title">Create New Assignment</h2>
            </div>

            <form onSubmit={handleSubmit} className="create-assignment-form" style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dbdbdb' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Classroom</label>
                    <select 
                        value={formData.classroom_id}
                        onChange={(e) => setFormData({...formData, classroom_id: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                        required
                    >
                        {classrooms.map(c => (
                            <option key={c.classroom_id} value={c.classroom_id}>{c.name} ({c.classroom_id})</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Assignment Title</label>
                    <input 
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Unit 1 Quiz"
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
                    <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe the task..."
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dbdbdb', minHeight: '100px' }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Due Date</label>
                        <input 
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Points</label>
                        <input 
                            type="number"
                            value={formData.points}
                            onChange={(e) => setFormData({...formData, points: e.target.value})}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dbdbdb' }}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        background: '#0095f6', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Creating...' : 'Create Assignment'}
                </button>
            </form>
        </div>
    );
};

export default CreateAssignment;
