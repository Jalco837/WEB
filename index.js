const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); 

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Para analizar las solicitudes JSON

// Configuración de sesión
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Middleware para servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de conexión a MongoDB
const dbURI = 'mongodb+srv://Johan:jalc2002@cluster0.0hh8wek.mongodb.net/agencia';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
    // Iniciar el servidor después de la conexión exitosa a MongoDB
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error de conexión a MongoDB:', err.message);
  });

// Definición del esquema y modelo del hotel
const hotelSchema = new mongoose.Schema({
  location: String,
  name: String,
  description: String,
  stars: Number,
  images: [String]
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// Ruta para manejar la solicitud POST y guardar el hotel
app.post('/api/hotels', async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).send({ message: 'Hotel guardado exitosamente' });
  } catch (error) {
    res.status(500).send({ message: 'Error al guardar el hotel', error });
  }
});

// Definir el esquema y modelo para la colección cotizaciones
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

// Middleware para verificar el estado de sesión
const checkAuth = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next(); // Si el usuario está autenticado, permite continuar con la solicitud
  } else {
    res.redirect('/html/index.html'); // Redirigir al usuario a index.html si no está autenticado
  }
};

// Ruta para servir el archivo HTML principal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Rutas específicas para otras páginas HTML...
app.get('/cotizaciones.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/cotizaciones.html'));
});

app.get('/completas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/completas.html'));
});

// Añadir las demás rutas HTML aquí

// Definir el esquema y modelo para la colección semanas_completas
const Schema = mongoose.Schema;
const semanaCompletaSchema = new Schema({
  nombre: String,
  descripcion: String,
  imagenes: [String]
});
const SemanaCompleta = mongoose.model('SemanaCompleta', semanaCompletaSchema);

// Ruta para procesar el formulario de nueva promoción y guardar los datos en MongoDB
app.post('/guardar_nueva_prom', async (req, res) => {
  const { nombre, descripcion, imagen } = req.body; // Cambio aquí a 'imagen' en lugar de 'imagenes'
  const datosPromocion = {
    nombre,
    descripcion,
    imagenes: imagen // Aquí 'imagen' es un arreglo de URLs de imágenes
  };

  try {
    // Guardar los datos en MongoDB
    const nuevaPromocion = new SemanaCompleta(datosPromocion);
    await nuevaPromocion.save();
    console.log('Datos de la nueva promoción guardados exitosamente.');
    // Redireccionar a completas.html (o cualquier otra página)
    res.redirect('/html/completas.html');
  } catch (error) {
    console.error('Error al guardar los datos de la nueva promoción:', error);
    res.status(500).send('Error interno al guardar los datos.');
  }
});

// Ruta para obtener todas las promociones
app.get('/obtener_promociones', async (req, res) => {
  try {
    const promociones = await SemanaCompleta.find();
    res.json(promociones);
  } catch (error) {
    console.error('Error al obtener las promociones:', error);
    res.status(500).send('Error interno al obtener las promociones.');
  }
});

// Ruta para eliminar una promoción
app.delete('/eliminar_promocion/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await SemanaCompleta.findByIdAndDelete(id);
    console.log(`Promoción con id ${id} eliminada exitosamente.`);
    res.sendStatus(200); // OK
  } catch (error) {
    console.error(`Error al eliminar la promoción con id ${id}:`, error);
    res.status(500).send('Error interno al eliminar la promoción.');
  }
});

// Ruta para actualizar una promoción
app.post('/guardar_promocion_actualizada', async (req, res) => {
  const { promocionId, nombre, descripcion, imagenes } = req.body;

  const datosActualizados = {
    nombre,
    descripcion,
    imagenes
  };

  try {
    await SemanaCompleta.findByIdAndUpdate(promocionId, datosActualizados);
    res.send({ message: 'Promoción actualizada con éxito.' });
  } catch (error) {
    console.error('Error al actualizar la promoción:', error);
    res.status(500).send('Error interno al actualizar la promoción.');
  }
});

// Ruta para procesar el formulario de cotización y guardar los datos en MongoDB
app.post('/guardar_cotizacion', async (req, res) => {
  const { name, email, phone, destination, departureDate, returnDate, children, adults, description } = req.body;
  
  const nuevaCotizacion = new Cotizacion({
    name,
    email,
    phone,
    destination,
    departureDate,
    returnDate,
    children,
    adults,
    description
  });

  try {
    await nuevaCotizacion.save();
    console.log('Cotización guardada exitosamente.');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al guardar la cotización:', error);
    res.status(500).send('Error interno al guardar la cotización.');
  }
});

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

// Definición del esquema y modelo del usuario
const usuarioSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Ruta para manejar la solicitud POST y guardar el usuario
app.post('/registrar_usuario', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const nuevoUsuario = new Usuario({ username, email, password });
    await nuevoUsuario.save();
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ruta para manejar la solicitud POST de inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(400).json({ success: false, message: 'Usuario no ha sido registrado' });
    }

    if (usuario.password !== password) {
      return res.status(400).json({ success: false, message: 'Usuario y/o contraseña incorrectos' });
    }

    // Establecer la sesión del usuario
    req.session.isLoggedIn = true;
    req.session.username = username;
    res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Ruta para verificar el estado de inicio de sesión
app.get('/is-logged-in', (req, res) => {
  if (req.session.isLoggedIn) {
    res.status(200).json({ isLoggedIn: true });
  } else {
    res.status(200).json({ isLoggedIn: false });
  }
});

// Ruta para manejar la solicitud POST de cerrar sesión
app.post('/logout', (req, res) => {
  // Limpiar la sesión del usuario
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      res.status(500).json({ success: false });
    } else {
      res.status(200).json({ success: true });
    }
  });
});
