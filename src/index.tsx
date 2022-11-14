import React, {
  FC,
  HTMLAttributes,
  ReactChild,
  Suspense,
  useContext,
  useCallback,
  useState
} from 'react';
//@ts-ignore
import Ticker from 'ticker-js';
import {
  Box2dContext,
  Box2ContextWrapper,
  useGlobalBox2d,
} from './Box2dContextWrapper';
import {Box2dWorld} from './Box2dWorld';
import { Rectangle, Circle, Ellipse } from './SimpleShapes';
import { usePhysics } from './usePhysics';
import * as PIXI from 'pixi.js';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactChild;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * A custom Thing component. Neat!
 */
export const Thing = ({ children }: React.PropsWithChildren) => {
  return <div>{children || `the snozzberries taste like snozzberries`}</div>;
};



const Wrap: FC<Props> = ({ children }) => {
  return <Box2ContextWrapper>{children}</Box2ContextWrapper>;
};

export const LogBox2d: FC<Props> = () => {
  const { box2d, ready } = useGlobalBox2d();
  const [enable,setEnable] = useState(true);
  const [rectangleRef] = usePhysics({shape:"rectangle"});

  if(!box2d){
    return <h1>Loading...</h1>
  }

  
  //console.log('loaded', { box2d, ready});
  return (
    <div>
      <h1>{ready ? `Loaded 6 5 box2d` : `Loading...`}</h1>
      {ready && <button onClick={()=> setEnable(x => !x)}>Toggle {enable?"600":"300"}</button>}
      {ready && <button >Toggle Noop</button>}
      <Box2dWorld width={enable?300:600} height={enable?600:300} box2d={box2d}>
        <Rectangle ref={rectangleRef} x={30} y={5} width={100} height={70} fillColor="red" strokeWidth={2} strokeColor="green" />
        <Circle radius={6} x={enable?200:400} y={90} strokeWidth={15} strokeColor="orange" fillColor='pink' />
      </Box2dWorld>
    </div>
  );
};

export { Box2dWorld };
