import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AnalystComments from './AnalystComments';
import { API_BASE_URL } from '../config/api';

const VenueSlide = ({ venueName }) => {
  const [insights, setInsights] = useState(null);
  const [tossDecisions, setTossDecisions] = useState([]);
  const [situationDetails, setSituationDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVenueData = useCallback(async () => {
    try {
      const [insightsRes, tossDecisionsRes, situationDetailsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/venue/${venueName}/insights`),
        axios.get(`${API_BASE_URL}/venue/${venueName}/toss-decisions`),
        axios.get(`${API_BASE_URL}/venue/${venueName}/toss-situation-details`)
      ]);
      
      setInsights(insightsRes.data.insights);
      setTossDecisions(tossDecisionsRes.data.toss_decisions || []);
      setSituationDetails(situationDetailsRes.data.situation_details || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venue data:', error);
      setLoading(false);
    }
  }, [venueName]);

  useEffect(() => {
    fetchVenueData();
  }, [fetchVenueData]);

  if (loading) {
    return (
      <div className="slide-container">
        <div className="text-teal-400 text-center">Loading venue data...</div>
      </div>
    );
  }

  return (
    <div className="slide-container">

      <div className="grid grid-cols-1 gap-6">
        {/* Venue Insights */}
        <div className="insight-card">
          <h3 className="text-xl font-semibold text-teal-400 mb-3">Venue Insights - {venueName}</h3>
          <ul className="space-y-3">
            {insights?.insights?.map((insight, index) => (
              <li key={index} className="text-sm text-gray-200 p-3 bg-gray-800 rounded-lg">
                • {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Toss Decision Tables - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Toss Situation Details Table - NOW ON LEFT */}
          <div className="insight-card">
            <h3 className="text-xl font-semibold text-teal-400 mb-4">Toss Situation Details</h3>
            {situationDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-3 text-gray-300 text-base">Situation</th>
                      <th className="text-center py-3 px-3 text-gray-300 text-base">Wins</th>
                      <th className="text-center py-3 px-3 text-gray-300 text-base">Losses</th>
                      <th className="text-center py-3 px-3 text-gray-300 text-base">No Result</th>
                      <th className="text-center py-3 px-3 text-teal-400 text-base font-bold bg-teal-900 bg-opacity-30">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {situationDetails.map((situation, index) => {
                      const wins = situation.wins || 0;
                      const losses = situation.losses || 0;
                      const totalGames = wins + losses;
                      const percentage = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : '0.00';
                      
                      return (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3 px-3 text-gray-200 text-sm">{situation.situation}</td>
                          <td className="text-center py-3 px-3 text-green-500 font-semibold text-base">{wins}</td>
                          <td className="text-center py-3 px-3 text-red-500 font-semibold text-base">{losses}</td>
                          <td className="text-center py-3 px-3 text-gray-200 text-base">{situation.no_result}</td>
                          <td className="text-center py-3 px-3 text-teal-400 font-bold text-lg bg-teal-900 bg-opacity-30">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No situation details available</p>
            )}
          </div>

          {/* Toss Decisions Table - NOW ON RIGHT */}
          <div className="insight-card">
            <h3 className="text-xl font-semibold text-teal-400 mb-4">Toss Decisions</h3>
            {tossDecisions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-300">Toss</th>
                      <th className="text-center py-2 px-3 text-gray-300">Batted First</th>
                      <th className="text-center py-2 px-3 text-gray-300">Bowled First</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tossDecisions.map((decision, index) => {
                      const battedFirst = decision.batted_first;
                      const bowledFirst = decision.bowled_first;
                      const battedColor = battedFirst > bowledFirst ? 'text-green-500' : battedFirst < bowledFirst ? 'text-red-500' : 'text-gray-200';
                      const bowledColor = bowledFirst > battedFirst ? 'text-green-500' : bowledFirst < battedFirst ? 'text-red-500' : 'text-gray-200';
                      
                      return (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 px-3 text-gray-200">{decision.toss}</td>
                          <td className={`text-center py-2 px-3 font-semibold ${battedColor}`}>{battedFirst}</td>
                          <td className={`text-center py-2 px-3 font-semibold ${bowledColor}`}>{bowledFirst}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No toss decision data available</p>
            )}
          </div>
        </div>

        {/* Overall Venue Statistics */}
        <div className="insight-card">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Overall Venue Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="stat-item">
              <div className="text-lg font-bold text-white">176.08</div>
              <div className="text-sm text-gray-300">Average Score</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">3.73</div>
              <div className="text-sm text-gray-300">Wickets by Spinners per Match</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">7.61</div>
              <div className="text-sm text-gray-300">Wickets by Pacers per Match</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">20.02%</div>
              <div className="text-sm text-gray-300">Overall Boundary % per Match</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">20.22%</div>
              <div className="text-sm text-gray-300">Boundary % (First Innings)</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">19.99%</div>
              <div className="text-sm text-gray-300">Boundary % (Second Innings)</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">51.30</div>
              <div className="text-sm text-gray-300">Death Overs (First Innings)</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">39.37</div>
              <div className="text-sm text-gray-300">Death Overs (Second Innings)</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">74.07</div>
              <div className="text-sm text-gray-300">Middle Overs (First Innings)</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">75.04</div>
              <div className="text-sm text-gray-300">Middle Overs (Second Innings)</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">52.79</div>
              <div className="text-sm text-gray-300">Powerplay (First Innings)</div>
            </div>
            <div className="stat-item">
              <div className="text-lg font-bold text-white">49.59</div>
              <div className="text-sm text-gray-300">Powerplay (Second Innings)</div>
            </div>
          </div>
        </div>

        {/* Analyst Comments Section */}
        <AnalystComments slideId={`venue_${venueName}`} />
      </div>
    </div>
  );
};

export default VenueSlide;
