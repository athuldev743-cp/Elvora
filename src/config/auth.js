const envAdmin = process.env.REACT_APP_ADMIN_EMAIL;

export const ADMIN_EMAILS = [
  // 1. Read from environment variable (if set)
  ...(envAdmin ? [envAdmin] : []),
  
  // 2. You can also keep hardcoded fallbacks here if you want
  // "athuldev743@gmail.com" 
];