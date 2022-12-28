import { AppContext } from './Box2dWorld';
import * as PIXI from 'pixi.js';
import {
  useEffect,
  forwardRef,
  MutableRefObject,
  useContext,
  useRef,
} from 'react';

type AdditionalHooksFactory = (props: { [k: string]: any }, item: any) => void;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = false;
PIXI.settings.RESOLUTION = 1;

function makeReactComponent(
  factory: any,
  additionalHooks?: AdditionalHooksFactory
) {
  return forwardRef((props: { [k: string]: any }, ref) => {
    const {from,scale,constructArgs,..._props} = props;
    const propKeys = Object.keys(_props);

    const app = useContext(AppContext)!;
    const internalRef = useRef<unknown>();
    useEffect(() => {
      if (from||constructArgs) {
        internalRef.current = from? factory.from(from): new factory(constructArgs);
        const displayObject = internalRef.current as any;
        if(scale){
            displayObject.scale.set(scale)
        }
        if (ref) {
          (ref as MutableRefObject<any>).current = displayObject;
        }

        for (const key of propKeys) {
          displayObject[key] = props[key];
        }

        console.log('sprite', displayObject, app);

        app.stage.addChild(displayObject);
      }
    }, [from, constructArgs]);

    if (additionalHooks) {
      additionalHooks(props,internalRef);
    }

    useEffect(() => {
      return () => {
        if (internalRef.current) {
          (internalRef.current as any).destroy(true);
        }
      };
    }, []);

    return null;
  });
}

export const Sprite = makeReactComponent(PIXI.Sprite);

export const AnimatedSprite = makeReactComponent(PIXI.AnimatedSprite,({play}, item) => {

    useEffect(()=>{
        if(item.current){
            if(play){
                item.current.play()
            } else{
                item.current.stop();
            }
        }
    },[play])
});
