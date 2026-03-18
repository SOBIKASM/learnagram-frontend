import React from "react";
import { useParams } from "react-router-dom";
import "./Semester.css";

const semesterData = {
  1: {
    title: "Semester 1",
    department: "Computer Science & Engineering",
    totalCredits: 21,
    subjects: [
      { code: "22MA101", name: "Engineering Mathematics I", credits: 4 },
      { code: "22PH102", name: "Engineering Physics", credits: 3 },
      { code: "22CH103", name: "Engineering Chemistry", credits: 3 },
      { code: "22GE001", name: "Fundamentals of Computing", credits: 3 },
      { code: "22GE003", name: "Basics of Electrical Engineering", credits: 3 },
      { code: "22HS001", name: "Foundational English", credits: 2 },
      { code: "22HS002", name: "Startup Management", credits: 2 },
      { code: "22HS003", name: "Heritage of Tamils", credits: 1 }
    ]
  }
};

const Semester = () => {
  const { id } = useParams();
  const sem = semesterData[id];

  if (!sem) return <h2>Semester Not Found</h2>;

  return (
    <div className="semester-container">
      <div className="sem-header">
        <h1>{sem.title}</h1>
        <p>{sem.department}</p>
        <p>Total Credits: {sem.totalCredits}</p>
      </div>

      <div className="subject-grid">
        {sem.subjects.map((sub, index) => (
          <div key={index} className="subject-card">
            <h3>{sub.name}</h3>
            <p>Code: {sub.code}</p>
            <p>Credits: {sub.credits}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Semester;