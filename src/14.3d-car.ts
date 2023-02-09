import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import dat from 'dat.gui'
import gsap from 'gsap'
import {
  Material, Mesh, MeshPhysicalMaterial, MeshStandardMaterial,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFloader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOloader'

import Stats from 'three/examples/jsm/libs/stats.module'
import observeResize from './utils/resize-observer'
import { pickupFactory } from './utils/pickup'

const stats = Stats();
stats.showPanel(0)
document.body.append(stats.dom)
requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) })
// 目标: 4s店汽车展示
const rootEle = document.getElementById('root')!
const canvas = document.createElement('canvas')
rootEle.appendChild(canvas)
// 1.生成场景
const scene = new THREE.Scene()
// scene.environment = new THREE.Color('#ccc')
scene.background = new THREE.Color('#ccc')
const gui = new dat.GUI()
// 2. 生成相机, 透视相机, 也叫视椎体相机
const camera = new THREE.PerspectiveCamera(75)
scene.add(camera)

// 3. 设置相机位置
camera.position.set(0, 2, 7)

// 增加灯光(环境光)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// 增加灯光(聚光灯)
const pointLight = new THREE.PointLight(0x11133f, 0.5)

// 设置光源投射阴影
pointLight.castShadow = true

// 阴影贴图精细度
pointLight.shadow.mapSize.set(2048, 2048)

// 5. 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // 抗锯齿
  antialias: true,
  canvas,

});

renderer.setClearColor('#000')
// 设置渲染器的阴影计算
renderer.shadowMap.enabled = true
// 使用物理的光照特性
// renderer.physicallyCorrectLights = true

// 6. 轨道控制器
const controller = new OrbitControls(camera, canvas);
controller.enableDamping = true
// 7. 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5)
const axesMaterial = axesHelper.material as Material
axesMaterial.transparent = true
axesMaterial.opacity = 0.75
scene.add(axesHelper)

// 8. 添加网格
const gridHelper = new THREE.GridHelper(10, 10)
const gridMaterial = gridHelper.material as Material
gridMaterial.transparent = true
gridMaterial.opacity = 0.2
scene.add(gridHelper)

// 自适应容器大小
observeResize(rootEle, ({ width, height }) => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix(); // 更新宽高比后需要更新投影矩阵

  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
})

const clock = new THREE.Clock()
const frameRenderFn = () => {
  controller.update() // 设置阻尼后必须在动画中设置update

  renderer.render(scene, camera)
  requestAnimationFrame(frameRenderFn)
}

// 添加汽车模型

const loader = new GLTFLoader()
// 提供解压缩的文件
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/gltf/')
loader.setDRACOLoader(dracoLoader)
const wheels: Array<Mesh> = []
let carBody: Mesh | null = null
let frontCar : Mesh | null = null
let hoodCar: Mesh | null = null
let glassCar: Mesh | null = null

// 创建材质
const bodyMaterial = new MeshPhysicalMaterial({
  roughness: 0.5, // 粗糙程度
  color: 0xff0000,
  metalness: 1,
  clearcoat: 1, // 打蜡的强度
  clearcoatRoughness: 0,
})

const frontMaterial = new MeshPhysicalMaterial({
  roughness: 0.5, // 粗糙程度
  color: 0xff0000,
  metalness: 1,
  clearcoat: 1, // 打蜡的强度
  clearcoatRoughness: 0,
})

const hoodMaterial = new MeshPhysicalMaterial({
  roughness: 0.5, // 粗糙程度
  color: 0xff0000,
  metalness: 1,
  clearcoat: 1, // 打蜡的强度
  clearcoatRoughness: 0,
})

const wheelsMaterial = new MeshPhysicalMaterial({
  roughness: 0.1, // 粗糙程度
  color: 0x000000,
  metalness: 1,
})

const glassMaterial = new MeshPhysicalMaterial({
  roughness: 0.1, // 粗糙程度
  color: 0xffffff,
  transmission: 1,
  transparent: true,
  metalness: 0,
})

gui.add({ color: '#ff0000' }, 'color', {
  red: '#ff0000',
  silver: 'silver',
  blue: '#0000ff',
  green: '#00ff00',
  orange: 'orange',
  purple: 'purple',
}).name('颜色').onChange((color) => {
  bodyMaterial.color.set(color)
  hoodMaterial.color.set(color)
  frontMaterial.color.set(color)
  // wheels.forEach((wheel) => wheel.material.color.set(color))
})

loader.load('/model/bmw01.glb', (gltf) => {
  const bmw = gltf.scene
  bmw.traverseVisible((child) => {
    // @ts-ignore
    if (child.isMesh) {
      const mesh = child as Mesh
      if (mesh.name.includes('轮毂')) {
        wheels.push(mesh)
        mesh.material = wheelsMaterial
      } else if (mesh.name.includes('Mesh002')) {
        carBody = mesh
        carBody.material = bodyMaterial
      } else if (mesh.name.includes('前脸')) {
        frontCar = mesh
        frontCar.material = frontMaterial
      } else if (mesh.name.includes('引擎盖_1')) {
        hoodCar = mesh
        hoodCar.material = hoodMaterial
      } else if (mesh.name.includes('挡风玻璃')) {
        glassCar = mesh
        glassCar.material = glassMaterial
      }
    }
  })
  scene.add(bmw)
})

/// 物理材质需要聚光灯展示效果
function addDiretionalLight(position: [number, number, number]) {
  const lightWhite = new THREE.DirectionalLight(0xffffff, 1);
  lightWhite.position.set(...position)
  scene.add(lightWhite)
}
[
  [0, 0, 10],
  [0, 0, -10],
  [10, 0, 0],
  [-10, 0, 0],
  [5, 10, 0],
  [0, 10, 5],
  [0, 10, -5],
  [-5, 10, 0],
].forEach(addDiretionalLight)

const pickupHandler = pickupFactory(canvas, camera, scene, true, (_, objects: Mesh[]) => {
  console.log(objects[0])
})

const mouseHandler = pickupFactory(
  canvas,
  camera,
  scene,
  true,
  () => {
    canvas.style.cursor = 'pointer'
  },
  () => {
    canvas.style.cursor = 'default'
  },
)

canvas.addEventListener('click', pickupHandler)
canvas.addEventListener('pointermove', mouseHandler)
frameRenderFn()
