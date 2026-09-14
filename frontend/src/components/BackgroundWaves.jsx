import React from 'react';

export default function BackgroundWaves() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <svg className="w-full h-full opacity-35" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Onda Violeta 1 */}
        <path 
          d="M-100,150 C350,50 800,600 1540,200" 
          stroke="#8b5cf6" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />

        {/* Onda Naranja 1 */}
        <path 
          d="M-100,350 C400,700 900,50 1540,600" 
          stroke="#ff5a00" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />

        {/* Onda Violeta 2 */}
        <path 
          d="M-100,650 C500,900 1000,300 1540,750" 
          stroke="#a78bfa" 
          strokeWidth="1" 
          strokeLinecap="round" 
        />

        {/* Onda Naranja 2 */}
        <path 
          d="M-100,500 C450,200 1050,850 1540,400" 
          stroke="#ff8033" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />

      </svg>
    </div>
  );
}