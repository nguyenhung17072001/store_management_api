import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import storage from '../Config/firebase.js';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';

const Uploadrouter = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

Uploadrouter.post('/', upload.array('files', 100), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'Please upload one or more files' });
      return;
    }

    const publicUrls = [];

    for (const file of files) {
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      const blob = storage.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on('error', (error) => {
        console.error('Error uploading file:', error.message);
        res.status(400).json({ message: 'Error uploading file' });
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${fileName}?alt=media`;
        publicUrls.push(publicUrl);

        // Nếu đã upload hết tất cả các tệp, trả về danh sách các URL công khai
        if (publicUrls.length === files.length) {
          res.status(200).json(publicUrls);
        }
      });

      blobStream.end(file.buffer);
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ message: 'Error uploading files' });
  }
});

const uploads = multer({ dest: 'uploads/' });
Uploadrouter.post('/process-image', uploads.single('file'), async (req, res) => {
  try {
    // Đọc tệp tin hình ảnh từ thư mục uploads
    const file = fs.readFileSync(req.file.path);

    // Tạo đối tượng FormData và đính kèm dữ liệu hình ảnh vào trong đó
    const formData = new FormData();
    formData.append('file', file, req.file.originalname);

    // Gửi yêu cầu đến microservice Python để xử lý ảnh
    const response = await axios({
      method: 'post',
      url: 'http://localhost:5000/process-image',
      data: formData,
      headers: formData.getHeaders()
    });

    // Xóa tệp tạm thời đã tải lên sau khi đã nhận kết quả từ microservice Python
    fs.unlinkSync(req.file.path);
    return res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ message: 'Error uploading files' });
  }
})

Uploadrouter.post('/process-comment', uploads.single('image'), async (req, res) => {
  try {
    // Đọc tệp tin hình ảnh từ thư mục uploads
    const file = fs.readFileSync(req.file.path);

    // Tạo đối tượng FormData và đính kèm dữ liệu hình ảnh và trường phrase vào trong đó
    const formData = new FormData();
    formData.append('image', file, req.file.originalname);
    formData.append('phrase', req.body.phrase);

    // Gửi yêu cầu đến microservice Python để xử lý ảnh
    const response = await axios({
      method: 'post',
      url: 'http://localhost:5000/comment',
      data: formData,
      headers: formData.getHeaders()
    });

    // Xóa tệp tạm thời đã tải lên sau khi đã nhận kết quả từ microservice Python
    fs.unlinkSync(req.file.path);
    return res.json(response.data);
  } catch (error) {
    console.error('Lỗi:', error.message);
    res.status(400).json({ message: 'Lỗi khi tải lên tệp' });
  }
})


export default Uploadrouter;
