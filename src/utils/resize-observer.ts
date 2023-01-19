import throttle from 'lodash.throttle'

interface ThrottleSettings {
  /**
   * @see _.leading
   */
  leading?: boolean | undefined;
  /**
   * @see _.trailing
   */
  trailing?: boolean | undefined;
}

function observeResize(
  target: Element,
  callback?: (rect: DOMRect, target: Element) => void,
  throttleTime: number = 200,
  throttleOptoin:ThrottleSettings = { leading: false, trailing: true },
): () => void {
  const exec = () => {
    const rect = target.getBoundingClientRect()
    callback?.(rect, target)
  }
  const resizeObserver = new ResizeObserver(throttle(exec, throttleTime, throttleOptoin))
  resizeObserver.observe(target)
  return () => resizeObserver.disconnect()
}

export default observeResize
