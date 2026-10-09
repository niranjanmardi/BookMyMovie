import React from 'react';
import useBooking from '../hooks/useBooking';

const THEATRES = [
  { id: 1, name: 'PVR Cinemas',     location: 'Phoenix Mall, Chennai', screen: 'IMAX Laser 4K' },
  { id: 2, name: 'INOX Multiplex',  location: 'VR Mall, Coimbatore',   screen: 'Dolby Atmos 7.1' },
  { id: 3, name: 'Sathyam Cinemas', location: 'Royapettah, Chennai',   screen: 'RGB Laser Cinema' },
];

function TheatreList() {
  const { selectedTheatre, handleSelectTheatre } = useBooking();

  return (
    <div className="theatres-grid">
      {THEATRES.map((theatre) => {
        const isSelected = selectedTheatre?.id === theatre.id;
        return (
          <div
            key={theatre.id}
            onClick={() => handleSelectTheatre(theatre)}
            className={`theatre-card ${isSelected ? 'selected' : ''}`}
          >
            <div className="theatre-name">{theatre.name}</div>
            <div className="theatre-location">{theatre.location}</div>
            <div style={{ fontSize: '11px', color: '#818cf8', marginTop: '6px' }}>
              {theatre.screen}
            </div>
            {isSelected && (
              <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 'bold', marginTop: '8px' }}>
                ✓ Selected
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TheatreList;
