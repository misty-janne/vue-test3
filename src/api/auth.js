// libs
import bcrypt from 'bcrypt';
import { Router } from 'express';

// modules
// import passport from '../passport.js';
import { newToken } from '../utils/auth.js';
import UserModel from '../models/UserModel.js';

// router init
const router = Router();

// router

router.get(
  '/findbyid/:id',
  async (req, res) => {
    // try {
    const docs = await UserModel.findOne({
      username: req.user._id,
      _id: req.params.id,
    })
      .lean()
      .exec();
    res.status(200).json({ ...doc });
  },
  // catch (error) {
  //   console.error(error);
  // }
  // }
);

router.post('/findid', (req, res) => {
  // find the user's id by name and cellphone
  try {
    const result = UserModel.find({
      nickname: req.body.nickname,
      cellphone: req.body.cellphone,
    }).exec();
    console.log(result);
    if (result) {
      res.status(200).json({
        success: true,
        user: result,
        message: 'Login Success',
        token: token,
      });
    }
  } catch (error) {
    console.error(error);
  }
});

router.post('/findpw', (req, res) => {
  // find the user's pw by name and cellphone
  UserModel.find({
    username: req.body.username,
    cellphone: req.body.cellphone,
  }).then(user => {
    if (!user) {
      res.status(401).send('Authentication failed. User not found.');
    }
    bcrypt.compare(req.body.password, user.password, (error, result) => {
      if (error) {
        res.status(500).send('Internal Server Error');
      }
      if (result) {
        // create token with user info
        const token = newToken(user);

        // current logged-in user
        const loggedInUser = {
          username: user.username,
          nickname: user.nickname,
        };

        // return the information including token as JSON
        res.status(200).json({
          success: true,
          user: loggedInUser,
          message: 'Login Success',
          token: token,
        });
      } else {
        res.status(401).json('Authentication failed. Wrong password.');
      }
    });
  });
});

router.post('/login', (req, res) => {
  // find the user
  UserModel.findOne({
    username: req.body.username,
  })
    .then(user => {
      // non registered user
      if (!user) {
        res.status(401).send('Authentication failed. User not found.');
      }
      bcrypt.compare(req.body.password, user.password, (error, result) => {
        if (error) {
          res.status(500).send('Internal Server Error');
        }
        if (result) {
          // create token with user info
          const token = newToken(user);

          // current logged-in user
          const loggedInUser = {
            username: user.username,
            nickname: user.nickname,
          };

          // return the information including token as JSON
          res.status(200).json({
            success: true,
            user: loggedInUser,
            message: 'Login Success',
            token: token,
          });
        } else {
          res.status(401).json('Authentication failed. Wrong password.');
        }
      });
    })
    .catch(error => {
      res.status(500).json('Internal Server Error');
      throw error;
    });
});

router.post('/signup', (req, res) => {
  const { username, password, nickname, cellphone } = req.body;
  // encrypt password
  // NOTE: 10 is saltround which is a cost factor
  bcrypt.hash(password, 10, (error, hashedPassword) => {
    if (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    } else {
      const newUser = new UserModel({
        username,
        password: hashedPassword,
        nickname,
        cellphone,
      });
      newUser.save((error, saved) => {
        if (error) {
          console.log(error);
          res.status(409).send(error);
        } else {
          console.log(saved);
          res.send(saved);
        }
      });
    }
  });
});

// TODO: Logout 구현 필요
export default router;
