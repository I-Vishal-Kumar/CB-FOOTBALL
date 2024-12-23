import React from "react";
import { Carousel } from "react-responsive-carousel";
import styles from "react-responsive-carousel/lib/styles/carousel.min.css";

const DemoCarousel = () => {
    return (
        <Carousel showArrows={false} autoPlay={true} infiniteLoop>
            <div>
                <img
                    src="carousel-1.png"
                    alt="Slide 1"
                    className="rounded-2xl"
                />
            </div>

            <div>
                <img
                    src="carousel-2.png"
                    alt="Slide 3"
                    className="rounded-2xl"
                />
            </div>

            <div>
                <img
                    src="carousel-3.png"
                    alt="Slide 4"
                    className="rounded-2xl"
                />
            </div>

            <div>
                <img
                    src="carousel-4.png"
                    alt="Slide 4"
                    className="rounded-2xl"
                />
            </div>

            <div>
                <img
                    src="carousel-5.png"
                    alt="Slide 4"
                    className="rounded-2xl"
                />
            </div>
        </Carousel>
    );
};

export default DemoCarousel;
