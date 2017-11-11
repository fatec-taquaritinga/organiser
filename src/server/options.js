export default function () {
  return {
    name: 'Server',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    internal: {
      debug: process.env.DEBUG || false
    }
  }
}
