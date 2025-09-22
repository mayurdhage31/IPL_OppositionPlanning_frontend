import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const VenueSlide = ({ venueName }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueData();
  }, [fetchVenueData]);

  const fetchVenueData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/venue/${venueName}/insights`);
      setInsights(response.data.insights);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venue data:', error);
      setLoading(false);
    }
  }, [venueName]);

  if (loading) {
    return (
      <div className="slide-container">
        <div className="text-teal-400 text-center">Loading venue data...</div>
      </div>
    );
  }

  return (
    <div className="slide-container">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-teal-400 mb-2">{venueName}</h2>
        <p className="text-lg text-gray-300">Venue Analysis</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Venue Insights */}
        <div className="insight-card">
          <h3 className="text-xl font-semibold text-teal-400 mb-3">Venue Insights</h3>
          <ul className="space-y-3">
            {insights?.insights?.map((insight, index) => (
              <li key={index} className="text-sm text-gray-200 p-3 bg-gray-800 rounded-lg">
                • {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Venue Statistics */}
        <div className="insight-card">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Venue Statistics</h3>
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
      </div>
    </div>
  );
};

export default VenueSlide;
