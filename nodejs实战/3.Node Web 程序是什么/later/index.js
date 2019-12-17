const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const articles = [{ title: 'Example', id: 0 }];

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/articles', (req, res, next) => {
  res.format({
    html: () => {
      res.render('articles.ejs', { articles: articles });
    },
    json: () => {
      res.send(articles);
    }
  })
});

app.post('/articles', (req, res, next) => {
  const article = { title: req.body.title };
  articles.push(article);
  res.send('OK');
})

app.get('/articles/:id', (req, res, next) => {
  const id = req.params.id;
  console.log('Fetching: ', id);
  res.send(articles[id]);
})

app.delete('/articles/:id', (req, res, next) => {
  const id = req.params.id;
  console.log('Deleting: ', id);
  delete articles[id];
  res.send({ message: 'Deleted' });
})

app.listen(app.get('port'), () => {
  console.log(`Express web app available at location ${app.get('port')}`);
})