/* eslint-disable @typescript-eslint/naming-convention */
import * as THREE from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { webColorToHex } from './utils/color'
import { ExhibitionHall } from './utils/exhibition-hall'
import { pickupFactory } from './utils/pickup'

const config = {
  body_colors: {
    colors: [
      {
        name: 'Arancio Atlas',
        value: '#F77F21',
      },
      {
        name: 'Arancio Argos',
        value: '#FC4705',
      },
      {
        name: 'Blu Cepheus',
        value: '#4393E6',
      },
      {
        name: 'Rosso Mars',
        value: '#BF0012',
      },
      {
        name: 'Bianco Monocerus',
        value: '#F2F3F5',
      },
      {
        name: 'Pink',
        value: '#D24A57',
      },
    ],
    target: 'Mt_Body',
  },
  mirror_colors: {
    colors: [
      {
        name: 'Black',
        value: '#121212',
      },
    ],
    target: 'Mt_MirrorCover',
  },
  wheel_designs: {
    designs: [
      {
        name: 'Type A',
        value: 'Obj_Rim_T0A',
        thumb: 'Render_Tyre_0A.png',
      },
      {
        name: 'Type B',
        value: 'Obj_Rim_T0B',
        thumb: 'Render_Tyre_0B.png',
      },
    ],
  },
  wheel_colors: {
    colors: [
      {
        name: 'Black',
        value: '#000000',
      },
      {
        name: 'Grey',
        value: '#4C5457',
      },
      {
        name: 'Metalic',
        value: '#dddddd',
      },
    ],
    target: 'Mt_AlloyWheels',
  },

  caliper_colors: {
    colors: [
      {
        name: 'Red',
        value: '#990000',
      },
      {
        name: 'Yellow',
        value: '#E9A435',
      },
      {
        name: 'Black',
        value: '#000000',
      },
      {
        name: 'White',
        value: '#F1F7F7',
      },
    ],
    target: 'Mt_BrakeCaliper',
  },
}

const rootEle = document.getElementById('root')!
const canvas = document.createElement('canvas')
rootEle.appendChild(canvas)

// 定义颜色
const dfCol_Body = webColorToHex(config.body_colors.colors[5].value)
const dfCol_Mirror = webColorToHex(config.mirror_colors.colors[0].value)
const dfCol_Alloys = webColorToHex(config.wheel_colors.colors[2].value)
const dfCol_Caliper = webColorToHex(config.caliper_colors.colors[0].value)

const {
  loadEnvTexture,
  loadTexture,
  loadMesh,
  orbitControls,
  scene,
  camera,
  renderer,
  renderFns,
  addLight,
  renderLoop,
} = new ExhibitionHall(canvas, {
  helper: true,
  loaders: {
    gltf: { dracoLoaderPath: '/draco/gltf/' },
    dds: true,
    ktx: true,
    texture: true,
    cube: true,
  },
})
const webglContext = renderer.getContext()
const supportedExtensions = webglContext.getSupportedExtensions()!
// 添加灯光

addLight('light1', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(0, 0, 10)
addLight('light2', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(0, 0, -10)
addLight('light3', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(10, 0, 0)
addLight('light4', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(-10, 0, 0)
addLight('light5', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(0, 10, 0)
addLight('light6', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(5, 10, 0)
addLight('light7', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(0, 10, 5)
addLight('light8', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(0, 10, -5)
addLight('light9', new THREE.DirectionalLight(0xffffff, 0.2)).position.set(-5, 10, 0)

// 加载材质
const mCubeMap = loadEnvTexture([
  'posx.jpg',
  'negx.jpg',
  'posy.jpg',
  'negy.jpg',
  'posz.jpg',
  'negz.jpg',
], '/env/cubemap/')
// 黑色塑料材质
const Mt_ABS_Black_Mat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.5,
  metalness: 0.5,
  envMap: mCubeMap,
})
// 光滑塑料材质
const Mt_Abs_Black_Gloss = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.0,
  metalness: 0.0,
  envMap: mCubeMap,
})

// 挡风玻璃材质
const Mt_WindScreens = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.0,
  metalness: 0.0,
  envMap: mCubeMap,
  transparent: true,
  opacity: 0.7,
})

const Mt_Body = new THREE.MeshStandardMaterial({
  name: 'Mt_Body',
  color: dfCol_Body,
  roughness: 0.0,
  metalness: 0.0,
  envMap: mCubeMap,
})
// 金属透镜材质
const Mt_Glass_Lens = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.0,
  metalness: 0.25,
  envMap: mCubeMap,
})
// 加载纹理
const TEXTURE_PATH = '/data/texture/'
const Alpha01 = loadTexture('Alpha01-dxt.dds', TEXTURE_PATH)
const Tire_A02_s3tc = loadTexture('Tire_A02-dxt.dds', TEXTURE_PATH)
const Tire_N02_s3tc = loadTexture('Tire_N02-dxt.dds', TEXTURE_PATH)
const Tire_A02_pvr = loadTexture('Tire_A02-pvr.ktx', TEXTURE_PATH)
const Tire_N02_pvr = loadTexture('Tire_N02-pvr.ktx', TEXTURE_PATH)
const Tire_A02_etc1 = loadTexture('Tire_A02-etc1.ktx', TEXTURE_PATH)
const Tire_N02_etc1 = loadTexture('Tire_N02-etc1.ktx', TEXTURE_PATH)
const Phev_Hub06_AO = loadTexture('Phev_Hub06_AO.jpg', TEXTURE_PATH)

// 定义材质
const transparentMaterial = new THREE.MeshBasicMaterial({
  alphaMap: Alpha01,
  transparent: true,
  opacity: 0,
})

const Mt_Tyres_s3tc = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.5,
  metalness: 0.5,
  envMap: mCubeMap,
  map: Tire_A02_s3tc,
  normalMap: Tire_N02_s3tc,
})

const Mt_Tyres_pvr = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.5,
  metalness: 0.5,
  envMap: mCubeMap,
  map: Tire_A02_pvr,
  normalMap: Tire_N02_pvr,
})

const Mt_Tyres_etc1 = new THREE.MeshStandardMaterial({
  color: 0x000000,
  roughness: 0.5,
  metalness: 0.5,
  envMap: mCubeMap,
  map: Tire_A02_etc1,
  normalMap: Tire_N02_etc1,
})

const Mt_Tyres_Hub = new THREE.MeshStandardMaterial({
  color: 0x929396,
  roughness: 0.1,
  metalness: 0.5,
  envMap: mCubeMap,
  map: Phev_Hub06_AO,
})

// 加载模型
const GLBs = [
  {
    name: 'EXT',
    path: '/data/model/Lynkco09_EXT_d.glb',
  },
  {
    name: 'INT',
    path: '/data/model/Lynkco09_INT_d.glb',
  },
  {
    name: 'Sunproof',
    path: '/data/model/Lynkco09_Sunproof_d.glb',
  },
  {
    name: 'Trunk',
    path: '/data/model/Lynkco09_Trunk_d.glb',
  },
  {
    name: 'Tires',
    path: '/data/model/Lynkco09_Tires_d.glb',
  },
  {
    name: 'LBDoor',
    path: '/data/model/Lynkco09_LBDoor_d.glb',
  },
  {
    name: 'LFDoor',
    path: '/data/model/Lynkco09_LFDoor_d.glb',
  },
  {
    name: 'RFDoor',
    path: '/data/model/Lynkco09_RFDoor_d.glb',
  },
  {
    name: 'RBDoor',
    path: '/data/model/Lynkco09_RBDoor_d.glb',
  },
]

const models: { [p:string]: any } = {}

GLBs.forEach(({ path, name }) => {
  loadMesh(path).then((obj: any) => {
    models[name] = obj
    obj.name = name
    obj.traverse((child: THREE.Mesh) => {
      if (child.isMesh) {
        if (child.name.includes('EXT')) {
          switch (child.name) {
            case 'EXT_04':
            case 'EXT_05':
            case 'EXT_08':
            case 'EXT_10':
            case 'EXT_22':
            case 'EXT_23':
            case 'EXT_24':
            case 'EXT_25':
            case 'EXT_28':
            case 'EXT_35':
            case 'EXT_36':
            case 'EXT_37':
            case 'EXT_38':
            case 'EXT_39':
            case 'EXT_40':
            case 'EXT_42':
            case 'EXT_43':
            case 'EXT_44':
            case 'EXT_45':
            case 'EXT_46':
            case 'EXT_47':
            case 'EXT_52':
              child.material = Mt_ABS_Black_Mat
              break
            case 'EXT_06':
            case 'EXT_07':
            case 'EXT_34':
              child.material = Mt_WindScreens
              break
            case 'EXT_11':
            case 'EXT_21':
            case 'EXT_41':
            case 'EXT_48':
              child.material = Mt_Abs_Black_Gloss
              break
            case 'EXT_51':
              child.material = Mt_Body
              break
            case 'EXT_29':
              break
            case 'EXT_01':
            case 'EXT_03':
              child.material = Mt_Body
              break

            default:
              child.material = Mt_ABS_Black_Mat
              break
          }
        }
        if (child.name.includes('Door')) {
          const doorname = child.name.slice(1)
          switch (doorname) {
            case 'BDoor_03':
              child.material = Mt_WindScreens
              break
            case 'BDoor_02':
            case 'BDoor_04':
            case 'BDoor_07':
            case 'BDoor_08':
            case 'BDoor_09':
            case 'BDoor_10':
            case 'BDoor_14':
              child.material = Mt_ABS_Black_Mat
              break
            case 'BDoor_05':
              child.material = Mt_Body
              break

            case 'FDoor_01':
              child.material = Mt_Body
              break
            case 'FDoor_02':
            case 'FDoor_04':
            case 'FDoor_05':
              child.material = Mt_ABS_Black_Mat
              break
            case 'FDoor_08':
              child.material = Mt_WindScreens
              break
            case 'FDoor_09':
              child.material = Mt_Glass_Lens
              break

            default:
              child.material = Mt_ABS_Black_Mat
              break
          }
        }
        if (child.name.includes('Sunproof')) {
          switch (child.name) {
            case 'Sunproof_01':
            case 'Sunproof_03':
              child.material = Mt_WindScreens
              break
            default:
              child.material = Mt_ABS_Black_Mat
              break
          }
        }
        if (child.name.includes('runk')) {
          switch (child.name) {
            case 'Trunk_03':
            case 'Trunk_04':
              child.material = Mt_WindScreens
              break
            case 'Trunk_05':
            case 'Trunk_08':
            case 'Trunk_09':
            case 'Trunk_10':
            case 'Trunk_15':
            case 'Trunk_19':
            case 'Trunk_22':
            case 'Trunk_17':
            case 'Trunk_93':
              child.material = Mt_ABS_Black_Mat
              break
            case 'Trunk_12':
              break
            case 'Trunk_92':
              child.material = Mt_Body
              break
            default:
              child.material = Mt_Body
              break
          }
        }
        if (child.name.includes('Tire')) {
          switch (child.name) {
            case 'Tire_01':
            case 'Tire_14':
            case 'Tire_17':
              child.material = Mt_Body
              break
            case 'Tire_02':
            case 'Tire_08':
            case 'Tire_09':
            case 'Tire_12':
              child.material = Mt_ABS_Black_Mat
              break
            case 'Tire_03':
            case 'Tire_05':
              child.material = transparentMaterial
              break
            case 'Tire_10':
            case 'Tire_11':
              child.material = Mt_Tyres_Hub
              break
            case 'Tire_19':

              // console.log('supportedExtensions', supportedExtensions)
              // console.log('navigator.userAgent', navigator.userAgent)
              if (supportedExtensions.includes('WEBGL_compressed_texture_s3tc')) {
                // console.log('WEBGL_compressed_texture_s3tc')
                child.material = Mt_Tyres_s3tc
                break
              }
              if (
                supportedExtensions.includes('WEBGL_compressed_texture_pvrtc')
              ) {
                // console.log('WEBGL_compressed_texture_pvrtc')
                child.material = Mt_Tyres_pvr
                break
              }
              if (supportedExtensions.includes('WEBGL_compressed_texture_etc1')) {
                // console.log('WEBGL_compressed_texture_etc1')
                child.material = Mt_Tyres_etc1
                break
              }
              break
            default:
              child.material = Mt_ABS_Black_Mat
              break
          }
        }
        if (child.name.includes('INT')) {
          switch (child.name) {
            // case 'INT_92':
            // console.log(child)
            // child.material = testMaterial
            // break
            default:
              child.material = Mt_ABS_Black_Mat
              break
          }
        }
      }
    })

    if (obj.name.includes('INT')) {
      const box = new THREE.Box3().setFromObject(obj)
      const modelY = Math.abs(box.max.y) + Math.abs(box.min.y) // 获取模型的长度
      obj.carInCameraPosition = { x: 0, y: modelY / 2 + 0.1, z: -0.2 } // 进到车内看内饰视角的相机位置
    }
    let outer: THREE.Group | null = null
    if (obj.name.includes('Door')) {
      // let box = new THREE.Box3().setFromObject(obj)
      // let modelX = Math.abs(box.max.x) + Math.abs(box.min.x) // 获取模型的长度
      switch (obj.name) {
        case 'LBDoor':
          outer = new THREE.Group() // 外层
          outer.name = 'LBDoorOuter'
          outer.add(obj)
          outer.position.set(0.77, 0, -0.12) // 外层往前移动50%
          // 辅助图像
          // const box3 = new THREE.Box3()
          // box3.expandByObject(outer)
          // outerHelp = new THREE.Box3Helper(box3, 0x000000)
          // outer.outerHelp = outerHelp
          // scene.add(outerHelp)
          obj.position.set(-0.77, 0, 0.12) // 模型往后移动50%（归到原位）
          obj.status = 'close'
          obj.outer = outer
          obj.rotateDirection = {
            rotateAxis: 'y',
            open: {
              from: { value: -60 },
              to: { value: 0 },
            },
            close: {
              from: { value: 0 },
              to: { value: -60 },
            },
          }
          break
        case 'RBDoor':
          outer = new THREE.Group()
          outer.name = 'RBDoorOuter'
          outer.add(obj)
          outer.position.set(-0.77, 0, -0.12)
          obj.position.set(0.77, 0, 0.12)
          obj.status = 'close'
          obj.outer = outer
          obj.rotateDirection = {
            rotateAxis: 'y',
            open: {
              from: { value: 60 },
              to: { value: 0 },
            },
            close: {
              from: { value: 0 },
              to: { value: 60 },
            },
          }
          break
        case 'LFDoor':
          outer = new THREE.Group()
          outer.name = 'LFDoorOuter'
          outer.add(obj)
          outer.position.set(0.78, 0, 0.75)
          obj.position.set(-0.78, 0, -0.75)
          obj.status = 'close'
          obj.outer = outer
          obj.rotateDirection = {
            rotateAxis: 'y',
            open: {
              from: { value: -50 },
              to: { value: 0 },
            },
            close: {
              from: { value: 0 },
              to: { value: -50 },
            },
          }
          break
        case 'RFDoor':
          outer = new THREE.Group()
          outer.name = 'RFDoorOuter'
          outer.add(obj)
          outer.position.set(-0.78, 0, 0.75)
          obj.position.set(0.78, 0, -0.75)
          obj.status = 'close'
          obj.outer = outer
          obj.rotateDirection = {
            rotateAxis: 'y',
            open: {
              from: { value: 50 },
              to: { value: 0 },
            },
            close: {
              from: { value: 0 },
              to: { value: 50 },
            },
          }
          break
        default:
          break
      }
    }
    if (obj.name.includes('Trunk')) {
      outer = new THREE.Group()
      outer.name = 'TrunkOuter'
      outer.add(obj)
      outer.position.set(0, 1.42, -1.45)
      obj.position.set(0, -1.42, 1.45)
      obj.status = 'close'
      obj.outer = outer
      obj.rotateDirection = {
        rotateAxis: 'x',
        open: {
          from: { value: 80 },
          to: { value: 0 },
        },
        close: {
          from: { value: 0 },
          to: { value: 80 },
        },
      }
    }
    if (outer) {
      scene.add(outer)
    } else {
      scene.add(obj)
    }
  })
})

// renderFns
renderFns.unshift(() => { TWEEN.update() })

const mouseHandler = pickupFactory(canvas, camera, scene, true, () => {
  canvas.style.cursor = 'pointer'
}, () => {
  canvas.style.cursor = 'default'
}, (object) => object.name.includes('Door') || object.name.includes('Trunk') || object.name.includes('INT'))
canvas.addEventListener('pointermove', mouseHandler)
const tweenCollection = {
  LBDoor: {
    tween: null,
    from: { value: null },
    to: { value: null },
  },
  RBDoor: {
    tween: null,
    from: { value: null },
    to: { value: null },
  },
  LFDoor: {
    tween: null,
    from: { value: null },
    to: { value: null },
  },
  RFDoor: {
    tween: null,
    from: { value: null },
    to: { value: null },
  },
  Trunk: {
    tween: null,
    from: { value: null },
    to: { value: null },
  },
}
const setupTweenDoor = (door, status) => {
  const { from, to } = door.rotateDirection[status]
  if (status === 'open') {
    door.status = 'close'
  }
  if (status === 'close') {
    door.status = 'open'
  }
  // TWEEN.removeAll()
  let lastLocation: any = null
  if (tweenCollection[door.name].tween) {
    lastLocation = { value: tweenCollection[door.name].from.value }
    tweenCollection[door.name].tween.stop()
  } else {
    lastLocation = { value: from.value }
  }
  tweenCollection[door.name].tween = new TWEEN.Tween(lastLocation)
    .to(to, 1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate((_lastLocation) => {
      door.outer.rotation[door.rotateDirection.rotateAxis] = THREE.MathUtils.degToRad(_lastLocation.value)
      tweenCollection[door.name].from.value = _lastLocation.value
    })
    .onComplete(() => {
      tweenCollection[door.name] = {
        tween: null,
        from: { value: null },
        to: { value: null },
      }
    })
    .start()
}
function setupTweenCamera(source, target) {
  const carTween = new TWEEN.Tween(source)
    .to(target, 2000)
    .easing(TWEEN.Easing.Quadratic.Out)
  carTween.onUpdate((that) => {
    camera.position.set(that.cx, that.cy, that.cz)
    orbitControls.target.set(that.ox, that.oy, that.oz)
  })
  carTween.start()
}
const setupTweenCarIn = (model) => {
  const { x: cx, y: cy, z: cz } = camera.position
  const { x: tocx, y: tocy, z: tocz } = model.carInCameraPosition
  setupTweenCamera(
    {
      cx, cy, cz, ox: 0, oy: 0, oz: 0,
    },
    {
      cx: tocx, cy: tocy, cz: tocz, ox: 0, oy: tocy, oz: 0.1,
    },
  )
}
const clickHandler = pickupFactory(canvas, camera, scene, true, (event, [object]) => {
  if (
    object.name.includes('Door')
    || object.name.includes('Trunk')
  ) {
    const doorName = object.name.split('_')[0]
    const door = models[doorName]

    if (door && door.outer && door.status) {
      setupTweenDoor(door, door.status)
    }
  }
  if (object.name.includes('INT')) {
    const { INT } = models
    setupTweenCarIn(INT)
  }
})

canvas.addEventListener('click', clickHandler)
renderLoop()
