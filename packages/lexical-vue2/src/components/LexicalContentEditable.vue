<script>
import {inject, onMounted, ref, toRaw} from "@vue/composition-api";

export default {
  setup() {
    const rootRef = ref(null)
    const editor = inject('editor')
    const editable = ref(true)
    onMounted(() => {
      if (rootRef.value) {
        editor.setRootElement(toRaw(rootRef.value))
        editable.value = editor.isEditable()
      }
      editor.registerEditableListener((currentIsEditable) => {
        this.editable.value = currentIsEditable
      })
    })
    return {
      rootRef,
      editable
    }
  },
  props: {
    ariaActivedescendant: {
      type: String,
    },
    ariaAutocomplete: {
      type: String,
      enum: ['none', 'inline', 'list', 'both'],
    },
    ariaControls: {
      type: String,
    },
    ariaDescribedby: {
      type: String,
    },
    ariaExpanded: {
      type: Boolean,
    },
    ariaLabel: {
      type: String,
    },
    ariaLabelledby: {
      type: String,
    },
    ariaMultiline: {
      type: Boolean,
    },
    ariaOwns: {
      type: String,
    },
    ariaRequired: {
      type: Boolean,
    },
    autoCapitalize: {
      type: Boolean,
    },
    autoComplete: {
      type: Boolean,
    },
    autoCorrect: {
      type: Boolean,
    },
    id: {
      type: String,
    },
    role: {
      type: String,
      default: 'textbox',
    },
    spellcheck: {
      type: Boolean,
      default: true
    },
    tabindex: {
      type: Number,
    },
    enableGrammarly: {
      type: Boolean,
    },
  },
}
</script>

<template>
  <div
      :id="id"
      ref="rootRef"
      :aria-activedescendant="!editable ? undefined : ariaActivedescendant"
      :aria-autocomplete="!editable ? undefined : ariaAutocomplete"
      :aria-controls="!editable ? undefined : ariaControls"
      :aria-describedby="ariaDescribedby"
      :aria-expanded="!editable ? undefined : role === 'combobox' ? !!ariaExpanded ? ariaExpanded : undefined : undefined"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-multiline="ariaMultiline"
      :aria-owns="!editable ? undefined : ariaOwns"
      :aria-required="ariaRequired"
      :autocapitalize="`${autoCapitalize}`"
      :autocomplete="autoComplete"
      :autocorrect="`${autoCorrect}`"
      :contenteditable="editable"
      :role="!editable ? undefined : role"
      :spellcheck="spellcheck"
      :tabindex="tabindex"
  />
</template>

<style>

</style>
