"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2, Home, Building, Trees, Dumbbell } from "lucide-react"

const Locations = () => {
  const [locations, setLocations] = useState([
    { id: 1, name: "健身房A", type: "gym", address: "市中心健身中心", lastUsed: "2024-01-15" },
    { id: 2, name: "家里", type: "home", address: "我的家", lastUsed: "2024-01-14" },
    { id: 3, name: "公园", type: "outdoor", address: "中央公园", lastUsed: "2024-01-10" },
  ])
  const [open, setOpen] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({ id: null, name: "", type: "gym", address: "" })

  const locationTypes = [
    { value: "gym", label: "健身房", icon: Dumbbell, color: "bg-blue-100 text-blue-800" },
    { value: "home", label: "家里", icon: Home, color: "bg-green-100 text-green-800" },
    { value: "outdoor", label: "户外", icon: Trees, color: "bg-orange-100 text-orange-800" },
    { value: "other", label: "其他", icon: Building, color: "bg-gray-100 text-gray-800" },
  ]

  const getLocationTypeInfo = (type) => {
    return locationTypes.find((t) => t.value === type) || locationTypes[3]
  }

  const handleOpen = (location = { id: null, name: "", type: "gym", address: "" }) => {
    setCurrentLocation(location)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setCurrentLocation({ id: null, name: "", type: "gym", address: "" })
  }

  const handleSave = async () => {
    if (currentLocation.id) {
      // 更新现有地址
      setLocations(locations.map((loc) => (loc.id === currentLocation.id ? currentLocation : loc)))
    } else {
      // 添加新地址
      const newLocation = {
        ...currentLocation,
        id: Date.now(),
        lastUsed: new Date().toISOString().split("T")[0],
      }
      setLocations([...locations, newLocation])
    }
    handleClose()
  }

  const handleDelete = async (id) => {
    setLocations(locations.filter((loc) => loc.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">训练地址</h1>
            <p className="text-green-100 mt-1">管理您的训练场所</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 地址列表 */}
        <div className="space-y-4 mb-6">
          {locations.map((location) => {
            const typeInfo = getLocationTypeInfo(location.type)
            const IconComponent = typeInfo.icon

            return (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{location.name}</h3>
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{location.address}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          最后使用: {new Date(location.lastUsed).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(location)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">还没有训练地址</h3>
            <p className="text-gray-500">添加您的第一个训练场所吧！</p>
          </div>
        )}

        {/* 添加按钮 */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpen()}
              className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{currentLocation.id ? "编辑地址" : "添加新地址"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">地址名称</Label>
                <Input
                  id="name"
                  placeholder="请输入地址名称"
                  value={currentLocation.name}
                  onChange={(e) =>
                    setCurrentLocation({
                      ...currentLocation,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">详细地址</Label>
                <Input
                  id="address"
                  placeholder="请输入详细地址"
                  value={currentLocation.address}
                  onChange={(e) =>
                    setCurrentLocation({
                      ...currentLocation,
                      address: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>地址类型</Label>
                <div className="grid grid-cols-2 gap-2">
                  {locationTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <Button
                        key={type.value}
                        variant={currentLocation.type === type.value ? "default" : "outline"}
                        className="h-12 flex-col gap-1"
                        onClick={() =>
                          setCurrentLocation({
                            ...currentLocation,
                            type: type.value,
                          })
                        }
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                取消
              </Button>
              <Button onClick={handleSave} className="flex-1">
                保存
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Locations
