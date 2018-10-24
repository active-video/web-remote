(function() {
  REMOTE = function () {
    this.init();
  };
  REMOTE.prototype = {
    devices: null,
    init: function () {
      this.spokenText = document.querySelector('#spokenText');
      this.microphone = document.querySelector('#microphone');
      this.alternateMicrophone = document.querySelector('#alternate-microphone');


      this.onSpeech = this.onSpeech.bind(this);
      this.onSpeechError = this.onSpeechError.bind(this);
      this.onSpeechEnd = this.onSpeechEnd.bind(this);

      this.bootstrap = this.bootstrap.bind(this);
      window.onmessage = this.onMessage.bind(this);

      this.loadDevices();
      this.activateRemote();
      this.activateVoice();

    },

    loadDevices: function () {
      var devices = localStorage.getItem('devices');
      devices = devices && JSON.parse(devices);

      this.devices = devices || ['abc', 'def'];
    },

    addDevice: function (id) {
      if (this.devices.indexOf(id) !== -1 || !id) {
        return false;
      }

      id = id.replace(/[^0-9a-z]/gi, '')
        .toLowerCase();


      this.devices.push(id);
      this.updateDevices();

      this.setActiveDevice(id);
    },

    updateDevices: function () {
      localStorage.setItem('devices', JSON.stringify(this.devices));
      this.populateDeviceList();
    },

    removeDevice: function (id) {
      var index = this.devices.indexOf(id);
      if (index !== -1) {
        this.devices.splice(index, 1);
      }
      if (id === this.activeDevice) {
        this.setActiveDevice('');
      } else {
        this.updateDevices();
      }
    },

    /**
     * Reloads page to re-open socketip with updated client id
     * @param id
     */
    setActiveDevice: function (id) {
      if (id === this.activeDevice) {
        return;
      }

      localStorage.setItem('active-device', id);
      location.reload();
    },

    getActiveDevice: function () {
      var id = localStorage.getItem('active-device') || undefined;

      return id;
    },

    activateRemote: function () {
      this.activeDevice = this.getActiveDevice();

      if (this.activeDevice) {
        //load web remote service
        navigator.avClient = { id: this.activeDevice };
        var role = location.href.indexOf('role') !== -1 ? 'client' : 'remote';
        document.write('<scr' + 'ipt src="//' + location.host + '/' + role + '"></scr' + 'ipt>');
      }


    },

    activateVoice: function () {
      //spoken-text
      this.activeDevice = this.getActiveDevice();

      if (!this.activeDevice) {
        return;
      }

      if (window.webkitSpeechRecognition) {
        console.log('voice supported');

      } else {
        this.microphone.classList.add('hide');
        this.alternateMicrophone.classList.remove('hide');
        console.warn('voice NOT supported');
      }
    },

    listen: function(){
      if(recognition){
        this.stopListening();
        return;
      }

      recognition = window.recognition = new webkitSpeechRecognition();
      //$('#submit-text').hide();

      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.addEventListener('result', this.onSpeech);
      recognition.addEventListener('error', this.onSpeechError);
      recognition.addEventListener('speechend', this.onSpeechEnd);


      this.updateText('');
      this.microphone.classList.add('active');
      recognition.start();
    },

    stopListening: function(){
      if(recognition){
        recognition.removeEventListener('result', this.onSpeech);
        recognition.removeEventListener('error', this.onSpeechError);
        recognition.removeEventListener('speechend', this.onSpeechEnd);

        recognition.abort();
        recognition = null;
      }

      this.microphone.classList.remove('active');
    },

    updateText: function(text, override) {
      if(override) {
        this.spokenText.textContent = text;
      } else {
        this.spokenText.textContent += text;
      }
    },

    onSpeechEvent: function(evt){
        console.log("Speech Event: " + evt.type, evt);
    },

    onSpeechError: function(evt) {
      if(evt.error === 'network') {
        this.spokenText.textContent = 'Sorry, but a network connection is required for VOICE support';
      }
    },

    onSpeechRecognized: function(text){
      this.updateText(text, true); //override text value
      remote.sendMessage({type: 'message', message: text});
      setTimeout(this.updateText.bind(this, '', true), 1000);
      // this.stopListening();
    },

    onSpeech: function(evt) {
      console.log("onSpeech", evt.type, evt);

      var text = '';

      for(var i= evt.resultIndex; i < evt.results.length; i++) {
        if(evt.results[i].isFinal) {
          this.onSpeechRecognized(evt.results[i][0].transcript);
          return;

        } else {
          text += evt.results[i][0].transcript
        }
      }

      this.updateText(text, true);


    },

    onSpeechEnd: function(){
      this.stopListening();

      //Listen again
      this.listen();

    },

    populateDeviceList: function () {
      var listContainer = $('#device-list');
      var active = this.getActiveDevice();
      var activeClass;

      listContainer.children()
        .remove();

      for (var i = 0; i < this.devices.length; i++) {
        activeClass = (active === this.devices[i] ? 'active' : '');
        listContainer.append('<li  class="btn-toolbar" role="toolbar">'
          + '<a class="btn btn-outline-primary ' + activeClass + '" href="javascript: remote.setActiveDevice(\'' + this.devices[i] + '\');">'
          + this.devices[i]
          + '</a>'
          + '<a class="btn btn-outline-danger" href="javascript: remote.removeDevice(\'' + this.devices[i] + '\');">Delete</a>'
          + '</li>'
        );
      }


    },

    sendMessage: function (data) {
      if (!data.type) {
        console.error("REMOTE::sendMessage(data) requires value for data.type");
        return;
      } else if (!window.sendMessage) {
        console.error("REMOTE::sendMessage(data) requires a cloudtv-remote-proxy, is 'npm run service' running?");
        return;
      }

      window.sendMessage(data);

    },

    onMessage: function (data) {
      console.log("Got message", data);
    },

    setupRemoteButtons: function () {
      $('.remote-buttons div')
        .each(function (index, button) {
          var elem = $(button);
          elem.on('mousedown', remote.sendMessage.bind(remote, {
            type: 'key',
            keyCode: parseFloat(elem.attr('data-value'))
          }));
        });
    },


    bootstrap: function () {
      this.populateDeviceList();
      this.setupRemoteButtons();

      var tabToShow = this.devices.length ? 'voice' : 'settings';
      var id = '#nav a[href="#' + tabToShow + '"]';

      $(id)
        .tab('show');

    }


  };

  var recognition;
  var remote =  window.remote = new REMOTE();

  $(document)
    .ready(remote.bootstrap);
})();
