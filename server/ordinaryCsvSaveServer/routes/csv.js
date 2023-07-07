var express = require('express');
const multer = require('multer');
const path = require('path');

var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('hi csv');
// });

// 파일 저장을 위한 Multer 미들웨어 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // 파일을 저장할 디렉토리 경로 설정
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    cb(null, fileName); // 저장될 파일명 설정
  },
});
const upload = multer({ storage });


router.get('/', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  console.log('CSV 파일이 업로드되었습니다:', filePath);
  
  // 여기서부터는 필요에 따라 추가 작업 수행 가능
  
  res.status(200).json({ success: true });
});



module.exports = router;
