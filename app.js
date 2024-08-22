require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');

const User = require('./models/UserModel');
const Chat = require('./models/ChatModels');
const userRoute = require('./routes/userRoute');

mongoose.connect('mongodb://localhost:27017');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use unique filenames
    }
});
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', userRoute);

// Handle file upload
app.post('/upload-file', upload.single('file'), async (req, res, next) => {
    try {
        const file = req.file;
        const fileName = file.filename;
        const filePath = file.path;
        // Handle file data as needed (e.g., saving file info to the database)
        console.log('File uploaded:', fileName);
        // Emit event to inform clients about the uploaded file
        io.emit('fileUploaded', { fileName, filePath });
        res.json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'File upload failed' });
    }
});

io.of('/user-namespace').on('connection', async (socket) => {
    console.log('User Connected');
    const userId = socket.handshake.auth.token;
    try {
        await User.findByIdAndUpdate(userId, { $set: { is_online: '1' } });
        socket.broadcast.emit('getOnlineUser', { user_id: userId });

        socket.on('disconnect', async () => {
            console.log('User Disconnected');
            await User.findByIdAndUpdate(userId, { $set: { is_online: '0' } });
            socket.broadcast.emit('getOfflineUser', { user_id: userId });
        });

        socket.on('newChat', (data) => {
            socket.broadcast.emit('loadNewChat', data);
        });

        socket.on('existsChat', async (data) => {
            try {
                const chats = await Chat.find({
                    $or: [
                        { sender_id: data.sender_id, receiver_id: data.receiver_id },
                        { sender_id: data.receiver_id, receiver_id: data.sender_id }
                    ]
                });
                socket.emit('loadChats', { chats });
            } catch (error) {
                console.error(error);
                // Handle error response if necessary
            }
        });

        // Handle file upload
        socket.on('fileUpload', async (data) => {
            try {
                const fileName = data.fileName;
                const filePath = data.filePath;
                // Handle file data as needed (e.g., saving file info to the database)
                console.log('File uploaded:', fileName);
                // Emit event to inform clients about the uploaded file
                io.emit('fileUploaded', { fileName, filePath });
            } catch (error) {
                console.error(error);
                // Handle error response if necessary
            }
        });
    } catch (error) {
        console.error(error);
        // Handle error response if necessary
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
