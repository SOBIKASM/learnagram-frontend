import React from 'react';
import './Curriculum.css';
import { Link } from "react-router-dom";
import { IoBook, IoVideocam, IoChatboxEllipses } from "react-icons/io5";

const departments = [
  { id: 1, type: "B.E.", name: "Biomedical Engineering", semesters: 8 },
  { id: 2, type: "B.E.", name: "Computer Science & Engineering", semesters: 8 },
  { id: 3, type: "B.T.", name: "Artificial Intelligence & Data Science", semesters: 8 },
  { id: 4, type: "B.T.", name: "Information Technology", semesters: 8 },
];

function Curriculum() {
  return (
    <div className="curriculum-container">
      <div className="reg-section">
        <h2 className="gradient-text">2022 Regulation</h2>
        <p className="subtitle">Bachelor of Engineering & Technology</p>
      </div>
      <div className="dept-feed">
        {departments.map((dept) => (
          <div key={dept.id} className="ig-card">
            <div className="card-header">
              <div className="avatar-mini">{dept.type}</div>
              <div className="header-text">
                <span className="dept-name">{dept.name}</span>
                <span className="location">Department Curriculum</span>
              </div>
            </div>
            <div className="card-body">
              <div className="sem-grid">
                {[...Array(dept.semesters)].map((_, i) => (
                  <Link key={i} to={`/navigation/curriculum/sem/${i + 1}`}
 className="glass-btn">
                    Sem {i + 1}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Curriculum;