# Livstream
Try it online at [meet.sophanorin.com](https://meet.sophanorin.com)
# Installation 
Clone Livstream git repository
```bash
git clone https://github.com/Sophanorin/livestream.git
cd livstream
```
### Configuration

Note: Livestream will start on the default settings (if you don't create your own configuration files)

Important! You must always **rebuild** the livestream when you change something in the configuration files. 

#### use template (example)
Just clone the example files and adjust them if required.

```bash
cp server/config/config.example.js server/config/config.js
cp app/public/config/config.example.js app/public/config/config.js
```

#### To change default options, create your own server config file (yaml or json)

Example when using _config.json_ file
```javascript
{
  [
    {
      "urls": [
        "turn:turn.example.com:443?transport=tcp"
      ],
      "username": "example",
      "credential": "example"
    }
  ]
};
```
### Build
**Note:** It is highly recommended to use _yarn_ package manager.

```bash
cd app
yarn && yarn build

cd ../server
yarn && yarn build
```
### Run

**Run on server** (as root or with sudo) 

```bash
# Run the Node.js server application in a terminal:
cd server
sudo yarn start
```

**Run locally** (for development)

```bash
# run a live build from app folder:
app$ yarn start

# and run server in server folder: 
server$ yarn start
```

## Ports and firewall
| Port | protocol | description |
| ---- | ----------- | ----------- |
|  443 | tcp | default https webserver and signaling - adjustable in `server/config/config.js`) |
| 4443 | tcp | default `yarn start` port for developing with live browser reload, not needed in production environments - adjustable in app/package.json) |
| 40000-49999 | udp, tcp | media ports - adjustable in `server/config/config.js` |

## TURN configuration

You need an additional [TURN](https://github.com/coturn/coturn)-server for clients located behind restrictive firewalls! 
Add your server and credentials to `server/config/config.js`
