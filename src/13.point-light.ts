import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import dat from 'dat.gui'
import gsap from 'gsap'
import observeResize from './utils/resize-observer'

// 目标: 聚光灯
const rootEle = document.getElementById('root')!
const { width: eleWidth, height: eleHeight } = rootEle.getBoundingClientRect()

// 1.生成场景
const scene = new THREE.Scene()
const gui = new dat.GUI()
// 2. 生成相机, 透视相机, 也叫视椎体相机
const camera = new THREE.PerspectiveCamera(75, eleWidth / eleHeight, 0.1, 1000)
scene.add(camera)

// 3. 设置相机位置
camera.position.set(0, 0, 10)

// 增加灯光(环境光)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// 增加灯光(聚光灯)
const pointLight = new THREE.PointLight(0x11133f, 0.5)

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshStandardMaterial({
    emissive: 0x11133f,
    emissiveIntensity: 3,
  }),
)
moon.position.z = 3

const pointLightFolder = gui.addFolder('点光源')
pointLightFolder.add(pointLight, 'intensity').max(10).min(0).step(0.1)

// 如果设置了distance, 那么光的强度会随着距离衰减
pointLightFolder.add(pointLight, 'distance').max(100).min(0).step(0.1)
// 沿着光照距离的衰减量
pointLightFolder.add(pointLight, 'decay').max(10).min(0).step(0.01)
// 设置光源投射阴影
pointLight.castShadow = true

// 阴影贴图精细度
pointLight.shadow.mapSize.set(2048, 2048)
moon.add(pointLight)
scene.add(moon)

const sphereGeometry = new THREE.SphereGeometry(1, 36, 36)
const sphereMaterial = new THREE.MeshStandardMaterial({

})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.castShadow = true
const sphereFolder = gui.addFolder('小球')
sphereFolder.add(sphere.position, 'x').name('x坐标').min(-5).max(5)
  .step(0.1)
scene.add(sphere)

// 添加平面
const planeGeometry = new THREE.PlaneGeometry(100, 100)
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial({}))
plane.position.y = -1
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true
scene.add(plane)

// 5. 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
// 设置渲染器的阴影计算
renderer.shadowMap.enabled = true
// 使用物理的光照特性
// renderer.physicallyCorrectLights = true
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
const clock = new THREE.Clock()
const frameRenderFn = () => {
  const time = clock.getElapsedTime()
  moon.position.x = Math.sin(time / Math.PI) * 3
  moon.position.z = Math.cos(time / Math.PI) * 3
  controller.update() // 设置阻尼后必须在动画中设置update

  renderer.render(scene, camera)
  requestAnimationFrame(frameRenderFn)
}

frameRenderFn()
