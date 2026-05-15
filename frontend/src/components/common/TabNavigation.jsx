
import React from "react";

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-2 mb-6 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;  // Make sure this line exists