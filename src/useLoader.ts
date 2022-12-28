import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';


type UseLoaderArgs = {
  resources: {[key: string]: string}
};

export function useLoader({ resources }: UseLoaderArgs){
  const [resourcesResult,setResourcesResult] = useState<PIXI.utils.Dict<PIXI.LoaderResource>>();
  const loaderRef = useRef<PIXI.Loader>();
  
  
  useEffect(()=>{
    loaderRef.current = new PIXI.Loader();
    Object.keys(resources).forEach((key)=> {
      loaderRef.current?.add(key, resources[key]);
    })
    loaderRef.current.onProgress.add((x) => {
      // console.log('progress', x)
    }); 

    loaderRef.current.load((loader, resources) => {
      setResourcesResult(resources);
    });


    return () => {
      loaderRef.current?.destroy();
      if(resourcesResult){
        for(const key of Object.keys(resourcesResult)){
          
          if(resourcesResult[key].textures){
            for(const r of Object.keys(resourcesResult[key].textures!) ){
              //@ts-ignore
              resourcesResult[key].textures[r].destroy(true);

            }
          }
          if(resourcesResult[key].texture){
            resourcesResult[key].texture?.destroy(true);
          }
        }
      }
    }
    
  },[]);


  return resourcesResult;

}