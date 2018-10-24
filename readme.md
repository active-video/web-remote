# Web-remote

Creates a basic interface to listen for voice commands and send them to an HTML application running in a browser (via `socket.io`).

## Web UI: Voice Control

1. Tap the microphone to begin listening.
2. When the "wake" word is detected, the subsequent command will be captured and sent to the device

![image-20181024091441932](assets/screenshot.png)

## Web UI: Settings

1. Add a device by entering the client id for the device
2. Delete a device by choosing `delete`
3. Switch devices by choosing one from the list of saved devices
4. Override the "wake" word

![image-20181024091547966](/Users/cwagner/Sites/web-remote/assets/screenshot-settings.png)



## Configuration

Make sure that for the hostname where this is being hosted, that you have placed the SSL certificates inside of the `./ssl` directory (not required for localhost). 

The service can be configured to run using `pm2`. For example, if you clone this service in to /home/some-account, then create a file called `ecosystem.config.js` 

**/home/some-account/ecosystem.config.js**

```javascript
module.exports = {
  apps : [
    {
      name      : 'webremote',
      cwd       : '/home/some-account/web-remote/',
      script    : 'server.js',
      env: {
        SSL_PORT: '443',
        ALTERNATE_PORT: '80'
      },
      env_production : {
        NODE_ENV: 'production'
      }
    }

  ]
};
```

Then start the service:

```bash
pm2 start ecosystem.config.js
```
