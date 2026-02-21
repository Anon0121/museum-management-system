import React, { useState, useEffect } from "react";
import api from "../../config/api";

const Contacts = () => {
  const [contactLoading, setContactLoading] = useState(true);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactSettings, setContactSettings] = useState({
    phone: '+63 88 123 4567',
    email: 'cdocitymuseum@cagayandeoro.gov.ph',
    address_line1: 'Gaston Park, Cagayan de Oro City',
    address_line2: 'Misamis Oriental, Philippines',
    operating_hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
    email_response_time: "We'll respond within 24 hours",
    logo_url: null
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [socialMedia, setSocialMedia] = useState([]);
  const [editingSocial, setEditingSocial] = useState(null);
  const [newSocialMedia, setNewSocialMedia] = useState({ name: '', icon: 'fa-brands fa-facebook', url: '' });
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [contactMessage, setContactMessage] = useState({ type: '', text: '' });

  // Available social media icons
  const socialIcons = [
    { label: 'Facebook', value: 'fa-brands fa-facebook' },
    { label: 'Twitter', value: 'fa-brands fa-twitter' },
    { label: 'Instagram', value: 'fa-brands fa-instagram' },
    { label: 'YouTube', value: 'fa-brands fa-youtube' },
    { label: 'LinkedIn', value: 'fa-brands fa-linkedin' },
    { label: 'TikTok', value: 'fa-brands fa-tiktok' },
    { label: 'Email', value: 'fa-solid fa-envelope' },
    { label: 'Phone', value: 'fa-solid fa-phone' },
    { label: 'WhatsApp', value: 'fa-brands fa-whatsapp' },
    { label: 'Telegram', value: 'fa-brands fa-telegram' },
    { label: 'Website', value: 'fa-solid fa-globe' }
  ];

  // Fetch contact settings
  const fetchContactSettings = async () => {
    try {
      setContactLoading(true);
      const res = await api.get("/api/contact-settings");
      if (res.data.success) {
        setContactSettings(res.data.contact);
        setSocialMedia(res.data.socialMedia || []);
        if (res.data.contact?.logo_url) {
          const logoUrl = res.data.contact.logo_url.startsWith('http') 
            ? res.data.contact.logo_url 
            : `http://localhost:3000${res.data.contact.logo_url}`;
          setLogoPreview(logoUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching contact settings:', err);
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    fetchContactSettings();
  }, []);

  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload logo
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const res = await api.post("/api/contact-settings/logo", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        const logoUrl = res.data.logo_url;
        setContactSettings({...contactSettings, logo_url: logoUrl});
        setLogoPreview(logoUrl);
        setContactMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setContactMessage({ type: 'error', text: 'Failed to upload logo' });
      setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
    }
  };

  // Save contact settings
  const handleSaveContact = async () => {
    try {
      setContactMessage({ type: '', text: '' });
      
      // Upload logo first if there's a new one
      if (logoFile) {
        await handleLogoUpload();
      }
      
      const res = await api.put("/api/contact-settings", contactSettings);
      if (res.data.success) {
        setContactMessage({ type: 'success', text: 'Contact settings saved successfully!' });
        setIsEditingContact(false);
        setLogoFile(null);
        setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error saving contact settings:', err);
      setContactMessage({ type: 'error', text: 'Failed to save contact settings' });
      setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
    }
  };

  // Add social media link
  const handleAddSocialMedia = async () => {
    try {
      if (!newSocialMedia.name || !newSocialMedia.url) {
        setContactMessage({ type: 'error', text: 'Please fill in name and URL' });
        return;
      }
      const res = await api.post("/api/social-media", {
        ...newSocialMedia,
        display_order: socialMedia.length,
        is_active: true
      });
      if (res.data.success) {
        await fetchContactSettings();
        setNewSocialMedia({ name: '', icon: 'fa-brands fa-facebook', url: '' });
        setShowAddSocial(false);
        setContactMessage({ type: 'success', text: 'Social media link added!' });
        setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error adding social media:', err);
      setContactMessage({ type: 'error', text: 'Failed to add social media link' });
      setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
    }
  };

  // Update social media link
  const handleUpdateSocialMedia = async (id, data) => {
    try {
      const res = await api.put(`/api/social-media/${id}`, data);
      if (res.data.success) {
        await fetchContactSettings();
        setEditingSocial(null);
        setContactMessage({ type: 'success', text: 'Social media link updated!' });
        setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error updating social media:', err);
      setContactMessage({ type: 'error', text: 'Failed to update social media link' });
      setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
    }
  };

  // Delete social media link
  const handleDeleteSocialMedia = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social media link?')) return;
    try {
      const res = await api.delete(`/api/social-media/${id}`);
      if (res.data.success) {
        await fetchContactSettings();
        setContactMessage({ type: 'success', text: 'Social media link deleted!' });
        setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error deleting social media:', err);
      setContactMessage({ type: 'error', text: 'Failed to delete social media link' });
      setTimeout(() => setContactMessage({ type: '', text: '' }), 3000);
    }
  };

  if (contactLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[#2e2b41]">
          <i className="fa-solid fa-spinner fa-spin mr-2"></i>
          Loading contact settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{background: 'linear-gradient(135deg, #E5B80B, #D4AF37)'}}>
              <i className="fa-solid fa-address-card text-white text-lg sm:text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                Contact Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base" style={{fontFamily: 'Telegraf, sans-serif'}}>
                Manage museum contact information and social media links
              </p>
            </div>
          </div>
        </div>
      </div>

      {contactMessage.text && (
        <div className={`p-4 rounded-lg ${
          contactMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <i className={`fa-solid ${contactMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
          {contactMessage.text}
        </div>
      )}

      {/* Contact Details Section */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg md:text-xl font-bold" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
              <i className="fa-solid fa-phone mr-2 sm:mr-3" style={{color: '#E5B80B'}}></i>
              Contact Details
            </h3>
            <button
              onClick={() => setIsEditingContact(!isEditingContact)}
              className="px-3 sm:px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
              style={{backgroundColor: isEditingContact ? '#dc2626' : '#E5B80B', color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = isEditingContact ? '#b91c1c' : '#d4a509'}
              onMouseLeave={(e) => e.target.style.backgroundColor = isEditingContact ? '#dc2626' : '#E5B80B'}
            >
              <i className={`fa-solid ${isEditingContact ? 'fa-times' : 'fa-edit'} mr-2`}></i>
              {isEditingContact ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {isEditingContact ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactSettings.phone}
                    onChange={(e) => setContactSettings({...contactSettings, phone: e.target.value})}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="+63 88 123 4567"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactSettings.email}
                    onChange={(e) => setContactSettings({...contactSettings, email: e.target.value})}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="cdocitymuseum@cagayandeoro.gov.ph"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={contactSettings.address_line1}
                    onChange={(e) => setContactSettings({...contactSettings, address_line1: e.target.value})}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="Gaston Park, Cagayan de Oro City"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={contactSettings.address_line2}
                    onChange={(e) => setContactSettings({...contactSettings, address_line2: e.target.value})}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="Misamis Oriental, Philippines"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={contactSettings.operating_hours}
                    onChange={(e) => setContactSettings({...contactSettings, operating_hours: e.target.value})}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="Mon-Fri: 8:00 AM - 5:00 PM"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Email Response Time
                  </label>
                  <input
                    type="text"
                    value={contactSettings.email_response_time}
                    onChange={(e) => setContactSettings({...contactSettings, email_response_time: e.target.value})}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="We'll respond within 24 hours"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Logo (for Footer)
                  </label>
                  <div className="flex items-center space-x-4">
                    {logoPreview && (
                      <div className="w-20 h-20 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                        <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Telegraf, sans-serif'}}>
                        Upload a logo image. This will appear in the footer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsEditingContact(false);
                    fetchContactSettings(); // Reset to original values
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold text-sm"
                  style={{fontFamily: 'Telegraf, sans-serif'}}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContact}
                  className="px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                  style={{backgroundColor: '#E5B80B', color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d4a509'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#E5B80B'}
                >
                  <i className="fa-solid fa-save mr-2"></i>
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Phone */}
              <div className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#E5B80B] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-phone text-white text-base sm:text-lg"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base mb-1" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Phone
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 font-['Telegraf']">
                    {contactSettings.phone}
                  </p>
                  <p className="text-xs text-gray-500 font-['Telegraf'] mt-1">
                    {contactSettings.operating_hours}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#351E10] to-[#2A1A0D] flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-envelope text-white text-base sm:text-lg"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base mb-1" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Email
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 font-['Telegraf'] break-words">
                    {contactSettings.email}
                  </p>
                  <p className="text-xs text-gray-500 font-['Telegraf'] mt-1">
                    {contactSettings.email_response_time}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors md:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#E5B80B] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-white text-base sm:text-lg"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base mb-1" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Address
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 font-['Telegraf']">
                    {contactSettings.address_line1}
                  </p>
                  <p className="text-xs text-gray-500 font-['Telegraf'] mt-1">
                    {contactSettings.address_line2}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connect With Us Section */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg md:text-xl font-bold" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
              <i className="fa-solid fa-share-nodes mr-2 sm:mr-3" style={{color: '#E5B80B'}}></i>
              Connect With Us
            </h3>
            <button
              onClick={() => {
                setShowAddSocial(!showAddSocial);
                setNewSocialMedia({ name: '', icon: 'fa-brands fa-facebook', url: '' });
              }}
              className="px-3 sm:px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
              style={{backgroundColor: '#E5B80B', color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#d4a509'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#E5B80B'}
            >
              <i className={`fa-solid ${showAddSocial ? 'fa-times' : 'fa-plus'} mr-2`}></i>
              {showAddSocial ? 'Cancel' : 'Add Social Media'}
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {/* Add New Social Media Form */}
          {showAddSocial && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-4 text-sm" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                Add New Social Media Link
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-xs" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newSocialMedia.name}
                    onChange={(e) => setNewSocialMedia({...newSocialMedia, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="Facebook, Twitter, etc."
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-xs" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    Icon *
                  </label>
                  <select
                    value={newSocialMedia.icon}
                    onChange={(e) => setNewSocialMedia({...newSocialMedia, icon: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                  >
                    {socialIcons.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-xs" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                    URL *
                  </label>
                  <input
                    type="url"
                    value={newSocialMedia.url}
                    onChange={(e) => setNewSocialMedia({...newSocialMedia, url: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddSocialMedia}
                  className="px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                  style={{backgroundColor: '#E5B80B', color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d4a509'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#E5B80B'}
                >
                  <i className="fa-solid fa-plus mr-2"></i>
                  Add Link
                </button>
              </div>
            </div>
          )}

          {/* Existing Social Media Links */}
          <div className="space-y-3">
            {socialMedia.length === 0 ? (
              <div className="text-center py-8">
                <i className="fa-solid fa-share-nodes text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-500 text-sm" style={{fontFamily: 'Telegraf, sans-serif'}}>
                  No social media links added yet. Click "Add Social Media" to get started.
                </p>
              </div>
            ) : (
              socialMedia.map((social) => (
                <div key={social.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {editingSocial === social.id ? (
                    // Edit Mode
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <input
                          type="text"
                          value={social.name}
                          onChange={(e) => {
                            const updated = socialMedia.map(s => 
                              s.id === social.id ? {...s, name: e.target.value} : s
                            );
                            setSocialMedia(updated);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                        />
                      </div>
                      <div>
                        <select
                          value={social.icon}
                          onChange={(e) => {
                            const updated = socialMedia.map(s => 
                              s.id === social.id ? {...s, icon: e.target.value} : s
                            );
                            setSocialMedia(updated);
                          }}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                        >
                          {socialIcons.map((icon) => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={social.url}
                          onChange={(e) => {
                            const updated = socialMedia.map(s => 
                              s.id === social.id ? {...s, url: e.target.value} : s
                            );
                            setSocialMedia(updated);
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5B80B] text-sm"
                        />
                        <button
                          onClick={() => handleUpdateSocialMedia(social.id, social)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          title="Save"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button
                          onClick={() => {
                            setEditingSocial(null);
                            fetchContactSettings(); // Reset
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          title="Cancel"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#E5B80B] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
                          <i className={`${social.icon} text-white text-base sm:text-lg`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base" style={{color: '#351E10', fontFamily: 'Telegraf, sans-serif'}}>
                            {social.name}
                          </h4>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-blue-600 hover:underline truncate block"
                            style={{fontFamily: 'Telegraf, sans-serif'}}
                          >
                            {social.url}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingSocial(social.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteSocialMedia(social.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;

