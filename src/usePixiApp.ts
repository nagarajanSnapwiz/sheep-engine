import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

type UsePixiArgs = PIXI.IApplicationOptions & {
    background?: string,
    width: number,
    height: number,
    domRef: React.MutableRefObject<HTMLElement|null>
}

export function usePixiApp(options:UsePixiArgs){
    const { background="0x0", width, height, domRef} = options;
    const appRef = useRef<PIXI.Application|null>(null);
    const [app,setApp] = useState<PIXI.Application|null>(null);

    useEffect(()=>{

        const pixiApp = new PIXI.Application({...options, });
        if(domRef.current){
            domRef.current.textContent = "";
        }
        domRef.current?.appendChild(pixiApp.view);
        setApp(pixiApp);


        return () =>{
            if(app){
                app.destroy(true,{children: true, texture:true,baseTexture:true});
                setApp(null);
                if(domRef.current){
                    domRef.current.textContent="";
                } else {
                    console.warn('domRef current undefined',domRef.current);
                }
                
            }
        }
    },[width,height,background])

    return app;

}