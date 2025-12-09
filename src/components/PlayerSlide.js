import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StrikeRateZones from './StrikeRateZones';
import BowlerTypeTable from './BowlerTypeTable';
import AnalystComments from './AnalystComments';
import PitchMap from './PitchMap';
import WagonWheel from './WagonWheel';
import { API_BASE_URL } from '../config/api';

const PlayerSlide = ({ playerName, opposition, selectedPlayers }) => {
  const [insights, setInsights] = useState(null);
  const [bowlingStats, setBowlingStats] = useState(null);
  const [dismissalData, setDismissalData] = useState(null);
  const [wagonWheelData, setWagonWheelData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlayerData = useCallback(async () => {
    try {
      const timestamp = Date.now(); // Cache busting
      const [insightsResponse, bowlingStatsResponse, dismissalResponse, wagonWheelResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/player/${playerName}/insights?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/player/${playerName}/bowling-stats?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/player/${playerName}/dismissal-locations?t=${timestamp}`),
        axios.get(`${API_BASE_URL}/player/${playerName}/wagon-wheel?t=${timestamp}`)
      ]);

      setInsights(insightsResponse.data.insights);
      setBowlingStats(bowlingStatsResponse.data);
      setDismissalData(dismissalResponse.data);
      setWagonWheelData(wagonWheelResponse.data);
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

      {/* AI Insights Section - Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* AI Insights */}
        <div className="insight-card">
          <h3 className="text-lg font-semibold teal-accent mb-3">AI Insights</h3>
          <ul className="space-y-2">
            {insights?.ai_insights?.map((insight, index) => (
              <li key={index} className="text-xs text-gray-200 flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths */}
        <div className="insight-card">
          <h3 className="text-lg font-semibold green-check mb-3">Strengths</h3>
          <ul className="space-y-2">
            {insights?.strengths?.map((strength, index) => (
              <li key={index} className="text-xs text-gray-200 flex items-start">
                <span className="green-check mr-2">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="insight-card">
          <h3 className="text-lg font-semibold orange-accent mb-3">Areas for Improvement</h3>
          <ul className="space-y-2">
            {insights?.areas_for_improvement?.map((area, index) => (
              <li key={index} className="text-xs text-gray-200 flex items-start">
                <span className="warning-icon mr-2">⚠</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 1: Performance vs Bowling Types (Left) | Strike Rate Zones (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="insight-card h-full">
          <h3 className="text-lg font-semibold text-white mb-3">Performance vs Bowling Types</h3>
          <BowlerTypeTable 
            data={bowlingStats}
            type="player"
          />
        </div>

        <div className="insight-card h-full">
          <StrikeRateZones 
            playerName={playerName}
          />
        </div>
      </div>

      {/* Row 2: Pitch Map (Left) | Wagon Wheel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="insight-card h-full">
          <PitchMap 
            data={dismissalData}
            playerName={playerName}
          />
        </div>

        <div className="insight-card h-full">
          <WagonWheel data={wagonWheelData} />
        </div>
      </div>

      {/* Row 3: Analyst Comments (Full Width) */}
      <div>
        <AnalystComments slideId={`player_${playerName}`} />
      </div>
    </div>
  );
};

export default PlayerSlide;
