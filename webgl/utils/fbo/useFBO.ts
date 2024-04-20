import { DataTexture, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType, WebGLRenderer } from "three"
import { useRenderTarget } from "./useRenderTarget"

// ### HOW TO USE FBO ######################################################
// #########################################################################
// #########################################################################

// render(){
//   requestAnimationFrame(this.render.bind(this))

//   this.fbo.fboMat.uniforms.uPosition.value = this.fbo.buffer2.texture // PROVIDE ANOTHER MATERIAL TO MANAGE THE SWAP

//   this.renderer.setRenderTarget(this.fbo.buffer1)
//   this.renderer.render(this.fbo.fboScene, this.fbo.fboCam)

//   this.renderer.setRenderTarget(null)

//   this.renderer.render(this.scene, this.camera)

//   // Swap render targets
//   let temp = this.fbo.buffer1
//   this.fbo.buffer1 = this.fbo.buffer2
//   this.fbo.buffer1 = temp
// }

// #########################################################################
// #########################################################################
// #########################################################################

interface OptionsFBO {
  res: number;
  width: number;
  height: number;
  vShader: string;
  fShader: string;
  renderer: WebGLRenderer;
}

interface FBOSetupResult {
  buffer1: WebGLRenderTarget;
  buffer2: WebGLRenderTarget;
  data: DataTexture;
  fboScene: Scene;
  fboCam: OrthographicCamera;
  fboMat: ShaderMaterial;
}

export const useFBO = ( options: OptionsFBO ) : FBOSetupResult => 
{
  
  const size = options.res
  const w = options.width
  const h = options.height
  const vertex = options.vShader
  const fragment = options.fShader

  const fbo: WebGLRenderTarget = useRenderTarget(w, h)
  const fbo1: WebGLRenderTarget = useRenderTarget(w, h)
  const mainRenderer: WebGLRenderer = options.renderer

  const fboScene: Scene = new Scene()
  const fboCam: OrthographicCamera = new OrthographicCamera(-1, 1, 1, -1, -1, 1)
  
  // @ts-ignore
  fboCam.position.set(0, 0, 0.5)
  fboCam.lookAt(0, 0, 0)

  let geometry: PlaneGeometry = new PlaneGeometry(2, 2)

  const data: Float32Array = new Float32Array(size * size * 4)

  for(let i = 0; i < size; i++){
    for(let j = 0; j < size; j++){
      let index = (i + j * size) * 4
      data[index + 0] = 0.
      data[index + 1] = 0.
      data[index + 2] = 1.
      data[index + 3] = 1.
    }
  }

  // @ts-ignore
  const fboTexture: DataTexture = new DataTexture(data, size, size, RGBAFormat, FloatType)
  fboTexture.magFilter = NearestFilter
  fboTexture.minFilter = NearestFilter
  fboTexture.needsUpdate = true

  const fboMaterial: ShaderMaterial = new ShaderMaterial({
    uniforms: {
      uPosition: { value: fboTexture },
      uInfo: { value: null },
      time: { value: 0 },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  })

  // @ts-ignore
  const fboMesh: Mesh = new Mesh(geometry, fboMaterial)

  fboScene.add(fboMesh)

  // SWAP TEXTURES FBO - FBO1
  // mainRenderer.setRenderTarget(fbo)
  // mainRenderer.render(fboScene, fboCam)

  // mainRenderer.setRenderTarget(fbo1)
  // mainRenderer.render(fboScene, fboCam)


  return {
    buffer1: fbo,
    buffer2: fbo1,
    data: fboTexture,
    fboScene: fboScene,
    fboCam: fboCam,
    fboMat: fboMaterial
  }
}