const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const env = require('env2')('./.env')
const AWS = require('aws-sdk')
app.use(bodyParser({ extended: false }))

const multer = require('multer')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_KEY
})

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '')
  },
  filename: (req, file, cb) => {
    const name = file.originalname
    cb(null, name)
  },
  mimetype: 'pplication/pdf'
})
const upload = multer({ storage }).single('Media')



const twiml =
  '<Response><Receive action="/fax/payload" method="POST" storeMedia="false" /></Response>'

app.post(
  '/fax/sent',
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    console.log(
      `(initialize): Incoming fax request. FaxSID:${req.body.FaxSid}, From:${req.body.From}`
    )
    res.type('text/xml').send(twiml)
  }
)

app.post('/fax/payload', upload, (req, res) => {
  console.log(
    `(payload): Incoming fax data. FaxSID:${req.body.FaxSid}, From:${req.body.From}, Pages:${req.body.NumPages}, Size:${req.file.size}, Type:${req.file.mimetype} ${req.file}`
  )

  let myFile = req.file.originalname.split('.')
  const fileType = myFile[myFile.length - 1]

  const params = {
    Bucket: process.env.AWS_S3,
    Key: `${'uuid()'}.${fileType}`,
    Body: req.file.buffer
  }

  s3.upload(params, (error, data) => {
    console.log(`error ${error} data${data}`)
    if (error) {
      res.status(500).send(error)
    }

    res.status(200).send(data)

  })
})

// Start the web server
http.createServer(app).listen(3000, () => {
  console.log('Express server listening on port 3000')
})
