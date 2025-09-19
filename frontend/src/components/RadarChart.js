import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CustomRadarChart = ({ data, type }) => {
  if (!data || !data.bowling_stats || !data.overall_averages) {
    return (
      <div className="text-center text-gray-400 py-8">
        No bowling statistics available
      </div>
    );
  }

  // Transform data for radar chart, excluding "Right arm pace"
  const radarData = Object.keys(data.overall_averages)
    .filter(bowlingType => !bowlingType.toLowerCase().includes('right arm pace'))
    .map(bowlingType => ({
      bowlingType: bowlingType.charAt(0).toUpperCase() + bowlingType.slice(1).toLowerCase().replace(/([A-Z])/g, ' $1').trim(),
      playerTeamSR: data.bowling_stats[bowlingType] || 0,
      overallAvg: data.overall_averages[bowlingType] || 0
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-green-500 p-3 rounded-lg shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value?.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="bowlingType" 
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 200]} 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
          />
          
          {/* Overall Average Line */}
          <Radar
            name="Overall Average"
            dataKey="overallAvg"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          
          {/* Player/Team Performance Line */}
          <Radar
            name={type === 'player' ? data.player : data.team}
            dataKey="playerTeamSR"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
            strokeWidth={3}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '14px',
              color: '#9CA3AF'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      
    </div>
  );
};

export default CustomRadarChart;
