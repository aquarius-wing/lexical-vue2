<script>

import {getCurrentInstance, inject, ref, watch} from '@vue/composition-api';

export default {
  setup() {

    const {index, updateIndex} = inject('index')
    const onEnter = inject('onEnter')

    const component = getCurrentInstance()

    const item = ref()

    const key = parseInt(component?.vnode.key)

    watch(index, () => {
      if (key === index)
        item.value?.scrollTo()
    })

    return {
      updateIndex,
      onEnter,
      key,
      index,
    }
  }
}
</script>

<template>
  <div
    ref="item" class="dropdown-menu-item" :class="{ 'dropdown-menu-item-active': key === index }"
    style="user-select: none"
    @mouseenter="() => updateIndex(key)"
    @click="onEnter"
  >
    <slot />
  </div>
</template>

<style scoped>

</style>
