import { createApp } from "/node_modules/.vite/deps/vue.js?v=4989f9f2"
import App from "/src/App.vue"
import router from "/src/router/index.js"
import "/node_modules/bootstrap/dist/css/bootstrap.min.css"
import "/node_modules/.vite/deps/bootstrap_dist_js_bootstrap__bundle__min__js.js?v=8f2884d6"
import "/node_modules/bootstrap-icons/font/bootstrap-icons.css"
import "/src/assets/global.css"
import Toast, { POSITION } from "vue-toastification"
import "vue-toastification/dist/index.css"

const app = createApp(App)

app.use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
})

app.use(router)
app.mount('#app')
