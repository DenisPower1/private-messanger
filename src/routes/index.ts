import app from './app';
import { getUser, createUser, getAllRegisteredUsers } from '../controllers/user.controller';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { getAllMessages, sendMessage } from '../services/message.service';
import { checkAuth, sendMessagesError, sendSocketMessage } from '../utils/helpers';
import { setOnlineStatus } from '../services/user.service';
import dotenv from 'dotenv';
import connectToDb from '../config/db';
import { checkOtp, sendOpt } from '../controllers/password.controller';
import { decodeToken } from '../utils/tokenGeneration';
import { deleteTokenFromDatabase } from '../services/token.service';

dotenv.config();

const startServer = async () => {
  await connectToDb();

  const serverPort = process.env.port;
  const server = createServer(app);
  const SocketChannel = new Server(server, {
    cors: {
      origin: '*',
      methods: ['POST', 'GET'],
      allowedHeaders: ['Content-Type', 'token'],
    },
  });

  SocketChannel.on('connection', (socket) => {
    let user: any;
    socket.on('join', ({ userId }) => {
      socket.join(userId);
    });
    socket.on('sendMessage', async ({ senderId, recepientId, text, token }) => {
      const auth = checkAuth(socket, token);
      const decodedToken = decodeToken(token);
      const participantsEntities = new Set([senderId, recepientId]);

      if (auth.succes && decodedToken && participantsEntities.has(decodedToken.id)) {
        const messages = await sendMessage(senderId, recepientId, text);
        const messageResponse = {
          success: true,
          data: messages,
        };
        sendSocketMessage(socket, 'sendMessages', messageResponse);
        socket.to(recepientId).emit('sendMessages', messageResponse);
      } else sendMessagesError(socket);
    });

    socket.on('getMessages', async ({ senderId, recepientId, token }) => {
      const auth = checkAuth(socket, token);
      const decodedToken = decodeToken(token);
      const participantsEntities = new Set([senderId, recepientId]);

      if (auth.succes && decodedToken && participantsEntities.has(decodedToken.id)) {
        const messages = await getAllMessages(senderId, recepientId);
        sendSocketMessage(socket, 'sendMessages', {
          success: true,
          data: messages,
        });
      } else sendMessagesError(socket);
    });
    socket.on('logout', async ({ token }) => {
      await deleteTokenFromDatabase(token);
      sendSocketMessage(socket, 'loggedOut', {
        success: true,
        message: 'User logged out successfully!',
      });
    });
    socket.on('login', async (credentialsBody) => {
      user = await getUser(socket, credentialsBody);
    });

    socket.on('disconnect', async () => {
      await setOnlineStatus(user?.id, false);
    });
  });

  app.post('/api/v1/register', createUser);
  app.post('/api/v1/sendOpt', sendOpt);
  app.post('/api/v1/verifyOpt', checkOtp);
  app.get('/api/v1/users', getAllRegisteredUsers);
  server.listen(serverPort, () => {
    console.log(`The Server is now alive on port ${serverPort}! `);
  });
};

startServer();
