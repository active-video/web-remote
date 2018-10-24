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

For this configuration, let's assume you've cloned this service `web-remote` into `/home/some-account`.

### Developing

```bash
npm run dev
#or to test SSL:
#npm run devsecure
```



### SSL Certificate

See [ssl/readme.md](ssl/readme.md) for how to generate the SSL certificate for use with ExpressJS.

You must have placed

- /home/some-account/ssl/webremote.key
- /home/some-account/ssl/webremote.cert

Example of using a symlink to point to the cert/key in a folder on your server:

```bash
cd /home/some-account/web-remote/ssl/
ln -s /home/some-account/ssl/myhostname.key webremote.key 
ln -s /home/some-account/ssl/myhostname.cert webremote.cert
```



### PM2

The service can be configured to run using `pm2`. Create a file called `ecosystem.config.js` 

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
