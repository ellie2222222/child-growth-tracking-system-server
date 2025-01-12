import rateLimit from "express-rate-limit";

// Create a rate limiter with customizable time window and max requests
const limiter = (time: number, max: number) => {
  const options = {
    windowMs: time * 60 * 1000, // time in minutes
    max: max, // limit each IP to max requests in windowMs time
    standardHeaders: true, // Include standard headers in response
    legacyHeaders: false, // Disable legacy headers
    message: `Too many requests from this IP, please try again after ${time} minutes`,
  };

  return rateLimit(options); // Return the configured rate limiter
};

export default limiter;
