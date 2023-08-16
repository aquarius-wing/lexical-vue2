import {watchEffect} from "@vue/composition-api";

/**
 * @internal
 */
export function useEffect(cb, options) {
  watchEffect((onInvalidate) => {
    const unregister = cb()

    onInvalidate(() => unregister?.())
  }, {
    flush: 'post',
    ...options,
  })
}
