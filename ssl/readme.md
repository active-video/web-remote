# HTTPs usage

In order to use the `webkitSpeechRecongition` API, the web-remote must be run over HTTPs.

Please generate a certificate in this directory matching your hostname, and it will be used the next time you run the service, and port 443 will be listened on.

```bash
cd ./ssl/
SSLDomainName=remote.3com.me
openssl genrsa -out webremote.key 2048
openssl req -new -x509 -key webremote.key -out webremote.cert -days 3650 -subj /CN=$SSLDomainName
```
