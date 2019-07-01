const express = require('express')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
require('express-group-routes')
const app = express()
const {Base64} = require('js-base64')

app.use(bodyParser.json())

const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'simplechat_db'
})

app.group("/api/v1", (router)=> {
    
    router.post('/users', (req, res) => {
        const username = req.body.username
        const password = req.body.password
        const decode = Base64.decode(password)

        connection.query(`SELECT * FROM users WHERE username='${username}' AND password='${decode}'`, function (err, rows) {
            if (rows==0) {
                res.send(404)
            } else {
                const id = rows[0].id
                const username = rows[0].username
                const profilImage= rows[0].image_user
                const token = jwt.sign({username:username,id:id,profilImage:profilImage}, 'wkwkwk')
                res.send({id, username, token})
            }
        })
    })

    router.post('/users/info', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id

        connection.query(`SELECT id,username,image_user FROM users WHERE id='${id}'`, function (err, rows, field) {
            if (err) throw rows
            res.send(rows)
        })
    })

    router.post('/posts/chats', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id
        const username = decode.username
        const profilImage =decode.profilImage
        const chat = req.body.chat

        connection.query(`INSERT INTO chats (id_user, username, image_user, chat) values ("${id}", "${username}", "${profilImage}", "${chat}")`, function (err, rows, field) {
            if (err) throw err
            
            res.send(rows)
        })
    })

    router.get('/chats', expressJwt({secret: 'wkwkwk'}), (req, res) => {

        connection.query(`SELECT * FROM chats ORDER BY id DESC`, function (err, rows, field) {
            if (err) throw err
            
            res.send(rows)
        })
        
    })

    router.post('/chats/:id', expressJwt({secret: 'wkwkwk'}), (req, res) => {
        const idPost = req.params.id

        connection.query(`SELECT * FROM chats WHERE id='${idPost}'`, function (err, rows, field) {
            if (err) throw err
            
            res.send(rows)
        })
        
    })

    router.delete('/chats/:id', expressJwt({secret: 'wkwkwk'}), (req, res)=> {
        const id = req.params.id

        connection.query(`DELETE FROM chats WHERE id='${id}'`, function (err, rows, field) {
            if (err) throw rows

            res.send(rows)
        })
    })

    router.patch('/chats/:id', expressJwt({secret: 'wkwkwk'}), (req, res)=> {
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.decode(token, 'wkwkwk')
        const id = decode.id
        const idChat = req.params.id
        const username = decode.username
        const image_user = decode.profilImage
        const chat = req.body.chat

        connection.query(`UPDATE chats SET id_user='${id}', username='${username}', image_user='${image_user}', chat='${chat}' WHERE id='${idChat}'`, function (err, rows, field) {
            if (err) throw err

            res.send(rows)
        }) 
    })

})

app.group("/api/v2", (router) => {
    router.get('/todos', (req, res)=> {
        res.send({
            data: todos
        })
    })
})


app.listen('5000', ()=> console.log("App Running"))
