<script>
import useDropdownMenu from "@/composables/useDropdownMenu";

export default {
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    hiddenOnClick: {
      type: Boolean,
      default: false,
    },
    hiddenOnRangeClick: {
      type: Boolean,
      default: false,
    },
    hiddenOnSelectionChange: {
      type: Boolean,
      default: false,
    },
    element: {
      type: HTMLElement,
      default: undefined,
    },
  },
  setup(props, {emit}) {
    return useDropdownMenu(props, emit)
  }
}
</script>

<template>
  <div ref="dropdownMenu" class="dropdown-menu absolute top-0 left-0">
    <slot/>
  </div>
</template>

<style lang="scss">

</style>