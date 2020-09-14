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
      btnOptions: [],
      storeConversation: [],
      createElement: null
    }
  },
  async mounted(){
    let conversation = LocalStorage.getItem('conversation')
    let options = LocalStorage.getItem('options')

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
    if(!conversation){
      const startConvo = 'hello'
      const botResponse = await this.sendTolex(startConvo)
      options = botResponse.responseCard.genericAttachments[0]
      this.getOptions(options)
      this.sendBotMessage(botResponse.message, botResponse.dialogState)
    }
  },
  watch: {
    chatConversation: function (val) {
      if (Object.keys(val).length) {
        this.scrollToBottom()
      }
    },
    btnOptions: function (val){
      if (Object.keys(val).length) {
        this.scrollToBottom()
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
    scrollToBottom () {
      const pageChat = this.$refs.pageChat
      const conversation = document.querySelector('.conversation')
      setTimeout(() => {
        conversation.scrollTop = conversation.scrollHeight;
      }, 20)
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
        const button = this.createElement('q-chip', { props: { outline: true }, class: "bg-teal text-white" }, [
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
      console.log('input: ', input);
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
      console.log('bot-response: ', botResponse)
      if (botResponse.responseCard) {
        options = botResponse.responseCard.genericAttachments[0]
      } else {
        LocalStorage.set('options', '')
      }
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
      document.getElementById('spinner').style.display = 'block'

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

        if(state === 'Fulfilled'){
          console.log('Fulfilled')
          this.storeConversation = []
        } else {
          this.storeConversation.push(data)
        }

        LocalStorage.set('conversation', this.storeConversation)
        document.getElementById('spinner').style.display = 'none'
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
        // TODO: search better way if possible.
        input: function (event) {
          self.chatInput = event
        },
        keyup: function(event){
          if(event.keyCode ===  13){
            self.sendUserMessage(self.chatInput)
            document.querySelector('.q-field__native').value = ''
          }
        }
      }
    })
    const footer = createElement('q-card-section', [qInput])

    // q-spinners-dots
    const QSpinnerDots = createElement('div', { attrs: { id: 'spinner' }, class: "spinner-position"}, [
      createElement('q-spinner-dots', {
        props: {
          size: '2rem'
        }
      })
    ])

    // chat wrapper for the chat-messages, options and the q-spinners dots
    const body = createElement('q-card-section', {
      attrs: {id: 'conversation'},
      class: 'conversation', // q-pa-md column col justify-end
    }, [self.chatConversation, self.btnOptions, QSpinnerDots])
    
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
