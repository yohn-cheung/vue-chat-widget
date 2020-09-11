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
  mounted(){
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

    const link = createElement('a', {
      attrs: {
        href: 'https://www.simac.com/en',
        target: '_blank'
      }
    }, 'Simac')

    const footerText = createElement('p','Powered by', [link])

    const footer = createElement('q-card-section', {
      class: 'footer q-py-sm text-center'
    }, [footerText])

    // icon for the message input
    const sendIcon = createElement('q-btn', {
      class: 'text-grey-4',
      props: {
        icon: 'send',
        round: true,
        dense: true,
        flat: true
      },
      on: {
        input: function (event) {
          self.chatInput = event
        },
        click: function(event){
          self.sendUserMessage(self.chatInput)
          document.querySelector('.q-field__native').value = ''
        }
      }
    })
  
    // Inputfield of the chat
    const qInput = createElement('q-input',  {
      props: {
        dense: true,
      },
      attrs: {
        placeholder: 'Type your message here'
      },
      on: {
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
    },[sendIcon])
    const messageInput = createElement('q-card-section', {class: 'q-py-sm'}, [qInput])

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
      class: 'conversation',
    }, [self.chatConversation, self.btnOptions, QSpinnerDots])

    // header of the widget with avatar
    const img = createElement('img', { 
      attrs: {
        src: 'https://tr1.cbsistatic.com/hub/i/r/2015/12/16/978e8dea-5c7d-4482-ab5f-016d7633951c/resize/770x/3117e58fdf7da32dac9d59d4f4364e22/artificial-intelligence-brain-ai.jpg'
      }
    })
    const qAvatar = createElement('q-avatar', [img])
    const qItemSectionAvatar = createElement('q-item-section', { props: { avatar: true }}, [qAvatar])
    
    //header of widhet with title(s)
    const title = createElement('q-item-label', {class: 'text-h5'},'Chatbot')
    const subTitle = createElement('q-item-label', {props: {caption: true}}, 'Online')
    const qItemSectionText = createElement('q-item-section', [title, subTitle])
    
    //header
    const header = createElement('q-item', {class: 'q-py-md'},[qItemSectionAvatar, qItemSectionText])
    
    const wrapper = createElement('q-card', { 
      class: 'my-card q-my-md shadow-4',
      style: {
        borderRadius: '15px'
      },
      attrs: {id: 'wrapper'},
    }, [header, body, messageInput, footer])
    
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
