import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ScatterPlot from './ScatterPlot';
import RadarChart from './RadarChart';
import { API_BASE_URL } from '../config/api';

const TeamSlide = ({ teamName }) => {
  const [insights, setInsights] = useState(null);
  const [bowlingStats, setBowlingStats] = useState(null);
  const [scatterData, setScatterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const fetchTeamData = useCallback(async () => {
    try {
      const timestamp = Date.now(); // Cache busting
      const [insightsResponse, bowlingStatsResponse, scatterResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/team/${teamName}/insights?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/team/${teamName}/bowling-stats?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/team-scatter-plot-data?t=${timestamp}`)
      ]);

      setInsights(insightsResponse.data.insights);
      setBowlingStats(bowlingStatsResponse.data);
      setScatterData(scatterResponse.data.team_scatter_data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team data:', error);
      setLoading(false);
    }
  }, [teamName]);

  if (loading) {
    return (
      <div className="slide-container">
        <div className="teal-accent text-center">Loading team data...</div>
      </div>
    );
  }

  return (
    <div className="slide-container">
      <div className="mb-6">
        <h2 className="text-3xl font-bold teal-accent mb-2">{teamName} - Team Analysis</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="insight-card">
          <h3 className="text-xl font-semibold teal-accent mb-4">AI Insights</h3>
          <ul className="space-y-3">
            {insights?.ai_insights?.map((insight, index) => (
              <li key={index} className="text-sm text-gray-200 flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths */}
        <div className="insight-card">
          <h3 className="text-xl font-semibold green-check mb-4">Strengths</h3>
          <ul className="space-y-3">
            {insights?.strengths?.map((strength, index) => (
              <li key={index} className="text-sm text-gray-200 flex items-start">
                <span className="green-check mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="insight-card lg:col-span-2">
          <h3 className="text-xl font-semibold orange-accent mb-4">Areas for Improvement</h3>
          <ul className="space-y-3">
            {insights?.areas_for_improvement?.map((area, index) => (
              <li key={index} className="text-sm text-gray-200 flex items-start">
                <span className="warning-icon mr-2">⚠</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team Performance Scatter Plot */}
        <div className="insight-card lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-4">Team Performance Scatter Plot</h3>
          <ScatterPlot 
            data={scatterData} 
            selectedTeam={teamName}
            type="team"
          />
        </div>
      </div>

      {/* Radar Chart - Full Width */}
      <div className="insight-card mt-6">
        <h3 className="text-xl font-semibold text-white mb-4">Strike Rate vs Bowling Types</h3>
        <RadarChart 
          data={bowlingStats}
          type="team"
        />
      </div>
    </div>
  );
};

export default TeamSlide;
