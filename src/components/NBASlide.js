import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const NBASlide = () => {
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [selectedPlayers1, setSelectedPlayers1] = useState([]);
  const [selectedPlayers2, setSelectedPlayers2] = useState([]);
  const [team1Stats, setTeam1Stats] = useState(null);
  const [team2Stats, setTeam2Stats] = useState(null);
  const [players1Stats, setPlayers1Stats] = useState([]);
  const [players2Stats, setPlayers2Stats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const team1 = 'Lakers';
  const team2 = 'Mavericks';

  useEffect(() => {
    fetchTeamPlayers();
    fetchTeamStats();
  }, []);

  const fetchTeamPlayers = async () => {
    try {
      const [response1, response2] = await Promise.all([
        axios.get(`${API_BASE_URL}/nba/team/${team1}/players`),
        axios.get(`${API_BASE_URL}/nba/team/${team2}/players`)
      ]);
      setTeam1Players(response1.data.players);
      setTeam2Players(response2.data.players);
    } catch (error) {
      console.error('Error fetching team players:', error);
    }
  };

  const fetchTeamStats = async () => {
    try {
      const [response1, response2] = await Promise.all([
        axios.get(`${API_BASE_URL}/nba/team/${team1}/stats`),
        axios.get(`${API_BASE_URL}/nba/team/${team2}/stats`)
      ]);
      setTeam1Stats(response1.data);
      setTeam2Stats(response2.data);
    } catch (error) {
      console.error('Error fetching team stats:', error);
    }
  };

  const fetchPlayerStats = async () => {
    if (selectedPlayers1.length === 0 || selectedPlayers2.length === 0) {
      alert('Please select at least one player from each team');
      return;
    }

    setLoading(true);
    try {
      // Fetch stats for all selected players from team 1
      const team1Promises = selectedPlayers1.map(player => 
        axios.get(`${API_BASE_URL}/nba/player/${encodeURIComponent(player)}/stats`)
      );
      
      // Fetch stats for all selected players from team 2
      const team2Promises = selectedPlayers2.map(player => 
        axios.get(`${API_BASE_URL}/nba/player/${encodeURIComponent(player)}/stats`)
      );
      
      const [team1Results, team2Results] = await Promise.all([
        Promise.all(team1Promises),
        Promise.all(team2Promises)
      ]);
      
      setPlayers1Stats(team1Results.map(r => r.data));
      setPlayers2Stats(team2Results.map(r => r.data));
      setShowInsights(true);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      alert('Error fetching player statistics');
    } finally {
      setLoading(false);
    }
  };

  const generateTeamInsights = (teamName, stats) => {
    if (!stats) return { ai_insights: [], strengths: [], weaknesses: [] };

    const insights = {
      ai_insights: [],
      strengths: [],
      weaknesses: []
    };

    // AI Insights based on stats (always at least 3)
    insights.ai_insights.push(
      `${teamName} averages <strong>${stats.avg_pts_h1.toFixed(1)}</strong> points in the first half and <strong>${stats.avg_pts_h2.toFixed(1)}</strong> in the second half over <strong>${stats.games_played}</strong> games`
    );
    
    if (stats.avg_diff_q1 > 0) {
      insights.ai_insights.push(
        `Strong Q1 performance with <strong>+${stats.avg_diff_q1.toFixed(1)}</strong> average point differential`
      );
    } else {
      insights.ai_insights.push(
        `Q1 performance shows <strong>${stats.avg_diff_q1.toFixed(1)}</strong> average point differential`
      );
    }
    
    insights.ai_insights.push(
      `Win margin of <strong>${stats.avg_win_margin.toFixed(1)}</strong> points when victorious, loss margin of <strong>${Math.abs(stats.avg_loss_margin).toFixed(1)}</strong> when defeated`
    );

    // Strengths (ensure at least 1)
    if (stats.avg_diff_q1 > 2) {
      insights.strengths.push(`Excellent first quarter starts (<strong>+${stats.avg_diff_q1.toFixed(1)}</strong> avg differential)`);
    }
    if (stats.avg_diff_q3 > 2) {
      insights.strengths.push(`Dominant third quarter performance (<strong>+${stats.avg_diff_q3.toFixed(1)}</strong> avg differential)`);
    }
    if (stats.wins_when_leading_q1 > stats.wins_when_trailing_q1 * 1.5) {
      insights.strengths.push(`Strong ability to protect early leads (<strong>${stats.wins_when_leading_q1}</strong> wins when leading Q1)`);
    }
    if (stats.avg_pts_h2 > stats.avg_pts_h1) {
      insights.strengths.push(`Better second half scoring (<strong>${stats.avg_pts_h2.toFixed(1)}</strong> vs <strong>${stats.avg_pts_h1.toFixed(1)}</strong> pts)`);
    }
    
    // Ensure at least one strength
    if (insights.strengths.length === 0) {
      const bestQuarter = Math.max(stats.avg_diff_q1, stats.avg_diff_q2, stats.avg_diff_q3, stats.avg_diff_q4);
      if (bestQuarter === stats.avg_diff_q1) {
        insights.strengths.push(`Competitive first quarter play with <strong>${stats.avg_diff_q1.toFixed(1)}</strong> point differential`);
      } else if (bestQuarter === stats.avg_diff_q2) {
        insights.strengths.push(`Solid second quarter performance with <strong>${stats.avg_diff_q2.toFixed(1)}</strong> point differential`);
      } else if (bestQuarter === stats.avg_diff_q3) {
        insights.strengths.push(`Strong third quarter execution with <strong>${stats.avg_diff_q3.toFixed(1)}</strong> point differential`);
      } else {
        insights.strengths.push(`Resilient fourth quarter play with <strong>${stats.avg_diff_q4.toFixed(1)}</strong> point differential`);
      }
    }

    // Weaknesses (ensure at least 1)
    if (stats.avg_diff_q4 < -1) {
      insights.weaknesses.push(`Struggles in fourth quarter (<strong>${stats.avg_diff_q4.toFixed(1)}</strong> avg differential)`);
    }
    if (stats.avg_pts_conc_h1 > stats.avg_pts_h1) {
      insights.weaknesses.push(`First half defensive issues (conceding <strong>${stats.avg_pts_conc_h1.toFixed(1)}</strong> pts vs scoring <strong>${stats.avg_pts_h1.toFixed(1)}</strong> pts)`);
    }
    if (stats.wins_when_trailing_q1 < stats.wins_when_leading_q1 * 0.3) {
      insights.weaknesses.push(`Difficulty recovering from slow starts (only <strong>${stats.wins_when_trailing_q1}</strong> wins when trailing Q1)`);
    }
    if (Math.abs(stats.avg_loss_margin) > stats.avg_win_margin * 1.2) {
      insights.weaknesses.push(`Larger loss margins (<strong>${Math.abs(stats.avg_loss_margin).toFixed(1)}</strong> pts) compared to win margins (<strong>${stats.avg_win_margin.toFixed(1)}</strong> pts)`);
    }
    
    // Ensure at least one weakness
    if (insights.weaknesses.length === 0) {
      const worstQuarter = Math.min(stats.avg_diff_q1, stats.avg_diff_q2, stats.avg_diff_q3, stats.avg_diff_q4);
      if (worstQuarter === stats.avg_diff_q1) {
        insights.weaknesses.push(`Room for improvement in first quarter (<strong>${stats.avg_diff_q1.toFixed(1)}</strong> point differential)`);
      } else if (worstQuarter === stats.avg_diff_q2) {
        insights.weaknesses.push(`Second quarter needs attention (<strong>${stats.avg_diff_q2.toFixed(1)}</strong> point differential)`);
      } else if (worstQuarter === stats.avg_diff_q3) {
        insights.weaknesses.push(`Third quarter requires focus (<strong>${stats.avg_diff_q3.toFixed(1)}</strong> point differential)`);
      } else {
        insights.weaknesses.push(`Fourth quarter closing needs work (<strong>${stats.avg_diff_q4.toFixed(1)}</strong> point differential)`);
      }
    }

    return insights;
  };

  const generatePlayerInsights = (playerName, stats) => {
    if (!stats) return { ai_insights: [], strengths: [], weaknesses: [] };

    const insights = {
      ai_insights: [],
      strengths: [],
      weaknesses: []
    };

    // AI Insights (always at least 3)
    insights.ai_insights.push(
      `${playerName} averages <strong>${stats.avg_points_first_half_per_game.toFixed(1)}</strong> pts in first half and <strong>${stats.avg_points_second_half_per_game.toFixed(1)}</strong> pts in second half`
    );
    
    if (stats.points_per_game_last5 > 0) {
      insights.ai_insights.push(
        `Recent form: <strong>${stats.points_per_game_last5.toFixed(1)}</strong> PPG, <strong>${stats.rebounds_per_game_last5.toFixed(1)}</strong> RPG, <strong>${stats.assists_per_game_last5.toFixed(1)}</strong> APG in last 5 games`
      );
    } else {
      insights.ai_insights.push(
        `Played <strong>${stats.games_played_window}</strong> games with varied performance across quarters`
      );
    }
    
    insights.ai_insights.push(
      `Quarter-by-quarter scoring: Q1 <strong>${stats.avg_points_q1_per_game.toFixed(1)}</strong>, Q2 <strong>${stats.avg_points_q2_per_game.toFixed(1)}</strong>, Q3 <strong>${stats.avg_points_q3_per_game.toFixed(1)}</strong>, Q4 <strong>${stats.avg_points_q4_per_game.toFixed(1)}</strong> PPG`
    );

    // Strengths (ensure at least 1)
    const maxQuarter = Math.max(
      stats.avg_points_q1_per_game,
      stats.avg_points_q2_per_game,
      stats.avg_points_q3_per_game,
      stats.avg_points_q4_per_game
    );
    
    if (stats.avg_points_q1_per_game === maxQuarter && maxQuarter > 3) {
      insights.strengths.push(`Strong first quarter scorer (<strong>${stats.avg_points_q1_per_game.toFixed(1)}</strong> PPG in Q1)`);
    } else if (stats.avg_points_q4_per_game === maxQuarter && maxQuarter > 3) {
      insights.strengths.push(`Clutch fourth quarter performer (<strong>${stats.avg_points_q4_per_game.toFixed(1)}</strong> PPG in Q4)`);
    }
    
    if (stats.points_per_game_last5 > stats.points_per_game_last10) {
      insights.strengths.push(`Improving recent form (<strong>${stats.points_per_game_last5.toFixed(1)}</strong> PPG last 5 vs <strong>${stats.points_per_game_last10.toFixed(1)}</strong> PPG last 10)`);
    }
    
    if (stats.assists_per_game_last5 > 3) {
      insights.strengths.push(`Excellent playmaker (<strong>${stats.assists_per_game_last5.toFixed(1)}</strong> APG in last 5 games)`);
    }
    
    if (stats.threes_made_per_game_last5 > 2) {
      insights.strengths.push(`Reliable three-point shooter (<strong>${stats.threes_made_per_game_last5.toFixed(1)}</strong> 3PM per game)`);
    }
    
    // Ensure at least one strength
    if (insights.strengths.length === 0) {
      if (maxQuarter === stats.avg_points_q1_per_game) {
        insights.strengths.push(`Consistent first quarter contributor (<strong>${stats.avg_points_q1_per_game.toFixed(1)}</strong> PPG in Q1)`);
      } else if (maxQuarter === stats.avg_points_q2_per_game) {
        insights.strengths.push(`Solid second quarter production (<strong>${stats.avg_points_q2_per_game.toFixed(1)}</strong> PPG in Q2)`);
      } else if (maxQuarter === stats.avg_points_q3_per_game) {
        insights.strengths.push(`Effective third quarter play (<strong>${stats.avg_points_q3_per_game.toFixed(1)}</strong> PPG in Q3)`);
      } else {
        insights.strengths.push(`Reliable fourth quarter option (<strong>${stats.avg_points_q4_per_game.toFixed(1)}</strong> PPG in Q4)`);
      }
    }

    // Weaknesses (ensure at least 1)
    const minQuarter = Math.min(
      stats.avg_points_q1_per_game,
      stats.avg_points_q2_per_game,
      stats.avg_points_q3_per_game,
      stats.avg_points_q4_per_game
    );
    
    if (stats.avg_points_q2_per_game === minQuarter && minQuarter < 2) {
      insights.weaknesses.push(`Low second quarter production (<strong>${stats.avg_points_q2_per_game.toFixed(1)}</strong> PPG in Q2)`);
    }
    
    if (stats.points_per_game_last5 < stats.points_per_game_last10 * 0.8) {
      insights.weaknesses.push(`Recent scoring decline (<strong>${stats.points_per_game_last5.toFixed(1)}</strong> PPG last 5 vs <strong>${stats.points_per_game_last10.toFixed(1)}</strong> PPG last 10)`);
    }
    
    if (stats.rebounds_per_game_last5 < 2) {
      insights.weaknesses.push(`Limited rebounding contribution (<strong>${stats.rebounds_per_game_last5.toFixed(1)}</strong> RPG)`);
    }
    
    if (stats.avg_points_second_half_per_game < stats.avg_points_first_half_per_game * 0.7) {
      insights.weaknesses.push(`Second half scoring drop-off (<strong>${stats.avg_points_second_half_per_game.toFixed(1)}</strong> vs <strong>${stats.avg_points_first_half_per_game.toFixed(1)}</strong> pts)`);
    }
    
    // Ensure at least one weakness
    if (insights.weaknesses.length === 0) {
      if (minQuarter === stats.avg_points_q1_per_game) {
        insights.weaknesses.push(`First quarter scoring needs improvement (<strong>${stats.avg_points_q1_per_game.toFixed(1)}</strong> PPG in Q1)`);
      } else if (minQuarter === stats.avg_points_q2_per_game) {
        insights.weaknesses.push(`Second quarter production could be better (<strong>${stats.avg_points_q2_per_game.toFixed(1)}</strong> PPG in Q2)`);
      } else if (minQuarter === stats.avg_points_q3_per_game) {
        insights.weaknesses.push(`Third quarter impact needs work (<strong>${stats.avg_points_q3_per_game.toFixed(1)}</strong> PPG in Q3)`);
      } else {
        insights.weaknesses.push(`Fourth quarter scoring requires attention (<strong>${stats.avg_points_q4_per_game.toFixed(1)}</strong> PPG in Q4)`);
      }
    }

    return insights;
  };

  const team1Insights = generateTeamInsights(team1, team1Stats);
  const team2Insights = generateTeamInsights(team2, team2Stats);

  const InsightSection = ({ title, insights }) => (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-teal-400 mb-2">{title}</h4>
      <ul className="space-y-1">
        {insights.map((insight, idx) => (
          <li key={idx} className="text-xs text-white flex items-start">
            <span className="text-teal-500 mr-2">•</span>
            <span dangerouslySetInnerHTML={{ __html: insight }} />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Matchup Header */}
      <div className="bg-gray-700 rounded-lg p-4 text-center">
        <h3 className="text-xl font-bold text-white">
          {team1} vs {team2}
        </h3>
        <p className="text-sm text-gray-400 mt-1">NBA Matchup Analysis</p>
      </div>

      {/* Player Selection */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Select Players</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {team1} Players (Hold Ctrl/Cmd for multiple)
            </label>
            <select
              multiple
              value={selectedPlayers1}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedPlayers1(selected);
              }}
              className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm h-32"
            >
              {team1Players.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
            {selectedPlayers1.length > 0 && (
              <div className="mt-2 text-xs text-white">
                Selected: {selectedPlayers1.join(', ')}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {team2} Players (Hold Ctrl/Cmd for multiple)
            </label>
            <select
              multiple
              value={selectedPlayers2}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedPlayers2(selected);
              }}
              className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm h-32"
            >
              {team2Players.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
            {selectedPlayers2.length > 0 && (
              <div className="mt-2 text-xs text-white">
                Selected: {selectedPlayers2.join(', ')}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={fetchPlayerStats}
          disabled={loading || selectedPlayers1.length === 0 || selectedPlayers2.length === 0}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition-colors"
        >
          {loading ? 'Loading...' : 'Generate Insights'}
        </button>
      </div>

      {/* Insights Display */}
      {(team1Stats || team2Stats || showInsights) && (
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Side - Lakers */}
            <div className="border-r border-gray-600 pr-4">
              <h3 className="text-lg font-bold text-white mb-4 text-center border-b border-gray-600 pb-2">
                {team1}
              </h3>
              
              {/* Team Insights */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-orange-400 mb-3">Team Analysis</h4>
                <InsightSection title="AI Insights" insights={team1Insights.ai_insights} />
                <InsightSection title="Strengths" insights={team1Insights.strengths} />
                <InsightSection title="Weaknesses" insights={team1Insights.weaknesses} />
              </div>

              {/* Player Insights */}
              {showInsights && players1Stats.length > 0 && (
                <div className="border-t border-gray-600 pt-4">
                  {players1Stats.map((playerStats, idx) => {
                    const playerInsights = generatePlayerInsights(selectedPlayers1[idx], playerStats);
                    return (
                      <div key={idx} className={idx > 0 ? "mt-6 pt-4 border-t border-gray-500" : ""}>
                        <h4 className="text-md font-semibold text-orange-400 mb-3">
                          Player Analysis: {selectedPlayers1[idx]}
                        </h4>
                        <InsightSection title="AI Insights" insights={playerInsights.ai_insights} />
                        <InsightSection title="Strengths" insights={playerInsights.strengths} />
                        <InsightSection title="Weaknesses" insights={playerInsights.weaknesses} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Side - Mavericks */}
            <div className="pl-4">
              <h3 className="text-lg font-bold text-white mb-4 text-center border-b border-gray-600 pb-2">
                {team2}
              </h3>
              
              {/* Team Insights */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-orange-400 mb-3">Team Analysis</h4>
                <InsightSection title="AI Insights" insights={team2Insights.ai_insights} />
                <InsightSection title="Strengths" insights={team2Insights.strengths} />
                <InsightSection title="Weaknesses" insights={team2Insights.weaknesses} />
              </div>

              {/* Player Insights */}
              {showInsights && players2Stats.length > 0 && (
                <div className="border-t border-gray-600 pt-4">
                  {players2Stats.map((playerStats, idx) => {
                    const playerInsights = generatePlayerInsights(selectedPlayers2[idx], playerStats);
                    return (
                      <div key={idx} className={idx > 0 ? "mt-6 pt-4 border-t border-gray-500" : ""}>
                        <h4 className="text-md font-semibold text-orange-400 mb-3">
                          Player Analysis: {selectedPlayers2[idx]}
                        </h4>
                        <InsightSection title="AI Insights" insights={playerInsights.ai_insights} />
                        <InsightSection title="Strengths" insights={playerInsights.strengths} />
                        <InsightSection title="Weaknesses" insights={playerInsights.weaknesses} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NBASlide;
