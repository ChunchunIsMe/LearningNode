const koa = require('koa');
const Router = require('koa-router');
const app = new koa();
const router = new Router();
router.get('/', ctx => {
  ctx.body = 'hello world';
}).all('/404', ctx => {
  ctx.body = 'nonono'
}).get('/:name', ctx => {
  ctx.body = `hello ${ctx.params.name}`
})

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
})
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = Date.now() - start;
  ctx.set('x-Response-Time', ms);
})
app.use(router.routes())
app.use(async (ctx, next) => {
  if (ctx.response.status === 404) {
    ctx.redirect('/404');
  }
  next();
})
app.listen(3000);