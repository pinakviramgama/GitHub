'use strict';

var React = require('react');

function useEffectOnce(callback) {
  const savedCallback = React.useRef(callback);
  const called = React.useRef(false);
  React.useEffect(() => {
    if (called.current === true) {
      return;
    }
    called.current = true;
    savedCallback.current();
  }, []);
}

exports.useEffectOnce = useEffectOnce;
