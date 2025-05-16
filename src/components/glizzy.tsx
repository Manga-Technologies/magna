import { useEffect, useState } from "react";

export default function Page() {

    const [position, setPosition] = useState({ x: 0, y: 0 });    // counts for the times the user crossed each line
    const [crossedUpperLine, setCrossedUpperLine] = useState(false);
    const [crossedLowerLine, setCrossedLowerLine] = useState(false);

    const [points, setPoints] = useState(0);

    // represents each line
    const TARGET_Y_UPPER = 200;
    const TARGET_Y_LOWER = 800;

    // when mouse moves
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