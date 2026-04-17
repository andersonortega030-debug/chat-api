const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// SERVIR FRONTEND
app.use(express.static(path.join(__dirname)));


// 🔥 CONEXIÓN A MONGODB
mongoose.connect("mongodb://arquitecturaenlanube26_db_user:Admin123456@ac-0off1lc-shard-00-00.kzcnojw.mongodb.net:27017,ac-0off1lc-shard-00-01.kzcnojw.mongodb.net:27017,ac-0off1lc-shard-00-02.kzcnojw.mongodb.net:27017/chat?ssl=true&replicaSet=atlas-1fslab-shard-0&authSource=admin&retryWrites=true&w=majority")
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.log("❌ Error:", err));


// 📦 MODELOS

// MENSAJES (global + privados)
const MensajeSchema = new mongoose.Schema({
    de: String,
    para: String, // null = global
    mensaje: String,
    fecha: { type: Date, default: Date.now }
});
const Mensaje = mongoose.model("Mensaje", MensajeSchema);



// USUARIOS
const UsuarioSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});
const Usuario = mongoose.model("Usuario", UsuarioSchema);


// 🔐 REGISTRO
app.post("/registro", async (req, res) => {
    try {
        const { username, password } = req.body;

        const nuevo = new Usuario({ username, password });
        await nuevo.save();

        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: "Usuario ya existe" });
    }
});


// 🔐 LOGIN
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await Usuario.findOne({ username, password });

    if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json({ ok: true, username });
});


// 👥 OBTENER USUARIOS
app.get("/usuarios", async (req, res) => {
    const usuarios = await Usuario.find({}, "username");
    res.json(usuarios);
});


// 📥 OBTENER MENSAJES (global + privados)
app.get("/mensajes/:usuario", async (req, res) => {
    const usuario = req.params.usuario;

    const mensajes = await Mensaje.find({
        $or: [
            { para: null },       // chat global
            { para: usuario },    // mensajes hacia mí
            { de: usuario }       // mensajes enviados por mí
        ]
    }).sort({ fecha: 1 });

    res.json(mensajes);
});


// 📤 ENVIAR MENSAJE
app.post("/mensaje", async (req, res) => {
    try {
        const { de, para, mensaje } = req.body;

        const nuevo = new Mensaje({
            de,
            para: para || null,
            mensaje
        });

        await nuevo.save();

        res.json(nuevo);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar mensaje" });
    }
});


// 🚀 SERVIDOR
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Servidor corriendo en puerto " + port);
});