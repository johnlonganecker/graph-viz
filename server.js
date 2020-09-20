const http = require('http'),
  WebSocketServer = require('websocket').server,
  fs = require('fs'),
  md5 = require('md5');

const server = http.createServer();
server.listen(9898);

const wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', request => {
  const conn = request.accept(null, request.origin),
    file = 'test.json';

  let fsWait = false,
    previousMD5 = null;

  console.log('asdf');

  fs.watch(file, (event, filename) => {
    console.log('file modded');
    if(filename && event === 'change') {
      if(fsWait) return;

      fsWait = setTimeout(() => {
        fsWait = false;
      }, 100);

      let fileContents = fs.readFileSync(file),
        currentMD5 = md5(fileContents);

      if(currentMD5 !== previousMD5) {
        console.log(`${filename} file changed`);
        conn.sendUTF(fileContents);
        previousMD5 = currentMD5;
      }
    }
  });

  conn.on('message', message => {
    console.log('Receive Message:', message.utf8Data);
    //conn.sendUTF('Hi this is WebSocket server!');
  });

  conn.on('close', (reasonCode, description) => { 
    console.log('Client has disconnected.');
  });

});
