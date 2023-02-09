export function webColorToHex(color: string): number {
  return parseInt(color.replace('#', '0x'), 16)
}
