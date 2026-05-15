const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center bg-red-50 rounded-lg p-8 max-w-md">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;