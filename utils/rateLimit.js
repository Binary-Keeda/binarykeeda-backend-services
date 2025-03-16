import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 3, 
  message: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); 
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;
    return `Too many requests, please try again after ${minutes}:${seconds < 10 ? `0${seconds}` : seconds}.`;
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});
const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 3, 
  message: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); 
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;
    return `Too many requests, please try again after ${minutes}:${seconds < 10 ? `0${seconds}` : seconds}.`;
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

export { otpLimiter ,verifyLimiter};


