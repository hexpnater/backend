const connectSocket = (io) => {
    // Handle incoming socket connections
    io.on('connection', (socket) => {
        console.log('New user connected');

        // Handle incoming messages from clients
        socket.on('message', (data) => {
              console.log(data);
            io.emit('message_listener',data.message);
        });

        // Handle disconnecting clients
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}

module.exports = connectSocket;