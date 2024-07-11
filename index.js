const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err.message);
    process.exit(1);
  });

// Definir esquema y modelo de Hotel
const hotelSchema = new mongoose.Schema({
  location: String,
  name: String,
  description: String,
  stars: Number,
  images: [String]
});

const Hotel = mongoose.model('Hotel', hotelSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Ruta para obtener hoteles por ubicación
app.get('/api/hotels', async (req, res) => {
  try {
    const location = req.query.location;
    const hotels = await Hotel.find({ location: location });
    res.status(200).send(hotels);
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener los hoteles', error });
  }
});

// Servir archivo HTML principal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
