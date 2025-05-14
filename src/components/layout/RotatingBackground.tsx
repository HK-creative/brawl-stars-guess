
import React, { useState, useEffect } from 'react';

// Background images - these are the images uploaded by the user
const backgroundImages = [
  '/lovable-uploads/de136078-ac44-407e-8905-7bd39a03588f.png',
  '/lovable-uploads/97176570-4ec2-47bf-860e-58e4ed1c23bf.png',
  '/lovable-uploads/754730fd-1eff-4214-95da-ed5b3ceeaeb6.png',
  '/lovable-uploads/ab47c8b6-7cc0-423e-8d7f-6c6ebade9814.png',
  '/lovable-uploads/65bba15f-20b0-4755-a5e9-ca559041ace8.png',
  '/lovable-uploads/26da03d4-1e8c-454e-8dc0-10b4e60f3473.png',
];

const RotatingBackground: React.FC = () => {
  // Calculate which image to show based on the current date
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    // Get current date and calculate which image to display
    // We use the day of the month modulo number of images
    const today = new Date();
    const dayOfMonth = today.getDate(); // 1-31
    const imageIndex = (dayOfMonth - 1) % backgroundImages.length;
    setCurrentImageIndex(imageIndex);
    
    // For development/testing - change image every 10 seconds
    // Uncomment this to test rotation
    /*
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 10000);
    
    return () => clearInterval(interval);
    */
  }, []);
  
  return (
    <div 
      className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url('${backgroundImages[currentImageIndex]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default RotatingBackground;
