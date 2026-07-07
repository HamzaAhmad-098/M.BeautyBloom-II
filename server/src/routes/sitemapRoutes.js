// routes/sitemapRoutes.js
import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).select('_id updatedAt');
    
    const baseUrl = 'https://www.mbeautybloom.shop';
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    // Homepage
    xml += `
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
    `;
    
    // Shop page
    xml += `
      <url>
        <loc>${baseUrl}/shop</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
    `;
    
    // Product pages
    products.forEach(product => {
      xml += `
        <url>
          <loc>${baseUrl}/product/${product._id}</loc>
          <lastmod>${product.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    });
    
    // Static pages
    const staticPages = ['about', 'contact', 'faq', 'privacy', 'terms'];
    staticPages.forEach(page => {
      xml += `
        <url>
          <loc>${baseUrl}/${page}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.6</priority>
        </url>
      `;
    });
    
    xml += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;