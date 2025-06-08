import React, { useState, useEffect } from 'react';
import { DEFAULT_PORTRAIT, DEFAULT_PIN } from '@/lib/image-helpers';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  imageType?: 'pin' | 'portrait' | 'default';
  aspectRatio?: number;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = "Image", 
  fallbackSrc,
  className = "",
  objectFit = "cover",
  imageType = "default",
  aspectRatio,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc || DEFAULT_PORTRAIT);
  
  // Reset when src prop changes
  useEffect(() => {
    setImgSrc(src || fallbackSrc || DEFAULT_PORTRAIT);
  }, [src, fallbackSrc]);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log("Image failed to load:", imgSrc);
    
    // Fallback to the appropriate default
    const defaultSrc = fallbackSrc || (imageType === 'pin' ? DEFAULT_PIN : DEFAULT_PORTRAIT);
    console.log("Using default:", defaultSrc);
    setImgSrc(defaultSrc);
  };

  // Apply specific styling based on image type
  let imageClassName = className;
  
  if (imageType === 'pin') {
    imageClassName = `${className} w-full h-full object-contain`;
  } else if (imageType === 'portrait') {
    imageClassName = `${className} w-full h-full object-cover`;
  } else {
    imageClassName = `${className} object-${objectFit}`;
  }

  const renderImage = () => (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={imageClassName}
      loading="lazy"
      {...props}
    />
  );

  // If aspectRatio is provided, wrap in AspectRatio component
  if (aspectRatio) {
    return (
      <AspectRatio ratio={aspectRatio} className="overflow-hidden">
        {renderImage()}
      </AspectRatio>
    );
  }

  return renderImage();
};

export default Image;
