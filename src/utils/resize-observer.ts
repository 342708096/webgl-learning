import debounce from 'lodash.debounce'

interface DebounceSettings {
  /**
   * @see _.leading
   */
  leading?: boolean | undefined;
  /**
   * @see _.maxWait
   */
  maxWait?: number | undefined;
  /**
   * @see _.trailing
   */
  trailing?: boolean | undefined;
}
// 会立即同步执行一次
function observeResize(
  target: Element,
  callback?: (rect: DOMRect, target: Element) => void,
  immediate: boolean = true,
  debounceTime: number = 0,
  debounceOptoin?:DebounceSettings,
): () => void {
  const exec = () => {
    const rect = target.getBoundingClientRect() // 包含padding 和 border
    callback?.(rect, target)
  }
  if (immediate) {
    exec()
  }
  const resizeObserver = new ResizeObserver(debounce(exec, debounceTime, debounceOptoin))
  resizeObserver.observe(target)
  return () => resizeObserver.disconnect()
}

export default observeResize
