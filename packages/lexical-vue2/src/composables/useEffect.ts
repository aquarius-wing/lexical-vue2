import {watchEffect} from "@vue/composition-api";
import type {WatchOptionsBase} from "@vue/composition-api";

/**
 * @internal
 */
export function useEffect(cb: () => (() => any) | undefined, options?: WatchOptionsBase) {
  watchEffect((onInvalidate) => {
    const unregister = cb()

    onInvalidate(() => unregister?.())
  }, {
    flush: 'post',
    ...options,
  })
}
