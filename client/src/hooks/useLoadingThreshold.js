import { useEffect, useState } from 'react'

/**
 * Hook to delay showing loading UI to prevent flickering
 * Only returns true if loading persists beyond the threshold
 * @param {boolean} isLoading - Current loading state
 * @param {number} threshold - Delay in milliseconds (default: 300ms)
 * @returns {boolean} - Whether to show loading UI
 */
export function useLoadingThreshold(isLoading, threshold = 300) {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      // Immediately hide loading UI when loading completes
      setShowLoading(false)
      return
    }

    // Only show loading UI if still loading after threshold
    const timer = setTimeout(() => {
      setShowLoading(true)
    }, threshold)

    return () => clearTimeout(timer)
  }, [isLoading, threshold])

  return showLoading
}

export default useLoadingThreshold
