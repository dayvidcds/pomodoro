const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();

const conexao = require('/connectionDB')
  .then((conn) => {

    const DIR = path.join(__dirname, '../app/public')

    const userRep = new UserRepository(conn)
    const userBus = new UserBusiness(userRep)

    const noteRep = new NoteRepository(conn)
    const noteBus = new NoteBusiness(noteRep)

    const heartRep = new HeartRepository(conn)
    const heartBus = new HeartBusiness(heartRep)

    const heartRouter = new HeartRouter(heartBus, DIR)

    app.use('/css', express.static(DIR + '/css'))
    app.use('/js', express.static(DIR + '/js'))
    app.use('/images', express.static(DIR + '/images'))
    app.use('/vendor', express.static(DIR + '/vendor'))
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(cookieParser())

    app.use('/heart', heartRouter.router)

    app.use((req, res, next) => {
      const cookie = req.cookies.userCookie
      if (cookie == undefined) {
        res.cookie('userCookie', {
          token: null,
          user: {
            nome: null,
            email_usuario: null,
          }
        })
      }
      next()
    })

    app.get('/', (req, res) => {
      res.sendFile(DIR + '/index.html')
    })

    app.get('/api/findUser/:email', (req, res) => {
      const email = req.params.email
      userBus.findByEmail(email).then((resp) => {
        const userResp = {
          atividade_emailUsuario: resp.atividade_emailUsuario,
          atividade_emailParceiro: resp.atividade_emailParceiro
        }
        res.send(resp)
      }).catch((resp) => {
        res.send(resp)
      })
    })

    app.get('/login', (req, res) => {
      const cookie = req.cookies.userCookie
      if (cookie == undefined) {
        res.cookie('userCookie', {
          token: null,
          user: {
            nome: null,
            email_usuario: null
          }
        })
        res.sendFile(DIR + '/login.html')
      } else if (cookie.token == null) {
        res.sendFile(DIR + '/login.html')
      } else {
        res.redirect('/profile')
      }
    })

    app.get('/signup', (req, res) => {
      res.sendFile(DIR + '/signup.html')
    })

    app.post('/api/login', (req, res) => {
      const user = {
        email: req.body.email,
        senha: req.body.senha
      }
      userBus.login(user).then((resp) => {
        const jwtSecret = 'SECRET'
        const token = jwt.sign(resp.toJSON(), jwtSecret, {
          expiresIn: 1440
        })
        res.cookie('userCookie', {
          token: token,
          user: {
            nome: resp.nome,
            email_usuario: resp.email_usuario,
          }
        })
        res.send('ok')
      }).catch((resp) => {
        res.send(resp)
      })
    })

    app.post('/api/insert', (req, res) => {
      const user = {
        nome_usuario: req.body.nome,
        email_usuario: req.body.email1,
        senha: req.body.senha
      }
      let id_ = null;
      if (req.body.token == undefined || req.body.token == '') {
        return res.send('Token não inserido!')
      }
      userBus.insert(user).then((u) => {
        id_ = u._id
        noteBus.insert(u._id, 'Bem Vindo!', 'Esperamos que você se divirta e ame ainda mais o seu companheiro, o Heartmy não é apenas uma forma de demonstrar o amor, é algo pra você guardar bons momentos, e quando precisar os relembrar.', new Date())
          .then((resp) => {
            heartBus.update({
              idUsuario: resp.idUsuario
            }, req.body.token).then((resp) => {
              userBus.login({
                email: req.body.email1,
                senha: req.body.senha
              }).then((resp) => {
                const jwtSecret = 'SECRET'
                const token = jwt.sign(resp.toJSON(), jwtSecret, {
                  expiresIn: 1440
                })
                res.cookie('userCookie', {
                  token: token,
                  user: {
                    nome: resp.nome,
                    email_usuario: resp.email_usuario
                  }
                })
                res.send('ok')
              }).catch((resp) => {
                res.send(resp)
              })
            }).catch((resp) => {
              userBus.remove(user.email_usuario, user.senha).then((v) => {
                noteBus.removeIdUser(id_).then((v) => {
                  res.send(resp)
                }).catch((resp) => {
                  res.send(resp)
                })
              }).catch((v) => {
                res.send(v)
              })
            })
          }).catch((resp) => {
            res.send(resp)
          })
      }).catch((resp) => {
        res.send(resp)
      })

    })

    app.use((req, res, next) => {
      const cookie = req.cookies.userCookie
      if (cookie !== undefined) {
        const token = cookie.token
        const jwtSecret = 'SECRET'
        jwt.verify(token, jwtSecret, (err, decoded) => {
          if (err) {
            res.cookie('userCookie', {
              token: null,
              user: null
            })
            res.redirect('/login')
          } else {
            // se tudo correr bem, salver a requisição para o uso em outras rotas
            req.decoded = decoded
            next()
          }
        })
      } else {
        // se não tiver o token, retornar o erro 403
        res.cookie('userCookie', {
          token: null,
          user: null
        })

        res.redirect('/login')
      }
    })

    app.get('/api/logout', (req, res) => {
      const userOn = req.cookies.userCookie.user
      res.cookie('userCookie', {
        token: null,
        user: null
      })
      res.redirect('/login')
    })

    app.get('/api/find', (req, res) => {
      const email = req.cookies.userCookie.user.email_usuario
      userBus.findByEmail(email).then((resp) => {
        const userResp = {
          _id: resp._id,
          nome_usuario: resp.nome_usuario,
          email_usuario: resp.email_usuario
        }
        res.send(resp)
      }).catch((resp) => {
        res.send(resp)
      })
    })

    app.post('/api/removeNote', (req, res) => {
      noteBus.remove(req.body.id).then((resp) => {
        res.send('ok')
      }).catch((resp) => {
        res.send(resp)
      })
    })

    app.post('/api/update', (req, res) => {
      const email_usuario = req.body.email_usuario
      const email_parceiro = req.body.email_parceiro
      const user = {
        email1: req.body.email1,
        email2: req.body.email2,
        nome: req.body.nome,
        senha: req.body.senha
      }
      //console.log(user)
      userBus.update(email_usuario, email_parceiro, user).then((resp) => {
        const token = req.cookies.userCookie.token
        res.cookie('userCookie', {
          token: token,
          user: {
            nome: user.nome,
            email_usuario: user.email1,
          }
        })
        res.send('ok')
      }).catch((resp) => {
        res.send(resp)
      })
    })

    app.post('/api/insertNote', (req, res) => {
      const email = req.cookies.userCookie.user.email_usuario
      userBus.findByEmail(email).then((resp) => {
        noteBus.insert(resp._id, req.body.title, req.body.msg, new Date()).then((resp) => {
          res.send('ok')
        }).catch((resp) => {
          res.send(resp)
        })
      }).catch((resp) => {
        res.send(resp)
      })
    })

    app.post('/api/updateNote', (req, res) => {
      noteBus.update(req.body.id, req.body.msg, req.body.title).then((resp) => {
        res.send('ok')
      }).catch((resp) => {
        res.send(resp)
      })
    })

    app.get('/api/findNotes', (req, res) => {
      const email = req.cookies.userCookie.user.email_usuario
      userBus.findByEmail(email).then((resp) => {
        noteBus.findNotesByUser(resp._id).then((resp) => {
          res.send(resp)
        }).catch((resp) => {
          res.send('error')
        })
      }).catch((resp) => {
        res.send('error')
      })
    })

    app.get('/profile', (req, res) => {
      res.sendFile(DIR + '/profile.html')
    })

    app.get('/edit', (req, res) => {
      res.sendFile(DIR + '/editprofile.html')
    })

  })
  .catch((err) => {
    console.log(err)
  })

module.exports = app