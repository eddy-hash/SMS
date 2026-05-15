const CampusHighlights = ({ researchProjects, employmentRate, graduationRate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Campus Highlights & Updates
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-l-4 border-blue-500 pl-4">
          <p className="text-sm font-semibold text-blue-600">Research Excellence</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{researchProjects}+</p>
          <p className="text-xs text-gray-500 mt-1">Active Research Projects</p>
        </div>
        <div className="border-l-4 border-green-500 pl-4">
          <p className="text-sm font-semibold text-green-600">Career Success</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{employmentRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Graduate Employment Rate</p>
        </div>
        <div className="border-l-4 border-purple-500 pl-4">
          <p className="text-sm font-semibold text-purple-600">Student Success</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{graduationRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Graduation Rate</p>
        </div>
      </div>
    </div>
  );
};

export default CampusHighlights;