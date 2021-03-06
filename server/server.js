const http = require('http'),
  WebSocketServer = require('websocket').server,
  fs = require('fs'),
  md5 = require('md5'),
  process = require('process');

const graphDataPath = process.env['DATA_PATH'] || '/home/node/app';

const server = http.createServer();
server.listen(6789);

const wsServer = new WebSocketServer({
  httpServer: server
});

function watchFile(filename, wsConn) {
  console.log(`attempting to watch ${filename}`);

  let fsWait = false,
    previousMD5 = null;

  console.log(`now watching ${filename}`);
  // https://thisdavej.com/how-to-watch-for-files-changes-in-node-js
  fs.watch(filename, (event, file) => {
    console.log('file modded');
    if(file && event === 'change') {
      if(fsWait) return;

      fsWait = setTimeout(() => {
        fsWait = false;
      }, 100);

      let fileContents = fs.readFileSync(filename),
        currentMD5 = md5(fileContents);

      if(currentMD5 !== previousMD5) {
        console.log(`${filename} file changed`);
        wsConn.sendUTF(fileContents);
        previousMD5 = currentMD5;
      }
    }
  });

}

wsServer.on('request', request => {
  const conn = request.accept(null, request.origin),
    file = graphDataPath+'/graph-data/test.json';

  watchFile(file, conn);

  conn.on('message', message => {
    let fileContents = fs.readFileSync(file);
    conn.sendUTF(fileContents);
    console.log('Receive Message:', message.utf8Data);
  });

  conn.on('close', (reasonCode, description) => { 
    console.log('Client has disconnected.');
  });

});

http.createServer((req, res) => {
  fs.readFile(__dirname + req.url, (err, data) => {
    if(err) {
      res.writeHead(400);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(7890);
