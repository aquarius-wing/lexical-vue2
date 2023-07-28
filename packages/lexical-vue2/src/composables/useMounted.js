import { onMounted, onUnmounted } from '@vue/composition-api';
/**
 * @internal
 */
export function useMounted(cb) {
  let unregister;
  onMounted(() => {
    unregister = cb();
  });
  onUnmounted(() => {
    unregister === null || unregister === void 0 ? void 0 : unregister();
  });
}
