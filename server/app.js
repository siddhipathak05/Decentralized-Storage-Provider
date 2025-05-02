const express = require("express");
const cors = require("cors");
const authRoutes = require('./routes/auth_routes');
const userRoutes = require('./routes/user_routes');
const providerRoutes = require('./routes/provider_routes');

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
    origin: (origin, callback) => {
        callback(null, origin); // Reflect the origin
    },
    credentials: true
};

app.use(cors(corsOptions)); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/provider', providerRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});