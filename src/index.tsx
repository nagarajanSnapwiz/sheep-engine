import React, {
  FC,
  HTMLAttributes,
  ReactChild,
  Suspense,
  useContext,
  useCallback
} from 'react';
import {
  Box2dContext,
  Box2ContextWrapper,
  useGlobalBox2d,
} from './Box2dContextWrapper';


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

  const { box2d: b2 } = useGlobalBox2d();
  console.log('loaded', { box2d, ready, b2, equal: box2d === b2 });
  return (
    <div>
      <h1>{ready ? `Loaded 6 5 box2d` : `Loading...`}</h1>
    </div>
  );
};
