"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Home, Dumbbell, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BottomNavBar() {
  const pathname = usePathname()
  const router = useRouter()

  // 隐藏导航栏的路径
  const hiddenPaths = ["/", "/login"]
  if (hiddenPaths.includes(pathname)) {
    return null
  }

  const navItems = [
    { label: "首页", path: "/home", icon: Home, color: "text-candy-pink" },
    { label: "训练", path: "/training", icon: Dumbbell, color: "text-candy-mint" },
    { label: "地址", path: "/locations", icon: MapPin, color: "text-candy-blue" },
    { label: "我的", path: "/profile", icon: User, color: "text-candy-lavender" },
  ]

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 md:hidden">
      <nav className="mx-auto max-w-sm rounded-[2rem] bg-white/90 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-2 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground scale-110 shadow-md"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "animate-bounce-short")} />
              {/* <span className="text-[10px] font-medium mt-1">{item.label}</span> */}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
