import Vue from 'vue'
import './chat.css'

import Amplify, { Interactions } from 'aws-amplify';
import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);
Vue.prototype.$Interactions = Interactions

export default Vue.extend({
  name: 'simac-chat',
  props: ['config'],
  data() {
    return {
      title: this.config.text.title,
      icon: 'close',
      chatInput: '',
      chatConversation: [],
      visibleSpiner: false,
      btnOptions: [],
      optionVisible: false,
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
    },
    getOptions(options, slotToElicit, createElement) {
      if (!options) {
        return
      }

      const buttons = []
      let self  = this

      options.buttons.forEach(option => {

        const button = createElement('q-chip', { props: { outline: true } }, [
          createElement('q-btn', {
            props: {
              round: true,
              flat: true
            }, 
            on: {
              click: function(event) {
                self.sendOption(option.value, createElement)
              }
            }
          }, option.text)])

          buttons.push(button)
      });

      const div = createElement('div', [buttons])

      setTimeout(() => {
        this.btnOptions.push(div)
      }, 1800)
    },
    async sendOption (option, createElement) {
      await this.sendUserMessage(option, createElement)
    },
    async sendTolex(input) {
      const response = await Interactions.send(
        'ScheduleAppointment_playground',
        input
      )
      return response 
    },
    async sendUserMessage (newMessage, createElement) {
      let options = ''

      if (!newMessage) return
      const botResponse = await this.sendTolex(newMessage)
      console.log('botResponse: ', botResponse)
      if (botResponse.responseCard) {
        options = botResponse.responseCard.genericAttachments[0]
      }

      this.getOptions(options, botResponse.slotToElicit, createElement)
      this.sendBotMessage(botResponse.message, createElement)

      const chat = createElement('q-chat-message', {
        props: {
          avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
          text: [newMessage],
          from: 'me',
          sent: true
        }
      })

      this.chatConversation.push(chat)
    },
    sendBotMessage (message, createElement) {
      setTimeout(() => {
        const chat = createElement('q-chat-message', {
          props: {
            avatar: 'https://tr1.cbsistatic.com/hub/i/r/2015/12/16/978e8dea-5c7d-4482-ab5f-016d7633951c/resize/770x/3117e58fdf7da32dac9d59d4f4364e22/artificial-intelligence-brain-ai.jpg',
            text: [message],
            from: 'bot',
            sent: false,
            name: 'Bot Alice'
          }
        })
        this.chatConversation.push(chat)
      }, 1500)

      this.btnOptions = []
    }
  },
  render(createElement) {

    var self = this
    const title = createElement('q-card-section', [createElement('div', {class: 'text-h6'}, this.title)])
  
    // this should be q-footer
    const qInput = createElement('q-input',  {
      props: {
        dense: true,
      },
      on: {
        input: function (event) {
          self.chatInput = event
        },
        keyup: function(event){
          if(event.keyCode ===  13){
            self.sendUserMessage(self.chatInput, createElement)
            document.getElementsByTagName('input').value = ''
          }
        }
      }
    })
    const footer = createElement('q-card-section', [qInput])

    const body = createElement('q-card-section', {
      class: 'q-pa-md column col justify-end conversation'
    }, [self.chatConversation, self.btnOptions])
    
    const wrapper = createElement('q-card', { 
      class: 'my-card q-my-md',
      attrs: {id: 'wrapper'},
      props: {
        flat: true,
        bordered: true
      }
    }, [title, body, footer])
    
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
