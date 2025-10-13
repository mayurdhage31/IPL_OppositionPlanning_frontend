import React, { useState, useRef } from 'react';
import PlayerSlide from './PlayerSlide';
import TeamSlide from './TeamSlide';
import OverByOverSlide from './OverByOverSlide';
import VenueSlide from './VenueSlide';
import pptxgen from 'pptxgenjs';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const SlideContainer = ({ 
  selectedPlayers, 
  selectedOpposition, 
  selectedVenue, 
  showSlides 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(null);

  if (!showSlides) {
    return (
      <div className="text-center mt-20 p-6" style={{color: '#10b981'}}>
        <h2 className="text-2xl mb-4">Welcome to Opposition Planning AI</h2>
        <p className="text-lg">Select teams, players, and venue from the sidebar, then click "Generate Insights" to view analysis</p>
      </div>
    );
  }

  // Create slides array
  const slides = [];
  
  // Add player slides
  selectedPlayers.forEach((player, index) => {
    slides.push({
      type: 'player',
      data: player,
      title: `Player Analysis: ${player}`,
      index: index + 1
    });
  });

  // Add opposition team slide
  if (selectedOpposition) {
    slides.push({
      type: 'team',
      data: selectedOpposition,
      title: `Opposition Analysis: ${selectedOpposition}`,
      index: slides.length + 1
    });
  }

  // Add over-by-over slide
  if (selectedOpposition) {
    slides.push({
      type: 'overbyover',
      data: selectedOpposition,
      title: `Over-by-Over Analysis: ${selectedOpposition}`,
      index: slides.length + 1
    });
  }


  // Add venue slide
  if (selectedVenue) {
    slides.push({
      type: 'venue',
      data: selectedVenue,
      title: `Venue Analysis: ${selectedVenue}`,
      index: slides.length + 1
    });
  }

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const downloadPPTX = async () => {
    // Store the original slide to restore it later
    const originalSlide = currentSlide;
    
    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <div style="background: #10b981; color: white; padding: 20px 40px; border-radius: 12px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">🔄 Generating PPTX</div>
          <div style="font-size: 14px; opacity: 0.9;">Creating editable presentation with real data...</div>
          <div style="margin-top: 15px; width: 200px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
            <div id="progress-bar" style="height: 100%; background: white; width: 0%; transition: width 0.3s ease; border-radius: 2px;"></div>
          </div>
        </div>
      </div>
    `;
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100vw';
    loadingOverlay.style.height = '100vh';
    loadingOverlay.style.backgroundColor = 'rgba(26, 31, 46, 0.95)';
    loadingOverlay.style.zIndex = '9999';
    loadingOverlay.style.backdropFilter = 'blur(5px)';
    document.body.appendChild(loadingOverlay);

    try {
      // Create new presentation with landscape orientation
      const pptx = new pptxgen();
      
      // Set slide size to landscape (16:9 aspect ratio)
      pptx.layout = 'LAYOUT_WIDE';
      
      // Set presentation properties
      pptx.author = 'IPL Opposition Planning Tool';
      pptx.company = 'Cricket Analytics';
      pptx.title = 'IPL Opposition Analysis';
      pptx.subject = 'Cricket Team Analysis';

      for (let i = 0; i < slides.length; i++) {
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
          progressBar.style.width = `${((i + 1) / slides.length) * 100}%`;
        }

        // Add slide to presentation
        const slide = pptx.addSlide();
        
        // Add title
        slide.addText(slides[i].title, {
          x: 0.5,
          y: 0.3,
          w: 12,
          h: 0.6,
          fontSize: 28,
          fontFace: 'Arial',
          color: '10b981',
          bold: true
        });
        
        // Add content based on slide type
        if (slides[i].type === 'player' || slides[i].type === 'team') {
          try {
            // Fetch actual bowling stats data
            const endpoint = slides[i].type === 'player' 
              ? `${API_BASE_URL}/player/${encodeURIComponent(slides[i].data)}/bowling-stats`
              : `${API_BASE_URL}/team/${encodeURIComponent(slides[i].data)}/bowling-stats`;
            
            const response = await axios.get(endpoint);
            const bowlingData = response.data;
            
            // Add Key Insights section
            slide.addText('Key Insights:', {
              x: 0.5,
              y: 1.2,
              w: 5.5,
              h: 0.4,
              fontSize: 18,
              fontFace: 'Arial',
              color: '10b981',
              bold: true
            });
            
            // Add insights content (editable)
            const insightsText = slides[i].type === 'player' 
              ? `• ${slides[i].data} performance analysis\n• Strengths: Identify best bowling matchups\n• Weaknesses: Areas for improvement\n• Strategic recommendations for team selection`
              : `• ${slides[i].data} team performance analysis\n• Team strengths against different bowling styles\n• Areas for tactical improvement\n• Opposition strategy recommendations`;
            
            slide.addText(insightsText, {
              x: 0.5,
              y: 1.7,
              w: 5.5,
              h: 2.5,
              fontSize: 14,
              fontFace: 'Arial',
              color: '000000'
            });
            
            // Add Performance vs Bowling Types section
            slide.addText('Performance vs Bowling Types:', {
              x: 6.5,
              y: 1.2,
              w: 6,
              h: 0.4,
              fontSize: 18,
              fontFace: 'Arial',
              color: '10b981',
              bold: true
            });
            
            // Create table with actual data
            const tableData = [['Bowler Type', 'Strike Rate', 'Runs', 'Balls']];
            
            // Process bowling stats data
            const detailedStats = bowlingData.detailed_stats || {};
            const bowlingStats = bowlingData.bowling_stats || {};
            
            Object.keys(bowlingStats)
              .filter(bowlingType => !bowlingType.toLowerCase().includes('right arm pace'))
              .forEach(bowlingType => {
                const strikeRate = bowlingStats[bowlingType] || 0;
                const detailed = detailedStats[bowlingType] || {};
                const runs = detailed.runs || 0;
                const balls = detailed.balls || 0;
                
                const formattedBowlingType = bowlingType.charAt(0).toUpperCase() + 
                  bowlingType.slice(1).toLowerCase().replace(/([A-Z])/g, ' $1').trim();
                
                tableData.push([
                  formattedBowlingType,
                  strikeRate.toFixed(1),
                  runs.toString(),
                  balls.toString()
                ]);
              });
            
            // Add table to slide
            slide.addTable(tableData, {
              x: 6.5,
              y: 1.7,
              w: 6,
              h: 2.5,
              fontSize: 12,
              fontFace: 'Arial',
              border: { pt: 1, color: '666666' },
              fill: { color: 'F8F9FA' },
              color: '000000',
              rowH: 0.4
            });
            
            // Add data context
            const contextText = slides[i].type === 'player' 
              ? `Data Context: Performance statistics for ${slides[i].data} against different bowling types`
              : `Data Context: Team performance statistics for ${slides[i].data} against different bowling types`;
            
            slide.addText(contextText, {
              x: 6.5,
              y: 4.3,
              w: 6,
              h: 0.5,
              fontSize: 11,
              fontFace: 'Arial',
              color: '666666',
              italic: true
            });
            
            slide.addText('Strike Rate: Green (>134) = Good Performance, Red (≤134) = Needs Improvement', {
              x: 6.5,
              y: 4.7,
              w: 6,
              h: 0.3,
              fontSize: 10,
              fontFace: 'Arial',
              color: '666666',
              italic: true
            });
            
          } catch (error) {
            console.error('Error fetching bowling stats:', error);
            // Fallback content if API fails
            slide.addText('Key Insights:', {
              x: 0.5,
              y: 1.2,
              w: 12,
              h: 0.4,
              fontSize: 18,
              fontFace: 'Arial',
              color: '10b981',
              bold: true
            });
            
            slide.addText('Data could not be loaded. Please check the connection and try again.', {
              x: 0.5,
              y: 1.7,
              w: 12,
              h: 1,
              fontSize: 14,
              fontFace: 'Arial',
              color: 'FF0000'
            });
          }
          
        } else if (slides[i].type === 'overbyover') {
          // Add over-by-over analysis content
          slide.addText('Over-by-Over Bowling Analysis:', {
            x: 0.5,
            y: 1.2,
            w: 12,
            h: 0.4,
            fontSize: 18,
            fontFace: 'Arial',
            color: '10b981',
            bold: true
          });
          
          slide.addText(`• Bowling patterns for ${slides[i].data} across 20 overs\n• Bowler rotation strategy and preferences\n• Powerplay (1-6) and death over (16-20) specialists\n• Pace vs Spin distribution analysis\n• Key bowlers for each phase of the innings`, {
            x: 0.5,
            y: 1.7,
            w: 12,
            h: 2.5,
            fontSize: 14,
            fontFace: 'Arial',
            color: '000000'
          });
          
        } else if (slides[i].type === 'venue') {
          // Add venue analysis content
          slide.addText('Venue Analysis:', {
            x: 0.5,
            y: 1.2,
            w: 12,
            h: 0.4,
            fontSize: 18,
            fontFace: 'Arial',
            color: '10b981',
            bold: true
          });
          
          slide.addText(`• Pitch conditions and characteristics at ${slides[i].data}\n• Historical performance trends at this venue\n• Weather and environmental factors\n• Strategic considerations for team selection\n• Recommended bowling and batting approaches`, {
            x: 0.5,
            y: 1.7,
            w: 12,
            h: 2.5,
            fontSize: 14,
            fontFace: 'Arial',
            color: '000000'
          });
        }
        
        // Add analyst comments section
        let slideId;
        if (slides[i].type === 'player') {
          slideId = `player_${slides[i].data}`;
        } else if (slides[i].type === 'team') {
          slideId = `team_${slides[i].data}`;
        } else if (slides[i].type === 'overbyover') {
          slideId = `overbyover_${slides[i].data}`;
        } else if (slides[i].type === 'venue') {
          slideId = `venue_${slides[i].data}`;
        }
        
        const comments = localStorage.getItem(`analyst_comments_${slideId}`);
        
        // Always add analyst comments section (even if empty)
        slide.addText('Analyst Comments:', {
          x: 0.5,
          y: 5.0,
          w: 12,
          h: 0.4,
          fontSize: 16,
          fontFace: 'Arial',
          color: '10b981',
          bold: true
        });
        
        const commentsText = comments && comments.trim() 
          ? comments 
          : 'Add your strategic insights and recommendations here...';
        
        slide.addText(commentsText, {
          x: 0.5,
          y: 5.5,
          w: 12,
          h: 1.5,
          fontSize: 12,
          fontFace: 'Arial',
          color: comments && comments.trim() ? '000000' : '999999',
          italic: !comments || !comments.trim()
        });
        
        // Add slide number
        slide.addText(`Slide ${i + 1} of ${slides.length}`, {
          x: 11.5,
          y: 7.2,
          w: 1,
          h: 0.3,
          fontSize: 10,
          fontFace: 'Arial',
          color: '666666'
        });
      }

      // Restore the original slide
      setCurrentSlide(originalSlide);
      
      // Save the PPTX
      await pptx.writeFile({ fileName: 'ipl-opposition-analysis.pptx' });
      
    } catch (error) {
      console.error('Error generating PPTX:', error);
      alert('Error generating PPTX. Please try again.');
    } finally {
      // Remove loading overlay
      document.body.removeChild(loadingOverlay);
    }
  };

  if (totalSlides === 0) {
    return (
      <div className="text-center mt-20 p-6" style={{color: '#10b981'}}>
        <h2 className="text-2xl mb-4">No Data Selected</h2>
        <p className="text-lg">Please select players, opposition team, or venue to generate insights</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full p-6">
      {/* Top Header with Navigation Controls */}
      <div className="flex justify-between items-center mb-6">
        {/* Left side - empty for spacing */}
        <div></div>
        
        {/* Center - Slide Title and Counter */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">
            Slide {currentSlide + 1} of {totalSlides}
          </p>
        </div>
        
        {/* Right side - Navigation Controls */}
        <div className="flex items-center space-x-4">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            disabled={totalSlides <= 1}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Previous</span>
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={totalSlides <= 1}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Next</span>
          </button>
        </div>
      </div>

      {/* Slide Indicators - Centered */}
      <div className="flex justify-center space-x-2 mb-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide 
                ? 'bg-teal-500' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Download PPTX Button - Top Right */}
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadPPTX}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PPTX</span>
        </button>
      </div>

      {/* Slide Content */}
      <div ref={slideRef} className="slide-content bg-gray-800 rounded-lg p-6 min-h-[600px]">
        {/* Slide Title */}
        <h2 className="text-2xl font-bold text-white mb-6">
          {currentSlideData.title}
        </h2>
        
        {currentSlideData.type === 'player' && (
          <PlayerSlide 
            playerName={currentSlideData.data} 
            opposition={selectedOpposition}
            selectedPlayers={selectedPlayers}
          />
        )}
        
        {currentSlideData.type === 'team' && (
          <TeamSlide teamName={currentSlideData.data} />
        )}
        
        {currentSlideData.type === 'overbyover' && (
          <OverByOverSlide teamName={currentSlideData.data} />
        )}
        
        {currentSlideData.type === 'venue' && (
          <VenueSlide venueName={currentSlideData.data} />
        )}
      </div>


      {/* Slide Counter */}
      <div className="text-center mt-4 text-gray-400 text-sm">
        {slides.map((slide, index) => (
          <span key={index} className="mx-1">
            {slide.type === 'player' && '👤'}
            {slide.type === 'team' && '🏏'}
            {slide.type === 'overbyover' && '📊'}
            {slide.type === 'venue' && '🏟️'}
            {slide.title.split(': ')[1]}
            {index < slides.length - 1 && ' → '}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SlideContainer;
