const db = require("../db");
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const crypto = require('crypto');

const signToken = id =>{
    return jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, res, status)=>{
    const token = signToken(user._id)

    const cookieOptions = {
        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true //To prevent XSS attacks, here browsers just send and recieve but cant manipulate the cookie
    }

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(200).json({
        status: status,
        "status_code": 200,
        access_token: token,
        user_id: user._id

    })
}

const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  
  try {
      if (!username || !email || !password) {
          return next(new AppError('Please provide username, email, and password', 400));
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await db.user.create({
          data: {
              username: username,
              email: email,
              password: hashedPassword,
          }
      });

      createSendToken(newUser, res, 'Account successfully created');
  } catch (error) {
      return next(new AppError('Something went wrong', 500));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
  }

  try {
      const user = await db.user.findUnique({
          where: { email: email },
          select: {
              id: true,
              username: true,
              email: true,
              password: true,
          }
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
          return next(new AppError('"Incorrect username/password provided. Please retry', 401));
      }

      createSendToken(user, res, 'Login successful');
  } catch (error) {
      return next(new AppError('Something went wrong', 500));
  } finally {
      await prisma.$disconnect();
  }
};

const protect = async(req, res, next)=>{
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token = req.headers.authorization.split(' ')[1];
  }
  if(!token){
      return next(new AppError('You are not logged in! Please login to get access!', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); 

  const freshUser = await db.user.findUnique({
    where: { id: decoded.id },
});
  if(!freshUser){
      return next(new AppError('The user belonging to this token no longer exists', 401));
  }

  req.user = freshUser;
  next();
};

module.exports = authController = {
    signup,
    login,
    protect
};