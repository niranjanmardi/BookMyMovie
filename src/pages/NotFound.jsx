import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-code">404</div>
      <h2 className="notfound-title">Page Not Found</h2>
      <p className="notfound-text">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => navigate('/')}
      >
        <span>Back to Home</span>
      </button>
    </div>
  );
}

export default NotFound;
