import { WebGLRenderTarget, NearestFilter, RGBAFormat, FloatType } from "three"

export const useRenderTarget = (w: number, h: number): WebGLRenderTarget => {
  const renderTarget = new WebGLRenderTarget(w, h, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType
  })

  return renderTarget
}