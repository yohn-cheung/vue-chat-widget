import Vue from 'vue'
import './chat.css'

export default Vue.extend({
  name: 'simac-chat',
  data() {
    return {
      title: 'ChatBot',
      icon: 'close'
    }
  },
  methods: {
    toggleButtonChat() {
      const wrapper = document.getElementById('wrapper')
      wrapper.style.display = wrapper.style.display === 'none' ? '' : 'none';
      
      if(wrapper.style.display === 'none' ){
        this.icon = 'chat'
      } else {
        this.icon = 'close'
      }
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
        icon: this.icon,
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
