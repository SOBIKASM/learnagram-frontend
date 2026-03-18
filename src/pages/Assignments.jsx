import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Assignment.css";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const user = JSON.parse(localStorage.getItem('user'));
  // Note: MTR102 is a verified mentor ID in the database.

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `http://localhost:7001/api/classrooms/my-assignments/${user.user_id}`
        );
        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : data.assignments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleFileChange = (id, file) => {
    setFiles(prev => ({ ...prev, [id]: file }));
  };

  const handleSubmit = async (id) => {
    if (!files[id]) { alert("Choose a file first"); return; }
    try {
      const response = await fetch(`http://localhost:7001/api/classrooms/assignment/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.user_id,
          file_url: 'dummy_url_' + files[id].name, // Simulate upload
          file_name: files[id].name
        })
      });
      if (response.ok) {
        setSubmitted(prev => ({ ...prev, [id]: true }));
        alert("Assignment submitted successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  const handleGrade = async (assignment_id, student_id, score, remarks) => {
    try {
      const response = await fetch(`http://localhost:7001/api/classrooms/assignment/${assignment_id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id, // For mentor check
          student_id,
          score,
          remarks
        })
      });
      if (response.ok) {
        alert("Graded successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Grading failed");
    }
  };
  const getDaysLeft = (due_date) => {
    const diff = new Date(due_date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const pendingAssignments = assignments.filter(a => {
    const submission = a.submissions?.find(s => s.student_id === user.user_id);
    return !submission && !submitted[a.assignment_id];
  });
  
  const submittedAssignments = assignments.filter(a => {
    const submission = a.submissions?.find(s => s.student_id === user.user_id);
    return submission || submitted[a.assignment_id];
  });

  const displayList = activeTab === "pending" ? pendingAssignments : submittedAssignments;

  if (loading) return <div className="loading">Loading assignments...</div>;

  return (
    <div className="assignment-container">
      {/* Header */}
      <div className="assignment-page-header">
        <div>
          <h2 className="assignment-title">Assignments</h2>
          <p className="assignment-subtitle">Manage your coursework and deadlines</p>
        </div>
        {user?.user_id?.startsWith('MTR') && (
          <Link to="/navigation/assignments/create" className="create-assignment-btn">
            + Create Assignment
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="assignment-stats">
        <div className="stat-card stat-pending">
          <div className="stat-number">{pendingAssignments.length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card stat-submitted">
          <div className="stat-number">{submittedAssignments.length}</div>
          <div className="stat-label">Submitted</div>
        </div>
        <div className="stat-card stat-total">
          <div className="stat-number">{assignments.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="assignment-tabs">
        <button
          className={`assignment-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Assignments
        </button>
        <button
          className={`assignment-tab ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          Submitted
        </button>
      </div>

      {/* Assignment Cards */}
      {displayList.length === 0 ? (
        <div className="no-assignments">
          {activeTab === 'pending' ? 'No pending assignments 🎉' : 'No submitted assignments yet.'}
        </div>
      ) : (
        displayList.map((item) => {
          const daysLeft = getDaysLeft(item.due_date);
          const isUrgent = daysLeft <= 2;
          const submission = item.submissions?.find(s => s.student_id === user.user_id);
          const isSubmitted = submission || submitted[item.assignment_id];

          return (
            <div key={item.assignment_id} className="assignment-card">
              <div className="assignment-card-top">
                <div className="assignment-card-left">
                  <div className="assignment-card-header">
                    <h4 className="assignment-name">{item.title}</h4>
                    {isSubmitted && (
                      <span className="submitted-badge">✓ Submitted</span>
                    )}
                  </div>
                  <p className="assignment-class">{item.classroom_id}</p>

                  <div className="assignment-meta">
                    {daysLeft > 0 ? (
                      <span className={`days-left ${isUrgent ? 'urgent' : ''}`}>
                        ⏰ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>
                    ) : (
                      <span className="days-left overdue">⚠ Overdue</span>
                    )}
                    {item.points && (
                      <span className="points-badge">🏆 {item.points} points</span>
                    )}
                  </div>

                  <p className="assignment-description">{item.description}</p>
                  <p className="assignment-due">
                    Due: {item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    }) : 'No due date'}
                  </p>
                  
                  {submission?.status === 'Graded' && (
                    <div className="grading-result" style={{ marginTop: '10px', padding: '10px', background: '#f0f9ff', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                      <div style={{ fontWeight: 'bold', color: '#0369a1' }}>Grade: {submission.score} / 100</div>
                      <div style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>Remarks: {submission.remarks}</div>
                    </div>
                  )}
                </div>
              </div>

              {!isSubmitted && !user?.user_id?.startsWith('MTR') && (
                <div className="assignment-actions">
                  <label className="choose-file-btn">
                    {files[item.assignment_id]
                      ? `📄 ${files[item.assignment_id].name}`
                      : '📎 Choose File'}
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(item.assignment_id, e.target.files[0])}
                    />
                  </label>
                  <button
                    className="submit-assignment-btn"
                    onClick={() => handleSubmit(item.assignment_id)}
                  >
                    Submit Assignment
                  </button>
                </div>
              )}

              {user?.user_id?.startsWith('MTR') && (
                <div className="mentor-submission-view" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <h5 style={{ marginBottom: '10px' }}>Submissions ({item.submissions?.length || 0})</h5>
                  {item.submissions?.map(s => (
                    <div key={s.student_id} style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: '#f9f9f9', marginBottom: '10px', borderRadius: '6px', border: '1px solid #efefef' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600' }}>Student: {s.student_id}</span>
                        <a href={s.file_url} target="_blank" rel="noreferrer" style={{ color: '#0095f6', fontSize: '0.85rem', textDecoration: 'none' }}>
                          View Submission: {s.file_name}
                        </a>
                      </div>
                      
                      {s.status === 'Graded' ? (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#ecfdf5', padding: '8px', borderRadius: '4px' }}>
                          <span style={{ color: '#059669', fontWeight: 'bold' }}>Grade: {s.score} / {item.points || 100}</span>
                          <span style={{ fontSize: '0.85rem', color: '#065f46' }}>Remarks: {s.remarks}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input 
                            type="number" 
                            placeholder="Score" 
                            style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #dbdbdb' }} 
                            id={`score-${item.assignment_id}-${s.student_id}`} 
                          />
                          <input 
                            type="text" 
                            placeholder="Remarks" 
                            style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #dbdbdb' }} 
                            id={`remarks-${item.assignment_id}-${s.student_id}`} 
                          />
                          <button 
                            onClick={() => {
                              const score = document.getElementById(`score-${item.assignment_id}-${s.student_id}`).value;
                              const remarks = document.getElementById(`remarks-${item.assignment_id}-${s.student_id}`).value;
                              handleGrade(item.assignment_id, s.student_id, score, remarks);
                            }}
                            className="grade-btn-submit"
                            style={{ padding: '5px 15px', background: '#0095f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Verify & Grade
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Assignments;
