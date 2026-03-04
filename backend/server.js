const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Veritabanı ve Sequelize bağlantısı
const sequelize = require('./config/db');

// Modellerin sisteme tanıtılması (Sequelize'ın tabloları oluşturabilmesi için şart)
const Role = require('./models/Role');
const User = require('./models/User');
const Table = require('./models/Table');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Ingredient = require('./models/Ingredient');
const Recipe = require('./models/Recipe');

const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tableRoutes');
const menuRoutes = require('./routes/menuRoutes')
const orderRoutes = require('./routes/orderRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes'); // Yukarıya importlara ekle
const printRoutes = require('./routes/printRoutes'); // Yukarıya importlara ekle

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // React'in çalıştığı port
        methods: ["GET", "POST"]
    }
});

// Socket.io nesnesini diğer dosyalarda (Controller) kullanabilmek için app içine gömüyoruz
app.set('io', io);

// Biri bağlandığında log at
io.on('connection', (socket) => {
    console.log(`Sistem Bilgisi: Canlı bağlantı sağlandı (Socket ID: ${socket.id})`);

    socket.on('disconnect', () => {
        console.log(`Sistem Bilgisi: Bağlantı koptu (Socket ID: ${socket.id})`);
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/print', printRoutes);

// API Durum Kontrol Ucu
app.get('/', (req, res) => {
    res.json({ message: 'Sistem Durumu: Lux POS Backend Servisi Aktif' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Sistem Bilgisi: Veritabanı modelleri başarıyla senkronize edildi.');
        // DİKKAT: app.listen yerine server.listen kullanıyoruz!
        server.listen(PORT, () => {
            console.log(`Sistem Bilgisi: Sunucu ve Canlı Yayın (Socket) ${PORT} portunda aktif.`);
        });
    })
    .catch((error) => {
        console.error('Sistem Hatası: Veritabanı senkronizasyonunda kritik hata.', error);
    });