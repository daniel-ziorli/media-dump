import React, { useEffect, useState } from "react";
import { AnimatedDropzone } from "./dropzone-animation";

const Dropzone: React.FC = () => {
    const [targetTransparency, setTargetTransparency] = useState(0.0);

    const [transparency, setTransparency] = useState(0.0);

    useEffect(() => {

        const lerp = (start: number, end: number, t: number) => start + t * (end - start);

        const animate = (startTime: number) => {
            const duration = 100; // animation duration in milliseconds
            const startTransparency = transparency; // assuming currentTransparency is the current transparency value

            const animateStep = (currentTime: number) => {
                let t = (currentTime - startTime) / duration;
                if (t > 1) t = 1; // clamp t to 1 to prevent overshooting

                const newTransparency = lerp(startTransparency, targetTransparency, t);
                setTransparency(newTransparency);

                if (t < 1) {
                    requestAnimationFrame(animateStep);
                }
            };

            requestAnimationFrame(animateStep);
        };

        animate(performance.now());


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetTransparency]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setTargetTransparency(0.9);
    };

    const handleDragLeave = () => {
        setTargetTransparency(0.0);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setTargetTransparency(0.0);

        if (e.dataTransfer.files) {
            Array.from(e.dataTransfer.files).forEach((file) => {
                console.log(file);
            });
        }
    };

    return (
        <>
            <AnimatedDropzone transparency={transparency} />
            <div
                className={`fixed inset-0 flex items-center justify-center transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <p>Drag and drop files here</p>
            </div>
        </>

    );
};

export default Dropzone;
