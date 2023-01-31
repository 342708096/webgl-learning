import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import dat from 'dat.gui'
import observeResize from './utils/resize-observer'

const rootEle = document.getElementById('root')!
const { width: eleWidth, height: eleHeight } = rootEle.getBoundingClientRect()

// 0.创建控制器

const gui = new dat.GUI()

// 1.生成场景
const scene = new THREE.Scene()

// 2. 生成相机, 透视相机, 也叫视椎体相机
const camera = new THREE.PerspectiveCamera(75, eleWidth / eleHeight, 0.1, 1000)
scene.add(camera)

// 3. 设置相机位置
camera.position.set(0, 0, 10)

// 4. 添加缓冲区几何体
const cubeGeometry = new THREE.BufferGeometry()
// 顶点数组
const vertices = new Float32Array([
  -1.0, -1.0, 1.0,
  1.0, -1.0, 1.0,
  1.0, 1.0, 1.0,
  1.0, 1.0, 1.0,
  -1.0, 1.0, 1.0,
  -1.0, -1.0, 1.0,
]) // 初始化32位浮点数数组

cubeGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
const cubeFolder = gui.addFolder('设置立方体')
cubeFolder.add(cube.position, 'x').min(0).max(5).step(0.01)
  .name('x轴')
cubeFolder.add(cube.position, 'y').min(0).max(5).step(0.01)
  .name('y轴')
cubeFolder.add(cube.position, 'z').min(0).max(5).step(0.01)
  .name('Z轴')

cubeFolder.addColor({ color: `#${cubeMaterial.color.getHexString()}` }, 'color').onChange((value) => {
  cubeMaterial.color.set(value)
}).name('颜色')

cubeFolder.add(cube, 'visible').name('显示/隐藏')

// 点击按钮触发事件
cubeFolder.add({
  fn: () => {
    gsap.to(cube.position, { x: 5, duration: 2 })
  },
}, 'fn').name('点击运动')

cubeFolder.add(cubeMaterial, 'wireframe')

scene.add(cube)

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
