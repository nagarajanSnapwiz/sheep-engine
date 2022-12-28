import React, {
  FC,
  HTMLAttributes,
  ReactChild,
  useState,
  useEffect,
  useRef,
} from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';

import { Box2ContextWrapper } from './Box2dContextWrapper';
import { Box2dWorld } from './Box2dWorld';
import { PhysicsObject } from './PhysicsObject';
import { useLoader } from './useLoader';
import { Sprite } from './DisplayObjects';

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
  const squareRef = useRef();
  const [enableCircle, setEnableCircle] = useState(true);
  const loadedResources = useLoader({
    resources: { woodCutter: '/texture.json' },
  });
  console.log('loadedResources', loadedResources);

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

      {enable && loadedResources && (
        <>
          <Box2dWorld
            ref={worldRef}
            width={600}
            height={400}
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

            <Sprite
              x={150}
              y={100}
              from={loadedResources!.woodCutter!.textures!.Woodcutter_attack1}
              height={48}
              scale={4}
              width={288}
            />

            <PhysicsObject
              type="dynamic"
              shape="rectangle"
              density={1}
              restitution={0.1}
              x={270}
              y={250}
              height={48*2}
              width={288*2}
            >
              <Sprite
                from={loadedResources!.woodCutter!.textures!.Woodcutter_attack1}
                scale={2}
              />
            </PhysicsObject>

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
              fixedRotation={true}
              ref={squareRef}
              restitution={0.4}
              x={110}
              y={5}
              height={30}
              width={30}
              fillColor="red"
              strokeWidth={20}
              strokeColor="blue"
            />

            <KeyboardEventHandler
              handleKeys={['right', 'left']}
              handleEventType="keydown"
              onKeyEvent={(key, e) => {
                let velocity = { x: 0, y: 0 };
                if (e.type === 'keydown') {
                  if (key === 'right') {
                    velocity.x = 5;
                  } else if (key === 'left') {
                    velocity.x = -5;
                  }
                }
                //@ts-ignore
                squareRef.current.setLinearVelocity(velocity);
                //squareRef.current.applyLinearVelocity(velocity)
                //squareRef.current.applyImpulse(impulse)
              }}
            />

            <KeyboardEventHandler
              handleKeys={['right', 'left']}
              handleEventType="keyup"
              onKeyEvent={(key, e) => {
                //@ts-ignore
                squareRef.current.stopMoving();
                //squareRef.current.updateData({linearVelocity:{x:0,y:0}})
              }}
            />

            {/* <PhysicsObject
              simpleShape
              type="dynamic"
              shape="rectangle"
              density={1}
              restitution={0.3}
              x={100}
              y={80}

              height={30}
              width={90}
              fillColor="red"
              strokeWidth={2}
              strokeColor="blue"
            /> */}

            {/* {enableCircle && (
              <PhysicsObject
                simpleShape
                type="dynamic"
                restitution={0.9}
                shape="circle"
                x={100}
                y={90}
                strokeWidth={15}
                cameraOffset={{ x: 70 }}
                radius={6}
                strokeColor="orange"
                fillColor="violet"
              />
            )} */}

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
