import { useState, useEffect, useRef, useCallback } from 'react'
import StoryCard from './StoryCard'

const GAP = 16
const AUTO_DELAY = 2500

function getVisible(width) {
  if (width < 480) return 2
  if (width < 768) return 3
  if (width < 1024) return 4
  return 5
}

export default function StoryCarousel({ stories = [], loading = false }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cardWidth, setCardWidth] = useState(0)
  const [visible, setVisible] = useState(() => getVisible(window.innerWidth))
  const containerRef = useRef(null)
  const timerRef = useRef(null)
  const maxIndex = Math.max(0, stories.length - visible)

  // Measure card width and update visible count from container
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        const v = getVisible(w)
        setVisible(v)
        setCardWidth((w - GAP * (v - 1)) / v)
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const next = useCallback(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), [maxIndex])
  const prev = useCallback(() => setIndex((i) => (i <= 0 ? maxIndex : i - 1)), [maxIndex])

  useEffect(() => {
    if (paused || stories.length === 0) return
    timerRef.current = setInterval(next, AUTO_DELAY)
    return () => clearInterval(timerRef.current)
  }, [paused, next, stories.length])

  const translateX = index * (cardWidth + GAP)

  if (loading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: visible }).map((_, i) => (
          <div key={i} className="flex-1">
            <div className="aspect-[3/4] rounded-xl bg-stone-800 animate-pulse mb-3" />
            <div className="h-3 bg-stone-800 rounded animate-pulse mb-2 w-full" />
            <div className="h-3 bg-stone-800 rounded animate-pulse w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute -left-5 top-[38%] z-10 w-9 h-9 rounded-full bg-stone-700 hover:bg-amber-500 border border-stone-600 hover:border-amber-500 text-stone-300 hover:text-white shadow-lg transition-all flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Track */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ gap: GAP, transform: `translateX(-${translateX}px)` }}
        >
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex-shrink-0"
              style={{ width: cardWidth || `calc((100% - ${GAP * (visible - 1)}px) / ${visible})` }}
            >
              <StoryCard story={story} />
            </div>
          ))}
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute -right-5 top-[38%] z-10 w-9 h-9 rounded-full bg-stone-700 hover:bg-amber-500 border border-stone-600 hover:border-amber-500 text-stone-300 hover:text-white shadow-lg transition-all flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300
              ${i === index ? 'w-6 bg-amber-500' : 'w-1.5 bg-stone-600 hover:bg-stone-500'}`}
          />
        ))}
      </div>
    </div>
  )
}
