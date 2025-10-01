import React, { useState, useEffect } from 'react';

const AnalystComments = ({ slideId }) => {
  // Use localStorage to persist comments between page refreshes
  const [comments, setComments] = useState('');
  
  // Load saved comments when component mounts
  useEffect(() => {
    const savedComments = localStorage.getItem(`analyst_comments_${slideId}`);
    if (savedComments) {
      setComments(savedComments);
    }
  }, [slideId]);
  
  // Save comments to localStorage when they change
  const handleCommentsChange = (e) => {
    const newComments = e.target.value;
    setComments(newComments);
    localStorage.setItem(`analyst_comments_${slideId}`, newComments);
  };
  
  return (
    <div className="insight-card mt-6">
      <h3 className="text-xl font-semibold text-white mb-4">Analyst Comments</h3>
      <textarea
        className="w-full h-32 bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder="Add your analysis and comments here..."
        value={comments}
        onChange={handleCommentsChange}
      />
    </div>
  );
};

export default AnalystComments;
