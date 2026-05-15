import { TrophyIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

const QuickInfoPanels = ({ internationalStudents }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <TrophyIcon className="w-10 h-10 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Excellence in Education</h3>
            <p className="text-blue-100 text-sm">
              East Africa University is committed to providing quality education 
              and fostering innovation across all disciplines.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <GlobeAltIcon className="w-10 h-10 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Global Recognition</h3>
            <p className="text-green-100 text-sm">
              {internationalStudents}% international student body from over 15 countries.
              Preparing global leaders for tomorrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInfoPanels;