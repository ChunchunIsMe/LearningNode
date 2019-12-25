const express = require('express');
const app = express();
const router = express.Router();
router.get('/', (req, res) => {
  res.send('hello world');
})

router.get('/name/:name', (req, res, next) => {
  console.log(`${req.params.name} come`);
  next();
}, (req, res) => {
  res.send(`hello ${req.params.name}`)
})

router.get('/404', (req, res) => {
  res.send('fuck you go out');
})
app.use(router);
app.use((req, res, next) => {
  console.log(res.statusCode);
  if (req.statusCode === 404) {
    res.redirect('/404');
  }
  
})

app.listen(3001, () => {
  console.log('server start in http://localhost:3001')
})
