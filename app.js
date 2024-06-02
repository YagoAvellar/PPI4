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

// Middleware para verificar se o usuário está logado
function checkLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.send('Você precisa realizar o login.');
  }
}

// Rota para exibir o formulário de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Rota para processar o login
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

// Rota para exibir o formulário de cadastro de produtos
app.get('/products', checkLogin, (req, res) => {
  res.render('products', {
    user: req.session.user,
    lastAccess: req.cookies.lastAccess,
    products: products
  });
});

// Rota para exibir o formulário de cadastro de produto
app.get('/product-form', checkLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'product-form.html'));
});

// Rota para processar o cadastro de produto
app.post('/product-form', checkLogin, (req, res) => {
  const { barcode, description, costPrice, salePrice, expiryDate, stockQty, manufacturer } = req.body;
  const newProduct = { barcode, description, costPrice, salePrice, expiryDate, stockQty, manufacturer };
  products.push(newProduct);
  res.redirect('/products');
});

// Iniciando o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
