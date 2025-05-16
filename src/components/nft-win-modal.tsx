"use client"

import { useState } from "react"
import { XMarkIcon, TrophyIcon } from "@heroicons/react/24/outline"

export default function NFTWinModal() {
    const [isOpen, setIsOpen] = useState(false)

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    return (
        <div className="flex items-center justify-center">
            {/* Trigger Button */}
            <button
                onClick={openModal}
                className="px-6 py-3 font-medium text-white rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                Reveal Prize
            </button>

            {/* Modal Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
                    {/* Modal Container */}
                    <div className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-black text-white shadow-2xl animate-fadeIn">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute right-4 top-4 p-1 rounded-full bg-zinc-800/50 hover:bg-zinc-700/70 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5 text-zinc-400" />
                            <span className="sr-only">Close</span>
                        </button>

                        {/* Trophy Icon */}
                        <div className="flex justify-center -mt-6 pt-12">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                                <TrophyIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="px-6 pt-6 pb-8 text-center">
                            <h3 className="text-xl font-bold mb-1">Congratulations!</h3>
                            <p className="text-zinc-400 mb-6">You've won an exclusive NFT</p>

                            {/* NFT Image */}
                            <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden border border-zinc-800 shadow-xl mb-6">
                                <img src="/placeholder-32w87.png" alt="Your new NFT" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-2 left-2 text-xs font-medium bg-black/50 px-2 py-1 rounded-full">
                                    #4289
                                </div>
                            </div>

                            {/* Claim Button */}
                            <button
                                onClick={closeModal}
                                className="w-full py-3 font-medium text-white rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                            >
                                Claim Your NFT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
