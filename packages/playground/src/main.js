import Vue from 'vue'
import App from './App.vue'
import VueCompositionApi from '@vue/composition-api';
import Teleport from 'vue2-teleport-component'

Vue.use(VueCompositionApi);
Vue.use(Teleport, { prefix: 'Vue2' })


Vue.config.productionTip = false

import './assets/style.css'

new Vue({
    render: h => h(App),
}).$mount('#app')
