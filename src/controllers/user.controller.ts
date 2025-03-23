import { Response, Request } from 'express';
import * as userService from '../services/user.service.js';
import { verifyEmail } from '../utils/emailSender.js';
import { generateToken } from '../utils/tokenGeneration.js';
import { checkPassword } from '../utils/password.js';
import { DefaultEventsMap, Socket } from 'socket.io';
import { checkAuthNoSocket, sendSocketMessage } from '../utils/helpers.js';
import validator from 'validator';

export const getUser = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  body: any,
) => {
  const { email, password } = body;
  const eventName = 'authentication';

  const isNotEmail = !validator.isEmail(email);
  const normalizedEmail = validator.normalizeEmail(email);

  if (isNotEmail) {
    sendSocketMessage(socket, eventName, {
      success: false,
      message: 'Use a valid e-mail format please!',
      error: 400,
    });

    return;
  } else if (normalizedEmail) {
    const user = await userService.findByEmail(normalizedEmail);

    if (user == void 0) {
      sendSocketMessage(socket, eventName, {
        success: false,
        message: 'The user does not exist',
        error: 404,
      });
    } else if (user) {
      const isSamePassWord = await checkPassword(password, user.password);
      console.log(isSamePassWord);

      if (!isSamePassWord) {
        sendSocketMessage(socket, eventName, {
          success: false,
          message: 'Invalid credentials',
          error: 403,
        });
      } else {
        const appUser = {
          id: user._id,
          name: user.name,
          email: user.email,
        };

        sendSocketMessage(socket, eventName, {
          success: true,
          message: 'User logged successfully',
          data: appUser,
          token: generateToken(appUser),
        });

        return appUser;
      }
    }
  }
};

export const createUser = async (req: Request, resp: Response) => {
  const { email = '', password = '', name = '' } = req.body;
  const user = {
    email: email,
    password: password,
    name: name,
  };

  const isEmail = validator.isEmail(email);
  user.email = isEmail ? validator.normalizeEmail(email) : '';
  const isStrongPassWord = validator.isStrongPassword(password, {
    minLength: 8,
    minSymbols: 1,
    minLowercase: 2,
    minUppercase: 1,
  });

  const hasName = !validator.isEmpty(name);
  const hasAtLeastThreeValues = validator.isLength(name, { min: 3, max: 10 });

  if (!isEmail || !isStrongPassWord || !hasName || !hasAtLeastThreeValues) {
    resp.status(400).json({
      success: false,
      message: `Either the e-mail provided is not valid, the password is not strong enought, the name field is empty or less than 3 and more than 10 characters`,
    });
  }

  const trimedPassWord = validator.trim(password);
  const savePassWord = validator.escape(trimedPassWord);
  user.password = savePassWord;

  const userAlreadyExist = await userService.findByEmail(user.email);

  if (userAlreadyExist) {
    resp.status(403).json({
      success: false,
      message: 'The email is not available for registration',
    });
  } else {
    try {
      verifyEmail(user.email, name);

      const answer = await userService.create(user);

      if (answer) {
        resp.status(200).json({
          success: true,
          message: 'User created succefully now login to your account',
        });
      }
    } catch (err: any) {
      resp.status(500).json({
        success: false,
        message: `The email provided is invalid, server error: ${err}`,
      });
    }
  }
};

export const getAllRegisteredUsers = async (req: Request, resp: Response) => {
  const { token } = req.headers;

  if (!token) {
    resp.status(400).json({
      success: false,
      message: 'No token header provided',
    });
    return;
  }
  const auth = checkAuthNoSocket(String(token));

  if (!auth.success) {
    resp.status(403).json({
      success: false,
      message: 'User sent an invalid token ',
    });
  } else {
    const users = await userService.findAllUsers();

    resp.status(200).json({
      success: true,
      data: users,
    });
  }
};
