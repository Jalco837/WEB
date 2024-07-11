// db.js

const mongoose = require('mongoose');

// Conexión a MongoDB
const dbURI = 'mongodb+srv://Johan:jalc2002@cluster0.0hh8wek.mongodb.net/agencia';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a MongoDB:', err.message));

// Definir el esquema y el modelo para la colección semanas_completas
const Schema = mongoose.Schema;
const semanaCompletaSchema = new Schema({
  nombre: String,
  descripcion: String,
  imagenes: [String]
});
const SemanaCompleta = mongoose.model('SemanaCompleta', semanaCompletaSchema);

// Función para guardar una semana completa en la base de datos
async function guardarSemanaCompleta(datosSemana) {
  try {
    const nuevaSemanaCompleta = new SemanaCompleta(datosSemana);
    await nuevaSemanaCompleta.save();
    console.log('Datos guardados exitosamente.');
  } catch (error) {
    console.error('Error al guardar los datos:', error);
    throw error; // Puedes manejar este error en tu aplicación principal
  }
}

// Definir el esquema y el modelo para la colección hoteles
const hotelSchema = new mongoose.Schema({
  location: String,
  name: String,
  description: String,
  images: [String]
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// Función para guardar un hotel en la base de datos
async function guardarHotel(datosHotel) {
  try {
    const nuevoHotel = new Hotel(datosHotel);
    await nuevoHotel.save();
    console.log('Datos del hotel guardados exitosamente.');
  } catch (error) {
    console.error('Error al guardar los datos del hotel:', error);
    throw error; // Puedes manejar este error en tu aplicación principal
  }
}
module.exports = {
  guardarSemanaCompleta,
  guardarHotel
};
