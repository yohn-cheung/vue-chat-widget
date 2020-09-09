import Vue from 'vue'
import './chat.css'

import Amplify, { Interactions } from 'aws-amplify';
import awsconfig from '../aws-exports'; 

Amplify.configure(awsconfig);
Vue.prototype.$Interactions = Interactions

import { LocalStorage } from 'quasar'

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
      storeConversation: [],
      createElement: null
    }
  },
  mounted(){
    let conversation = LocalStorage.getItem('conversation')
    let options = LocalStorage.getItem('options')

    // this.storeConversation = conversation

    console.log('conversation: ', conversation)

    if(conversation) {
      conversation.forEach(chat => {
        const chatMessage = this.createElement('q-chat-message', {
          props: {
            avatar: chat.avatar,
            text: chat.text,
            from: chat.from,
            sent: chat.sent
          }
        })
        this.chatConversation.push(chatMessage)
      });
      this.storeConversation = conversation

      if(options) {
        this.getOptions(options)
      }
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
    // getOptions(options, slotToElicit) {
    getOptions(options) {
      if (!options) {
        return
      }
      const buttons = []
      let self  = this

      LocalStorage.set('options', options)

      options.buttons.forEach(option => {
        const button = this.createElement('q-chip', { props: { outline: true } }, [
          this.createElement('q-btn', {
            props: {
              round: true,
              flat: true
            }, 
            on: {
              click: function(event) {
                self.sendOption(option.value)
              }
            }
          }, option.text)])

          buttons.push(button)
      });

      const div = this.createElement('div', [buttons])

      setTimeout(() => {
        this.btnOptions.push(div)
      }, 1800)
    },
    async sendOption (option) {
      await this.sendUserMessage(option)
    },
    async sendTolex(input) {
      const response = await Interactions.send(
        'ScheduleAppointment_playground',
        input
      )
      return response 
    },
    async sendUserMessage (newMessage) {
      let options = ''

      if (!newMessage) return
      const botResponse = await this.sendTolex(newMessage)
      // console.log('botResponse: ', botResponse)
      console.log('diaLogState: ', botResponse.dialogState)
      if (botResponse.responseCard) {
        options = botResponse.responseCard.genericAttachments[0]
      } else {
        LocalStorage.set('options', '')
      }
      // this.getOptions(options, botResponse.slotToElicit)
      this.getOptions(options)
      this.sendBotMessage(botResponse.message, botResponse.dialogState)

      let data = {
        avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
        text: [newMessage],
        from: 'me',
        sent: true
      }

      const chat = this.createElement('q-chat-message', {
        props: data
      })
      this.chatConversation.push(chat)

      this.storeConversation.push(data)
      LocalStorage.set('conversation', this.storeConversation)
    },
    sendBotMessage (message, state) {
      let data = {
        avatar: 'https://tr1.cbsistatic.com/hub/i/r/2015/12/16/978e8dea-5c7d-4482-ab5f-016d7633951c/resize/770x/3117e58fdf7da32dac9d59d4f4364e22/artificial-intelligence-brain-ai.jpg',
        text: [message],
        from: 'bot',
        sent: false,
        name: 'Bot Alice'
      }

      setTimeout(() => {
        const chat = this.createElement('q-chat-message', {
          props: data
        })
        this.chatConversation.push(chat)

        // this.storeConversation.push(data)
        // LocalStorage.set('conversation', this.storeConversation)

        if(state === 'Fulfilled'){
          console.log('Fulfilled')
          this.storeConversation = []
          // LocalStorage.set('conversation', this.storeConversation)
        } else {
          this.storeConversation.push(data)
        }

        LocalStorage.set('conversation', this.storeConversation)

      }, 1500)
      this.btnOptions = []
    }
  },
  render(createElement) {

    var self = this
    self.createElement = createElement

    // title of chat widget
    const title = createElement('q-card-section', [createElement('div', {class: 'text-h6'}, this.title)])
  
    // Inputfield of the chat
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
            self.sendUserMessage(self.chatInput)
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
    
    // toggle button open/close chat
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
