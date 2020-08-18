import Vue from 'vue'

import './styles/quasar.sass'
import 'quasar/dist/quasar.ie.polyfills'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'

import {
    Quasar,
    QCard,
    QCardSection,
    QCardActions,
    QBtn
  } from 'quasar'

import 'quasar/dist/quasar.min.css'

Vue.use(Quasar, {
    components: {
      QCard,
      QCardSection,
      QCardActions,
      QBtn
    }
  })