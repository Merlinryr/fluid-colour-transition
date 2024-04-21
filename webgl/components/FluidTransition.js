import vertex from '../shader/base/vertex.glsl'
import fragment from '../shader/base/fragment.glsl'
import { Uniform } from 'three'
import { Vector2 } from 'three'
import Triangle from '../utils/fbo/triangle'
import { Mesh } from 'three'
import { RawShaderMaterial } from 'three'

const uniforms = {
  uResolution: new Uniform(new Vector2()),
  uTime: new Uniform(0.0),
  uAmount: new Uniform(0.0),
  uSpeed: new Uniform(0.2),
  uScale: new Uniform(0.5),
  uProgress: new Uniform(1.0),
  uCurtains: new Uniform(50.0),
  tBackground: new Uniform(),
  tTransition: new Uniform(),
  tDiffuse: new Uniform(),
}


export class FluidTransition {
  constructor({ opts, assets, gui }) {
    this.size = { w: opts.width, h: opts.height }
    this.scene = opts.scene
    this.assets = assets

    this.gui = gui
    this.createQuad()
  }

  createQuad() {
    this.material = new RawShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: uniforms,
    })

    // Update textures
    this.material.uniforms.tDiffuse.value = this.assets.texture1
    this.material.uniforms.tBackground.value = this.assets.background
    this.material.uniforms.tTransition.value = this.assets.transition

    this.updateResolution(this.size.w, this.size.h)

    this.quad = new Mesh(Triangle, this.material)
    this.quad.position.set(0, 0, 0)

    this.scene.add(this.quad)

    this.updateUniforms()
  }

  updateUniforms() {  
    if(this.gui && uniforms) {
      this.gui.add(uniforms.uSpeed, 'value', 0.0, 5, 0.05).name('Speed')
      this.gui.add(uniforms.uScale, 'value', 0.5, 5, 0.05).name('Scale')
      this.gui.add(uniforms.uProgress, 'value', 0.0, 2.0, 0.05).name('Grid Opacity')
      this.gui.add(uniforms.uCurtains, 'value', 0.0, 100.0, 1.0).name('Curtains')
    }
  }

  updateResolution(w, h) {
    if(this.material){
      this.material.uniforms.uResolution.value.set(w, h)
    }
  }

  updateQuad(t) {
    if(this.material){
      this.material.uniforms.uTime.value = t*0.35
    }
  }
}