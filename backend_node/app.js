const express = require('express');
const app = express();

app.get('/Platzi', (req, res) => {
  res.send('Hola desde un dev container con Express.');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Escuchando en http://localhost:${port}/Platzi`);
});