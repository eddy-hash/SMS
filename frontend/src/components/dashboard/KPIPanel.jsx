import { performanceMetrics } from "./constants";

const KPIPanel = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Key Performance Indicators
      </h3>
      <div className="space-y-6">
        {performanceMetrics.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">{item.metric}</span>
              <span className="text-gray-600">
                {stats[item.key]}{item.unit} / {item.target}{item.unit}
              </span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                <div
                  style={{ width: `${Math.min((stats[item.key] / item.target) * 100, 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Current ({stats[item.key]}{item.unit})</span>
                <span>Target ({item.target}{item.unit})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIPanel;