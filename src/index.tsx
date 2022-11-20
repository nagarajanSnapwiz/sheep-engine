import React, {
  FC,
  HTMLAttributes,
  ReactChild,
  useState,
  useEffect,
} from 'react';
import {
  Box2ContextWrapper,
  useGlobalBox2d,
} from './Box2dContextWrapper';
import { Box2dWorld } from './Box2dWorld';
import { PhysicsObject } from './PhysicsObject';

//@ts-ignore
if (import.meta.hot) {
  //@ts-ignore
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.location.reload();
  });
}

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
  const [enable, setEnable] = useState(true);
  const [enableCircle, setEnableCircle] = useState(true);

  useEffect(() => {
    setTimeout(() => setEnableCircle(false), 7 * 1000);
    setTimeout(() => setEnableCircle(true), 13 * 1000);
  }, []);

  if (!box2d) {
    return <h1>Loading...</h1>;
  }

  //console.log('loaded', { box2d, ready});
  return (
    <div>
      <h1>{ready ? `Loaded 6 5 box2d` : `Loading...`}</h1>
      {ready && (
        <button onClick={() => setEnable((x) => !x)}>
          Toggle {enable ? '600' : '300'}
        </button>
      )}
      {ready && <button>Toggle Noop</button>}
      <Box2dWorld
        width={enable ? 600 : 300}
        height={enable ? 300 : 600}
        gravity={[0, 10]}
        box2d={box2d}
        ground={true}
      >
        <PhysicsObject
          simpleShape
          type="dynamic"
          shape="rectangle"
          density={1}
          restitution={0.5}
          x={110}
          y={5}
          height={30}
          width={30}
          fillColor="red"
          strokeWidth={20}
          strokeColor="blue"
        />

        <PhysicsObject
          simpleShape
          type="dynamic"
          shape="rectangle"
          density={1}
          restitution={0.4}
          x={100}
          y={80}
          height={30}
          width={90}
          fillColor="red"
          strokeWidth={2}
          strokeColor="blue"
        />

        {enableCircle && (
          <PhysicsObject
            simpleShape
            type="dynamic"
            restitution={0.5}
            shape="circle"
            x={100}
            y={90}
            strokeWidth={15}
            radius={6}
            strokeColor="orange"
            fillColor="violet"
          />
        )}

        {/* <Rectangle x={30} y={5} width={100} height={70} fillColor="red" strokeWidth={2} strokeColor="green" /> */}
        {/* <Circle radius={6} x={enable?200:400} y={90} strokeWidth={15} strokeColor="orange" fillColor='pink' /> */}
      </Box2dWorld>
    </div>
  );
};

export { Box2dWorld };
