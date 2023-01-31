import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import dat from 'dat.gui'
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
const spotLight = new THREE.SpotLight(0xffffff, 0.5)
spotLight.position.set(0, 50, 0)
spotLight.angle = Math.PI / 16
const spotLightFolder = gui.addFolder('聚光灯')
spotLightFolder.add(spotLight, 'intensity').max(10).min(0).step(0.1)
spotLightFolder.add(spotLight, 'angle').max(Math.PI / 2).min(Math.PI / 1024).step(Math.PI / 1024)
// 如果设置了distance, 那么光的强度会随着距离衰减
spotLightFolder.add(spotLight, 'distance').max(100).min(0).step(0.1)
// 半影的衰减效果
spotLightFolder.add(spotLight, 'penumbra').max(1).min(0).step(0.01)
// 沿着光照距离的衰减量
spotLightFolder.add(spotLight, 'decay').max(10).min(0).step(0.01)
// 设置光源投射阴影
spotLight.castShadow = true
spotLight.shadow.radius = 10
// 阴影贴图精细度
spotLight.shadow.mapSize.set(2048, 2048)

scene.add(spotLight)

const sphereGeometry = new THREE.SphereGeometry(1, 36, 36)
const sphereMaterial = new THREE.MeshStandardMaterial({

})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphere.castShadow = true
const sphereFolder = gui.addFolder('小球')
sphereFolder.add(sphere.position, 'x').name('x坐标').min(-5).max(5)
  .step(0.1)
scene.add(sphere)
// 设置聚光灯的目标
spotLight.target = sphere
// 添加平面
const planeGeometry = new THREE.PlaneGeometry(100, 100)
const plane = new THREE.Mesh(planeGeometry, new THREE.MeshStandardMaterial({}))
plane.position.y = -1
plane.rotation.x = -Math.PI / 2
plane.receiveShadow = true
scene.add(plane)

// 5. 初始化渲染器
const renderer = new THREE.WebGLRenderer();
// 设置渲染器的阴影计算
renderer.shadowMap.enabled = true
// 使用物理的光照特性
renderer.physicallyCorrectLights = true
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
