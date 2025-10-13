import React from 'react';

const BowlerTypeTable = ({ data, type }) => {
  if (!data || !data.bowling_stats || !data.overall_averages) {
    return (
      <div className="text-center text-gray-400 py-8">
        No bowling statistics available
      </div>
    );
  }

  // Get the detailed stats from the data
  const detailedStats = data.detailed_stats || {};
  
  // Transform data for table, including all bowling types
  const tableData = Object.keys(data.bowling_stats)
    .map(bowlingType => {
      const strikeRate = data.bowling_stats[bowlingType] || 0;
      const overallAvg = data.overall_averages[bowlingType] || 0;
      const detailed = detailedStats[bowlingType] || {};
      
      return {
        bowlingType: bowlingType.charAt(0).toUpperCase() + bowlingType.slice(1).toLowerCase().replace(/([A-Z])/g, ' $1').trim(),
        strikeRate: detailed.strike_rate || strikeRate,
        runs: detailed.runs || 0,
        balls: detailed.balls || 0,
        average: detailed.average || 0,
        boundaryPct: detailed.boundary_pct || 0,
        dotPct: detailed.dot_pct || 0,
        overallAvg: overallAvg
      };
    });

  // Function to determine text color for strike rate
  const getStrikeRateColor = (strikeRate) => {
    if (strikeRate >= 140) {
      return 'text-green-400'; // Green for 140 and above
    } else if (strikeRate >= 125) {
      return 'text-yellow-400'; // Yellow for 125 to 139
    } else {
      return 'text-red-400'; // Red for below 125
    }
  };

  // Function to determine text color for average
  const getAverageColor = (average) => {
    if (average >= 35) {
      return 'text-green-400'; // Green for 35 and above
    } else if (average >= 21) {
      return 'text-yellow-400'; // Yellow for 21 to 34
    } else {
      return 'text-red-400'; // Red for below 20
    }
  };

  // Function to determine text color for boundary percentage
  const getBoundaryPctColor = (boundaryPct) => {
    if (boundaryPct > 25) {
      return 'text-green-400'; // Green for more than 25
    } else if (boundaryPct >= 15) {
      return 'text-yellow-400'; // Yellow for 15 to 24
    } else {
      return 'text-red-400'; // Red for rest
    }
  };

  // Function to determine text color for dot ball percentage (lower is better for batters)
  const getDotPctColor = (dotPct) => {
    if (dotPct > 30) {
      return 'text-red-400'; // Red for above 30 (bad for batters)
    } else if (dotPct >= 20) {
      return 'text-yellow-400'; // Yellow for 20 to 29
    } else {
      return 'text-green-400'; // Green for rest (good for batters)
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-600 rounded-lg">
          <thead>
            <tr className="bg-gray-700">
              <th className="border border-gray-600 px-4 py-3 text-left text-white font-semibold">
                Bowler Type
              </th>
              <th className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                Runs
              </th>
              <th className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                Balls Faced
              </th>
              <th className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                Strike Rate
              </th>
              <th className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                Average
              </th>
              <th className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                Dot Ball %
              </th>
              <th className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                Boundary %
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-750 transition-colors">
                <td className="border border-gray-600 px-4 py-3 text-white font-medium">
                  {row.bowlingType}
                </td>
                <td className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                  {row.runs}
                </td>
                <td className="border border-gray-600 px-4 py-3 text-center text-white font-semibold">
                  {row.balls}
                </td>
                <td className="border border-gray-600 px-4 py-3 text-center">
                  <span className={`font-semibold ${getStrikeRateColor(row.strikeRate)}`}>
                    {row.strikeRate.toFixed(1)}
                  </span>
                </td>
                <td className="border border-gray-600 px-4 py-3 text-center">
                  <span className={`font-semibold ${getAverageColor(row.average)}`}>
                    {row.average.toFixed(1)}
                  </span>
                </td>
                <td className="border border-gray-600 px-4 py-3 text-center">
                  <span className={`font-semibold ${getDotPctColor(row.dotPct)}`}>
                    {row.dotPct.toFixed(1)}%
                  </span>
                </td>
                <td className="border border-gray-600 px-4 py-3 text-center">
                  <span className={`font-semibold ${getBoundaryPctColor(row.boundaryPct)}`}>
                    {row.boundaryPct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Context Information */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-teal-400">Data Context:</span> 
          {type === 'player' ? (
            <span> Performance statistics for <span className="text-white font-semibold">{data.player}</span> against different bowling types</span>
          ) : (
            <span> Team performance statistics for <span className="text-white font-semibold">{data.team}</span> against different bowling types</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default BowlerTypeTable;
