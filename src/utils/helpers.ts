import { DefaultEventsMap, Socket } from 'socket.io';
import { verifyToken } from './tokenGeneration.js';

type socketType = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export const sendSocketMessage = (socket: socketType, eventName: string, responseObj: any) => {
  socket.emit(eventName, responseObj);
};

export const checkAuth = (socket: socketType, token: string) => {
  try {
    verifyToken(token);
    return {
      succes: true,
    };
  } catch (err) {
    sendSocketMessage(socket, 'authentication', {
      success: false,
      message: 'You can not perform this action, login again',
    });

    return {
      success: false,
      error: err,
    };
  }
};

export const generateSixRandomDigits = function (): string {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let sixRandomDigits: string = '';

  for (let i = 0; i < 6; i++) {
    const randomDigit = numbers[Math.floor(Math.random() * numbers.length)];

    sixRandomDigits += randomDigit;
  }

  return sixRandomDigits;
};

export const sendMessagesError = (socket: socketType) => {
  sendSocketMessage(socket, 'sendMessages', {
    success: false,
    message: 'Authentication error: your token is invalid',
  });
};

export const checkAuthNoSocket = (token: string) => {
  try {
    verifyToken(String(token));
    return { success: true };
  } catch (err) {
    return {
      success: false,
    };
  }
};
