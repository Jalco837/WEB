import mongoose from 'mongoose';

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch(error => console.error('Error al conectar a MongoDB:', error));

// Definición del esquema y modelo del hotel
const hotelSchema = new mongoose.Schema({
  name: String,
  description: String,
  stars: Number,
  images: [String]
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// Definición del esquema y modelo de cotización
const cotizacionSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  destination: String,
  departureDate: Date,
  returnDate: Date,
  children: Number,
  adults: Number,
  description: String
});

const Cotizacion = mongoose.model('Cotizacion', cotizacionSchema);

// Definición del esquema y modelo de Semana Completa
const semanaCompletaSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  imagenes: [String]
});

const SemanaCompleta = mongoose.model('SemanaCompleta', semanaCompletaSchema);

export { Hotel, Cotizacion, SemanaCompleta };
