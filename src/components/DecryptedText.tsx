import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion' // Ensure framer-motion is installed

const styles = {
  wrapper: {
    display: 'inline-block',
    whiteSpace: 'pre-wrap', // Handles multiple spaces and line breaks in the text
  },
  srOnly: { // For accessibility: screen readers will read the actual text
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    border: 0,
  },
} as const; // Use "as const" for better type inference on styles

interface DecryptedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;          // Applied to revealed/normal letters
  parentClassName?: string;    // Applied to parent motion.span
  encryptedClassName?: string; // Applied to encrypted letters
  animateOn?: "view" | "hover";  // Default: "hover"
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'hover',
  ...props // Spread any other HTML span attributes
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false) // Combined hover/view trigger
  const [isScrambling, setIsScrambling] = useState(false)
  const [revealedIndices, setRevealedIndices] = useState(new Set<number>())
  const [hasAnimatedOnView, setHasAnimatedOnView] = useState(false) // for "view" mode, to run once
  const containerRef = useRef<HTMLSpanElement>(null)

  // Effect for scrambling and revealing text
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    let currentIteration = 0

    // Determines the next character index to reveal based on direction
    const getNextIndex = (revealedSet: Set<number>): number => {
      const textLength = text.length
      if (revealedSet.size >= textLength) return -1; // All revealed

      switch (revealDirection) {
        case 'start':
          return revealedSet.size;
        case 'end':
          return textLength - 1 - revealedSet.size;
        case 'center': {
          const middle = Math.floor(textLength / 2)
          const offset = Math.floor(revealedSet.size / 2)
          // Alternate between right and left of center
          const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1

          // Check if the calculated index is valid and not already revealed
          if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
            return nextIndex
          }
          // Fallback: find the first available unrevealed index from the start
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i
          }
          return -1; // Should not happen if not all revealed
        }
        default:
          return revealedSet.size; // Fallback to 'start'
      }
    }

    // Characters to use for scrambling
    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter((char) => char !== ' ') // Unique non-space chars from original text
      : characters.split('')

    // Generates the scrambled text
    const shuffleText = (originalText: string, currentRevealed: Set<number>): string => {
      if (useOriginalCharsOnly) {
        // More complex shuffle that only uses characters present in the original string
        const positions = originalText.split('').map((char, i) => ({
          char,
          isSpace: char === ' ',
          index: i,
          isRevealed: currentRevealed.has(i),
        }))

        const nonSpaceCharsToScramble = positions
          .filter((p) => !p.isSpace && !p.isRevealed)
          .map((p) => p.char)

        // Fisher-Yates shuffle for the available characters
        for (let i = nonSpaceCharsToScramble.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
            ;[nonSpaceCharsToScramble[i], nonSpaceCharsToScramble[j]] = [nonSpaceCharsToScramble[j], nonSpaceCharsToScramble[i]]
        }

        let charIndex = 0
        return positions
          .map((p) => {
            if (p.isSpace) return ' '
            if (p.isRevealed) return originalText[p.index]
            return nonSpaceCharsToScramble[charIndex++] || availableChars[Math.floor(Math.random() * availableChars.length)]; // Fallback if not enough chars
          })
          .join('')
      } else {
        // Simple scramble using the provided character set
        return originalText
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ' // Preserve spaces
            if (currentRevealed.has(i)) return originalText[i] // Show revealed characters
            return availableChars[Math.floor(Math.random() * availableChars.length)]
          })
          .join('')
      }
    }

    if (isAnimating) {
      setIsScrambling(true)
      currentIteration = 0 // Reset iteration count for non-sequential
      
      interval = setInterval(() => {
        setRevealedIndices((prevRevealed) => {
          if (sequential) {
            if (prevRevealed.size < text.length) {
              const nextIndexToReveal = getNextIndex(prevRevealed)
              if (nextIndexToReveal === -1) { // All revealed
                clearInterval(interval)
                setIsScrambling(false)
                setDisplayText(text) // Ensure final text is set
                return prevRevealed
              }
              const newRevealed = new Set(prevRevealed)
              newRevealed.add(nextIndexToReveal)
              setDisplayText(shuffleText(text, newRevealed))
              return newRevealed
            } else {
              clearInterval(interval)
              setIsScrambling(false)
              setDisplayText(text) // Ensure final text is set
              return prevRevealed
            }
          } else { // Non-sequential scrambling
            setDisplayText(shuffleText(text, prevRevealed)) // prevRevealed is empty here for non-sequential
            currentIteration++
            if (currentIteration >= maxIterations) {
              clearInterval(interval)
              setIsScrambling(false)
              setDisplayText(text) // Set to final text after iterations
            }
            return prevRevealed; // No indices are "revealed" during non-sequential scramble
          }
        })
      }, speed)
    } else { // Not animating (e.g., mouse leave or view exited before completion)
      setDisplayText(text)
      setRevealedIndices(new Set()) // Reset revealed characters
      setIsScrambling(false)
      if (interval) clearInterval(interval)
    }

    // Cleanup function
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [
    isAnimating,
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    characters,
    useOriginalCharsOnly,
  ])

  // Effect for IntersectionObserver (animateOn="view")
  useEffect(() => {
    if (animateOn !== 'view' || hasAnimatedOnView) return; // Only run if animateOn is 'view' and hasn't animated yet

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimatedOnView) {
          setIsAnimating(true) // Trigger the decryption
          setHasAnimatedOnView(true) // Ensure it runs only once per view
        } else if (!entry.isIntersecting && animateOn === 'view' && hasAnimatedOnView && sequential) {
          // Optional: Reset if it scrolls out of view and you want it to re-animate if sequential
          // For a true "once" effect, this part might be removed or adjusted.
          // setIsAnimating(false); 
          // setHasAnimatedOnView(false); // Allow re-trigger
          // setRevealedIndices(new Set());
        }
      })
    }

    const observerOptions: IntersectionObserverInit = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1, // 10% of item is visible
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    const currentRef = containerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [animateOn, hasAnimatedOnView, sequential]) // Added sequential to deps

  // Props for hover-triggered animation
  const hoverProps =
    animateOn === 'hover'
      ? {
        onMouseEnter: () => {
          if (!isScrambling) setIsAnimating(true)
        },
        onMouseLeave: () => {
          setIsAnimating(false)
        },
      }
      : {}

  return (
    <motion.span
      className={parentClassName}
      ref={containerRef}
      style={styles.wrapper}
      {...hoverProps}
      {...props} // Spread other native span attributes
    >
      {/* For screen readers */}
      <span style={styles.srOnly}>{text}</span>

      {/* Visually displayed text with character-by-character styling */}
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => {
          // A character is "revealed" if its index is in revealedIndices,
          // or if scrambling is not active (either not started or finished).
          const isCharRevealed = revealedIndices.has(index);
          const isAnimationCompleteOrNotSequential = !isScrambling || !sequential;

          // For non-sequential, all chars are "revealed" when scrambling stops
          // For sequential, only chars in revealedIndices are truly revealed during scramble
          const showOriginalChar = sequential ? isCharRevealed : isAnimationCompleteOrNotSequential;

          return (
            <span
              key={index}
              // Apply 'className' if char is revealed or animation is done, else 'encryptedClassName'
              className={showOriginalChar && !isScrambling ? className : encryptedClassName}
            >
              {char}
            </span>
          )
        })}
      </span>
    </motion.span>
  )
}
