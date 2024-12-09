import React, { useState } from "react";
import { AnimatedDropzone } from "./dropzone-animation";

const Dropzone: React.FC = () => {
    const [transparency, setTransparency] = useState(0.0);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setTransparency(1.0);
    };

    const handleDragLeave = () => {
        setTransparency(0.0);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setTransparency(0.0);

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
