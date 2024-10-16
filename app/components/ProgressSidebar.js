import React, { useState } from 'react';

// Define the stages as an array
const stages = [
  "Consent",
  "Personal Information",
  "Step-by-Step Guidance",
  "Objectives of Estate Planning",
  "Assets & Liabilities",
  "Policies & Investments",
  "Estate Duty & Executor Fees",
  "Liquidity Position",
  "Maintenance Claims",
  "Provisions for Dependents",
  "Trusts",
  "Final Details",
];

export default function ProgressSidebar({ currentStage }) {
  return (
    <div className="progress-sidebar ">
      <ul className="progress-list">
        {stages.map((stage, index) => (
          <li
            key={index}
            className={`progress-item ${currentStage === index ? 'active' : ''}`}
          >
            {stage}
          </li>
        ))}
      </ul>
    </div>
  );
}