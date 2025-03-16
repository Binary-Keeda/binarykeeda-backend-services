import { envMode } from "../app.js";

export const errorMiddleware = (err, req, res, next)=> {

  err.message||= "Internal Server Error";
  err.statusCode = err.statusCode || 500;
  
  const response = {
    success: false,
    message: err.message,
  };

  if (envMode === "DEVELOPMENT") {
    response.error = err;
  }

  return res.status(err.statusCode).json(response);

};



