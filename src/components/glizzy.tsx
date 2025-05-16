"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { Star, Zap, Flame, Trophy, Clock, ArrowUpRight } from "lucide-react"

interface PhysicsBallProps {
    size?: number
    bounciness?: number
    gravity?: number
    friction?: number
    fullScreen?: boolean
}

// Interface for high score entries
interface HighScore {
    score: number
    date: string
    combo: number
}

export const PhysicsBall = ({
                                size = 80,
                                bounciness = 0.7,
                                gravity = 1500,
                                friction = 0.95,
                                fullScreen = false,
                            }: PhysicsBallProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [score, setScore] = useState(0)
    const [combo, setCombo] = useState(0)
    const [multiplier, setMultiplier] = useState(1)
    const [isOnFire, setIsOnFire] = useState(false)
    const [screenShake, setScreenShake] = useState(false)
    const [scorePopups, setScorePopups] = useState<Array<{ id: number; value: number; x: number; y: number }>>([])
    const [comboTimer, setComboTimer] = useState(0)

    // Timer states
    const [gameActive, setGameActive] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(10)
    const [showResults, setShowResults] = useState(false)
    const [isNewHighScore, setIsNewHighScore] = useState(false)
    const [highScores, setHighScores] = useState<HighScore[]>([])
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const gameStartTimeRef = useRef<number>(0)

    const nextPopupId = useRef(0)

    // Performance optimization - throttle visual effects
    const lastParticleTime = useRef(0)
    const lastScreenShakeTime = useRef(0)
    const particleThrottle = 150 // ms between particle bursts
    const screenShakeThrottle = 500 // ms between screen shakes

    // Motion values for position and velocity
    const y = useMotionValue(0)
    const x = useMotionValue(0)
    const velocityY = useRef(0)

    // Add rotation for wiggle effect
    const rotation = useMotionValue(0)
    const springRotation = useSpring(rotation, {
        stiffness: 100,
        damping: 10,
        mass: 1.5,
    })

    // Previous values for calculating changes
    const prevX = useRef(0)
    const prevY = useRef(0)
    const velocityX = useRef(0)
    const lastBounceTime = useRef(0)
    const lastScoreTime = useRef(0)
    const wiggleIntensity = useRef(0)

    // Simple drag counter for guaranteed scoring
    const dragCounter = useRef(0)
    const dragDistance = useRef(0)
    const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Throttle drag events for performance
    const lastDragProcessTime = useRef(0)
    const dragThrottle = 16 // ~60fps

    // Add spring physics to make movement more realistic
    const springY = useSpring(y, { damping: 10, stiffness: 100 })
    const springX = useSpring(x, { damping: 20, stiffness: 200 })

    // Create a shadow that changes with height
    const shadowOpacity = useTransform(springY, [0, 300], [0.2, 0.05])
    const shadowBlur = useTransform(springY, [0, 300], [10, 20])
    const shadowY = useTransform(springY, [0, 300], [0, 15])

    // Load high scores on mount
    useEffect(() => {
        const loadHighScores = () => {
            try {
                const savedScores = localStorage.getItem("glizzyHighScores")
                if (savedScores) {
                    setHighScores(JSON.parse(savedScores))
                }
            } catch (error) {
                console.error("Error loading high scores:", error)
                // Initialize with empty array if there's an error
                setHighScores([])
            }
        }

        loadHighScores()
    }, [])

    // Save high scores when they change
    useEffect(() => {
        if (highScores.length > 0) {
            try {
                localStorage.setItem("glizzyHighScores", JSON.stringify(highScores))
            } catch (error) {
                console.error("Error saving high scores:", error)
            }
        }
    }, [highScores])

    // Timer countdown effect
    useEffect(() => {
        if (gameActive && timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        // Time's up - end the game
                        clearInterval(timerIntervalRef.current!)
                        endGame()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => {
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current)
                }
            }
        }
    }, [gameActive, timeRemaining])

    // Add a useEffect to center the glizzy initially after the component mounts
    // Add this after the other useEffect hooks
    useEffect(() => {
        // Center the glizzy when the component mounts
        if (containerRef.current) {
            const centerX = containerRef.current.clientWidth / 2 - (size * 5) / 2
            const centerY = containerRef.current.clientHeight / 2 - size / 2

            // Set both direct and spring values
            x.set(centerX)
            springX.set(centerX)
            y.set(centerY)
            springY.set(centerY)
        }
    }, [size, x, y, springX, springY])

    // End game and check for high score
    const endGame = () => {
        setGameActive(false)
        setShowResults(true)

        // Check if this is a new high score
        const isNewRecord = checkAndUpdateHighScores()
        setIsNewHighScore(isNewRecord)

        // Reset glizzy position to center of screen
        if (containerRef.current) {
            const centerX = containerRef.current.clientWidth / 2 - (size * 5) / 2
            const centerY = containerRef.current.clientHeight / 2 - size / 2

            // Set both direct and spring values
            x.set(centerX)
            springX.set(centerX)
            y.set(centerY)
            springY.set(centerY)
        }

        velocityY.current = 0
        rotation.set(0)
        springRotation.set(0)

        // Make sure physics simulation stops
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current)
        }
    }

    // Check and update high scores
    const checkAndUpdateHighScores = () => {
        // Create new score entry
        const newScore: HighScore = {
            score,
            date: new Date().toLocaleDateString(),
            combo: combo,
        }

        // Check if this score makes it to the top 5
        const allScores = [...highScores, newScore]
        const sortedScores = allScores.sort((a, b) => b.score - a.score).slice(0, 5)

        // Check if our new score is in the top 5
        const isNewHighScore = sortedScores.some((entry) => entry === newScore)

        // Update high scores
        setHighScores(sortedScores)

        return isNewHighScore
    }

    // Start a new game
    const startNewGame = () => {
        setScore(0)
        setCombo(0)
        setMultiplier(1)
        setIsOnFire(false)
        setTimeRemaining(10)
        setShowResults(false)
        setIsNewHighScore(false)
        gameStartTimeRef.current = Date.now()
        nextPopupId.current = 0  // Reset popup ID counter

        // Reset position to center of screen
        if (containerRef.current) {
            const centerX = containerRef.current.clientWidth / 2 - (size * 5) / 2
            const centerY = containerRef.current.clientHeight / 2 - size / 2

            // Set both direct and spring values
            x.set(centerX)
            springX.set(centerX)
            y.set(centerY)
            springY.set(centerY)
        } else {
            x.set(0)
            springX.set(0)
            y.set(0)
            springY.set(0)
        }

        velocityY.current = 0
        rotation.set(0)
        springRotation.set(0)
    }

    // Calculate glizzy color based on combo
    const glizzyColor = useMemo(() => {
        // Define color progression based on combo count
        if (combo === 0) return "#8B4513" // Default brown

        if (combo < 5) {
            // Slight variation of brown (1-4)
            return "#9B5523"
        } else if (combo < 10) {
            // Reddish brown (5-9)
            return "#A13800"
        } else if (combo < 15) {
            // Red (10-14)
            return "#C62828"
        } else if (combo < 20) {
            // Orange (15-19)
            return "#EF6C00"
        } else if (combo < 25) {
            // Gold (20-24)
            return "#FFC107"
        } else if (combo < 30) {
            // Yellow (25-29)
            return "#FFEB3B"
        } else if (combo < 40) {
            // Green (30-39)
            return "#4CAF50"
        } else if (combo < 50) {
            // Blue (40-49)
            return "#2196F3"
        } else if (combo < 75) {
            // Purple (50-74)
            return "#9C27B0"
        } else if (combo < 100) {
            // Pink (75-99)
            return "#E91E63"
        } else {
            // Rainbow gradient effect for 100+
            return "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)"
        }
    }, [combo])

    // Get color name for display
    const getColorName = (combo: number) => {
        if (combo === 0) return "Regular"
        if (combo < 5) return "Toasted"
        if (combo < 10) return "Seared"
        if (combo < 15) return "Spicy"
        if (combo < 20) return "Hot"
        if (combo < 25) return "Golden"
        if (combo < 30) return "Glowing"
        if (combo < 40) return "Radioactive"
        if (combo < 50) return "Cosmic"
        if (combo < 75) return "Mystical"
        if (combo < 100) return "Legendary"
        return "RAINBOW"
    }

    // Manage combo timer
    useEffect(() => {
        if (combo > 0) {
            setComboTimer(100)
            const interval = setInterval(() => {
                setComboTimer((prev) => {
                    if (prev <= 0) {
                        clearInterval(interval)
                        setCombo(0)
                        setMultiplier(1)
                        return 0
                    }
                    return prev - 1
                })
            }, 30)

            return () => clearInterval(interval)
        }
    }, [combo])

    // Manage score popups - limit and clean up
    useEffect(() => {
        if (scorePopups.length > 0) {
            const timeout = setTimeout(() => {
                // Remove the oldest popups after they've been visible for a while
                setScorePopups((prev) => prev.slice(-10)) // Keep the 10 most recent popups
            }, 800)

            return () => clearTimeout(timeout)
        }
    }, [scorePopups])

    // Manage screen shake
    useEffect(() => {
        if (screenShake) {
            const timeout = setTimeout(() => {
                setScreenShake(false)
            }, 300)

            return () => clearTimeout(timeout)
        }
    }, [screenShake])

    // Add points with visual feedback
    const addPoints = (amount: number, sourceX: number, sourceY: number, reason: string) => {
        const now = performance.now()

        // Update combo
        if (now - lastScoreTime.current < 1000) {
            setCombo((prev) => {
                const newCombo = prev + 1

                // Update multiplier based on combo
                if (newCombo >= 30) {
                    setMultiplier(5)
                    setIsOnFire(true)
                } else if (newCombo >= 20) {
                    setMultiplier(4)
                    setIsOnFire(true)
                } else if (newCombo >= 10) {
                    setMultiplier(3)
                    setIsOnFire(true)
                } else if (newCombo >= 5) {
                    setMultiplier(2)
                    setIsOnFire(false)
                } else {
                    setMultiplier(1)
                    setIsOnFire(false)
                }

                return newCombo
            })
        } else {
            // Reset combo if too much time has passed
            if (combo > 5) {
                // Add score popup for broken combo - limit popups for performance
                if (scorePopups.length < 10) {
                    setScorePopups((prev) => [
                        ...prev.slice(-9), // Keep only the 9 most recent popups
                        {
                            id: nextPopupId.current++,
                            value: -combo,
                            x: sourceX,
                            y: sourceY - 40,
                        },
                    ])
                }
            }

            setCombo(1)
            setMultiplier(1)
            setIsOnFire(false)
        }

        lastScoreTime.current = now

        // Apply multiplier to score
        const pointsToAdd = amount * multiplier

        // Add to score
        setScore((prev) => prev + pointsToAdd)

        // Add score popup - limit popups for performance
        if (scorePopups.length < 10) {
            setScorePopups((prev) => [
                ...prev.slice(-9), // Keep only the 9 most recent popups
                {
                    id: nextPopupId.current++,
                    value: pointsToAdd,
                    x: sourceX,
                    y: sourceY,
                },
            ])
        }

        // Add screen shake for big points - throttled
        if (pointsToAdd >= 20 && now - lastScreenShakeTime.current > screenShakeThrottle) {
            setScreenShake(true)
            lastScreenShakeTime.current = now
        }
    }

    // Super enhanced scoring based on drag events - with throttling
    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
        const now = performance.now()

        // Start the game if this is the first interaction
        if (!gameActive) {
            setGameActive(true)
            gameStartTimeRef.current = Date.now()
        }

        // Throttle drag processing for performance
        if (now - lastDragProcessTime.current < dragThrottle) {
            return
        }
        lastDragProcessTime.current = now

        // Calculate current position
        const currentX = x.get()
        const currentY = y.get()

        // Increment counter on every drag event
        dragCounter.current += 1

        // Add distance moved
        const distanceMoved = Math.abs(info.delta.x) + Math.abs(info.delta.y)
        dragDistance.current += distanceMoved

        // Update wiggle intensity based on velocity
        wiggleIntensity.current = Math.min(1, Math.max(0, Math.abs(info.velocity.x) / 1000))

        // Add points every 5 drag events
        if (dragCounter.current % 5 === 0) {
            addPoints(1, currentX, currentY, "drag")
        }

        // Add bonus points for significant movement
        if (dragDistance.current > 50) {
            const points = Math.min(10, Math.max(3, Math.floor(dragDistance.current / 20)))
            addPoints(points, currentX, currentY, "distance")
            dragDistance.current = 0
        }

        // Add bonus points for fast movement - less frequently
        const speed = Math.sqrt(info.velocity.x * info.velocity.x + info.velocity.y * info.velocity.y)
        if (speed > 500 && dragCounter.current % 10 === 0) {
            const speedPoints = Math.min(15, Math.floor(speed / 100))
            addPoints(speedPoints, currentX, currentY, "speed")
        }

        // Set rotation for visual feedback
        rotation.set(info.delta.x * 2)
    }

    // Handle physics simulation when ball is released
    const startPhysics = () => {
        if (!containerRef.current) return

        const containerHeight = containerRef.current.clientHeight
        const ballBottom = containerHeight - size

        let lastY = y.get()
        let lastTime = performance.now()

        const updatePhysics = () => {
            if (isDragging) return

            const now = performance.now()
            const deltaTime = (now - lastTime) / 1000 // Convert to seconds
            lastTime = now

            // Apply gravity
            velocityY.current += gravity * deltaTime

            // Update position
            let newY = y.get() + velocityY.current * deltaTime

            // Check for collision with bottom
            if (newY >= ballBottom) {
                newY = ballBottom
                velocityY.current = -velocityY.current * bounciness

                // Apply friction on bounce
                const vx = (x.get() - springX.get()) * friction
                x.set(x.get() + vx * deltaTime)

                // Add some rotation on bounce for more dynamic movement
                rotation.set(rotation.get() + vx * 0.1)

                // Add points for bouncing - simple fixed amount
                const now = performance.now()
                if (now - lastBounceTime.current > 300) {
                    const bounceForce = Math.abs(velocityY.current)
                    const bouncePoints = Math.min(30, Math.max(10, Math.floor(bounceForce / 100)))
                    addPoints(bouncePoints, x.get(), newY, "bounce")
                    lastBounceTime.current = now
                }
            }

            // Apply friction in the air (less than on bounce)
            velocityY.current *= 0.995

            // When not dragging, gradually return to 0 rotation
            rotation.set(rotation.get() * 0.9)

            // Stop simulation if movement is very small
            if (Math.abs(newY - lastY) < 0.1 && Math.abs(velocityY.current) < 10 && newY >= ballBottom - 1) {
                velocityY.current = 0
                newY = ballBottom
                return
            }

            lastY = newY
            y.set(newY)

            requestAnimationFrame(updatePhysics)
        }

        requestAnimationFrame(updatePhysics)
    }

    // Calculate screen shake offset - optimized to avoid layout thrashing
    const getScreenShakeStyle = () => {
        if (!screenShake) return {}

        return {
            transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`,
        }
    }

    // Get timer color based on time remaining
    const getTimerColor = () => {
        if (timeRemaining <= 3) return "bg-red-500"
        if (timeRemaining <= 5) return "bg-yellow-500"
        return "bg-green-500"
    }

    return (
        <div
            ref={containerRef}
            className={`relative bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden ${
                fullScreen ? "w-screen h-screen" : "w-full h-[500px] rounded-lg border border-gray-700"
            }`}
            style={{
                touchAction: "none",
                ...getScreenShakeStyle(),
            }}
        >
            {/* Timer display */}
            <div className="absolute top-0 left-0 right-0 p-3 z-30 flex justify-center items-start pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border border-gray-700">
                    <div className="flex items-center gap-2">
                        <Clock className="text-gray-400" size={18} />
                        <div className="text-sm font-semibold text-gray-400">TIME</div>
                    </div>
                    <div
                        className={`text-4xl font-bold text-center ${
                            timeRemaining <= 3 ? "text-red-500" : timeRemaining <= 5 ? "text-yellow-400" : "text-white"
                        }`}
                    >
                        {timeRemaining}
                    </div>
                    <div className="w-full bg-gray-700 h-2 mt-1 rounded-full overflow-hidden">
                        <div className={`h-full ${getTimerColor()}`} style={{ width: `${(timeRemaining / 10) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Score display */}
            <div className="absolute top-0 left-0 p-3 z-20 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border border-gray-700">
                    <div className="text-sm font-semibold text-gray-400 text-center">SCORE</div>
                    <div className="text-4xl font-bold text-center text-white">{score.toLocaleString()}</div>
                </div>
            </div>

            {/* Combo display */}
            <div className="absolute top-0 right-0 p-3 z-20 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border border-gray-700">
                    <div className="text-sm font-semibold text-gray-400 text-center">COMBO</div>
                    <div className="flex items-center gap-2">
                        <div className="text-4xl font-bold text-center text-white">{combo}x</div>
                        <div className={`text-2xl font-bold ${multiplier > 1 ? "text-yellow-400" : "text-gray-500"}`}>
                            {multiplier}x
                        </div>
                    </div>
                    {combo > 0 && (
                        <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${comboTimer}%` }}
                            />
                        </div>
                    )}
                    <div className="text-xs text-center mt-1" style={{ color: combo >= 100 ? "#FFFFFF" : glizzyColor }}>
                        {getColorName(combo)}
                    </div>
                </div>
            </div>

            {/* Score popups - limited for performance */}
            <AnimatePresence>
                {scorePopups.slice(-5).map((popup) => (
                    <motion.div
                        key={popup.id}
                        className={`absolute font-bold text-xl z-50 pointer-events-none ${
                            popup.value < 0 ? "text-red-500" : popup.value >= 20 ? "text-yellow-400" : "text-white"
                        }`}
                        style={{
                            x: popup.x,
                            y: popup.y,
                            textShadow: "0 0 5px rgba(0,0,0,0.5)",
                        }}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{
                            opacity: 0,
                            scale: 1.5,
                            y: popup.y - 80,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {popup.value > 0 ? `+${popup.value}` : popup.value}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Game over / Results screen */}
            <AnimatePresence>
                {showResults && (
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold text-center text-white mb-2">Times Up</h2>

                            {isNewHighScore && (
                                <motion.div
                                    className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-center py-2 px-4 rounded-lg mb-4 flex items-center justify-center gap-2"
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: [0.8, 1.1, 1] }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    <Trophy size={20} />
                                    <span>NEW HIGH SCORE!</span>
                                </motion.div>
                            )}

                            <div className="text-center mb-6">
                                <div className="text-gray-300 mb-1">Your Score</div>
                                <div className="text-5xl font-bold text-white">{score.toLocaleString()}</div>
                                <div className="text-gray-400 mt-2">Max Combo: {combo}x</div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                    <Trophy className="text-yellow-500" size={20} />
                                    <span>High Scores</span>
                                </h3>
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    {highScores.length > 0 ? (
                                        <table className="w-full">
                                            <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="py-2 px-3 text-left text-gray-400 font-medium">#</th>
                                                <th className="py-2 px-3 text-left text-gray-400 font-medium">Score</th>
                                                <th className="py-2 px-3 text-left text-gray-400 font-medium">Combo</th>
                                                <th className="py-2 px-3 text-left text-gray-400 font-medium">Date</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {highScores.map((entry, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b border-gray-800 ${
                                                        entry.score === score && isNewHighScore ? "bg-yellow-900/30" : ""
                                                    }`}
                                                >
                                                    <td className="py-2 px-3 text-gray-300">{index + 1}</td>
                                                    <td className="py-2 px-3 font-bold text-white">{entry.score.toLocaleString()}</td>
                                                    <td className="py-2 px-3 text-gray-300">{entry.combo}x</td>
                                                    <td className="py-2 px-3 text-gray-400 text-sm">{entry.date}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-gray-400 text-center py-4">No high scores yet</div>
                                    )}
                                </div>
                            </div>

                            <button
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                onClick={() => {
                                    startNewGame()
                                    setGameActive(false) // Will start when user interacts
                                }}
                            >
                                <ArrowUpRight size={20} />
                                <span>Play Again</span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glizzy */}
            <motion.div
                drag
                dragElastic={0.1}
                dragMomentum={false}
                dragConstraints={containerRef}
                style={{
                    x: springX,
                    y: springY,
                    zIndex: 30,
                }}
                onDrag={handleDrag}
                onDragStart={() => {
                    setIsDragging(true)
                    velocityY.current = 0
                    prevX.current = x.get()
                    prevY.current = y.get()

                    // Start the game if this is the first interaction
                    if (!gameActive) {
                        setGameActive(true)
                        gameStartTimeRef.current = Date.now()
                    }

                    // Add points on drag start
                    addPoints(5, x.get(), y.get(), "drag start")
                }}
                onDragEnd={() => {
                    setIsDragging(false)
                    startPhysics()

                    // Add points on drag end
                    addPoints(5, x.get(), y.get(), "drag end")

                    // Reset drag counter
                    dragCounter.current = 0
                    dragDistance.current = 0
                }}
                className="absolute touch-none cursor-grab active:cursor-grabbing z-30"
                whileTap={{ scale: 1.05 }}
            >
                {/* Shadow */}
                <motion.div
                    className="absolute bg-black"
                    style={{
                        width: size * 4,
                        height: size * 0.2,
                        x: size * 0.5,
                        y: shadowY,
                        opacity: shadowOpacity,
                        filter: `blur(${shadowBlur}px)`,
                        borderRadius: size / 4,
                    }}
                />

                {/* Sausage */}
                <motion.div
                    style={{
                        width: size * 5,
                        height: size,
                        background: combo >= 100 ? glizzyColor : "none",
                        backgroundColor: combo < 100 ? glizzyColor : "none",
                        borderRadius: size / 2,
                        rotate: springRotation,
                        transformOrigin: "center center",
                        boxShadow: isOnFire
                            ? "0 0 20px #ef4444, 0 0 40px #f97316"
                            : multiplier > 1
                                ? "0 0 15px rgba(250, 204, 21, 0.7)"
                                : "none",
                        transition: "background-color 0.3s, background 0.3s, box-shadow 0.3s",
                    }}
                    className="pointer-events-auto relative overflow-hidden"
                >
                    {/* Fire effect when on fire - simplified for performance */}
                    {isOnFire && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="absolute"
                                animate={{
                                    y: [0, -10, 0],
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                }}
                            >
                                <Flame className="text-orange-500" size={30} style={{ filter: "blur(2px)" }} />
                            </motion.div>
                        </div>
                    )}

                    {/* Glow effect when combo active - simplified for performance */}
                    {multiplier > 1 && !isOnFire && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="absolute"
                                animate={{
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                }}
                            >
                                <Star className="text-yellow-400" size={20} style={{ filter: "blur(1px)" }} />
                            </motion.div>
                        </div>
                    )}

                    {/* Rainbow animation for 100+ combo */}
                    {combo >= 100 && (
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                background: [
                                    "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)",
                                    "linear-gradient(180deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)",
                                    "linear-gradient(270deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)",
                                    "linear-gradient(360deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)",
                                    "linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)",
                                ],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                            style={{
                                borderRadius: size / 2,
                            }}
                        />
                    )}
                </motion.div>
            </motion.div>

            {/* Instructions */}
            {!gameActive && !showResults && (
                <div className="absolute top-32 left-0 right-0 flex justify-center z-40 pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-sm px-6 py-4 rounded-xl text-white text-center max-w-md mx-4 border border-gray-700 shadow-lg">
                        <h2 className="text-2xl font-bold mb-2">Wiggle the Glizzy!</h2>
                        <p className="mb-4">Drag the glizzy to score points. You have 10 seconds!</p>
                        <div className="inline-block bg-white/20 rounded-lg px-4 py-2">Tap and drag to start</div>
                    </div>
                </div>
            )}

            {gameActive && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                        Wiggle faster for more points! <Zap className="inline-block ml-1 text-yellow-400" size={16} />
                    </div>
                </div>
            )}
        </div>
    )
}
