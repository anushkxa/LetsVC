const IS_PROD = true;

const server = IS_PROD
  ? "https://letsvc.onrender.com"
  : "http://localhost:8000";

export default server;
