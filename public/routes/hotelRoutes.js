const express = require('express');
const router = express.Router();
const Hotel = require('../models/hotel');

// Ruta para manejar la solicitud POST y guardar el hotel
router.post('/api/hotels', async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).send({ message: 'Hotel guardado exitosamente' });
  } catch (error) {
    res.status(500).send({ message: 'Error al guardar el hotel', error });
  }
});

// Ruta para obtener hoteles por ubicación
router.get('/api/hotels', async (req, res) => {
  try {
    const location = req.query.location;
    const hotels = await Hotel.find({ location: location });
    res.status(200).send(hotels);
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener los hoteles', error });
  }
});

// Ruta para eliminar un hotel
router.delete('/api/hotels/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Hotel.findByIdAndDelete(id);
    res.status(200).send({ message: 'Hotel eliminado exitosamente' });
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar el hotel', error });
  }
});

// Ruta para actualizar un hotel específico
router.put('/api/hotels/:id', async (req, res) => {
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

module.exports = router;
