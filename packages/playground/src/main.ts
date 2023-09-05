import Vue from 'vue'
// @ts-ignore
import App from './App.vue'
import VueCompositionApi from '@vue/composition-api';
// @ts-ignore
import Teleport from 'vue2-teleport-component'

Vue.use(VueCompositionApi);
Vue.use(Teleport)


Vue.config.productionTip = false

import './assets/style.css'

new Vue({
    render: h => h(App),
}).$mount('#app')
