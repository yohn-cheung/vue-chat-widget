
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
  padding-bottom: 25px;
}

.counter {
  float: right;
  font-size: 10px;
  padding-top: 2px;
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