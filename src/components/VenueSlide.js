import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const VenueSlide = ({ venueName }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueData();
  }, [venueName]);

  const fetchVenueData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/venue/${venueName}/insights`);
      setInsights(response.data.insights);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching venue data:', error);
      setLoading(false);
    }
  };

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

        {/* Additional Venue Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="insight-card">
            <h4 className="text-lg font-semibold text-teal-400 mb-2">Batting Conditions</h4>
            <p className="text-sm text-gray-200">
              This venue provides balanced conditions for batting with good scoring opportunities throughout the innings.
            </p>
          </div>

          <div className="insight-card">
            <h4 className="text-lg font-semibold text-teal-400 mb-2">Bowling Analysis</h4>
            <p className="text-sm text-gray-200">
              Both pace and spin bowlers find assistance at this venue, making it crucial to have a balanced bowling attack.
            </p>
          </div>

          <div className="insight-card">
            <h4 className="text-lg font-semibold text-teal-400 mb-2">Match Strategy</h4>
            <p className="text-sm text-gray-200">
              Teams should focus on building partnerships and capitalizing on boundary-hitting opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueSlide;
