import { useContext } from 'react';
import { FeatureFlagContext } from './FeatureFlagContext.js';

/**
 * Check if the given feature flag is enabled
 */
function useFeatureFlag(flag) {
  const context = useContext(FeatureFlagContext);
  return context.enabled(flag);
}

export { useFeatureFlag };
