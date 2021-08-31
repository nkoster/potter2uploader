require('dotenv').config()

const PORT = process.env.PORT || 4040
const useAuth = process.env.AUTHENTICATION === 'false' ? false : true
const express = require('express')
const fileUpload = require('express-fileupload')
const app = express()
const log = console.log.bind(console)
const jwt = require('jsonwebtoken')

app.use(express.json())

app.use(fileUpload({createParentPath: true}))

const authenticateToken = (req, res, next) => {
  if (!useAuth) return next()
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    const message = 'No token supplied'
    log(`--- ${message}`)
    return res.status(200).send({ error: message })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      const message = 'Token did not verify'
      log(`--- ${message}`)
      return res.status(200).send({ error: message })
    }
    req.user = user
    return next()
  })
}

app.post('/uploader', authenticateToken, (req, res) => {
  console.log('--- upload request')
  if(!req.files) {
    return res.send({status: false, message: 'No file uploaded'})
  }
  try {
    const upload = req.files.file
    console.log(`--- received ${upload.name}`)
    upload.mv('./uploads/' + upload.name)
    res.send({
      status: true,
      message: 'File is uploaded',
      data: {
          name: upload.name,
          mimetype: upload.mimetype,
          size: upload.size
      }
    })
  } catch(err) {
    console.log(`--- ${err.message}`)
    res.status(500).send(err.message)
  }
})

app.listen(PORT, _ => console.log(`Uploader at port ${PORT}`))
