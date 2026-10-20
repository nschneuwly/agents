
import { type RefObject, useRef, useState } from 'react'

export const usePopover = (anchorElement: RefObject<HTMLElement>) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const hasOpenedRef = useRef(false)

  const isOpen = Boolean(anchorEl)

  const open = () => {
    hasOpenedRef.current = true
    setAnchorEl(anchorElement.current)
  }
  const close = () => setAnchorEl(null)
  const toggle = () => (anchorEl ? close() : open())

  return { anchorEl, isOpen, toggle, open, close, hasOpened: hasOpenedRef.current }
}
