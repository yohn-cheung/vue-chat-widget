import Vue from 'vue'

import AWS from 'aws-sdk';

import Amplify, { Interactions } from 'aws-amplify';
import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);
Vue.prototype.$Interactions = Interactions

import { LocalStorage } from 'quasar'
import { iframeHeader } from './iframeHeader'
import {
  getHeader, getBody,
  getmessageInput, getResetChatButton,
  getFooter, getButton,
  getIframe
} from './render'

export default Vue.extend({
  name: 'simac-chat',
  props: ['config', 'slots'],
  data() {
    return {
      title: this.config.text.title,
      slotsStatus: this.slots,
      chatInput: '',
      chatConversation: [],
      btnOptions: [],
      storeConversation: [],
      createElement: null,
      company: 'Simac Triangle',
      link: 'https://www.simac.com/nl/simac-triangle',
      time: 300000,
      wrapper: null,
      wrapperButton: null,
      chatBotWidth: '370px',
      chatBotHeight: '680px',
      chatBotRoom: null,
      chatBotIframe: null,
      disableQInput: false,
      disableQChip: false,
      startConvo: 'hello',
      lexruntime: null,
      botAlias: null,
      botName: null,
      lexUserId: null,
      sessionAttributes: null
    }
  },
  async mounted() {
    this.setConfiguration()

    this.chatBotRoom = document.getElementById('chatbot-chat')
    this.chatBotRoom.style.width = '100px'
    this.chatBotRoom.style.height = '100px'

    this.chatBotIframe = document.getElementById('chatbot-iframe')

    const conversation = LocalStorage.getItem('conversation')
    const options = LocalStorage.getItem('options')

    if (conversation) {
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

      if (options) this.getOptions(options)
    }
  },
  watch: {
    chatConversation: function (val) {
      if (Object.keys(val).length) this.scrollToBottom()
    },
    btnOptions: function (val) {
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

      iframe.contentDocument.head.innerHTML = iframeHeader

      const chatApp = new Vue({
        name: 'chatApp',
        render(h) {
          return h('div', { class: 'simac-chat' }, [self.wrapper, self.wrapperButton])
        },
      })

      chatApp.$mount(el) // mount into iframe
    },
    toggleButtonChat() {
      const wrapper = this.chatBotIframe.contentWindow.document.getElementById('wrapper')
      wrapper.style.display = wrapper.style.display === 'block' ? '' : 'block';
      const togglebutton = this.chatBotIframe.contentWindow.document.getElementById('togglebutton')

      // mobile
      if (this.$q.platform.is.mobile && !this.$q.platform.is.ipad) {
        const conversation = this.chatBotIframe.contentWindow.document.querySelector('.conversation')
        this.chatBotWidth = '100%'
        this.chatBotHeight = '100%'
        conversation.style.height = '65%'
      }

      if (wrapper.style.display === 'block') {
        this.scrollToBottom()
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
    scrollToBottom() {
      const conversation = this.chatBotIframe.contentWindow.document.querySelector('.conversation')
      setTimeout(() => {
        conversation.scrollTop = conversation.scrollHeight;
      }, 20)
    },
    checkTime() {
      setTimeout(() => {
        this.clearStorage()
        this.disableQChip = true
        this.chatBotIframe.contentWindow.document.getElementById('message-input').style.display = 'none'
        this.chatBotIframe.contentWindow.document.getElementById('reset-chat-button').style.display = 'block'
        this.chatBotIframe.contentWindow.document.getElementById('conversation').classList.add('disabled')
      }, this.time)
    },
    setConfiguration(){
      AWS.config.region = awsconfig.aws_bots_config[0].region
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsconfig.aws_cognito_identity_pool_id,
      });

      if(!this.slots){
        this.clearStorage()
      }

      const ID = LocalStorage.getItem('ID')
      const domain = window.location.hostname
      if(!ID){
        const key = `${awsconfig.aws_bots_config[0].region}:${awsconfig.aws_bots_config[0].key}-${domain}-${Date.now()}`
        LocalStorage.set('ID', key)
        this.lexUserId = key;
      } else {
        this.lexUserId = ID;
      }

      this.lexruntime = new AWS.LexRuntime();
      this.botAlias =awsconfig.aws_bots_config[0].alias
      this.botName = awsconfig.aws_bots_config[0].name
      this.sessionAttributes = {};
    },
    resetChat() {
      this.chatConversation = []
      this.btnOptions = []
      this.clearStorage()

      this.disableQChip = false

      this.chatBotIframe.contentWindow.document.getElementById('message-input').style.display = 'block'
      this.chatBotIframe.contentWindow.document.getElementById('reset-chat-button').style.display = 'none'
      this.chatBotIframe.contentWindow.document.getElementById('conversation').classList.remove('disabled')

      this.setConfiguration()
      this.initChat()
    },
    clearStorage(){
      this.storeConversation = []
      LocalStorage.set('options', '')
      LocalStorage.set('conversation', this.storeConversation)
      LocalStorage.set('ID', '')
    },
    async initChat() {
      if (!this.chatConversation.length) {
        this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'block'
        await this.sendToLex(this.startConvo)
      }
      this.checkTime()
    },
    async sendToLex(input) {
      this.disableQInput = false
      const params = {
        botAlias: this.botAlias,
        botName: this.botName,
        inputText: input,
        userId: this.lexUserId,
        sessionAttributes: this.sessionAttributes
      };

      const _tempInput = 'Too long'
      if(input.length > 1020) params.inputText = _tempInput

      if(input != 'hello'){
        this.showUserResponse(input);
      }
      
      this.lexruntime.postText(params, async (err, response) => {
        if (err) {
          const errorMessage = {
            message: 'Sorry, je bericht is te lang, kun je een korter bericht typen?'
          }
          await this.showBotReponse(errorMessage)
        }
        if (response) {
          await this.showBotReponse(response)
        }
      })
    },
    showUserResponse(newMessage) {
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
    },
    async showBotReponse(response) {
      this.chatBotIframe.contentWindow.document.getElementById('spinner').style.display = 'block'
     
      setTimeout(() => {
        const data = {
          avatar: 'https://cdn.dribbble.com/users/690291/screenshots/3507754/untitled-1.gif',
          text: [response.message],
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
  
        if (response.dialogState === 'Fulfilled') {
          this.clearStorage()
          this.chatBotIframe.contentWindow.document.getElementById('message-input').style.display = 'none'
          this.chatBotIframe.contentWindow.document.getElementById('reset-chat-button').style.display = 'block'
        } else {
          this.storeConversation.push(data)
          LocalStorage.set('conversation', this.storeConversation)
        }
      }, 1500)
      if (response.responseCard) options = response.responseCard.genericAttachments[0]
      else LocalStorage.set('options', '')

      let options
      this.getOptions(options)
      this.checkTime()
    },
    getOptions(options) {
      if (!options) return

      const buttons = []
      const self = this

      LocalStorage.set('options', options)

      options.buttons.forEach(option => {
        const button = this.createElement('q-chip', { props: { outline: true }, class: "bg-white text-black" }, [
          this.createElement('q-btn', {
            props: {
              round: true,
              flat: true
            },
            on: {
              click: function (event) {
                if (!self.disableQChip) {
                  self.sendUserResponse(option.value)
                  self.btnOptions = []
                }
              }
            }
          }, option.text)])

        buttons.push(button)
      });

      const chipsOptions = this.createElement('div', [buttons])

      setTimeout(() => {
        this.btnOptions.push(chipsOptions)
        this.disableQInput = true
      }, 1800)
    },
    async sendUserResponse(response){
      await this.sendToLex(response)
    }
  },
  render(createElement) {
    var self = this
    self.createElement = createElement

    // header of the widget with avatar
    const header = getHeader(createElement, self.toggleButtonChat)
    // chat wrapper for the chat-messages, options and the q-spinners dots
    const body = getBody(createElement, self.chatConversation, self.btnOptions)
    // messages exchanged
    const messageInput = getmessageInput(createElement, self.chatInput, self.sendUserResponse, self.disableQInput)
    //start chat again button if the 5 minutes are passed
    const resetChatButton = getResetChatButton(createElement, self.resetChat)
    //Toggle button, to open the chat
    const toggleButton = getButton(createElement, self.toggleButtonChat)
    //footer
    const footer = getFooter(createElement, self.company, self.link)
    // Iframe
    const iframe = getIframe(createElement, self.renderChildren)
    // wrapper
    self.wrapper = createElement('q-card', {
      class: 'q-ma-md shadow-6',
      attrs: { id: 'wrapper' },
    }, [header, body, messageInput, resetChatButton, footer])

    self.wrapperButton = createElement('div', { attrs: { id: 'togglebutton' } }, [toggleButton])

    return createElement('div', {
      attrs: { id: 'chatbot-chat' },
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
    }, [iframe])
  }
})
