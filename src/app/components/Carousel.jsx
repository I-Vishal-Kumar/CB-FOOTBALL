"use client"
// components/Carousel.js
import React, { useEffect, useRef } from 'react';
import Flickity from 'flickity';
import 'flickity/css/flickity.css';

const Carousel = ({ children }) => {
  const carouselRef = useRef(null);

  useEffect(() => {
    if (carouselRef.current) {
      // Initialize Flickity when the component mounts
      const flkty = new Flickity(carouselRef.current, {
        pageDots: false,
        autoPlay: true,
        prevNextButtons: false,
        // Add your Flickity options here
        // For example:
        // cellAlign: 'left',
        // contain: true,
      });

      // Ensure to destroy Flickity when the component unmounts
      return () => {
        flkty.destroy();
      };
    }
  }, []);

  return <div className="main-carousel" ref={carouselRef}>{children}</div>;
};

export default Carousel;
