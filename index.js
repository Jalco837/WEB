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
  
  // Middlewares necesarios
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  
  // Rutas para manejar las solicitudes CRUD de hoteles
  // Ruta para manejar la solicitud POST y guardar un hotel
  app.post('/api/hotels', async (req, res) => {
    try {
      const hotel = new Hotel(req.body);
      await hotel.save();
      res.status(201).send({ message: 'Hotel guardado exitosamente' });
    } catch (error) {
      res.status(500).send({ message: 'Error al guardar el hotel', error });
    }
  });
  
  // Ruta para actualizar un hotel específico
  app.put('/api/hotels/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, stars, images } = req.body;
  
    try {
      const hotel = await Hotel.findByIdAndUpdate(id, {
        name,
        description,
        stars,
        images
      }, { new: true });
  
      res.status(200).send({ message: 'Hotel actualizado exitosamente', hotel });
    } catch (error) {
      console.error('Error al actualizar el hotel:', error);
      res.status(500).send({ message: 'Error interno al actualizar el hotel', error });
    }
  });
  
  // Ruta para eliminar un hotel
  app.delete('/api/hotels/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await Hotel.findByIdAndDelete(id);
      res.status(200).send({ message: 'Hotel eliminado exitosamente' });
    } catch (error) {
      res.status(500).send({ message: 'Error al eliminar el hotel', error });
    }
  });
  

// Servir archivo HTML principal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
