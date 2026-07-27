import { useEffect, useRef, useState } from 'react';

export function useChartAnimationKey(animated: boolean, replayToken?: number | string): number {
  const [animationKey, setAnimationKey] = useState(() => (animated ? 1 : 0));
  const prevAnimated = useRef(animated);
  const prevReplayToken = useRef(replayToken);

  useEffect(() => {
    const animatedTurnedOn = animated && !prevAnimated.current;
    const replayTokenChanged =
      animated &&
      replayToken !== undefined &&
      prevReplayToken.current !== undefined &&
      replayToken !== prevReplayToken.current;

    if (animatedTurnedOn || replayTokenChanged) {
      setAnimationKey((key) => key + 1);
    }

    prevAnimated.current = animated;
    prevReplayToken.current = replayToken;
  }, [animated, replayToken]);

  return animationKey;
}
