const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

let products = [];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos da pasta "paginas"
app.use(express.static(path.join(__dirname, 'paginas')));

// Middleware para verificar login
function checkLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.send('Você precisa realizar o login.');
  }
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
</head>
<body>
  <h1>Login</h1>
  <form action="/login" method="post">
    <label for="username">Nome de Usuário:</label>
    <input type="text" id="username" name="username" required>
    <button type="submit">Login</button>
  </form>
</body>
</html>
  `);
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username) {
    req.session.user = username;
    res.cookie('lastAccess', new Date().toISOString());
    res.redirect('/products');
  } else {
    res.send('Nome de usuário é obrigatório.');
  }
});

app.get('/products', checkLogin, (req, res) => {
  res.render('products', {
    user: req.session.user,
    lastAccess: req.cookies.lastAccess,
    products: products
  });
});

app.get('/product-form', checkLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'product-form.html'));
});

app.post('/product-form', checkLogin, (req, res) => {
  const { barcode, description, costPrice, salePrice, expiryDate, stockQty, manufacturer } = req.body;
  const newProduct = { barcode, description, costPrice, salePrice, expiryDate, stockQty, manufacturer };
  products.push(newProduct);
  res.redirect('/products');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
