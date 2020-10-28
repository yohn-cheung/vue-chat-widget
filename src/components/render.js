const url = window.location.origin

const getIframe = (createElement, renderChildren) => {
  const iframe = createElement('iframe', {
    attrs: {
      id: 'chatbot-iframe',
      sandbox: 'allow-same-origin allow-scripts',
      src: url + '/chat.html'
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
    on: { load: renderChildren }
  })
  return iframe
}

// resetButton
const getResetChatButton = (createElement, resetChat) => {
  const resetChatButton = createElement('q-btn', {
    attrs: { id: 'reset-chat-button' },
    class: 'q-py-sm full-width no-box-shadow no-border-radius',
    on: { click: resetChat }
  }, 'Begin opnieuw met chat')
  return resetChatButton
}

// button

const getButton = (createElement, toggleButtonChat) => {
  const img = createElement('img', {
    attrs: { src: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif' }
  })
  const qAvatar = createElement('q-avatar', { props: { size: "42px" } }, [img])
  const button = createElement('q-btn', {
    props: { round: true },
    class: 'bg-white fixed-bottom-right q-ma-md',
    on: { click: toggleButtonChat }
  }, [qAvatar])

  return button
}

// getHeader()
const getHeader = (createElement, toggleButtonChat) => {
  const imgHeader = createElement('img', { attrs: { src: 'https://i.pinimg.com/originals/7d/9b/1d/7d9b1d662b28cd365b33a01a3d0288e1.gif' } })
  const qAvatarHeader = createElement('q-avatar', [imgHeader])
  const qItemSectionAvatar = createElement('q-item-section', { props: { avatar: true } }, [qAvatarHeader])

  //header of widget with title(s)
  const title = createElement('q-item-label', { class: 'text-h5' }, 'Chatbot')
  const subTitle = createElement('q-item-label', { props: { caption: true } }, 'Online')
  const qItemSectionText = createElement('q-item-section', [title, subTitle])

  const closeIcon = createElement('q-btn', {
    props: {
      round: true,
      flat: true,
      icon: 'close'
    },
    on: {
      click: toggleButtonChat
    }
  })

  const header = createElement('q-item', { class: 'q-py-md' }, [qItemSectionAvatar, qItemSectionText, closeIcon])

  return header
}

// body

const getBody = (createElement, chatConversation, btnOptions) => {
  const QSpinnerDots = createElement('div', { attrs: { id: 'spinner' }, class: "spinner-position" }, [
    createElement('q-spinner-dots', {
      props: {
        size: '2rem'
      }
    })
  ])
  const body = createElement('q-card-section', {
    attrs: { id: 'conversation' },
    class: 'conversation inset-shadow',
  }, [chatConversation, btnOptions, QSpinnerDots])
  return body
}

//input
const getmessageInput = (createElement, chatInput, sendUserResponse, disableQInput) => {
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
        chatInput = event
      },
      click: function (event) {
        if (chatInput.length >= 1) {
          sendUserResponse(chatInput)
        }
      }
    }
  })
  // Inputfield of the chat
  const qInput = createElement('q-input', {
    props: {
      dense: true,
      borderless: true,
      disable: disableQInput
    },
    attrs: {
      placeholder: 'Type jouw bericht in'
    },
    on: {
      input: function (event) {
        chatInput = event
      },
      keyup: function (event) {
        if (event.keyCode === 13 && chatInput.length >= 1) {
          sendUserResponse(chatInput)
        }
      }
    }
  }, [sendIcon])
  const messageInput = createElement('q-card-section', { attrs: { id: 'message-input' }, class: 'q-py-sm' }, [qInput])
  return messageInput
}

//footer

const getFooter = (createElement, company, link) => {
  return createElement('q-card-section', {
    class: 'footer q-py-sm text-center',
    domProps: {
      innerHTML: `Powered by <a href="${link}" target="_blank">${company}</a>`
    }
  })
}

module.exports = {
  getFooter,
  getHeader,
  getBody,
  getmessageInput,
  getResetChatButton,
  getButton,
  getIframe
}