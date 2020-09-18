import Vue from 'vue'

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
      createElement: null,
      company: 'Simac Triangle',
      link: 'https://www.simac.com/nl',
			time: 300000,
			wrapper: null,
      button: null,
      chatBotWidth: '370px',
      chatBotHeight: '730px',
      disable: false
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
            sent: chat.sent,
            bgColor: chat.bgColor,
            textColor: chat.textColor
          }
        })
        this.chatConversation.push(chatMessage)
      });
      this.storeConversation = conversation

      if(options) {
        this.getOptions(options)
      }
    } 
    
    if(!conversation || conversation.length === 0)
    {
      const startConvo = 'hello'
      const botResponse = await this.sendTolex(startConvo)
      options = botResponse.responseCard.genericAttachments[0]
      this.getOptions(options)
      this.sendBotMessage(botResponse.message, botResponse.dialogState)
    }

    this.checkTime()
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
    renderChildren() {
			const self = this
			
			const iframe = document.getElementById('chatbot-iframe')
      const body = iframe.contentDocument.body
      const el = document.createElement('div') // we will mount or nested app to this element
      body.appendChild(el)

      iframe.contentDocument.head.innerHTML = iframe.contentDocument.head.innerHTML + `
      <link href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet" type="text/css">
      <link href="https://cdn.jsdelivr.net/npm/quasar@1.14.0/dist/quasar.min.css" rel="stylesheet" type="text/css">`

      iframe.contentDocument.head.innerHTML = iframe.contentDocument.head.innerHTML + `
      <style>
			@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');
			
			body: {
				height: 100%;
				width: 100%;
			}

			.simac-chat {
				overflow: hidden;
			}

      .conversation {
        height: 475px;
        overflow: auto;
				background: rgb(234, 238, 243);
      }

      .q-message-text-content div > p > a {
        color: #ffffff;
        font-weight: bold;
      }

      #spinner {
        display: none;
      }

      #start-chat-button {
        display: none;
      }

      #message-input {
        border-top: 1px solid rgb(238, 238, 238);
        border-bottom: 1px solid rgb(238, 238, 238);
      }

      .footer {
        background: #f9f9f9;
        font-size: 12px;
        font-weight: bold;
      }

      .footer > a {
        color: #a7002b;
        text-decoration: none;
      }
      </style>
      `

      const chatApp = new Vue({
        name: 'chatApp',
        render(h) {
          return h('div', {class: 'simac-chat'}, [self.wrapper, self.button])
        },
      })

      chatApp.$mount(el) // mount into iframe
    },
    toggleButtonChat() {
      const chatbot = document.getElementById('chatbot-chat')

      const iframe = document.getElementById('chatbot-iframe')
      const wrapper = iframe.contentWindow.document.getElementById('wrapper')
      wrapper.style.display = wrapper.style.display === 'none' ? '' : 'none';
      
      if(wrapper.style.display === 'none' ){
        this.icon = 'chat'
        chatbot.style.width = '100px'
        chatbot.style.height = '100px'
      } else {
        this.icon = 'close'
        chatbot.style.width = this.chatBotWidth
        chatbot.style.height = this.chatBotHeight
      }
    },
    scrollToBottom () {
      const iframe = document.getElementById('chatbot-iframe')
      const conversation = iframe.contentWindow.document.querySelector('.conversation')

      let conversationStorage = LocalStorage.getItem('conversation')

      if(conversationStorage.length > 1){
        setTimeout(() => {
          conversation.scrollTop = conversation.scrollHeight;
        }, 20)
      }      
    },
		checkTime(){
			
      setTimeout(() => {
				const iframe = document.getElementById('chatbot-iframe')
				iframe.contentWindow.document.getElementById('message-input').style.display = 'none'
				iframe.contentWindow.document.getElementById('start-chat-button').style.display = 'block'
      }, this.time)
    },
    async initChat() {			
			this.chatConversation = []
      this.storeConversation = []
      this.btnOptions = []

      LocalStorage.set('options', '')
      LocalStorage.set('conversation', this.storeConversation)

      const startConvo = 'hello'
      const botResponse = await this.sendTolex(startConvo)
      const options = botResponse.responseCard.genericAttachments[0]
      this.getOptions(options)
			this.sendBotMessage(botResponse.message, botResponse.dialogState)
						
			const iframe = document.getElementById('chatbot-iframe')
			iframe.contentWindow.document.getElementById('message-input').style.display = 'block'
			iframe.contentWindow.document.getElementById('start-chat-button').style.display = 'none'
		},
		getOptions(options) {
      if (!options) {
        return
      }
      const buttons = []
      let self  = this

      LocalStorage.set('options', options)

      options.buttons.forEach(option => {
        const button = this.createElement('q-chip', { props: { outline: true }, class: "bg-white text-black" }, [
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
        this.disable = true
      }, 1800)
    },
		async sendOption (option) {
      await this.sendUserMessage(option)
    },
    async sendTolex(input) {
      const response = await Interactions.send(
        'contactformwidget_playground',
        input
      )
      return response 
    },
    async sendUserMessage(newMessage) {
      const iframe = document.getElementById('chatbot-iframe')
			iframe.contentWindow.document.querySelector('.q-field__native').value = ''
			
			let options = ''

      if (!newMessage) return
      let inputMessage = null

      if (newMessage === 'yes') {
        inputMessage = 'Ja'
      } else if (newMessage === 'no') {
        inputMessage = 'Nee'
      } else {
        inputMessage = newMessage
      }

      const botResponse = await this.sendTolex(newMessage)
      if (botResponse.responseCard) {
        options = botResponse.responseCard.genericAttachments[0]
      } else {
        LocalStorage.set('options', '')
			}
			
      this.getOptions(options)
      this.sendBotMessage(botResponse.message, botResponse.dialogState)

      let data = {
        avatar: 'https://static.vecteezy.com/system/resources/thumbnails/000/550/731/small/user_icon_004.jpg',
        text: [inputMessage],
        from: 'me',
        sent: true,
        bgColor: 'blue-grey-6',
        textColor: 'white'
      }

      const chat = this.createElement('q-chat-message', {
        props: data
      })
			this.chatConversation.push(chat)
			
			this.storeConversation.push(data)
      LocalStorage.set('conversation', this.storeConversation)
		},
		sendBotMessage (message, state) {
			const iframe = document.getElementById('chatbot-iframe')			
			iframe.contentWindow.document.getElementById('spinner').style.display = 'block'

      let data = {
        avatar: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif',
        text: [message],
        from: 'bot',
        sent: false,
        name: 'Bot Alice',
        bgColor: 'red-9',
        textColor: 'white'
      }

      setTimeout(() => {
        const chat = this.createElement('q-chat-message', {
          props: data
        })
        this.chatConversation.push(chat)

        if(state === 'Fulfilled'){
          this.storeConversation = []

          const iframe = document.getElementById('chatbot-iframe')
          iframe.contentWindow.document.getElementById('message-input').style.display = 'none'
          iframe.contentWindow.document.getElementById('start-chat-button').style.display = 'block'
        
        } else {
          this.storeConversation.push(data)
        }

        LocalStorage.set('conversation', this.storeConversation)
        iframe.contentWindow.document.getElementById('spinner').style.display = 'none'
      }, 1500)
      this.btnOptions = []
      this.disable = false
      this.checkTime()
    }
  },
  render(createElement) {

    var self = this
		self.createElement = createElement

		//footer
		const footer = createElement('q-card-section', {
      class: 'footer q-py-sm text-center',
      domProps: {
        innerHTML: "Gesponsord door <a href='"+this.link+"' target='_blank'>"+this.company+"</a>"  
      }
    })

    //start chat again button if the 5 minutes are passed
    const startChatButton = createElement('q-btn',{
      attrs: {
        id: 'start-chat-button'
      },
      class: 'q-py-sm full-width no-box-shadow no-border-radius',
      on: {
        click: this.initChat
      }
    }, 'Begin opnieuw met chat')

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
        }
      }
    })
  
    // Inputfield of the chat
    const qInput = createElement('q-input',  {
      props: {
        dense: true,
        borderless: true,
        disable: self.disable
      },
      attrs: {
        placeholder: 'Type jouw bericht in'
      },
      on: {
        input: function (event) {
          self.chatInput = event
        },
        keyup: function(event){
          if(event.keyCode ===  13){
            self.sendUserMessage(self.chatInput)
          }
        }
      }
    },[sendIcon])

    const messageInput = createElement('q-card-section', {attrs: {id: 'message-input'} ,class: 'q-py-sm'}, [qInput])

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
			class: 'conversation inset-shadow',
		}, [self.chatConversation, self.btnOptions, QSpinnerDots])

		// header of the widget with avatar
    const img = createElement('img', { 
      attrs: {
        src: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif'
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

		self.wrapper = createElement('q-card', { 
      class: 'q-ma-md shadow-6',
      style: {
        borderRadius: '15px'
      },
      attrs: {id: 'wrapper'},
		}, [header, body, messageInput, startChatButton, footer])
		
		// toggle button open/close chat
    self.button = createElement('q-btn', {
      class: 'bg-white fixed-bottom-right q-ma-md',
      props: {
        icon: this.icon,
        round: true,
        size: 'md'
      },
      on: {
        click: this.toggleButtonChat
      }
    })
    
    const iframe = createElement('iframe', {
      attrs: {
        id: 'chatbot-iframe',
        sandbox: 'allow-same-origin allow-scripts allow-popups'
      },
      style: {
				'pointer-events': 'all',
				'background': 'none',
				'border': '0px',
				'float': 'none',
				'position': 'absolute',
				'top': '0px',
				'right': '0px',
				'bottom': '0px',
				'left': '0px',
				'width': '100%',
				'height': '100%',
				'margin': '0px',
				'padding': '0px',
				'min-height': '0px'
      },
      on: { load: this.renderChildren }
     })

     return createElement('div', {
      attrs: {
        id: 'chatbot-chat'
      },
      style: {
				'border': '0px',
				'background-color': 'transparent',
				'pointer-events': 'none',
				'z-index': '2147483639',
				'position': 'fixed',
				'bottom': '0',
				'width': self.chatBotWidth,
				'height': self.chatBotHeight,
				'overflow': 'hidden',
				'opacity': '1',
				'max-width': '100%',
				'right': '0px',
				'max-height': '100%'
			}
    },[iframe])
  }
})
