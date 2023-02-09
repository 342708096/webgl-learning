import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOloader'
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader'
import { KTXLoader } from 'three/examples/jsm/loaders/KTXLoader'
import observeResize from './resize-observer'
import { isDDS, isJPG, isKTX } from './texture-type'
import { LoadTextureCorrected } from './load-texture-correct'

interface ExhibitionHallConfiguration {
  helper?: boolean
  loaders?: {
    gltf?: {
      dracoLoaderPath?: string;
    }
    texture?: boolean;
    dds?: boolean;
    ktx?: boolean;
    cube?: boolean;
  }
}

const DEFAULT_CONFIGURATION = {
  helper: false,
  loaders: {
    gltf: { dracoLoaderPath: '/draco/gltf/' },
    texture: true,
    dds: false,
    ktx: false,
    cube: false,
    meshBasePath: '',
    textureBasePath: '',
  },
}

/**
 * 展厅基础类
 */
export class ExhibitionHall {
  // 画布元素
  canvas: HTMLCanvasElement

  // 场景
  scene: THREE.Scene

  // 透视相机
  camera: THREE.PerspectiveCamera

  // 渲染器
  renderer: THREE.WebGLRenderer

  axesHelper: THREE.AxesHelper

  orbitControls: OrbitControls

  renderFns: (() => void)[] = []

  loopRenderId?: number

  lights: { [p:string]: THREE.Light } = {}

  meshs: { [p:string]: THREE.Mesh } = {}

  textures: { [p:string]: THREE.Texture } = {}

  gltfLoader: GLTFLoader

  textureLoader: THREE.TextureLoader

  ddsLoader: DDSLoader

  ktxLoader: KTXLoader

  cubeLoader: THREE.CubeTextureLoader

  mManager = new THREE.LoadingManager()

  configuration: ExhibitionHallConfiguration = { ...DEFAULT_CONFIGURATION }

  compositionRenderFn:(time: number) =>void = (time: number) => {
    for (const fn of this.renderFns) {
      fn.call(this, time)
    }
    this.loopRenderId = requestAnimationFrame(this.compositionRenderFn)
  }

  protected initCanvas() {
    const parentEle = this.canvas.parentElement
    if (parentEle) {
      // 防止屏幕抖动
      parentEle.style.overflow = 'hidden'
      observeResize(parentEle!, ({ width, height }) => {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
      })
    }
  }

  protected initRenderer() {
    this.renderer.setClearColor('#000')
    // 设置渲染器的阴影计算
    this.renderer.shadowMap.enabled = true
    this.renderFns.push(() => {
      this.renderer.render(this.scene, this.camera)
    })
  }

  protected initCamera() {
    // 设置相机
    this.camera.position.set(0, 2, 7)
  }

  protected initScene() {
    this.scene.background = new THREE.Color('#ccc')
  }

  protected initHelper() {
    if (!this.configuration.helper) return

    const axesHelper = new THREE.AxesHelper(5)
    this.axesHelper = axesHelper
    const axesMaterial = axesHelper.material as THREE.Material
    axesMaterial.transparent = true
    axesMaterial.opacity = 0.75
    this.scene.add(axesHelper)

    const gridHelper = new THREE.GridHelper(10, 10)
    const gridMaterial = gridHelper.material as THREE.Material
    gridMaterial.transparent = true
    gridMaterial.opacity = 0.2
    this.scene.add(gridHelper)

    const stats = Stats();
    stats.showPanel(0)
    document.body.append(stats.dom)
    this.renderFns.push(() => stats.update())
  }

  protected initOrbitControls() {
    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableDamping = true
    this.renderFns.unshift(() => this.orbitControls.update())
  }

  protected initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)
    this.lights.ambientLight = ambientLight
  }

  protected initLoaders() {
    if (!this.configuration.loaders) return
    const {
      gltf, dds, ktx, texture, cube,
    } = this.configuration.loaders
    if (gltf) {
      const loader = new GLTFLoader()
      // 提供解压缩的文件
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath(gltf.dracoLoaderPath ?? '/draco/gltf/')
      loader.setDRACOLoader(dracoLoader)
      this.gltfLoader = loader
    }
    if (texture) {
      const loader = new THREE.TextureLoader(this.mManager)
      this.textureLoader = loader
    }
    if (dds) {
      const loader = new DDSLoader()
      this.ddsLoader = loader
    }
    if (ktx) {
      const loader = new KTXLoader()
      this.ktxLoader = loader
    }
    if (cube) {
      const loader = new THREE.CubeTextureLoader()
      this.cubeLoader = loader
    }
  }

  constructor(canvas: HTMLCanvasElement, configuration: ExhibitionHallConfiguration = {}) {
    Object.assign(this.configuration, configuration)
    this.canvas = canvas
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera()
    this.renderer = new THREE.WebGLRenderer({
      // 抗锯齿
      antialias: true,
      canvas,

    });

    this.renderLoop.bind(this)
    this.cancelRender.bind(this)
    this.initHelper()
    this.initCanvas()
    this.initScene()
    this.initCamera()
    this.initOrbitControls()
    this.initLoaders()
    this.initLights()
    this.initRenderer()
    this.initCustom()
  }

  initCustom() {}

  addLight = (name: string, light: THREE.Light) => {
    this.lights[name] = light
    this.scene.add(light)
    return light
  }

  removeLight = (...names: string[]) => {
    for (const name of names) {
      this.scene.remove(this.lights[name])
    }
  }

  loadMesh = (path: string, basePath = '', addScene?: boolean): Promise<THREE.Group> => {
    if (basePath) {
      path = basePath + path
    }
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(path, (gltf) => {
        if (addScene) this.scene.add(gltf.scene)
        resolve(gltf.scene)
      }, undefined, (e) => {
        reject(e)
      })
    })
  }

  loadTexture = (path: string, basePath = '') => {
    if (basePath) {
      path = basePath + path
    }
    if (isDDS(path)) {
      if (!this.ddsLoader) {
        throw new Error('missing ddsLoader!')
      }
      return LoadTextureCorrected(this.ddsLoader, path)
    }
    if (isKTX(path)) {
      if (!this.ktxLoader) {
        throw new Error('missing ddsLoader!')
      }
      return LoadTextureCorrected(this.ktxLoader, path)
    }
    if (isJPG(path)) {
      if (!this.textureLoader) {
        throw new Error('missing textureLoader!')
      }
      return LoadTextureCorrected(this.textureLoader, path)
    }
    throw new Error('loader not found')
  }

  loadEnvTexture = (paths: string[], basePath = '') => {
    if (basePath) {
      paths = paths.map((p) => basePath + p)
    }
    if (!this.cubeLoader) {
      throw new Error('missing cubeLoader!')
    }
    const cubeTexture = this.cubeLoader.load(paths)
    cubeTexture.format = THREE.RGBAFormat
    cubeTexture.mapping = THREE.CubeReflectionMapping
    return cubeTexture
  }

  renderLoop: (time?: number) =>void = (time = performance.now()) => {
    for (const fn of this.renderFns) {
      fn.call(this, time)
    }
    this.loopRenderId = requestAnimationFrame(this.renderLoop)
  }

  cancelRender:() => void = () => {
    if (this.loopRenderId) cancelAnimationFrame(this.loopRenderId)
  }
}
