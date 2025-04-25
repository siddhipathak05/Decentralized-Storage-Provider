const express = require("express");
const cors = require("cors");
const authRoutes = require('./routes/auth_routes');
const userRoutes = require('./routes/user_routes');
const providerRoutes = require('./routes/provider_routes');

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
    origin: 'http://localhost:5173',   // Frontend URL
    credentials: true                  // Allow cookies/token headers
};

app.use(cors(corsOptions)); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/provider', providerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});