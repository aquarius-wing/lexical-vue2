<script>
import Teleport from 'vue2-teleport-component';
import {useSlashMenuPlugin} from "@/composables";
import DropdownMenu from "@/components/DropdownMenu.vue";
import DropdownMenuItem from '@/components/DropdownMenuItem.vue'

export default {
  setup(props) {
    return useSlashMenuPlugin(props)
  },
  components: {
    DropdownMenu,
    DropdownMenuItem,
    Teleport
  }
}

</script>

<template>
  <Teleport v-if="data.isShow" :to="rootContainer">
    <DropdownMenu
        :hidden-on-click="true"
        :hidden-on-selection-change="false"
        :style="{ top: `${data.top}px`, left: `${data.left}px` }"
        :element="editor.getRootElement()"
        class="insert-block-menu"
        @hide="data.isShow = false"
        @choose="onChoose"
    >
      <div v-if="filterBlockFormats.length === 0" class="no-result">
        没有结果
      </div>
      <DropdownMenuItem v-for="(blockFormat, index) in filterBlockFormats" :key="index" :class="blockFormat.className">
        <span class="mr-auto dropdown-menu-item-title">{{ blockFormat.name }}</span>
        <span class="dropdown-menu-item-subtitle" v-if="blockFormat.wordsToShow">
          {{ blockFormat.wordsToShow }}
        </span>
      </DropdownMenuItem>
    </DropdownMenu>
  </Teleport>

</template>

<style>

</style>