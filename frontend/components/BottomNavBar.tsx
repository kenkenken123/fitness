"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, Dumbbell, MapPin, User } from "lucide-react"
import { BottomNavigation, BottomNavigationAction } from "@mui/material"

export default function BottomNavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [value, setValue] = React.useState(pathname)

  React.useEffect(() => {
    setValue(pathname)
  }, [pathname])

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
    router.push(newValue)
  }

  // 隐藏导航栏的路径
  const hiddenPaths = ["/", "/login"]
  if (hiddenPaths.includes(pathname)) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200 md:hidden">
      <BottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction
          label="首页"
          value="/home"
          icon={<Home className="w-5 h-5" />}
          className="text-gray-600 data-[selected=true]:text-orange-500"
        />
        <BottomNavigationAction
          label="训练"
          value="/training"
          icon={<Dumbbell className="w-5 h-5" />}
          className="text-gray-600 data-[selected=true]:text-orange-500"
        />
        <BottomNavigationAction
          label="地址"
          value="/locations"
          icon={<MapPin className="w-5 h-5" />}
          className="text-gray-600 data-[selected=true]:text-orange-500"
        />
        <BottomNavigationAction
          label="我的"
          value="/profile"
          icon={<User className="w-5 h-5" />}
          className="text-gray-600 data-[selected=true]:text-orange-500"
        />
      </BottomNavigation>
    </div>
  )
}
