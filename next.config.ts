/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SFTP_HOST: process.env.SFTP_HOST,
    SFTP_PORT: process.env.SFTP_PORT,
    SFTP_USER: process.env.SFTP_USER,
    SFTP_PASS: process.env.SFTP_PASS,
  },
};

export default nextConfig;