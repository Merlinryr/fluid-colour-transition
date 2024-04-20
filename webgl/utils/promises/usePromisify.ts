import { Loader } from "three";

export default function promisifyLoader ( loader: Loader, onProgress: number ) {
  function promiseLoader ( url: string ) {

    return new Promise( ( resolve, reject ) => {

      // @ts-ignore
      loader.load( url, resolve, onProgress, reject );

    } );
  }

  return {
    originalLoader: loader,
    load: promiseLoader,
  };
}
