import app from './app';
import {
  logUser,
  createUser,
  getAllRegisteredUsers,
  getUserWalletInfo,
  toManyLoginRequest,
} from '../controllers/user.controller.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { getAllMessages, sendMessage } from '../services/message.service.js';
import { checkAuth, sendMessagesError, sendSocketMessage } from '../utils/helpers.js';
import connectToDb from '../config/db.js';
import { checkOtp, sendOpt } from '../controllers/password.controller.js';
import { decodeToken } from '../utils/tokenGeneration.js';
import { deleteTokenFromDatabase } from '../services/token.service.js';
import runSchedules from '../cron/index.js';
import { addOnlineUser, isOnline, removeOnlineUser } from '../services/redisuser.service.js';
import envConfig from '../config/env.js';
import { loginLimiter } from './middlewares/ratelimit';

const host = envConfig.serverHost;
const port = envConfig.serverPort;

const startServer = async () => {
  await connectToDb();
  runSchedules();
  const server = createServer(app);
  const SocketChannel = new Server(server, {
    cors: {
      origin: '*',
      methods: ['POST', 'GET'],
      allowedHeaders: ['content-type', 'token', 'userId', 'skip', 'limit'],
    },
  });

  SocketChannel.on('connection', (socket) => {
    socket.on('logged', async ({ userId }) => {
      socket.join(userId);
      await addOnlineUser(userId);
      socket.on('stillOnline', async () => await addOnlineUser(userId));
      socket.on('disconnect', async () => await removeOnlineUser(userId));
      socket.on('isOnline', async () => {
        const onlineStatus = await isOnline(userId);

        sendSocketMessage(socket, 'isOnline', {
          success: true,
          data: Boolean(onlineStatus),
        });
      });
    });

    socket.on(
      'sendMessage',
      async ({ senderId, recepientId, conversationId = '', text, token }) => {
        const auth = checkAuth(socket, token);
        const decodedToken = decodeToken(token);
        const recepientIsOnline = await isOnline(recepientId);
        const participantsEntities = new Set([senderId, recepientId]);

        if (auth.succes && decodedToken && participantsEntities.has(decodedToken.id)) {
          const messages = await sendMessage(senderId, recepientId, conversationId, text);
          const messageResponse = {
            success: true,
            data: messages,
            conversationId: messages[0]?.conversationId,
          };

          if (recepientIsOnline)
            SocketChannel.to(recepientId).emit('recieveMessages', messageResponse);
          SocketChannel.to(senderId).emit('recieveMessages', messageResponse);
        } else sendMessagesError(socket);
      },
    );

    socket.on('getMessages', async ({ senderId, recepientId, conversationId, token }) => {
      const auth = checkAuth(socket, token);
      const decodedToken = decodeToken(token);
      const participantsEntities = new Set([senderId, recepientId]);

      if (auth.succes && decodedToken && participantsEntities.has(decodedToken.id)) {
        const messages = await getAllMessages(conversationId, senderId);
        sendSocketMessage(socket, 'recievesMessages', {
          success: true,
          data: messages,
        });
      } else sendMessagesError(socket);
    });
    socket.on('logout', async ({ token, userId }) => {
      await deleteTokenFromDatabase(token);
      SocketChannel.to(userId).emit('loggedOut', {
        success: true,
        message: 'User Logged out successfully!',
      });
      socket.leave(userId);
      await removeOnlineUser(userId);
    });
  });

  app.post('/api/v1/register', createUser);
  app.post('/api/v1/login', async (req, resp) => {
    try {
      loginLimiter.consume(req.ip as string);
      logUser(req, resp);
    } catch (err) {
      toManyLoginRequest(req, resp);
    }
  });
  app.post('/api/v1/sendOpt', sendOpt);
  app.post('/api/v1/verifyOpt', checkOtp);
  app.get('/api/v1/users', getAllRegisteredUsers);
  app.get('/api/v1/user/walletInfo', getUserWalletInfo);
  server.listen({ host, port }, () => {
    console.log(`The Server is now alive on port ${port}! `);
  });
};

startServer();
