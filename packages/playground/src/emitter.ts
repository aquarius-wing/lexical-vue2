import {createCommand, createEmitter} from 'powerful-mitt';

const emitter = createEmitter({
  key: true,
  priority: true,
  failEmit: true,
  commandNest: true,
})


export const MARKDOWN_CHANGED_COMMAND = createCommand('MARKDOWN_CHANGED')
export const LEXICAL_CHANGED_COMMAND = createCommand('LEXICAL_CHANGED')
export default emitter