import React, {
    useEffect,
    createContext,
    useRef,
    useLayoutEffect,
    useState,
  } from 'react';
  import * as PIXI from 'pixi.js';


  type UsePhysicsArg = {
    shape: "rectangle"|"circle"
  }

  export function usePhysics({shape}: UsePhysicsArg){
    const graphicsRef = useRef<PIXI.Sprite|null>(null);

    useEffect(()=>{
        //console.log('graphicsRef',graphicsRef);
    },[shape])

    return [graphicsRef];

  }