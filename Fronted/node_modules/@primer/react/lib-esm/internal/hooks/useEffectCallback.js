import { useRef, useEffect, useCallback } from 'react';

/**
 * Create a callback that can be used within an effect without re-running the
 * effect when the values used change. The callback passed to this hook will
 * always see the latest snapshot of values that it uses and does not need to
 * use a dependency array.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useEffectCallback(callback) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  return useCallback((...args) => {
    return savedCallback.current(...args);
  }, []);
}

export { useEffectCallback };
