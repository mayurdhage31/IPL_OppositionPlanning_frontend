import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StrikeRateZones from './StrikeRateZones';
import BowlerTypeTable from './BowlerTypeTable';
import AnalystComments from './AnalystComments';
import PitchMap from './PitchMap';
import { API_BASE_URL } from '../config/api';

const PlayerSlide = ({ playerName, opposition, selectedPlayers }) => {
  const [insights, setInsights] = useState(null);
  const [bowlingStats, setBowlingStats] = useState(null);
  const [dismissalData, setDismissalData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayerData = useCallback(async () => {
    try {
      const timestamp = Date.now(); // Cache busting
      const [insightsResponse, bowlingStatsResponse, dismissalResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/player/${playerName}/insights?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/player/${playerName}/bowling-stats?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/player/${playerName}/dismissal-locations?t=${timestamp}`)
      ]);

      setInsights(insightsResponse.data.insights);
      setBowlingStats(bowlingStatsResponse.data);
      setDismissalData(dismissalResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching player data:', error);
      setLoading(false);
    }
  }, [playerName]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  if (loading) {
    return (
      <div className="slide-container">
        <div className="teal-accent text-center">Loading player data...</div>
      </div>
    );
  }

  return (
    <div className="slide-container">

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
      </div>

      {/* Bowling Stats Table - Full Width */}
      <div className="insight-card mt-6">
        <h3 className="text-xl font-semibold text-white mb-4">Performance vs Bowling Types</h3>
        <BowlerTypeTable 
          data={bowlingStats}
          type="player"
        />
      </div>

      {/* Strike Rate Zones Heatmap */}
      <div className="insight-card mt-6">
        <StrikeRateZones 
          playerName={playerName}
        />
      </div>

      {/* Pitch Map Visualisation - Full Width */}
      <div className="insight-card mt-6">
        <h3 className="text-xl font-semibold text-white mb-4">Pitch Map Visualisations: Dismissal Location</h3>
        <PitchMap 
          data={dismissalData}
          playerName={playerName}
        />
      </div>

      {/* Analyst Comments Section */}
      <AnalystComments slideId={`player_${playerName}`} />
    </div>
  );
};

export default PlayerSlide;
