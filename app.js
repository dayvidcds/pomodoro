const path = require('path');

const express = require('express');

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const bodyParser = require("body-parser");

const cors = require('cors');

const corsOptions = {
  origin: '*',//ALL origins
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const DIR = path.join(__dirname);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use('/assets', express.static(DIR + '/assets'))
app.use('/pomodoro/assets', express.static(DIR + '/assets'))

let cups = [];

const povo = [
  {
    email: 'dayvid@navitdigital.com.br',
    nome: 'Dayvid'
  },
  {
    email: 'wedson@navitdigital.com.br',
    nome: 'Wedson'
  },
  {
    email: 'cleber@navitdigital.com.br',
    nome: 'Cleber'
  },
];

app.get('/', (req, res) => {
  res.sendFile(DIR + '/index.html');
});

app.get('/pomodoro', (req, res) => {
  res.sendFile(DIR + '/jungle.html');
});

app.get('/pomodoro/master', (req, res) => {
  res.sendFile(DIR + '/master.html');
});

app.get('/briefing', (req, res) => {
  res.sendFile(DIR + '/briefing.html');
});

app.get('/addBriefing', (req, res) => {
  res.sendFile(DIR + '/addBriefing.html');
});

app.post('/logout', (req, res) => {
  const name = req.body.name;
  let puloDoGato = false;
  let i = 0;
  console.log('SAINDOOOOOOOOOOOOO');
  for (i; i < cups.length; i++) {
    if (name === cups[i].name) {
      puloDoGato = true;
      break;
    }
  }
  if (!puloDoGato) {
    res.status(404).json({
      status: false,
      msg: 'Jungle não encontrado'
    });
  } else {
    cups.splice(i, 1);
    res.status(200).json({
      status: true,
      msg: 'Tudo ok'
    });
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  let puloDoGato = false;
  for (let i = 0; i < povo.length; i++) {
    if (povo[i].email === email) {
      puloDoGato = true;
      break;
    } else {
      puloDoGato = false;
    }
  }
  if (puloDoGato) {
    res.status(200).json({
      status: true,
      msg: 'Tudo ok'
    });
  } else {
    res.redirect('/');
  }
});

app.post('/setCup', (req, res) => {
  const name = req.body.name;
  const cup = req.body.cup;
  let puloDoGato = false;
  let i = 0;
  for (i; i < cups.length; i++) {
    if (name === cups[i].name) {
      puloDoGato = true;
      break;
    }
  }
  if (!puloDoGato) {
    cups.push({
      name,
      cup
    });
  } else {
    cups[i].cup = cup;
  }
  console.log(cups);
  res.status(200).json({
    status: true,
    msg: 'Tudo ok'
  });
});

io.on('error', () => {
  console.log('Socket ERROR!');
})

io.on('connection', function (socket) {
  socket.on('time', (msg) => {
    console.log('TIME => ', msg);
    io.emit('time', { ...msg, cups });
  });
});

server.listen(process.env.PORT || 80, (err, res) => {
  if (err) {
    console.log('SERVER DEU PAUU');
  } else {
    console.log('Tudo certinn');
  }
});