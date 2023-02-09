import * as THREE from 'three'

export function LoadTextureCorrected(_loader, _path) {
  // Load the texture
  const texture = _loader.load(_path)

  // console.log(_path, texture)

  // Set repeat wrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.wrapS = THREE.RepeatWrapping
  // Flip texture vertically
  texture.repeat.y = -1
  // Return the corrected texture
  return texture
}
