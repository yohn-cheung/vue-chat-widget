
const iframeHeader = `
<link href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet" type="text/css">
<link href="https://cdn.jsdelivr.net/npm/quasar@1.14.0/dist/quasar.min.css" rel="stylesheet" type="text/css">
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

.q-card {
  border-radius: 15px;
}

.textballon {
  display: none;
}

.active {
  display: block;
  -webkit-animation: slide-in .5s ease-out;
    -moz-animation: slide-in .5s ease-out;
}

@-webkit-keyframes slide-in {
  0% { opacity: 0; -webkit-transform: translateX(-100%); }   
100% { opacity: 1; -webkit-transform: translateX(0); }
}
@-moz-keyframes slide-in {
  0% { opacity: 0; -moz-transform: translateX(-100%); }   
100% { opacity: 1; -moz-transform: translateX(0); }
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

#reset-chat-button {
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

module.exports ={
  iframeHeader
}