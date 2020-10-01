import Vue from 'vue'

import Amplify, { Interactions } from 'aws-amplify';
import awsconfig from '../aws-exports'; 

Amplify.configure(awsconfig);
Vue.prototype.$Interactions = Interactions

import { LocalStorage } from 'quasar'
import { iframeHeader } from './iframeHeader'
import '../styles/chat.css'

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
      wrapperButton: null,
      chatBotWidth: '370px',
      chatBotHeight: '680px',
      chatBotRoom: null,
      chatBotIframe: null,
      disableQInput: false,
      disableQChip: false,
    }
  },
	async mounted(){
    this.chatBotRoom = document.getElementById('chatbot-chat')
    this.chatBotRoom.style.width = '100px'
    this.chatBotRoom.style.height = '100px'

    this.chatBotIframe = document.getElementById('chatbot-iframe')

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

      if(options) this.getOptions(options)

      this.checkTime()
    }
  },
  watch: {
    chatConversation: function (val) {
      if (Object.keys(val).length) this.scrollToBottom()
    },
    btnOptions: function (val){
      if (Object.keys(val).length) this.scrollToBottom()
    }
  },
  methods: {
    renderChildren() {
			const self = this
      const iframe = document.getElementById('chatbot-iframe')
      const body = iframe.contentDocument.body
      const el = document.createElement('div') // we will mount or nested app to this element
      body.appendChild(el)

      iframe.contentDocument.head.innerHTML = iframe.contentDocument.head.innerHTML + iframeHeader

      const chatApp = new Vue({
        name: 'chatApp',
        render(h) {
          return h('div', {class: 'simac-chat'}, [self.wrapper, self.wrapperButton])
        },
      })

      chatApp.$mount(el) // mount into iframe
    },
    toggleButtonChat() {
      const wrapper = this.chatBotIframe.contentWindow.document.getElementById('wrapper')
      wrapper.style.display = wrapper.style.display === 'block' ? '' : 'block';
      const togglebutton = this.chatBotIframe.contentWindow.document.getElementById('togglebutton')

      // mobile
      if (this.$q.platform.is.mobile && !this.$q.platform.is.ipad){
        const conversation = this.chatBotIframe.contentWindow.document.querySelector('.conversation')
        this.chatBotWidth = '100%',
        this.chatBotHeight = '100%',
        conversation.style.height = '65%'
      }
      
      if(wrapper.style.display === 'block' ){
        this.chatBotRoom.style.width = this.chatBotWidth
        this.chatBotRoom.style.height = this.chatBotHeight
        this.initChat()
        togglebutton.style.display = 'none';
      } else {
        this.chatBotRoom.style.width = '100px'
        this.chatBotRoom.style.height = '100px'
        togglebutton.style.display = 'block';
      }
    },
    scrollToBottom () {
      const conversation = this.chatBotIframe.contentWindow.document.querySelector('.conversation')
      const conversationStorage = LocalStorage.getItem('conversation')

      if(conversationStorage.length > 1){
        setTimeout(() => {
          conversation.scrollTop = conversation.scrollHeight;
        }, 20)
      }      
    },
		checkTime(){
      setTimeout(() => {
        this.storeConversation = []
        LocalStorage.set('options', '')
        LocalStorage.set('conversation', this.storeConversation)

        this.disableQChip = true
				this.chatBotIframe.contentWindow.document.getElementById('message-input').style.display = 'none'
        this.chatBotIframe.contentWindow.document.getElementById('start-chat-button').style.display = 'block'
        this.chatBotIframe.contentWindow.document.getElementById('conversation').classList.add('disabled')
      }, this.time)
    },
    async initChat(){
      if(!this.chatConversation.length)
      {
        this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'block'
        const startConvo = 'hello'
        const botResponse = await this.sendTolex(startConvo)

        if (botResponse.responseCard) {
          const options = botResponse.responseCard.genericAttachments[0]
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
      //let options = null

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
      if (!options) return

      const buttons = []
      const self  = this

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

      if (newMessage === 'yes') inputMessage = 'Ja'
      else if (newMessage === 'no') inputMessage = 'Nee'
      else inputMessage = newMessage

      const data = {
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
      if (botResponse.responseCard) options = botResponse.responseCard.genericAttachments[0]
      else LocalStorage.set('options', '')
			
      this.getOptions(options)
      this.sendBotMessage(botResponse.message, botResponse.dialogState)
		},
		sendBotMessage (message, state) {	
      this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'block'
      
      setTimeout(() => {
        const data = {
          // avatar: 'https://www.simac.com/bundles/lamecowebsite/img/simac-logo.png',
          avatar: 'https://cdn.dribbble.com/users/690291/screenshots/3507754/untitled-1.gif',
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
      }, 1200)
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
    
    //header of widget with title(s)
    const title = createElement('q-item-label', {class: 'text-h5'},'Chatbot')
    const subTitle = createElement('q-item-label', {props: {caption: true}}, 'Online')
    const qItemSectionText = createElement('q-item-section', [title, subTitle])
    
    const closeIcon = createElement('q-btn', {
      props: {
        round: true,
        flat: true,
        icon: 'close'
      },
      on: {
        click: self.toggleButtonChat
      }
    })

    //header
    const header = createElement('q-item', {class: 'q-py-md'},[qItemSectionAvatar, qItemSectionText, closeIcon])

		self.wrapper = createElement('q-card', { 
      class: 'q-ma-md shadow-6',
      style: {
        borderRadius: '15px'
      },
      attrs: {id: 'wrapper'},
    }, [header, body, messageInput, startChatButton, footer])
  

    const img = createElement('img', { 
      attrs: {
        src: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif'
      }
    })    
    const qAvatar = createElement('q-avatar', {props: { size: "42px" } },[img])
    
    const button = createElement('q-btn', {
      props: {
        round: true
      },
      class: 'bg-white fixed-bottom-right q-ma-md',
      on: {
        click: this.toggleButtonChat
      }
    }, [qAvatar])
    
    self.wrapperButton = createElement('div',{attrs: {id: 'togglebutton' }}, [button])
		
    const iframe = createElement('iframe', {
      attrs: {
        id: 'chatbot-iframe',
        sandbox: 'allow-same-origin allow-scripts allow-popups'
      },
      on: { load: this.renderChildren }
     })

     return createElement('div', {
      attrs: {
        id: 'chatbot-chat'
      }
    },[iframe])
  }
})
