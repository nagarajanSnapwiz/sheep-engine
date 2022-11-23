import React, {
  FC,
  HTMLAttributes,
  ReactChild,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Box2ContextWrapper } from './Box2dContextWrapper';
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
  const [enable, setEnable] = useState(true);
  const [enableCircle, setEnableCircle] = useState(true);

  useEffect(() => {
    setTimeout(() => setEnableCircle(false), 7 * 1000);
    setTimeout(() => setEnableCircle(true), 13 * 1000);
  }, []);

  const worldRef = useRef<any>();

  //console.log('loaded', { box2d, ready});
  return (
    <div>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Id asperiores,
        aliquid veniam ea facere alias sint cum natus itaque eaque non possimus?
        Quae distinctio exercitationem rerum eos eligendi ab qui.
      </p>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Id asperiores,
        aliquid veniam ea facere alias sint cum natus itaque eaque non possimus?
        Quae distinctio exercitationem rerum eos eligendi ab qui.
      </p>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Id asperiores,
        aliquid veniam ea facere alias sint cum natus itaque eaque non possimus?
        Quae distinctio exercitationem rerum eos eligendi ab qui.
      </p>
      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Id asperiores,
        aliquid veniam ea facere alias sint cum natus itaque eaque non possimus?
        Quae distinctio exercitationem rerum eos eligendi ab qui.
      </p>
      <button onClick={() => setEnable((x) => !x)}>
        Toggle {enable ? '600' : '300'}
      </button>

      {enable && (
        <>
          <Box2dWorld
            ref={worldRef}
            width={600}
            height={300}
            gravity={[0, 10]}
            ground={true}
            fallback={<h1>Loading...</h1>}
          >
            <PhysicsObject
              simpleShape
              type="static"
              shape="rectangle"
              density={1}
              restitution={0.1}
              x={180}
              y={60}
              height={30}
              width={60}
              fillColor="gray"
              strokeWidth={20}
              strokeColor="green"
            />
            <PhysicsObject
              simpleShape
              type="static"
              shape="rectangle"
              density={1}
              restitution={0.1}
              x={270}
              y={150}
              height={30}
              width={60}
              fillColor="gray"
              strokeWidth={20}
              strokeColor="green"
            />

            <PhysicsObject
              simpleShape
              type="static"
              shape="rectangle"
              density={1}
              restitution={0.1}
              x={355}
              y={63}
              height={30}
              width={60}
              fillColor="gray"
              strokeWidth={20}
              strokeColor="green"
            />

            <PhysicsObject
              simpleShape
              type="dynamic"
              shape="rectangle"
              density={1}
              restitution={0.9}
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
              restitution={0.9}
              x={100}
              y={80}
              cameraOffset={{ x: 70 }}
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
                restitution={0.9}
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
          <button onClick={() => worldRef?.current?.setRelativeOffset(-3)}>
            {'<- left'}
          </button>
          <button onClick={() => worldRef?.current?.setRelativeOffset(+3)}>
            {'right ->'}
          </button>
        </>
      )}
    </div>
  );
};

export { Box2dWorld };
