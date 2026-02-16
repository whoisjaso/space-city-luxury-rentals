import { useState, useRef, useCallback } from 'react';

// ---------------------------------------------------------------
// ImageGallery — hero image with optional thumbnail navigation.
// Shows a large hero image and, if multiple images exist, a
// clickable thumbnail strip below with gold-highlighted active.
// ---------------------------------------------------------------

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const hasMultiple = images.length > 1;

  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (index === activeIndex || isTransitioning) return;
      setIsTransitioning(true);
      // Brief opacity fade for smooth transition
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 200);
    },
    [activeIndex, isTransitioning],
  );

  return (
    <div className="bg-[#0a0a0a] rounded-xl overflow-hidden">
      {/* Hero image */}
      <div ref={heroRef} className="relative w-full aspect-[16/9] overflow-hidden">
        <img
          src={images[activeIndex] || '/images/placeholder-vehicle.jpg'}
          alt={`${alt} — image ${activeIndex + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Subtle bottom gradient for visual separation */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>

      {/* Thumbnail strip — only when multiple images */}
      {hasMultiple && (
        <div className="flex gap-3 p-4 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                i === activeIndex
                  ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                  : 'border-white/10 hover:border-white/30'
              }`}
              aria-label={`View image ${i + 1} of ${images.length}`}
            >
              <img
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
