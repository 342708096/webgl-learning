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

// 创建几何体
for (let i = 0; i < 50; i++) {
  // 每一个三角形, 需要三个顶点, 每个顶点需要三个值
  const geometry = new THREE.BufferGeometry();
  const positionArray = new Float32Array(9) // 必须声明缓冲长度
  for (let j = 0; j < 9; j++) {
    positionArray[j] = Math.random() * 10 - 5
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
  const color = new THREE.Color(Math.random(), Math.random(), Math.random())
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 })
  const triangle = new THREE.Mesh(geometry, material)
  scene.add(triangle)
}

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
