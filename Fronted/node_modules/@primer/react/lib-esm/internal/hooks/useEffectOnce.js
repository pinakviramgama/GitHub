import { useRef, useEffect } from 'react';

function useEffectOnce(callback) {
  const savedCallback = useRef(callback);
  const called = useRef(false);
  useEffect(() => {
    if (called.current === true) {
      return;
    }
    called.current = true;
    savedCallback.current();
  }, []);
}

export { useEffectOnce };
