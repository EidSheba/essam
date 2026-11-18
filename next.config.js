/** @type {import('next').NextConfig} */
module.exports = {
  // Static export: the build writes a plain HTML/CSS/JS site into ./out that any host can serve.
  output: 'export',
  images: { unoptimized: true },
}
