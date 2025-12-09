import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AnalystComments from './AnalystComments';
import { API_BASE_URL } from '../config/api';

const OverByOverSlide = ({ teamName }) => {
  const [overData, setOverData] = useState([]);
  const [pacerSpinnerData, setPacerSpinnerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPacerSpinner, setShowPacerSpinner] = useState(false);

  // Color palette for different bowlers
  const colors = [
    '#14b8a6', // teal-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#10b981', // emerald-500
    '#f97316', // orange-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#22d3ee', // cyan-400
    '#fbbf24', // amber-400
    '#fb7185', // rose-400
    '#a78bfa', // violet-400
    '#4ade80', // green-400
    '#facc15', // yellow-400
    '#f472b6', // pink-400
    '#60a5fa', // blue-400
    '#34d399', // emerald-400
    '#fcd34d'  // amber-300
  ];

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const timestamp = Date.now();
      
      // Fetch both datasets in parallel
      const [overByOverResponse, pacerSpinnerResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/team/${teamName}/over-by-over?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/team/${teamName}/pacer-spinner-breakdown?t=${timestamp}`)
      ]);
      
      // Transform over-by-over data for stacked bar chart
      const transformedOverData = overByOverResponse.data.overs_data.map(overInfo => {
        const overData = {
          over: overInfo.over,
          total: 0
        };
        
        // Calculate total overs for this over
        const totalOvers = overInfo.bowlers.reduce((sum, bowler) => sum + bowler.overs, 0);
        
        // Add each bowler's contribution to this over as percentage
        overInfo.bowlers.forEach((bowler) => {
          // Calculate percentage (0-100)
          const percentage = totalOvers > 0 ? (bowler.overs / totalOvers) * 100 : 0;
          overData[bowler.name] = percentage;
          overData.total += percentage;
          // Store raw overs for tooltip display
          overData[`${bowler.name}_raw`] = bowler.overs;
        });
        
        return overData;
      });
      
      // Transform pacer-spinner data
      const transformedPacerSpinnerData = pacerSpinnerResponse.data.overs_data.map(overInfo => {
        const totalOvers = overInfo.total_overs;
        return {
          over: overInfo.over,
          Pacer: totalOvers > 0 ? (overInfo.pacer_overs / totalOvers) * 100 : 0,
          Spinner: totalOvers > 0 ? (overInfo.spinner_overs / totalOvers) * 100 : 0,
          total: totalOvers,
          // Store raw values for tooltip display
          Pacer_raw: overInfo.pacer_overs,
          Spinner_raw: overInfo.spinner_overs
        };
      });
      
      setOverData(transformedOverData);
      setPacerSpinnerData(transformedPacerSpinnerData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching over-by-over data:', error);
      setError(error.response?.data?.detail || 'Failed to load over-by-over data');
      setLoading(false);
    }
  }, [teamName]);

  useEffect(() => {
    if (teamName) {
      fetchAllData();
    }
  }, [teamName, fetchAllData]);


  // Get all unique bowler names across all overs
  const getAllBowlers = () => {
    const bowlers = new Set();
    overData.forEach(over => {
      Object.keys(over).forEach(key => {
        if (key !== 'over' && key !== 'total') {
          bowlers.add(key);
        }
      });
    });
    return Array.from(bowlers);
  };

  // Custom tooltip to show bowler names and overs
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const activeBowlers = payload.filter(p => p.value > 0);
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{`Over ${label}`}</p>
          {activeBowlers.map((entry, index) => {
            const bowlerName = entry.dataKey;
            const percentage = entry.value.toFixed(1);
            // Get raw overs value from the data
            const rawOvers = payload[0].payload[`${bowlerName}_raw`] || 0;
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${bowlerName}: ${percentage}% (${rawOvers} over${rawOvers > 1 ? 's' : ''})`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="slide-container">
        <div className="teal-accent text-center">Loading over-by-over data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="slide-container">
        <div className="text-red-400 text-center">
          <h3 className="text-xl font-semibold mb-2">Error Loading Data</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const allBowlers = getAllBowlers();
  const currentData = showPacerSpinner ? pacerSpinnerData : overData;
  const pacerSpinnerColors = {
    'Pacer': '#ef4444',    // red-500
    'Spinner': '#14b8a6'   // teal-500
  };

  // Custom tooltip for pacer/spinner view
  const PacerSpinnerTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const totalPercentage = payload.reduce((sum, entry) => sum + entry.value, 0);
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{`Over ${label}`}</p>
          {payload.map((entry, index) => {
            const bowlerType = entry.dataKey;
            const percentage = entry.value.toFixed(1);
            // Get raw overs value from the data
            const rawOvers = payload[0].payload[`${bowlerType}_raw`] || 0;
            
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${bowlerType}: ${percentage}% (${rawOvers} over${rawOvers > 1 ? 's' : ''})`}
              </p>
            );
          })}
          <p className="text-sm text-gray-300 border-t border-gray-600 pt-1 mt-1">
            {`Total: ${payload[0].payload.total} over${payload[0].payload.total > 1 ? 's' : ''}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="slide-container">
      <div className="mb-6">
        <p className="text-gray-300 text-sm">
          {showPacerSpinner 
            ? 'Pacer vs Spinner breakdown across overs' 
            : 'Individual bowler breakdown across overs'}
        </p>
      </div>

      {currentData.length > 0 ? (
        <div className="insight-card">
          {/* Toggle Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold teal-accent">
              {showPacerSpinner ? 'Pacer vs Spinner Breakdown' : 'Bowling Distribution Across Overs'}
            </h3>
            <button
              onClick={() => setShowPacerSpinner(!showPacerSpinner)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <span>{showPacerSpinner ? 'Show Individual Bowlers' : 'Show Pacer/Spinner'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
          
          <div style={{ width: '100%', height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="over" 
                  stroke="#9ca3af"
                  fontSize={12}
                  interval={0}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  label={{ value: 'Percentage of Overs', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
                />
                <Tooltip content={showPacerSpinner ? <PacerSpinnerTooltip /> : <CustomTooltip />} />
                
                {showPacerSpinner ? (
                  // Pacer/Spinner bars
                  <>
                    <Bar
                      dataKey="Pacer"
                      stackId="bowlerType"
                      fill={pacerSpinnerColors.Pacer}
                      stroke="#1f2937"
                      strokeWidth={1}
                    />
                    <Bar
                      dataKey="Spinner"
                      stackId="bowlerType"
                      fill={pacerSpinnerColors.Spinner}
                      stroke="#1f2937"
                      strokeWidth={1}
                    />
                  </>
                ) : (
                  // Individual bowler bars
                  allBowlers.map((bowler, index) => (
                    <Bar
                      key={bowler}
                      dataKey={bowler}
                      stackId="bowlers"
                      fill={colors[index % colors.length]}
                      stroke="#1f2937"
                      strokeWidth={1}
                    />
                  ))
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">
              {showPacerSpinner ? 'Bowler Type Legend' : 'Bowlers Legend'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {showPacerSpinner ? (
                // Pacer/Spinner legend
                Object.entries(pacerSpinnerColors).map(([type, color]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm text-gray-300">{type}</span>
                  </div>
                ))
              ) : (
                // Individual bowlers legend
                allBowlers.map((bowler, index) => (
                  <div key={bowler} className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    ></div>
                    <span className="text-sm text-gray-300 truncate" title={bowler}>
                      {bowler}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="insight-card text-center">
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Data Available</h3>
          <p className="text-gray-500">No over-by-over bowling data found for {teamName}</p>
        </div>
      )}

      {/* Analyst Comments Section */}
      <AnalystComments slideId={`overbyover_${teamName}`} />
    </div>
  );
};

export default OverByOverSlide;
