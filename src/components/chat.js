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
      chatBotChat: null,
      chatBotIframe: null,
      disableQInput: false,
      disableQChip: false,
      wrapperButton: null
    }
  },
	async mounted(){
    this.chatBotChat = document.getElementById('chatbot-chat')
    this.chatBotChat.style.width = '100px'
    this.chatBotChat.style.height = '100px'

    this.chatBotIframe = document.getElementById('chatbot-iframe')

    let conversation = LocalStorage.getItem('conversation')
    let options = LocalStorage.getItem('options')

    this.buttonAvatar()

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
      this.checkTime()
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
      
      #wrapper {
        display: none
      }

      .conversation {
        height: 475px;
        overflow: auto;
				background: rgb(234, 238, 243);
      }

      .q-message-avatar {
        background: #ffffff;
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
          return h('div', {class: 'simac-chat'}, [self.wrapper, self.wrapperButton])
          // return h('div', {class: 'simac-chat'}, [self.wrapper, self.button]) self.toggleButton
        },
      })

      chatApp.$mount(el) // mount into iframe
    },
    buttonAvatar() {
      // toggle button open/close chat
      const img = this.createElement('img', { 
        attrs: {
          src: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif'
        }
      })
      
      const qAvatar = this.createElement('q-avatar', {props: { size: "42px" } },[img])
      this.button = this.createElement('q-btn', {
        props: {
          round: true
        },
        class: 'bg-white fixed-bottom-right q-ma-md',
        on: {
          click: this.toggleButtonChat
        }
      }, [qAvatar])
    },
    buttonClose(){
      this.button = this.createElement('q-btn', {
        props: {
          round: true,
          icon: 'close'
        },
        class: 'bg-white fixed-bottom-right q-ma-md',
        on: {
          click: this.toggleButtonChat
        }
      })
    },
    toggleButtonChat() {
      const wrapper = this.chatBotIframe.contentWindow.document.getElementById('wrapper')
      wrapper.style.display = wrapper.style.display === 'block' ? '' : 'block';

      if (this.$q.platform.is.mobile && !this.$q.platform.is.ipad){
        const conversation = this.chatBotIframe.contentWindow.document.querySelector('.conversation')
        this.chatBotWidth = '100%',
        this.chatBotHeight = '100%',
        conversation.style.height = '65%'
      }
      
      if(wrapper.style.display === 'block' ){
        this.chatBotChat.style.width = this.chatBotWidth
        this.chatBotChat.style.height = this.chatBotHeight
        this.initChat()
        this.buttonClose()
      } else {
        this.chatBotChat.style.width = '100px'
        this.chatBotChat.style.height = '100px'
        this.buttonAvatar()
      }
    },
    scrollToBottom () {
      const conversation = this.chatBotIframe.contentWindow.document.querySelector('.conversation')
      let conversationStorage = LocalStorage.getItem('conversation')

      if(conversationStorage.length > 1){
        setTimeout(() => {
          conversation.scrollTop = conversation.scrollHeight;
        }, 20)
      }      
    },
		checkTime(){
			
      setTimeout(() => {
        this.disableQChip = true
				this.chatBotIframe.contentWindow.document.getElementById('message-input').style.display = 'none'
        this.chatBotIframe.contentWindow.document.getElementById('start-chat-button').style.display = 'block'
        this.chatBotIframe.contentWindow.document.getElementById('conversation').classList.add('disabled')
      }, this.time)
    },
    async initChat(){
      let conversation = LocalStorage.getItem('conversation')
      if(!conversation || conversation.length === 0)
      {
        this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'block'
          
        const startConvo = 'hello'
        const botResponse = await this.sendTolex(startConvo)

        if (botResponse.responseCard) {
          let options = botResponse.responseCard.genericAttachments[0]
          this.getOptions(options)
        }
        this.sendBotMessage(botResponse.message, botResponse.dialogState)
        this.checkTime()
      }
    },
    async resetChat() {			
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
      
      this.disableQChip = false
						
			this.chatBotIframe.contentWindow.document.getElementById('message-input').style.display = 'block'
      this.chatBotIframe.contentWindow.document.getElementById('start-chat-button').style.display = 'none'
      this.chatBotIframe.contentWindow.document.getElementById('conversation').classList.remove('disabled')

      this.checkTime()
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
                if(!self.disableQChip) {
                  self.sendOption(option.value)
                  self.btnOptions = []
                }
              }
            }
          }, option.text)])

          buttons.push(button)
      });

      const div = this.createElement('div', [buttons])

      setTimeout(() => {
        this.btnOptions.push(div)
        this.disableQInput = true
      }, 1800)
    },
		async sendOption (option) {
      await this.sendUserMessage(option)
    },
    async sendTolex(input) {
      console.log('input: ', input);
      const response = await Interactions.send(
        'contactformwidget_playground',
        input
      )
      return response 
    },
    async sendUserMessage(newMessage) {
      this.chatInput = ''			
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
      
			this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'block'

      const botResponse = await this.sendTolex(newMessage)
      if (botResponse.responseCard) {
        options = botResponse.responseCard.genericAttachments[0]
      } else {
        LocalStorage.set('options', '')
			}
			
      this.getOptions(options)
      this.sendBotMessage(botResponse.message, botResponse.dialogState)
		},
		sendBotMessage (message, state) {	
      this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'block'
      
      setTimeout(() => {
        let data = {
          avatar: 'https://www.simac.com/bundles/lamecowebsite/img/simac-logo.png',
          text: [message],
          from: 'bot',
          sent: false,
          name: 'Bot Alice',
          bgColor: 'red-9',
          textColor: 'white'
        }

        const chat = this.createElement('q-chat-message', {
          props: data
        })
        this.chatConversation.push(chat)
        this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'none'

        if(state === 'Fulfilled'){
          this.storeConversation = []

          this.chatBotIframe.contentWindow.document.getElementById('message-input').style.display = 'none'
          this.chatBotIframe.contentWindow.document.getElementById('start-chat-button').style.display = 'block'
        
        } else {
          this.storeConversation.push(data)
          LocalStorage.set('conversation', this.storeConversation)
        }        
      }, 1500)
      this.disableQInput = false
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
        innerHTML: "Powered by <a href='"+this.link+"' target='_blank'>"+this.company+"</a>"  
      }
    })

    //start chat again button if the 5 minutes are passed
    const startChatButton = createElement('q-btn',{
      attrs: {
        id: 'start-chat-button'
      },
      class: 'q-py-sm full-width no-box-shadow no-border-radius',
      on: {
        click: this.resetChat
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
        disable: self.disableQInput
      },
      attrs: {
        placeholder: 'Type jouw bericht in'
      },
      on: {
        // TODO: search better way if possible.
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
    const imgHeader = createElement('img', { attrs: { src: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif' }})
    const qAvatarHeader = createElement('q-avatar', [imgHeader])
    const qItemSectionAvatar = createElement('q-item-section', { props: { avatar: true }}, [qAvatarHeader])
    
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
  

    //toggleButton Chat
    const img = createElement('img', { 
      attrs: {
        src: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif'
      }
    })
    
    // const qAvatar = createElement('q-avatar', {props: { size: "42px" } },[img])
    // self.button = createElement('q-btn', {
    //   props: {
    //     round: true
    //   },
    //   class: 'bg-white fixed-bottom-right q-ma-md',
    //   on: {
    //     click: this.toggleButtonChat
    //   }
    // }, [qAvatar])

    self.wrapperButton = createElement('div', [self.button])
		
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
