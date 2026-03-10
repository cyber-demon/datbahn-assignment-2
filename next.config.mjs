/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Enable static HTML export for GitHub Pages
  output: 'export',

  // When deployed to GitHub Pages under cyber-demon/datbahn-assignment-2,
  // assets need this basePath/assetPrefix. Locally (dev) we keep it empty.
  basePath: isProd ? '/datbahn-assignment-2' : '',
  assetPrefix: isProd ? '/datbahn-assignment-2' : '',
};

export default nextConfig;
