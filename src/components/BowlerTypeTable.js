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

  // Dynamic color coding function - highest 2 = green, lowest 2 = red, rest = yellow
  const getDynamicColor = (value, values, isLowerBetter = false) => {
    // Sort values to find thresholds
    const sortedValues = [...values].sort((a, b) => a - b);
    const uniqueSorted = [...new Set(sortedValues)];
    
    if (uniqueSorted.length <= 2) {
      // If 2 or fewer unique values, use simple logic
      if (isLowerBetter) {
        return value <= uniqueSorted[0] ? 'text-green-400' : 'text-red-400';
      } else {
        return value >= uniqueSorted[uniqueSorted.length - 1] ? 'text-green-400' : 'text-red-400';
      }
    }
    
    if (isLowerBetter) {
      // For dot ball % - lower is better
      if (value <= uniqueSorted[1]) {
        return 'text-green-400'; // Lowest 2 values = green (good)
      } else if (value >= uniqueSorted[uniqueSorted.length - 2]) {
        return 'text-red-400'; // Highest 2 values = red (bad)
      } else {
        return 'text-yellow-400'; // Rest = yellow
      }
    } else {
      // For strike rate, average, boundary % - higher is better
      if (value >= uniqueSorted[uniqueSorted.length - 2]) {
        return 'text-green-400'; // Highest 2 values = green (good)
      } else if (value <= uniqueSorted[1]) {
        return 'text-red-400'; // Lowest 2 values = red (bad)
      } else {
        return 'text-yellow-400'; // Rest = yellow
      }
    }
  };

  // Extract all values for dynamic coloring
  const strikeRateValues = tableData.map(row => row.strikeRate);
  const averageValues = tableData.map(row => row.average);
  const boundaryPctValues = tableData.map(row => row.boundaryPct);
  const dotPctValues = tableData.map(row => row.dotPct);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-600 rounded-lg text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="border border-gray-600 px-2 py-3 text-left text-white font-semibold text-xs">
                Bowler Type
              </th>
              <th className="border border-gray-600 px-2 py-3 text-center text-white font-semibold text-xs">
                Balls Faced
              </th>
              <th className="border border-gray-600 px-2 py-3 text-center text-white font-semibold text-xs">
                Strike Rate
              </th>
              <th className="border border-gray-600 px-2 py-3 text-center text-white font-semibold text-xs">
                Average
              </th>
              <th className="border border-gray-600 px-2 py-3 text-center text-white font-semibold text-xs">
                Dot Ball %
              </th>
              <th className="border border-gray-600 px-2 py-3 text-center text-white font-semibold text-xs">
                Boundary %
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-750 transition-colors">
                <td className="border border-gray-600 px-2 py-4 text-white font-medium text-xs">
                  {row.bowlingType}
                </td>
                <td className="border border-gray-600 px-2 py-4 text-center text-white font-semibold text-xs">
                  {row.balls}
                </td>
                <td className="border border-gray-600 px-2 py-4 text-center">
                  <span className={`font-semibold text-xs ${getDynamicColor(row.strikeRate, strikeRateValues)}`}>
                    {row.strikeRate.toFixed(1)}
                  </span>
                </td>
                <td className="border border-gray-600 px-2 py-4 text-center">
                  <span className={`font-semibold text-xs ${getDynamicColor(row.average, averageValues)}`}>
                    {row.average.toFixed(1)}
                  </span>
                </td>
                <td className="border border-gray-600 px-2 py-4 text-center">
                  <span className={`font-semibold text-xs ${getDynamicColor(row.dotPct, dotPctValues, true)}`}>
                    {row.dotPct.toFixed(1)}%
                  </span>
                </td>
                <td className="border border-gray-600 px-2 py-4 text-center">
                  <span className={`font-semibold text-xs ${getDynamicColor(row.boundaryPct, boundaryPctValues)}`}>
                    {row.boundaryPct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Context Information */}
      <div className="mt-2 p-2 bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-300">
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
