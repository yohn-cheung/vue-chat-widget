import Vue from 'vue'

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
    const title = createElement('h4', { class: 'title' }, this.title)
    const body = createElement('div', 'This is be Franckys input') 
    const wrapper = createElement('div', { attrs: {id: 'wrapper'} }, [title, body])
    const button = createElement('button', {
      on: {
        click: this.toggleButtonChat
      }
    }, 'Open/Close Chat')

    return createElement('div', {
      class: 'simac-chat'
    }, [wrapper, button])
  }
})
