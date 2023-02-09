export function isDDS(path: string) {
  return /\.dds$/.test(path)
}

export function isKTX(path: string) {
  return /\.ktx$/.test(path)
}

export function isJPG(path: string) {
  return /\.jpg$/.test(path)
}
