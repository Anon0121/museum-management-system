const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get contact settings
router.get('/contact-settings', async (req, res) => {
  try {
    // Get contact settings (should only be one row)
    const [contactRows] = await pool.query('SELECT * FROM contact_settings ORDER BY id DESC LIMIT 1');
    
    // Get social media links
    const [socialRows] = await pool.query(
      'SELECT * FROM social_media_links WHERE is_active = TRUE ORDER BY display_order ASC, id ASC'
    );

    res.json({
      success: true,
      contact: contactRows[0] || {
        phone: '+63 88 123 4567',
        email: 'cdocitymuseum@cagayandeoro.gov.ph',
        address_line1: 'Gaston Park, Cagayan de Oro City',
        address_line2: 'Misamis Oriental, Philippines',
        operating_hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
        email_response_time: "We'll respond within 24 hours"
      },
      socialMedia: socialRows || []
    });
  } catch (err) {
    console.error('❌ Error fetching contact settings:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch contact settings' });
  }
});

// Upload logo
router.post('/contact-settings/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    // Check if settings exist
    const [existing] = await pool.query('SELECT id, logo_url FROM contact_settings ORDER BY id DESC LIMIT 1');

    if (existing.length > 0) {
      // Delete old logo if exists
      if (existing[0].logo_url) {
        const oldLogoPath = path.join(__dirname, '..', existing[0].logo_url);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      // Update logo URL
      await pool.query(
        `UPDATE contact_settings SET logo_url = ?, updated_at = NOW() WHERE id = ?`,
        [logoUrl, existing[0].id]
      );
    } else {
      // Insert new with logo
      await pool.query(
        `INSERT INTO contact_settings (logo_url) VALUES (?)`,
        [logoUrl]
      );
    }

    res.json({ 
      success: true, 
      message: 'Logo uploaded successfully',
      logo_url: `http://localhost:3000${logoUrl}`
    });
  } catch (err) {
    console.error('❌ Error uploading logo:', err);
    res.status(500).json({ success: false, message: 'Failed to upload logo' });
  }
});

// Update contact settings
router.put('/contact-settings', async (req, res) => {
  try {
    const { phone, email, address_line1, address_line2, operating_hours, email_response_time, logo_url } = req.body;

    // Check if settings exist
    const [existing] = await pool.query('SELECT id FROM contact_settings ORDER BY id DESC LIMIT 1');

    if (existing.length > 0) {
      // Update existing
      await pool.query(
        `UPDATE contact_settings SET 
          phone = ?, email = ?, address_line1 = ?, address_line2 = ?, 
          operating_hours = ?, email_response_time = ?, logo_url = ?, updated_at = NOW()
        WHERE id = ?`,
        [phone, email, address_line1, address_line2, operating_hours, email_response_time, logo_url || null, existing[0].id]
      );
    } else {
      // Insert new
      await pool.query(
        `INSERT INTO contact_settings 
          (phone, email, address_line1, address_line2, operating_hours, email_response_time, logo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [phone, email, address_line1, address_line2, operating_hours, email_response_time, logo_url || null]
      );
    }

    res.json({ success: true, message: 'Contact settings updated successfully' });
  } catch (err) {
    console.error('❌ Error updating contact settings:', err);
    res.status(500).json({ success: false, message: 'Failed to update contact settings' });
  }
});

// Get all social media links (including inactive)
router.get('/social-media', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM social_media_links ORDER BY display_order ASC, id ASC'
    );
    res.json({ success: true, socialMedia: rows });
  } catch (err) {
    console.error('❌ Error fetching social media links:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch social media links' });
  }
});

// Add new social media link
router.post('/social-media', async (req, res) => {
  try {
    const { name, icon, url, display_order, is_active } = req.body;

    if (!name || !icon || !url) {
      return res.status(400).json({ success: false, message: 'Name, icon, and URL are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO social_media_links (name, icon, url, display_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name, icon, url, display_order || 0, is_active !== undefined ? is_active : true]
    );

    res.json({ 
      success: true, 
      message: 'Social media link added successfully',
      id: result.insertId
    });
  } catch (err) {
    console.error('❌ Error adding social media link:', err);
    res.status(500).json({ success: false, message: 'Failed to add social media link' });
  }
});

// Update social media link
router.put('/social-media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, url, display_order, is_active } = req.body;

    const [result] = await pool.query(
      `UPDATE social_media_links SET 
        name = ?, icon = ?, url = ?, display_order = ?, 
        is_active = ?, updated_at = NOW()
      WHERE id = ?`,
      [name, icon, url, display_order || 0, is_active !== undefined ? is_active : true, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Social media link not found' });
    }

    res.json({ success: true, message: 'Social media link updated successfully' });
  } catch (err) {
    console.error('❌ Error updating social media link:', err);
    res.status(500).json({ success: false, message: 'Failed to update social media link' });
  }
});

// Delete social media link
router.delete('/social-media/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM social_media_links WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Social media link not found' });
    }

    res.json({ success: true, message: 'Social media link deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting social media link:', err);
    res.status(500).json({ success: false, message: 'Failed to delete social media link' });
  }
});

module.exports = router;

