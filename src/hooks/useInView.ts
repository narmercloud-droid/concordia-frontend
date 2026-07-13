import { useEffect, useState, type RefObject } from "react"

type Options = {
  rootMargin?: string
  once?: boolean
}

/** True when the element enters (or nears) the viewport — use to defer below-fold work. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "240px 0px", once = true }: Options = {}
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || (once && inView)) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setInView(true)
        if (once) observer.disconnect()
      },
      { rootMargin, threshold: 0.01 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, rootMargin, once, inView])

  return inView
}
