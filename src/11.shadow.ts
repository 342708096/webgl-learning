import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import dat from 'dat.gui'
import observeResize from './utils/resize-observer'

// 目标: 灯光与阴影
// 1. 材质要满足对光照有反应
// 2. 设置渲染器开启阴影计算
// 3. 设置光照投射阴影
// 4. 设置物体投射阴影
// 5. 设置物体接受阴影
const rootEle = document.getElementById('root')!
const { width: eleWidth, height: eleHeight } = rootEle.getBoundingClientRect()

// 1.生成场景
const scene = new THREE.Scene()

// 2. 生成相机, 透视相机, 也叫视椎体相机
const camera = new THREE.PerspectiveCamera(75, eleWidth / eleHeight, 0.1, 1000)
scene.add(camera)

// 3. 设置相机位置
camera.position.set(0, 0, 10)

// 增加灯光(环境光)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// 增加灯光(平行光)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(10, 10, 10)

// 设置光源投射阴影
directionalLight.castShadow = true
directionalLight.shadow.radius = 10
// 阴影贴图精细度
directionalLight.shadow.mapSize.set(2048, 2048)
const gui = new dat.GUI()
function setGUIProps(camera1: typeof directionalLight.shadow.camera, ...props: string[]) {
  props.forEach((prop) => {
    gui.add(camera1, prop).min(-100).max(100).step(0.1)
      .onChange(() => {
        camera1.updateProjectionMatrix()
      })
  })
}
setGUIProps(directionalLight.shadow.camera, 'near', 'far', 'top', 'bottom', 'left', 'right')

scene.add(directionalLight)

const sphereGeometry = new THREE.SphereGeometry(1, 36, 36)
const sphereMaterial = new THREE.MeshStandardMaterial({

})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.castShadow = true
scene.add(sphere)

// 添加平面
const planeGeometry = new THREE.PlaneGeometry(10, 10)
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial({}))
plane.position.y = -1
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true
scene.add(plane)

// 5. 初始化渲染器
const renderer = new THREE.WebGLRenderer();
// 设置渲染器的阴影计算
renderer.shadowMap.enabled = true
renderer.setSize(eleWidth, eleHeight);

// 6. 轨道控制器
const controller = new OrbitControls(camera, renderer.domElement);
controller.enableDamping = true
// 7. 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

rootEle.appendChild(renderer.domElement);

// 自适应容器大小
observeResize(rootEle, ({ width, height }) => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix(); // 更新宽高比后需要更新投影矩阵

  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
})

// 双击进入全屏
rootEle.addEventListener('dblclick', () => {
  const fullScreenElement = document.fullscreenElement
  if (fullScreenElement === renderer.domElement) {
    document.exitFullscreen()
  } else {
    renderer.domElement.requestFullscreen()
  }
})

const frameRenderFn = () => {
  // const deltaTime = clock.getDelta()
  // cube.position.x += deltaTime
  // cube.position.x %= 5
  controller.update() // 设置阻尼后必须在动画中设置update

  renderer.render(scene, camera)
  requestAnimationFrame(frameRenderFn)
}

frameRenderFn()
