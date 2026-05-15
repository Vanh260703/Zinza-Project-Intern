import { useState, useEffect, useRef } from 'react'
import StoryCard from './StoryCard'

const GAP = 16
const AUTO_DELAY = 2500
// Must be >= max visible count (5) so clones always fill the viewport
const CLONE_COUNT = 5

function getVisible(width) {
  if (width < 480) return 2
  if (width < 768) return 3
  if (width < 1024) return 4
  return 5
}

export default function StoryCarousel({ stories = [], loading = false }) {
  const [visible, setVisible] = useState(() => getVisible(window.innerWidth))
  const [cardWidth, setCardWidth] = useState(0)
  // trackIdx points into cloned array: [CLONE_COUNT clones] + [real items] + [CLONE_COUNT clones]
  // Start at CLONE_COUNT = first real item
  const [trackIdx, setTrackIdx] = useState(CLONE_COUNT)
  const [animated, setAnimated] = useState(true)
  const [paused, setPaused] = useState(false)
  const containerRef = useRef(null)
  const trackIdxRef = useRef(CLONE_COUNT)

  const N = stories.length
  const maxIndex = Math.max(0, N - visible)

  // Keep ref in sync so handleTransitionEnd always reads the latest value
  useEffect(() => { trackIdxRef.current = trackIdx }, [trackIdx])

  // Reset position when stories change (e.g. after initial load)
  useEffect(() => {
    setTrackIdx(CLONE_COUNT)
    setAnimated(false)
  }, [N])

  // Cloned track: [last CLONE_COUNT real] + [all real] + [first CLONE_COUNT real]
  const cloned = N > 0
    ? [...stories.slice(-CLONE_COUNT), ...stories, ...stories.slice(0, CLONE_COUNT)]
    : []

  // Measure container width → card width + visible count
  // Depends on `loading` so the effect re-runs once the carousel div actually mounts
  // (when loading=true the div is absent and containerRef.current is null)
  useEffect(() => {
    if (loading) return
    function measure() {
      if (!containerRef.current) return
      const w = containerRef.current.offsetWidth
      const v = getVisible(w)
      setVisible(v)
      setCardWidth((w - GAP * (v - 1)) / v)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [loading])

  function goNext() {
    setAnimated(true)
    setTrackIdx((i) => i + 1)
  }

  function goPrev() {
    setAnimated(true)
    setTrackIdx((i) => i - 1)
  }

  // After each transition, snap from clone zone → real zone without animation
  function handleTransitionEnd() {
    const cur = trackIdxRef.current
    if (cur >= CLONE_COUNT + N) {
      // Overshot the end → jump to real start equivalent
      setAnimated(false)
      setTrackIdx(cur - N)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
    } else if (cur < CLONE_COUNT) {
      // Overshot the start → jump to real end equivalent
      setAnimated(false)
      setTrackIdx(cur + N)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
    }
  }

  // Auto-play (functional setState so closure is always fresh)
  useEffect(() => {
    if (paused || N === 0) return
    const id = setInterval(goNext, AUTO_DELAY)
    return () => clearInterval(id)
  }, [paused, N])

  const translateX = cardWidth > 0 ? trackIdx * (cardWidth + GAP) : 0
  // Dot index: which "window position" (0..maxIndex) we're currently showing
  const dotIndex = Math.min(Math.max(trackIdx - CLONE_COUNT, 0), maxIndex)

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
        onClick={goPrev}
        className="absolute -left-5 top-[38%] z-10 w-9 h-9 rounded-full bg-stone-700 hover:bg-amber-500 border border-stone-600 hover:border-amber-500 text-stone-300 hover:text-white shadow-lg transition-all flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Track */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          className={animated ? 'flex transition-transform duration-500 ease-in-out' : 'flex'}
          style={{ gap: GAP, transform: `translateX(-${translateX}px)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {cloned.map((story, i) => (
            <div
              key={`${story.id}-${i}`}
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
        onClick={goNext}
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
            onClick={() => { setAnimated(true); setTrackIdx(CLONE_COUNT + i) }}
            className={`h-1.5 rounded-full transition-all duration-300
              ${i === dotIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-stone-600 hover:bg-stone-500'}`}
          />
        ))}
      </div>
    </div>
  )
}
