import React, { useState, useRef } from 'react';
import PlayerSlide from './PlayerSlide';
import TeamSlide from './TeamSlide';
import OverByOverSlide from './OverByOverSlide';
import VenueSlide from './VenueSlide';
import NBASlide from './NBASlide';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const SlideContainer = ({ 
  selectedPlayers, 
  selectedOpposition, 
  selectedVenue, 
  showSlides 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [geminiApiKey] = useState(process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBzWtlKc4svrDEEZlf2NTt4itcUgzntJlo');
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

  // Add NBA slide (always at the end)
  slides.push({
    type: 'nba',
    data: 'Lakers vs Mavericks',
    title: 'NBA Matchup: Lakers vs Mavericks',
    index: slides.length + 1
  });

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
    setIsGenerating(true);
    
    try {
      // Prepare slides data for backend
      const slidesData = slides.map(slide => ({
        type: slide.type,
        player_name: slide.type === 'player' ? slide.data : null,
        team_name: (slide.type === 'team' || slide.type === 'overbyover') ? slide.data : null,
        venue_name: slide.type === 'venue' ? slide.data : null,
        opposition: selectedOpposition
      }));
      
      console.log('Requesting PPT generation from:', `${API_BASE_URL}/generate-screenshot-ppt`);
      console.log('Slides data:', slidesData);
      
      // Call backend API for screenshot-based PPT
      const response = await axios.post(
        `${API_BASE_URL}/generate-screenshot-ppt`,
        {
          slides: slidesData,
          gemini_api_key: geminiApiKey  // Not used but kept for compatibility
        },
        {
          responseType: 'blob',
          timeout: 300000  // 5 minute timeout for screenshot generation
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with opposition and date
      const date = new Date().toISOString().split('T')[0];
      const filename = selectedOpposition 
        ? `IPL_Opposition_Analysis_${selectedOpposition.replace(/\s+/g, '_')}_${date}.pptx`
        : `IPL_Opposition_Analysis_${date}.pptx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('PowerPoint generated successfully!');
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      const errorMessage = error.response?.data 
        ? `Error: ${error.response.status} - ${error.response.statusText}`
        : 'Error generating PowerPoint. Please ensure the backend is running and try again.';
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
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
    <div className="w-full p-4">
      {/* Compact Header with Navigation Controls */}
      <div className="flex justify-between items-center mb-3">
        {/* Left side - Slide Counter */}
        <div className="text-gray-400 text-xs">
          Slide {currentSlide + 1} of {totalSlides}
        </div>
        
        {/* Right side - All Controls */}
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            disabled={totalSlides <= 1}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Previous
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={totalSlides <= 1}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Slide Indicators and Download Button */}
      <div className="flex justify-between items-center mb-3">
        {/* Slide Indicators - Left */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide 
                  ? 'bg-teal-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Download Button - Right */}
        <button
          onClick={downloadPPTX}
          disabled={isGenerating}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium flex items-center space-x-2 transition-colors shadow-lg"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating PPT...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>Download PPT</span>
            </>
          )}
        </button>
      </div>

      {/* Slide Content */}
      <div ref={slideRef} className="slide-content bg-gray-800 rounded-lg p-4 min-h-[600px]">
        {/* Slide Title */}
        <h2 className="text-2xl font-bold text-white mb-3">
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
        
        {currentSlideData.type === 'nba' && (
          <NBASlide />
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
            {slide.type === 'nba' && '🏀'}
            {slide.title.split(': ')[1]}
            {index < slides.length - 1 && ' → '}
          </span>
        ))}
      </div>

    </div>
  );
};

export default SlideContainer;
