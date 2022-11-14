import React, { useEffect,useRef, useState } from 'react';
import Box2dFactory from 'box2d-wasm';

export const Box2dContext = React.createContext<typeof Box2D|null>(null)

type Box2dType = typeof Box2D & EmscriptenModule;

const SCRIPT_DIRECTORY = 'https://unpkg.com/box2d-wasm@7.0.0/dist/es/';

export function useGlobalBox2d(){
    /**
     * Ugly hack to handle hmr seamlessly 
     */
   const [loadedBox2d,setBox2d] = useState<Box2dType>();
   useEffect(()=>{
    let active = true;
    if('_box2d' in window){
        //@ts-ignore
       if(active) setBox2d(window!._box2d);
    } else {
        Box2dFactory({
            locateFile: (url) => `${SCRIPT_DIRECTORY}${url}`
        }).then(box2d => {
            if(active) setBox2d(box2d);
            //@ts-ignore
            window['_box2d'] = box2d;
        })
    }
    
    return () =>{
        active = false; 
    }
   },[])

   return {box2d: loadedBox2d, ready: !!loadedBox2d};
}

export const Box2ContextWrapper = React.lazy(() => {
  return Box2dFactory()
    .then(box2d => {
      return {
        default: ({ children }: React.PropsWithChildren) => {
          return (
            <Box2dContext.Provider value={box2d}>
              {children}
            </Box2dContext.Provider>
          );
        },
      };
    });
});
