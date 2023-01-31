import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import observeResize from './utils/resize-observer'
import img from './assets/arroway-textures_fabric-002/fabric-002_basket-weave-100x100cm-cream_d.jpg'

import nx from './assets/textures/environmentMaps/1/nx.jpg'
import ny from './assets/textures/environmentMaps/1/ny.jpg'
import nz from './assets/textures/environmentMaps/1/nz.jpg'
import px from './assets/textures/environmentMaps/1/px.jpg'
import py from './assets/textures/environmentMaps/1/py.jpg'
import pz from './assets/textures/environmentMaps/1/pz.jpg'

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

// 设置cube纹理加载器

const cubeTextureLoader = new THREE.CubeTextureLoader()
const envMapTexture = cubeTextureLoader.load([
  px,
  nx,
  py,
  ny,
  pz,
  nz,
])
// 给场景添加背景
scene.background = envMapTexture
// 给场景所有的物体添加默认的环境贴图, 设置后不用在geometry设置envmap
scene.environment = envMapTexture

const sphereGeometry = new THREE.SphereGeometry(1, 36, 36)
const sphereMaterial = new THREE.MeshStandardMaterial({
  roughness: 0.1,
  metalness: 0.9, // 金属度
  // envMap: envMapTexture,
})
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)
// 增加灯光(环境光)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// 增加灯光(平行光)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(0, 10, 10)
scene.add(directionalLight)

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
