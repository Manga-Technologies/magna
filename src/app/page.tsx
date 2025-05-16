import { PhysicsBall } from "@/components/glizzy"

export default function Home() {
  return (
      <div className="h-screen w-screen overflow-hidden">
        <PhysicsBall fullScreen={true} />
      </div>
  )
}
