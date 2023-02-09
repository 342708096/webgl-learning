import * as THREE from 'three'

export function pickupFactory(
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  scene: THREE.Scene,
  pickupFirst?: boolean,
  callback?: (event: MouseEvent, objects: THREE.Mesh[]) => void,
  fallback?: (event: MouseEvent) => void,
  filter?: ((object: THREE.Mesh) => boolean),
) {
  return (event: MouseEvent) => {
    const { clientWidth } = canvas
    const { clientHeight } = canvas
    const { offsetLeft } = canvas
    const { offsetTop } = canvas
    const mouse = new THREE.Vector2()
    mouse.x = ((event.clientX - offsetLeft) / clientWidth) * 2 - 1
    mouse.y = -((event.clientY - offsetTop) / clientHeight) * 2 + 1
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children)
    if (intersects.length) {
      const objects: THREE.Mesh[] = []
      // eslint-disable-next-line no-restricted-syntax
      for (const intersect of intersects) {
        if ((intersect.object as THREE.Mesh).isMesh) {
          objects.push(intersect.object as THREE.Mesh)
          if (pickupFirst) {
            break
          }
        }
      }
      if (objects.length) {
        if (filter) {
          const filtered = objects.filter(filter)
          if (filtered.length) {
            callback?.(event, filtered)
            return
          }
        } else {
          callback?.(event, objects)
          return
        }
      }
    }
    fallback?.(event)
  }
}
