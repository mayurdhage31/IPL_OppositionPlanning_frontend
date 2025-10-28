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
          {/* Toss Decisions Table */}
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
                    {tossDecisions.map((decision, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-2 px-3 text-gray-200">{decision.toss}</td>
                        <td className="text-center py-2 px-3 text-gray-200">{decision.batted_first}</td>
                        <td className="text-center py-2 px-3 text-gray-200">{decision.bowled_first}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No toss decision data available</p>
            )}
          </div>

          {/* Toss Situation Details Table */}
          <div className="insight-card">
            <h3 className="text-xl font-semibold text-teal-400 mb-4">Toss Situation Details</h3>
            {situationDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-300">Situation</th>
                      <th className="text-center py-2 px-3 text-gray-300">Wins</th>
                      <th className="text-center py-2 px-3 text-gray-300">Losses</th>
                      <th className="text-center py-2 px-3 text-gray-300">No Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {situationDetails.map((situation, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-2 px-3 text-gray-200 text-xs">{situation.situation}</td>
                        <td className="text-center py-2 px-3 text-gray-200">{situation.wins}</td>
                        <td className="text-center py-2 px-3 text-gray-200">{situation.losses}</td>
                        <td className="text-center py-2 px-3 text-gray-200">{situation.no_result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No situation details available</p>
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
