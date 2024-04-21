
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from "dat.gui";

import usePreload from './utils/preload/usePreload.ts';
import assets from './assets.json'
import { FluidTransition } from './components/FluidTransition.js';

export default class Ctx {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0xeeeeee, 1)

    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    )

    this.camera.position.set(0, 0, 3);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0
    this.clock = new THREE.Clock()

    this.isPlaying = true


    this.loadAssets()
    this.resize()
    this.render()
    this.setupResize()
  }

  settings() {
    this.gui = new dat.GUI();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    if(this.quad){
      this.quad.updateResolution(this.width, this.height)
    }
  }

  addObjects(assets) {
    if (!assets) return

    this.quad = new FluidTransition({ opts: this, assets: assets, gui: this.gui })
    
  }

  loadAssets() {
    this.loader = usePreload(assets)
      .then(({ loadedAssets }) => {
        console.log('All assets loaded: ', loadedAssets)
        this.settings()
        this.addObjects(loadedAssets)
      }).catch((error) => {
        console.log('error: ', error)
      })
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time = this.clock.getElapsedTime()

    if(this.quad){
      this.quad.updateQuad(this.time)
    }
    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.render.bind(this))
  }
}

new Ctx({
  dom: document.getElementById("container")
});
