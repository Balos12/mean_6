const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

const s3 = new AWS.S3({
    accessKeyId: '',
    secretAccessKey: '',
});

const bucket_name = 'itsmemario';
console.log("Bucket name:", bucket_name);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.array('files'), async (req, res) => {
    try {
      const promises = [];
      for (const file of req.files) {
        const fileStream = fs.createReadStream(file.path);
        const params = {
          Bucket: bucket_name,
          Key: file.originalname,
          Body: fileStream
        };
        const uploadPromise = s3.upload(params).promise();
        promises.push(uploadPromise);
      }
      const results = await Promise.all(promises);
      req.files.forEach(file => fs.unlinkSync(file.path));
      res.send('Files uploaded successfully');
    } catch (error) {
      res.status(500).send('Error uploading files: ' + error.message);
    }
  });
  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
