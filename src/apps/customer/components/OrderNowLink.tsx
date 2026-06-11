import React from "react"
import { Link, useLocation } from "react-router-dom"
import { scrollToBranchChoice } from "@/lib/scrollToBranchChoice"

type Props = {
  className?: string
  children: React.ReactNode
}

export default function OrderNowLink({ className, children }: Props) {
  const location = useLocation()
  const onHome = location.pathname === "/"

  if (onHome) {
    return (
      <a
        href="#order"
        className={className}
        onClick={(event) => {
          event.preventDefault()
          scrollToBranchChoice()
        }}
      >
        {children}
      </a>
    )
  }

  return (
    <Link to="/#order" className={className}>
      {children}
    </Link>
  )
}
