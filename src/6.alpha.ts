import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import observeResize from './utils/resize-observer'
import img from './assets/three.png'
import alpha from './assets/alpha.png'
// 目标: 纹理设置
const rootEle = document.getElementById('root')!
const { width: eleWidth, height: eleHeight } = rootEle.getBoundingClientRect()

// 1.生成场景
const scene = new THREE.Scene()

// 2. 生成相机, 透视相机, 也叫视椎体相机
const camera = new THREE.PerspectiveCamera(75, eleWidth / eleHeight, 0.1, 1000)
scene.add(camera)

// 3. 设置相机位置
camera.position.set(0, 0, 10)

// 4. 添加缓冲区几何体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)

const textureLoader = new THREE.TextureLoader()

const doorTexture = textureLoader.load(img)

const alphaTexture = textureLoader.load(alpha)

const cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00,
  map: doorTexture,
  alphaMap: alphaTexture,
  transparent: true, // 需要设置为true, 才能使alphaMap生效
  side: THREE.DoubleSide, // 双面材质
})
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

scene.add(cube)

// 添加平面几何体
const surface = new THREE.PlaneGeometry(1, 1)
const surfaceMesh = new THREE.Mesh(surface, cubeMaterial)
surfaceMesh.position.x = 3
scene.add(surfaceMesh)
// 5. 初始化渲染器
const renderer = new THREE.WebGLRenderer();

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
