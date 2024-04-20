import { LoadingManager, Loader, TextureLoader, ObjectLoader, AnimationLoader, AudioLoader, CubeTextureLoader } from 'three'


// ### HOW TO USE ##########################################################
// #########################################################################
// #########################################################################

// loadAssets() {
//   this.loader = usePreload(assets)
//   this.loader.then(({ loadedAssets, progress }) => {
//     console.log('All assets loaded: ', loadedAssets)
//     console.log('Progress: ', progress.loaded, '/', progress.total)
//   }).catch((error) => {
//     console.log('error: ', error)
//   })
// }

// #########################################################################
// #########################################################################
// #########################################################################

type AssetType = 'texture' | 'model' | 'animation' | 'audio' | 'cube'

interface Asset {
  type: AssetType,
  url: string 
}

interface PreloadProgress {
  loaded: number;
  total: number;
}

type AssetMap = {
  [ key: string ] : Asset
}

type LoadedAssets = {
  [ key: string ] : any
}

function usePreload(assets: AssetMap): Promise<{ loadedAssets: LoadedAssets; progress: PreloadProgress }> {
  return new Promise((resolve, reject) => {
    const loader = new LoadingManager()

    const loadedAssets: LoadedAssets = {}
  
    const loaders: { [ key in AssetType ]: Loader } = {
      texture: new TextureLoader(loader),
      model: new ObjectLoader(loader),
      animation: new AnimationLoader(loader),
      audio: new AudioLoader(loader),
      cube: new CubeTextureLoader(loader)
    }
  
    const totalAssets = Object.keys(assets).length
    let assetsLoaded = 0

    function reportProgress(progress: PreloadProgress) {
      const percentComplete = (progress.loaded / progress.total) * 100;
      console.log(`Loading progress: ${progress.loaded}/${progress.total} (${percentComplete.toFixed(2)}%)`);
    }
  
    const onAssetLoad = (assetKey: string, asset: Asset, loadedAsset: any) => {
      loadedAssets[assetKey] = loadedAsset
      assetsLoaded++

      const progress: PreloadProgress = {
        loaded: assetsLoaded,
        total: totalAssets,
      }
  
      if (assetsLoaded === totalAssets) {
        resolve({ loadedAssets, progress });
      } else {
        // Report progress
        reportProgress(progress);
      }
    }
  
    const onAssetError = (error: any) => {
      reject(error)
    }
  
    for (const key in assets) {
      const asset = assets[key]
  
      const assetLoader = loaders[asset.type]
  
  
      if (assetLoader) {
        assetLoader.load(
          // @ts-expect-error
          asset.url,
          (loadedAsset: any) => {
            onAssetLoad(key, asset, loadedAsset);
          },
          undefined,
          (error: any) => {
            onAssetError(error);
          }
        )
      } else {
        reject(new Error(`Unsupported asset type: ${asset.type}`))
      }
    }
  })
}

export default usePreload