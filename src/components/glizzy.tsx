import { useEffect, useState } from "react";

export default function Page() {
        const [position, setPosition] = useState({ x: 0, y: 0 });

        useEffect(() => {
            const handleMouseMove = (event: MouseEvent) => {
                setPosition({ x: event.clientX, y: event.clientY });
            };

            window.addEventListener('mousemove', handleMouseMove);

            // Cleanup on unmount
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }, []);

    // counts for the times the user crossed each line
    const [crossedUpperLine, setCrossedUpperLine] = useState(Boolean);
    const [crossedLowerLine, setCrossedLowerLine] = useState(Boolean);

    // represents each line
    const TARGET_Y_UPPER = 200;
    const TARGET_Y_LOWER = 800;


    return (
    <>
    
    </>
)}