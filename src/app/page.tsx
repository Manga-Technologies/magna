import { PhysicsBall } from "@/components/glizzy"
import { HatWardrobeModal } from "@/components/hat-wardrobe-modal"

export default function Home() {
  return (
      <div className="h-screen w-screen overflow-hidden">
        <PhysicsBall fullScreen={true} />
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <HatWardrobeModal />
        </div>
      </div>
  )
}
