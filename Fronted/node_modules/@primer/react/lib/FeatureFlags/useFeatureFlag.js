'use strict';

var React = require('react');
var FeatureFlagContext = require('./FeatureFlagContext.js');

/**
 * Check if the given feature flag is enabled
 */
function useFeatureFlag(flag) {
  const context = React.useContext(FeatureFlagContext.FeatureFlagContext);
  return context.enabled(flag);
}

exports.useFeatureFlag = useFeatureFlag;
