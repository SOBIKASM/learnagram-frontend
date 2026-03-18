import React from "react";
import "./LearnSnaps.css";

function LearnSnaps() {
  const snaps = [
    { title: "Placement", type: "primary", icon: "🎓" },
    { title: "Exam Prep", type: "secondary", icon: "📝" },
    { title: "Trends", type: "accent", icon: "🚀" },
    { title: "Events", type: "primary", icon: "📅" },
    { title: "Resources", type: "secondary", icon: "📚" },
    { title: "Library", type: "accent", icon: "🏢" },
  ];

  return (
    <div className="learnsnaps-container">
  
      <div className="learnsnaps-bar">
        {snaps.map((snap, index) => (
          <div className="snap-item" key={index}>
            <div className={`snap-ring ${snap.type}`}>
              <div className="snap-inner">
                {snap.icon}
              </div>
            </div>
            <span>{snap.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LearnSnaps;
