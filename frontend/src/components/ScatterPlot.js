import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

const ScatterPlot = ({ data, selectedPlayer, selectedTeam, type }) => {
  const [metric, setMetric] = useState('average'); // 'average' or 'strike_rate'

  const getDataForMetric = () => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      name: item.name,
      x: metric === 'average' ? item.first_innings_avg : item.first_innings_sr,
      y: metric === 'average' ? item.second_innings_avg : item.second_innings_sr,
      isSelected: type === 'player' ? item.name === selectedPlayer : item.name === selectedTeam
    }));
  };

  const plotData = getDataForMetric();

  // Calculate average lines for quadrants
  const avgX = plotData.reduce((sum, item) => sum + (item.x || 0), 0) / plotData.length;
  const avgY = plotData.reduce((sum, item) => sum + (item.y || 0), 0) / plotData.length;

  // Define axis ranges and reference lines based on data type
  const getAxisConfig = () => {
    if (type === 'team') {
      if (metric === 'average') {
        return {
          xDomain: [155, 175],
          yDomain: [145, 165],
          xTicks: [155, 160, 165, 170, 175],
          yTicks: [145, 150, 155, 160, 165],
          refX: 167.42,
          refY: 155.18
        };
      } else {
        return {
          xDomain: [130, 156],
          yDomain: [130, 170],
          xTicks: [130, 135, 140, 145, 150, 155],
          yTicks: [130, 135, 140, 145, 150, 155, 160, 165, 170],
          refX: 140,
          refY: 138
        };
      }
    } else {
      // Player scatter plot config
      if (metric === 'average') {
        return {
          xDomain: [20, 60],
          yDomain: [15, 85],
          xTicks: [20, 30, 40, 50, 60],
          yTicks: [15, 25, 35, 45, 55, 65, 75, 85],
          refX: avgX,
          refY: avgY
        };
      } else {
        return {
          xDomain: [100, 200],
          yDomain: [100, 200],
          xTicks: [100, 120, 140, 160, 180, 200],
          yTicks: [100, 120, 140, 160, 180, 200],
          refX: avgX,
          refY: avgY
        };
      }
    }
  };

  const axisConfig = getAxisConfig();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-teal-400 p-3 rounded-lg">
          <p className="text-teal-400 font-semibold">{data.name}</p>
          <p className="text-white text-sm">
            1st Innings: {data.x?.toFixed(2)}
          </p>
          <p className="text-white text-sm">
            2nd Innings: {data.y?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const isSelected = payload.isSelected;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 8 : 5}
        fill={isSelected ? '#4fd1c7' : '#38b2ac'}
        stroke={isSelected ? '#ffffff' : '#4fd1c7'}
        strokeWidth={isSelected ? 2 : 1}
        opacity={0.8}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Toggle Buttons */}
      <div className="flex mb-4 space-x-2 justify-end">
        <button
          onClick={() => setMetric('average')}
          className={`toggle-button ${
            metric === 'average' ? 'active' : 'inactive'
          }`}
        >
          Average
        </button>
        <button
          onClick={() => setMetric('strike_rate')}
          className={`toggle-button ${
            metric === 'strike_rate' ? 'active' : 'inactive'
          }`}
        >
          Strike Rate
        </button>
      </div>

      {/* Scatter Plot */}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number" 
            dataKey="x" 
            stroke="#9CA3AF"
            fontSize={12}
            domain={axisConfig.xDomain}
            ticks={axisConfig.xTicks}
            name={metric === 'average' ? '1st Innings Average Score' : '1st Innings Strike Rate'}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            stroke="#9CA3AF"
            fontSize={12}
            domain={axisConfig.yDomain}
            ticks={axisConfig.yTicks}
            name={metric === 'average' ? '2nd Innings Average Score' : '2nd Innings Strike Rate'}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Scatter
            data={plotData}
            shape={<CustomDot />}
          />
        </ScatterChart>
      </ResponsiveContainer>

    </div>
  );
};

export default ScatterPlot;
