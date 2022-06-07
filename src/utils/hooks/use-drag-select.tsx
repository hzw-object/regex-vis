import { useState, useRef } from "react"
import { useEvent } from "react-use"

function captureClick(e: MouseEvent) {
  e.stopPropagation()
  window.removeEventListener("click", captureClick, true)
}

type Options = {
  disabled?: boolean
  style?: React.CSSProperties
}
export const useDragSelect = ({
  disabled = false,
  style = {},
}: Options = {}) => {
  const dragging = useRef(false)
  const moving = useRef(false)
  const start = useRef<[number, number]>([0, 0])
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging.current) {
      return
    }
    // should fire onMouseMove at least once
    if (!moving.current) {
      dragging.current = false
      return
    }
    const { width, height } = rect
    if (width > 5 && height > 5) {
      // prevent click event on node
      window.addEventListener("click", captureClick, true)
      // TODO
    }
    dragging.current = false
    moving.current = false
    setRect({ x: 0, y: 0, width: 0, height: 0 })
  }

  useEvent("mouseup", handleMouseUp)

  const bindings = {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }
      const { offsetX, offsetY } = e.nativeEvent
      dragging.current = true
      start.current = [offsetX, offsetY]
    },
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragging.current) {
        return
      }
      moving.current = true
      const { offsetX, offsetY } = e.nativeEvent
      const x = offsetX > start.current[0] ? start.current[0] : offsetX
      const y = offsetY > start.current[1] ? start.current[1] : offsetY
      const width = Math.abs(offsetX - start.current[0])
      const height = Math.abs(offsetY - start.current[1])
      setRect({ x, y, width, height })
    },
  }
  const { x, y, width, height } = rect
  // console.log(x, y, width, height)
  const Selection = width > 0 && height > 0 && (
    <div
      style={{
        position: "absolute",
        top: `${y}px`,
        left: `${x}px`,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: "none",
        ...style,
      }}
    ></div>
  )
  return [bindings, Selection]
}
