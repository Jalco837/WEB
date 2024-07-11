import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import { guardarSemanaCompleta, guardarHotel } from './db.js'; // Importa las funciones del archivo db.js
import dotenv from 'dotenv';

dotenv.config();

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

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

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

// Middleware para verificar el estado de sesión
const checkAuth = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next(); // Si el usuario está autenticado, permite continuar con la solicitud
  } else {
    res.redirect('/index.html'); // Redirigir al usuario a index.html si no está autenticado
  }
};

// Ruta para servir el archivo HTML principal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Rutas específicas para otras páginas HTML...
app.get('/completas.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/completas.html'));
});

app.get('/nueva_prom.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/nueva_prom.html'));
});

app.get('/editar_prom.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/editar_prom.html'));
});

app.get('/hoteles.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/hoteles.html'));
});

app.get('/nuevo_hotel.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/nuevo_hotel.html'));
});

app.get('/editar_hotel.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/editar_hotel.html'));
});

app.get('/cotizaciones.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/cotizaciones.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/recuperar_contrasena.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/recuperar_contrasena.html'));
});

app.get('/registro.html', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/registro.html'));
});

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
    res.redirect('/completas.html');
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
app.post('/iniciar_sesion', async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ username });

    if (!usuario || usuario.password !== password) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    req.session.isLoggedIn = true;
    req.session.user = usuario;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ruta para manejar la solicitud POST de cierre de sesión
app.post('/cerrar_sesion', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.status(200).json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
