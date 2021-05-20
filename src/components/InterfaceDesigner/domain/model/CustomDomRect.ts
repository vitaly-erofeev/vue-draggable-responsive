export default class CustomDomRect {
  [index: string]: any

  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0
  left: number = 0
  right: number = 0
  top: number = 0
  bottom: number = 0

  public static fromDocRect (domRect: DOMRect): CustomDomRect {
    const { top, right, bottom, left, width, height, x, y } = domRect
    return <CustomDomRect>{ top, right, bottom, left, width, height, x, y }
  }
}
