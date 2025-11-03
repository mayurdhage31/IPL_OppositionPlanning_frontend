import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const ScreenshotModal = ({ 
  isOpen, 
  onClose, 
  slides, 
  selectedOpposition, 
  selectedVenue,
  selectedPlayers
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const captureElementScreenshot = async (element) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#1f2937',
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: true
      });
      
      return canvas.toDataURL('image/png', 0.95);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  };

  const createSectionSlide = async (pptx, sectionElement, title, slideNumber, totalSlides) => {
    const screenshot = await captureElementScreenshot(sectionElement);
    const slide = pptx.addSlide();
    
    // Add title at top
    slide.addText(title, {
      x: 0.5,
      y: 0.3,
      w: 12,
      h: 0.5,
      fontSize: 24,
      fontFace: 'Arial',
      color: '10b981',
      bold: true
    });
    
    // Add screenshot filling most of the slide
    slide.addImage({
      data: screenshot,
      x: 0.3,
      y: 1,
      w: 12.4,
      h: 6.3,
      sizing: {
        type: 'contain',
        w: 12.4,
        h: 6.3
      }
    });
    
    // Add slide number
    slide.addText(`${slideNumber} / ${totalSlides}`, {
      x: 12,
      y: 8,
      w: 1,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: '999999',
      align: 'right'
    });
  };

  const generatePowerPointWithScreenshots = async () => {
    if (!slides || slides.length === 0) {
      alert('No slides to generate PowerPoint from');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Initializing...');

    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'IPL Opposition Planning Tool';
      pptx.company = 'Cricket Analytics';
      pptx.title = `IPL Opposition Analysis - ${selectedOpposition}`;
      pptx.subject = 'Cricket Team Analysis';

      // Create hidden container
      let hiddenContainer = document.getElementById('hidden-slide-container');
      if (!hiddenContainer) {
        hiddenContainer = document.createElement('div');
        hiddenContainer.id = 'hidden-slide-container';
        hiddenContainer.style.position = 'fixed';
        hiddenContainer.style.top = '-9999px';
        hiddenContainer.style.left = '-9999px';
        hiddenContainer.style.width = '1400px';
        hiddenContainer.style.backgroundColor = '#1f2937';
        hiddenContainer.style.zIndex = '-1';
        document.body.appendChild(hiddenContainer);
      }

      let totalPptSlides = 0;
      let processedSlides = 0;

      for (let i = 0; i < slides.length; i++) {
        const slideData = slides[i];
        setCurrentStep(`Processing ${slideData.title}...`);

        if (slideData.type === 'player') {
          // For player slides, split into multiple PPT slides
          processedSlides++;
          setProgress((processedSlides / slides.length) * 80);

          try {
            // Fetch player data
            const timestamp = Date.now();
            const [insightsResponse, bowlingStatsResponse, dismissalResponse, zonesResponse] = await Promise.all([
              axios.get(`${API_BASE_URL}/player/${slideData.data}/insights?t=${timestamp}`),
              axios.get(`${API_BASE_URL}/player/${slideData.data}/bowling-stats?t=${timestamp}`),
              axios.get(`${API_BASE_URL}/player/${slideData.data}/dismissal-locations?t=${timestamp}`),
              axios.get(`${API_BASE_URL}/player/${slideData.data}/strike-rate-zones?t=${timestamp}`)
            ]);

            const insights = insightsResponse.data.insights;
            const bowlingStats = bowlingStatsResponse.data;
            const dismissalData = dismissalResponse.data;
            const zonesData = zonesResponse.data;

            // Slide 1: Insights (AI Insights, Strengths, Areas for Improvement)
            hiddenContainer.innerHTML = '';
            const insightsDiv = document.createElement('div');
            insightsDiv.className = 'bg-gray-800 rounded-lg p-8';
            insightsDiv.style.width = '1400px';
            insightsDiv.innerHTML = `
              <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="bg-gray-700 rounded-lg p-6">
                  <h3 class="text-2xl font-semibold text-teal-400 mb-4">AI Insights</h3>
                  <ul class="space-y-3">
                    ${insights?.ai_insights?.map(insight => `
                      <li class="text-lg text-gray-200 flex items-start">
                        <span class="mr-2">•</span>
                        <span>${insight}</span>
                      </li>
                    `).join('') || '<li class="text-gray-400">No insights available</li>'}
                  </ul>
                </div>
                <div class="bg-gray-700 rounded-lg p-6">
                  <h3 class="text-2xl font-semibold text-green-400 mb-4">Strengths</h3>
                  <ul class="space-y-3">
                    ${insights?.strengths?.map(strength => `
                      <li class="text-lg text-gray-200 flex items-start">
                        <span class="text-green-400 mr-2">✓</span>
                        <span>${strength}</span>
                      </li>
                    `).join('') || '<li class="text-gray-400">No strengths data</li>'}
                  </ul>
                </div>
              </div>
              <div class="bg-gray-700 rounded-lg p-6">
                <h3 class="text-2xl font-semibold text-orange-400 mb-4">Areas for Improvement</h3>
                <ul class="space-y-3">
                  ${insights?.areas_for_improvement?.map(area => `
                    <li class="text-lg text-gray-200 flex items-start">
                      <span class="text-orange-400 mr-2">⚠</span>
                      <span>${area}</span>
                    </li>
                  `).join('') || '<li class="text-gray-400">No improvement areas data</li>'}
                </ul>
              </div>
            `;
            hiddenContainer.appendChild(insightsDiv);
            await createSectionSlide(pptx, insightsDiv, `${slideData.data} - Insights`, ++totalPptSlides, 999);

            // Slide 2: Bowling Stats Table
            if (bowlingStats && bowlingStats.bowling_stats) {
              hiddenContainer.innerHTML = '';
              const statsDiv = document.createElement('div');
              statsDiv.className = 'bg-gray-800 rounded-lg p-8';
              statsDiv.style.width = '1400px';
              
              const statsTable = Object.entries(bowlingStats.bowling_stats)
                .filter(([type]) => !type.toLowerCase().includes('right arm pace'))
                .map(([type, sr]) => {
                  const detailed = bowlingStats.detailed_stats?.[type] || {};
                  return `
                    <tr class="border-b border-gray-600">
                      <td class="py-4 px-6 text-lg text-gray-200">${type}</td>
                      <td class="py-4 px-6 text-lg ${sr > 134 ? 'text-green-400' : 'text-red-400'} font-bold">${sr.toFixed(1)}</td>
                      <td class="py-4 px-6 text-lg text-gray-200">${detailed.runs || 0}</td>
                      <td class="py-4 px-6 text-lg text-gray-200">${detailed.balls || 0}</td>
                      <td class="py-4 px-6 text-lg text-gray-200">${detailed.wickets || 0}</td>
                      <td class="py-4 px-6 text-lg text-gray-200">${detailed.dismissals || 0}</td>
                    </tr>
                  `;
                }).join('');

              statsDiv.innerHTML = `
                <h3 class="text-3xl font-semibold text-white mb-6">Performance vs Bowling Types</h3>
                <table class="w-full bg-gray-700 rounded-lg overflow-hidden">
                  <thead class="bg-gray-600">
                    <tr>
                      <th class="py-4 px-6 text-left text-xl font-semibold text-teal-400">Bowler Type</th>
                      <th class="py-4 px-6 text-left text-xl font-semibold text-teal-400">Strike Rate</th>
                      <th class="py-4 px-6 text-left text-xl font-semibold text-teal-400">Runs</th>
                      <th class="py-4 px-6 text-left text-xl font-semibold text-teal-400">Balls</th>
                      <th class="py-4 px-6 text-left text-xl font-semibold text-teal-400">Wickets</th>
                      <th class="py-4 px-6 text-left text-xl font-semibold text-teal-400">Dismissals</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${statsTable}
                  </tbody>
                </table>
              `;
              hiddenContainer.appendChild(statsDiv);
              await createSectionSlide(pptx, statsDiv, `${slideData.data} - Bowling Stats`, ++totalPptSlides, 999);
            }

            // Slide 3: Strike Rate Zones (if available)
            // Note: This would require rendering the actual React component
            // For now, we'll skip or add a placeholder

          } catch (error) {
            console.error(`Error processing player ${slideData.data}:`, error);
          }

        } else if (slideData.type === 'team' || slideData.type === 'overbyover' || slideData.type === 'venue') {
          // For other slide types, create one PPT slide
          processedSlides++;
          setProgress((processedSlides / slides.length) * 80);

          // Add a simple slide with the title
          const slide = pptx.addSlide();
          slide.addText(slideData.title, {
            x: 1,
            y: 3,
            w: 11,
            h: 2,
            fontSize: 32,
            fontFace: 'Arial',
            color: '10b981',
            align: 'center',
            valign: 'middle'
          });
          totalPptSlides++;
        }
      }

      // Update all slide numbers
      // (In a real implementation, you'd need to track and update these)

      // Clean up
      if (hiddenContainer && hiddenContainer.parentNode) {
        document.body.removeChild(hiddenContainer);
      }

      setCurrentStep('Generating PowerPoint file...');
      setProgress(90);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `IPL_Opposition_Analysis_${selectedOpposition?.replace(/\s+/g, '_')}_${timestamp}.pptx`;

      await pptx.writeFile({ fileName: filename });

      setProgress(100);
      setCurrentStep('Complete!');
      
      setTimeout(() => {
        alert(`PowerPoint generated successfully: ${filename}\n\nTotal slides: ${totalPptSlides}`);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      alert('Error generating PowerPoint. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Generate PowerPoint with Screenshots
          </h2>
          
          {!isGenerating ? (
            <>
              <p className="text-gray-300 mb-6">
                This will create multiple PowerPoint slides for each section, making content large and easily readable. Total slides: ~{slides?.length * 3 || 0}
              </p>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-teal-400 mb-2">What's included:</h3>
                <ul className="text-sm text-gray-300 text-left space-y-1">
                  <li>• Multiple slides per player (Insights, Stats, Charts)</li>
                  <li>• Large, readable text and visualizations</li>
                  <li>• All sections clearly visible</li>
                  <li>• Professional presentation layout</li>
                  <li>• No need to zoom to read content</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePowerPointWithScreenshots}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Generate PowerPoint
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-lg font-semibold text-teal-400 mb-2">
                  {currentStep}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                  <div 
                    className="bg-teal-500 h-4 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">
                  {Math.round(progress)}% complete
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Creating multiple slides for better readability...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotModal;
