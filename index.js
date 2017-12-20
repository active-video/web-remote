REMOTE = function () {
  this.init();
};
REMOTE.prototype = {
  devices: null,
  init: function () {
    this.bootstrap = this.bootstrap.bind(this);
    window.onmessage = this.onMessage.bind(this);

    this.loadDevices();
    this.activateRemote();
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

    id = id.replace(/[^0-9a-z]/gi, '').toLowerCase();


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
    if(id === this.activeDevice) {
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
    if(id === this.activeDevice) {
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
      document.write('<scr' + 'ipt src="//' + location.hostname + ':8081/' + role + '"></scr' + 'ipt>');
    }


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

  sendMessage: function(data) {
    if(!data.type) {
      console.error("REMOTE::sendMessage(data) requires value for data.type");
      return;
    } else if(!window.sendMessage) {
      console.error("REMOTE::sendMessage(data) requires a cloudtv-remote-proxy, is 'npm run service' running?");
      return;
    }

    window.sendMessage(data);

  },

  onMessage: function(data) {
      console.log("Got message", data);
  },

  setupRemoteButtons: function(){
     $('.remote-buttons div').each(function(index, button){
       var elem = $(button);
       elem.on('mousedown', remote.sendMessage.bind(remote, {type: 'key', keyCode: parseFloat(elem.attr('data-value'))}));
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


var remote = new REMOTE();

$(document)
  .ready(remote.bootstrap);
