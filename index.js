import express from 'express';

const app = express();

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(3000, () => {
    console.log('Servidor en el puerto', 3000);
});
