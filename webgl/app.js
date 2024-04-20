
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from "dat.gui";


import fragment from "./shader/base/fragment.js";
import vertex from "./shader/base/vertex.js";
import { useFBO } from './utils/fbo/useFBO.ts';
import usePreload from './utils/preload/usePreload.ts';
import assets from './assets.json'

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

    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0
    this.clock = new THREE.Clock()

    this.fbo = useFBO({ 
      res: 128,
      width: this.width,
      height: this.height,
      renderer: this.renderer,
      vShader: vertex,
      fShader: fragment
    })

    this.isPlaying = true;
    
    this.loadAssets()
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  settings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
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
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: null },
        resolution: { value: new THREE.Vector4() },
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  loadAssets() {
    this.loader = usePreload(assets)
    this.loader.then(({ loadedAssets, progress }) => {
      console.log('All assets loaded: ', loadedAssets)
      console.log('Progress: ', progress.loaded, '/', progress.total)
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
    this.material.uniforms.time.value = this.time

    requestAnimationFrame(this.render.bind(this))

    this.fbo.fboMat.uniforms.uPosition.value = this.fbo.buffer2.texture

    this.renderer.setRenderTarget(this.fbo.buffer1)
    this.renderer.render(this.fbo.fboScene, this.fbo.fboCam)

    this.renderer.setRenderTarget(null)

    this.renderer.render(this.scene, this.camera)

    // Swap render targets
    // let temp = this.fbo.buffer1
    // this.fbo.buffer1 = this.fbo.buffer2
    // this.fbo.buffer1 = temp
  }
}

new Ctx({
  dom: document.getElementById("container")
});
