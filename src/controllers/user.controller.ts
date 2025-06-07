import { Response, Request } from 'express';
import * as userService from '../services/user.service.js';
import { generateToken } from '../utils/tokenGeneration.js';
import { checkPassword } from '../utils/password.js';
import { checkAuthNoSocket } from '../utils/helpers.js';
import validator from 'validator';

export const logUser = async (req: Request, resp: Response) => {
  const { email, password } = req.body;

  const isNotEmail = !validator.isEmail(email);
  const normalizedEmail = validator.normalizeEmail(email);

  if (isNotEmail) {
    resp.status(400).json({
      success: false,
      message: 'Use a valid e-mail format please!',
      error: 400,
    });
  } else if (normalizedEmail) {
    const user = await userService.findByEmail(normalizedEmail);

    if (user == void 0) {
      resp.status(400).json({
        success: false,
        message: 'The user does not exist',
        error: 400,
      });
    } else if (user) {
      const isSamePassWord = await checkPassword(password, user.password);

      if (!isSamePassWord) {
        resp.status(403).json({
          success: false,
          message: 'Invalid credentials',
        });
      } else {
        const appUser = {
          id: user._id,
          name: user.name,
          email: user.email,
        };

        resp.status(200).json({
          success: true,
          message: 'User logged successfully',
          data: appUser,
          token: generateToken(appUser),
        });
      }
    }
  }
};

export const toManyLoginRequest = async (req: Request, resp: Response) => {
  resp.status(429).json({
    success: true,
    message: 'It seems that you forgot your password, try to reset it instead',
  });
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
    return;
  }

  const trimedPassWord = validator.trim(password);
  const safePassWord = validator.escape(trimedPassWord);
  user.password = safePassWord;

  const userAlreadyExist = await userService.findByEmail(user.email);

  if (userAlreadyExist) {
    resp.status(403).json({
      success: false,
      message: 'The email is not available for registration',
    });
  } else {
    try {
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
        message: `Something bad happened!!! The user could not be registered: ${err}`,
      });
    }
  }
};

export const getAllRegisteredUsers = async (req: Request, resp: Response) => {
  const { token, skip = 0, limit = 50, userid } = req.headers;

  if (!token) {
    resp.status(400).json({
      success: false,
      message: 'No token header provided',
    });
    return;
  }
  const auth = checkAuthNoSocket(String(token), String(userid));

  if (!auth.success) {
    resp.status(403).json({
      success: false,
      message: 'User sent an invalid token ',
    });
  } else {
    const users = await userService.findAllUsers(Number(skip), Number(limit), userid);

    resp.status(200).json({
      success: true,
      data: users,
    });
  }
};

export const getUserWalletInfo = async (req: Request, resp: Response) => {
  const { token, userid } = req.headers;

  if (!token) {
    resp.status(400).json({
      success: false,
      message: 'No token header provided',
    });
    return;
  }
  const auth = checkAuthNoSocket(String(token), String(userid));

  if (!auth.success) {
    resp.status(401).json({
      success: false,
      message: 'User sent an invalid token ',
    });
  } else {
    const messageAmount = await userService.getUserMessageAmount(String(userid));

    resp.status(200).json({
      success: true,
      data: messageAmount,
    });
  }
};
