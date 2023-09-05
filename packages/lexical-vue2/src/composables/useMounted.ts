import { onMounted, onUnmounted } from '@vue/composition-api';
/**
 * @internal
 */
export function useMounted(cb: () => () => any) {
  let unregister: () => void

  onMounted(() => {
    unregister = cb()
  })

  onUnmounted(() => {
    unregister?.()
  })
}
