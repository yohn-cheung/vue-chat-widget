import Vue from 'vue'

// import './styles/quasar.sass'
// import 'quasar/dist/quasar.ie.polyfills'
// import '@quasar/extras/roboto-font/roboto-font.css'
// import '@quasar/extras/material-icons/material-icons.css'
// import 'quasar/dist/quasar.min.css'

import {
    Quasar,
    QCard,
    QCardSection,
    QChatMessage,
    QInput,
    QChip,
    QSpinnerDots,
    QBtn,
    QAvatar,
    QItem,
    QItemSection,
    QItemLabel,
    LocalStorage,
    Platform
  } from 'quasar'



Vue.use(Quasar, {
    components: {
      QCard,
      QCardSection,
      QChatMessage,
      QInput,
      QChip,
      QSpinnerDots,
      QBtn,
      QAvatar,
      QItem,
      QItemSection,
      QItemLabel,
    },
    plugins: {
      LocalStorage,
      Platform
    }
  })