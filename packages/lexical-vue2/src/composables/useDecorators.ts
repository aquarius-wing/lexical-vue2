import {computed, h as _h, ref, unref} from '@vue/composition-api';
import Teleport from 'vue2-teleport-component';
import { useMounted } from './useMounted';
import {LexicalEditor} from "lexical";
import {VNode} from "vue";

export function useDecorators(editor: LexicalEditor) {
  const decorators = ref<Record<string, any>>({});
  useMounted(() => {
    const listen = (nextDecorators: Record<string, any>) => {
      decorators.value = nextDecorators;
    }
    editor._listeners.decorator.add(listen)
    decorators.value = editor.getDecorators();
    return () => {
      editor._listeners.decorator.delete(listen)
    }
  });

  // Return decorators defined as Vue Teleports
  return computed(() => {
    const decoratedTeleports: VNode[] = [];
    const decoratorKeys = Object.keys(unref(decorators));
    for (let i = 0; i < decoratorKeys.length; i++) {
      const nodeKey = decoratorKeys[i];
      const vueDecorator = decorators.value[nodeKey];
      const element = editor.getElementByKey(nodeKey);

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
        }, [vueDecorator]);
        decoratedTeleports.push(teleport);
      }
    }
    return decoratedTeleports;
  });
}
