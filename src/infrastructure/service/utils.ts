export function debounce<T extends Function> (cb: T, wait = 20, additionalCb: Function = () => {}) {
  let h = 0
  let callable = (...args: any) => {
    additionalCb()
    clearTimeout(h)
    // eslint-disable-next-line standard/no-callback-literal
    h = setTimeout(() => cb(...args), wait)
  }
  return <T>(<any>callable)
}
