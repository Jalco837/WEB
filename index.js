import express from 'express'

const app = express()

app.get('/', (req, res)=>{
    res.send('Hola ya pude deployar es el comienzo')
})
app.listen(3000)
console.log('Servidor en el puerto', 3000);