import { PhysicsBall } from "@/components/glizzy"
import { HatWardrobeModal } from "@/components/hat-wardrobe-modal"

export default function Home() {
  return (
      <div className="h-screen w-screen overflow-hidden">
        <PhysicsBall fullScreen={true} />
        <div className="fixed bottom-6 right-6 z-10">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20">
            <HatWardrobeModal />
          </div>
        </div>
      </div>
  )
}
