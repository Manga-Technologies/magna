"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check, Crown } from "lucide-react"
import Image from "next/image"
import gsap from "gsap"

type Hat = {
    id: number
    name: string
    image: string
    color?: string
}

const hats: Hat[] = [
    { id: 1, name: "Baseball Cap", image: "", color: "Blue" },
    { id: 2, name: "Beanie", image: "", color: "Gray" },
    { id: 3, name: "Fedora", image: "", color: "Black" },
    { id: 4, name: "Bucket Hat", image: "", color: "Beige" },
    { id: 5, name: "Sun Hat", image: "", color: "Straw" },
    { id: 6, name: "Cowboy Hat", image: "", color: "Brown" },
    { id: 7, name: "Beret", image: "", color: "Red" },
    { id: 8, name: "Straw Hat", image: "", color: "Natural" },
]

export function HatWardrobeModal() {
    const [open, setOpen] = useState(false)
    const [selectedHat, setSelectedHat] = useState<Hat | null>(null)
    const [isClosing, setIsClosing] = useState(false)
    const [animationComplete, setAnimationComplete] = useState(false)
    const lastFocusedElementRef = useRef<HTMLElement | null>(null)
    const selectedHatRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const successRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)

    // Save the last focused element when opening the modal
    useEffect(() => {
        if (open) {
            lastFocusedElementRef.current = document.activeElement as HTMLElement
            // Reset states when opening
            setSelectedHat(null)
            setAnimationComplete(false)

            // Animate modal opening
            if (modalRef.current) {
                gsap.fromTo(
                    modalRef.current,
                    {
                        opacity: 0,
                        y: 50,
                        x: 50,
                        scale: 0.95,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        x: 0,
                        scale: 1,
                        duration: 0.4,
                        ease: "power2.out",
                        clearProps: "all", // Important to prevent positioning issues
                    },
                )
            }
        } else if (lastFocusedElementRef.current && !open && !isClosing) {
            // Restore focus when modal is fully closed
            lastFocusedElementRef.current.focus()
        }
    }, [open, isClosing])

    // Scroll selected hat into view
    useEffect(() => {
        if (selectedHat && selectedHatRef.current) {
            selectedHatRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            })

            // Animate selection
            gsap.fromTo(
                selectedHatRef.current,
                { scale: 1 },
                {
                    scale: 1.05,
                    duration: 0.2,
                    ease: "power1.out",
                    yoyo: true,
                    repeat: 1,
                },
            )
        }
    }, [selectedHat])

    // Handle animation transitions between button and success state
    useEffect(() => {
        if (animationComplete && successRef.current && buttonRef.current) {
            gsap.to(buttonRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    gsap.fromTo(
                        successRef.current!,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
                    )
                },
            })
        }
    }, [animationComplete])

    const handleSelect = () => {
        if (selectedHat && modalRef.current) {
            setIsClosing(true)
            setAnimationComplete(true)

            // Animate modal closing with slide down
            gsap.to(modalRef.current, {
                opacity: 0,
                y: 50,
                x: 50,
                scale: 0.9,
                duration: 0.6,
                ease: "power2.in",
                onComplete: () => {
                    setOpen(false)
                    setIsClosing(false)
                    console.log(`Selected hat: ${selectedHat.name} (${selectedHat.color})`)
                },
            })
        }
    }

    const animateHatSelection = (element: HTMLDivElement) => {
        gsap.fromTo(element, { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "back.out(1.5)" })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (isClosing) return // Prevent changing state during animation
                setOpen(newOpen)
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="relative px-6 py-3 text-base font-medium transition-all duration-300 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white hover:bg-white/15 hover:scale-105 flex items-center justify-center"
                    onClick={() => {
                        gsap.to(document.body, { duration: 0.01 }) // Initialize GSAP
                    }}
                >
                    <Crown className="mr-2 h-5 w-5" />
                    Choose a Hat
                </Button>
            </DialogTrigger>

            {open && (
                <DialogContent
                    className="sm:max-w-[700px] p-0 overflow-hidden rounded-xl border-none shadow-2xl fixed bottom-6 right-6 transform-none"
                    onCloseAutoFocus={(e) => {
                        // Prevent the default focus behavior
                        e.preventDefault()
                    }}
                >
                    <div
                        ref={modalRef}
                        className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 w-full"
                    >
                        <DialogHeader className="p-6 pb-2 relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-t-xl" />
                            <DialogTitle className="text-2xl font-bold text-center mt-2">Hat Collection</DialogTitle>
                            <p className="text-center text-muted-foreground mt-2">Select a hat from your virtual wardrobe</p>
                        </DialogHeader>

                        <div className="p-6 pt-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                {hats.map((hat) => {
                                    const isSelected = selectedHat?.id === hat.id
                                    return (
                                        <div
                                            key={hat.id}
                                            ref={isSelected ? selectedHatRef : null}
                                            className={cn(
                                                "relative cursor-pointer rounded-lg p-2 transition-all duration-200",
                                                isSelected
                                                    ? "ring-2 ring-primary bg-primary/10 shadow-md"
                                                    : "border hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm",
                                            )}
                                            onClick={(e) => {
                                                setSelectedHat(hat)
                                                animateHatSelection(e.currentTarget)
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-pressed={isSelected}
                                            aria-label={`Select ${hat.name} in ${hat.color}`}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    setSelectedHat(hat)
                                                    animateHatSelection(e.currentTarget)
                                                    e.preventDefault()
                                                }
                                            }}
                                        >
                                            <div className="aspect-square relative overflow-hidden rounded-md mb-2 bg-white dark:bg-gray-800 shadow-sm">
                                                <Image
                                                    src={hat.image || "/placeholder.svg"}
                                                    alt={hat.name}
                                                    fill
                                                    className={cn("object-cover transition-all duration-300", isSelected ? "scale-105" : "")}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />

                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                            <Check className="w-5 h-5 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-center font-medium">{hat.name}</p>
                                                {hat.color && <p className="text-center text-xs text-muted-foreground">{hat.color}</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center mt-6 h-[100px] relative">
                                <div
                                    ref={buttonRef}
                                    className="absolute left-1/2 transform -translate-x-1/2"
                                    style={{ display: animationComplete ? "none" : "block" }}
                                >
                                    <Button
                                        onClick={handleSelect}
                                        disabled={!selectedHat}
                                        className={cn(
                                            "px-8 py-6 text-lg font-medium transition-all duration-300",
                                            selectedHat 
                                                ? "bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 text-white hover:bg-white/15 hover:scale-105" 
                                                : "bg-gray-300/50 text-gray-500 cursor-not-allowed rounded-full"
                                        )}
                                        size="lg"
                                    >
                                        {selectedHat ? `Select ${selectedHat.name}` : "Select a Hat"}
                                    </Button>
                                </div>

                                <div
                                    ref={successRef}
                                    className="flex flex-col items-center absolute left-1/2 transform -translate-x-1/2"
                                    style={{ opacity: 0, display: animationComplete ? "flex" : "none" }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg border border-white/30">
                                        <Check className="w-7 h-7 text-white" />
                                    </div>
                                    <p className="text-white font-medium text-lg backdrop-blur-sm px-4 py-2 rounded-full bg-white/10">Hat selected!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    )
}
