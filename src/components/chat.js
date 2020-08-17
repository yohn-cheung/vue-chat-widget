import Vue from 'vue'
import './chat.css'

export default Vue.extend({
  name: 'simac-chat',
  data() {
    return {
      title: 'ChatBot'
    }
  },
  methods: {
    toggleButtonChat() {
      // this.toggleChat = !this.toggleChat
      console.log('test')

      const wrapper = document.getElementById('wrapper')
			wrapper.style.display = wrapper.style.display === 'none' ? '' : 'none';
    }
  },
  render(createElement) {

    const title = createElement('q-card-section', [createElement('div', {class: 'text-h6'}, this.title)])

    const body = createElement('q-card-section', {
      class: 'q-pt-none'
    }, 'This is be Franckys input')

    const wrapper = createElement('q-card', { 
      class: 'my-card q-my-md',
      attrs: {id: 'wrapper'},
      props: {
        flat: true,
        bordered: true
      }
    }, [title, body])
    const button = createElement('q-btn', {
      class: 'float-right',
      props: {
        icon: 'chat',
        round: true,
        size: 'md'
      },
      on: {
        click: this.toggleButtonChat
      }
    })

    return createElement('div', {
      class: 'simac-chat q-pa-md fixed-bottom-right'
    }, [wrapper, button])
  }
})
