import {computed, getCurrentInstance, h as _h, reactive, ref, unref, watch, watchEffect} from '@vue/composition-api';
import Teleport from 'vue2-teleport-component';
import { useMounted } from './useMounted';
import {mergeRegister} from "@lexical/utils";

export function useDecorators(editor) {
  const decorators = ref({});
  console.log('init decorators', decorators);
  const editorReactive = reactive(editor)
  window.decorators = decorators
  useMounted(() => {
    return mergeRegister(
        editor.registerDecoratorListener((nextDecorators) => {
          console.log('nextDecorators', nextDecorators);
          // decorators.value = Object.keys(nextDecorators).length
            decorators.value = nextDecorators;
          // for (let nextDecoratorsKey in nextDecorators) {
          // console.log('nextDecoratorsKey', nextDecoratorsKey);
          //   decorators.value[nextDecoratorsKey] = nextDecorators[nextDecoratorsKey];
          // }
        }),
    );
  });
  watch(() => decorators.value, () => {
      console.log('new decorators', decorators.value)
  })
  // const length = computed(() => {
  //   console.log('computed decorators length', decorators.value);
  //   return Object.keys(decorators.value).length
  // })
  // watch(length, () => {
  //   console.log('new length', length.value)
  // })

  // watch(() => editor, () => {
  //   console.log('setDecorators', editor.getDecorators())
  //   decorators.value = editor.getDecorators();
  // })
  // return computed(() => {
  //   console.log('computed decorators return', decorators.value);
  //   return Object.keys(decorators.value).length
  // })


  // Return decorators defined as Vue Teleports
  return computed(() => {
    console.log('computed decorators', decorators.value);
    const decoratedTeleports = [];
    const decoratorKeys = Object.keys(unref(decorators));
    for (let i = 0; i < decoratorKeys.length; i++) {
      const nodeKey = decoratorKeys[i];
      const vueDecorator = decorators.value[nodeKey];
      const element = editor.getElementByKey(nodeKey);

      console.log('element', element);
      console.log("vueDecorator", vueDecorator);
      if (element !== null) {
        /**
         * createElement
         * instance.$createElement.apply(instance, args)
         * _createElement
         * 根据extractPropsFromVNodeData函数知道这里要加props
         * initRender
         * 当前问题：mountComponent处能够发现vueDecorator成为了一个comment注释
         */
        const teleport = _h(Teleport, {
          props: {
            to: element,
          },
        }, vueDecorator);
        decoratedTeleports.push(teleport);
      }
    }
    window.decoratedTeleports = decoratedTeleports
    console.log("decoratedTeleports", decoratedTeleports);
    return decoratedTeleports;
  });
}
