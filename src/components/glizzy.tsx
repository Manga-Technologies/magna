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
    return (
    <>
    
    </>
)}