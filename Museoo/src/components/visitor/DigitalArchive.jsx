import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DigitalArchive = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);

  const archiveTypes = [
    { value: '', label: 'All Types' },
    { value: 'Document', label: 'Documents' },
    { value: 'Image', label: 'Images' },
    { value: 'Audio', label: 'Audio Files' },
    { value: 'Video', label: 'Video Files' },
    { value: 'Other', label: 'Other Files' }
  ];

  const predefinedCategories = [
    { value: '', label: 'All Categories' },
    { value: 'History of Cdeo', label: 'History of Cdeo' },
    { value: 'Local Heroes', label: 'Local Heroes' },
    { value: 'History of Baragnays', label: 'History of Baragnays' },
    { value: 'Fathers of City Charter', label: 'Fathers of City Charter' },
    { value: 'Mayor Of Cagayan De oro City', label: 'Mayor Of Cagayan De oro City' },
    { value: 'Other', label: 'Other' }
  ];

  // Load all visible documents
  const loadAllArchives = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/archives');
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error loading archives:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchArchives = async () => {
    if (searchTerm.trim().length < 2 && !selectedType && !selectedCategory) {
      // If no search criteria, load all documents
      await loadAllArchives();
      return;
    }

    setIsLoading(true);
    try {
      let url = 'http://localhost:3000/api/archives?';
      const params = new URLSearchParams();
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      if (selectedType) {
        params.append('type', selectedType);
      }

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      const response = await axios.get(`http://localhost:3000/api/archives?${params.toString()}`);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all documents and categories on component mount
  useEffect(() => {
    loadAllArchives();
    
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/archives/categories');
        setAvailableCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(searchArchives, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedType, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchArchives();
  };

  const handleResultClick = (archive) => {
    setSelectedArchive(archive);
  };

  const handleDownload = (archive) => {
    if (archive.file_url) {
      window.open(`http://localhost:3000${archive.file_url}`, '_blank');
    }
  };

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'document':
        return <i className="fa-solid fa-file-alt text-white text-2xl"></i>;
      case 'image':
        return <i className="fa-solid fa-image text-white text-2xl"></i>;
      case 'audio':
        return <i className="fa-solid fa-music text-white text-2xl"></i>;
      case 'video':
        return <i className="fa-solid fa-video text-white text-2xl"></i>;
      default:
        return <i className="fa-solid fa-file text-white text-2xl"></i>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-white hover:text-[#D4AF37] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Digital Archive</h1>
                <p className="text-gray-400">Search through our collection of historical documents and artifacts</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Archives
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, description, or tags..."
                    className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300"
                >
                  {archiveTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300"
                >
                  {predefinedCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Archives</span>
                  </div>
                )}
              </button>
              
              <button
                type="button"
                onClick={loadAllArchives}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>Show All</span>
                </div>
              </button>

              <div className="text-sm text-gray-400">
                {searchResults.length > 0 && (
                  <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                  <span className="text-white text-lg">Searching archives...</span>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((archive) => (
                  <div
                    key={archive.id}
                    className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
                    onClick={() => handleResultClick(archive)}
                  >
                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    <div className="relative p-6">
                      {/* Header with Icon and Type Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                            archive.type?.toLowerCase() === 'document' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            archive.type?.toLowerCase() === 'image' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            archive.type?.toLowerCase() === 'audio' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                            archive.type?.toLowerCase() === 'video' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                            'bg-gradient-to-br from-gray-500 to-gray-600'
                          }`}>
                            {getFileIcon(archive.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              archive.type?.toLowerCase() === 'document' ? 'bg-blue-500/20 text-blue-300' :
                              archive.type?.toLowerCase() === 'image' ? 'bg-green-500/20 text-green-300' :
                              archive.type?.toLowerCase() === 'audio' ? 'bg-purple-500/20 text-purple-300' :
                              archive.type?.toLowerCase() === 'video' ? 'bg-red-500/20 text-red-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {archive.type || 'Document'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-2 line-clamp-2">
                        {archive.title}
                      </h3>

                      {/* Description */}
                      {archive.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {archive.description}
                        </p>
                      )}

                      {/* Category and Date */}
                      <div className="space-y-2 mb-4">
                        {archive.category && (
                          <div className="flex items-center space-x-2">
                            <i className="fa-solid fa-folder text-[#D4AF37] text-xs"></i>
                            <span className="text-xs text-gray-400">Category:</span>
                            <span className="text-xs font-medium text-[#D4AF37]">{archive.category}</span>
                          </div>
                        )}
                        {archive.date && (
                          <div className="flex items-center space-x-2">
                            <i className="fa-solid fa-calendar text-[#D4AF37] text-xs"></i>
                            <span className="text-xs text-gray-400">Date:</span>
                            <span className="text-xs text-gray-300">{formatDate(archive.date)}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {archive.tags && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {archive.tags.split(',').slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2.5 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-lg border border-gray-600/50"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                            {archive.tags.split(',').length > 3 && (
                              <span className="px-2.5 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-lg">
                                +{archive.tags.split(',').length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResultClick(archive);
                          }}
                          className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(archive);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <i className="fa-solid fa-download text-xs"></i>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Archives Found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search terms or filters</p>
                <button
                  onClick={loadAllArchives}
                  className="px-6 py-2 bg-[#8B6B21] hover:bg-[#D4AF37] text-white font-medium rounded-lg transition-colors duration-300"
                >
                  Show All Documents
                </button>
              </div>
            )}
          </div>
        )}

        {/* Archive Detail Modal - Enhanced Design */}
        {selectedArchive && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50 p-6 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${
                      selectedArchive.type?.toLowerCase() === 'document' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      selectedArchive.type?.toLowerCase() === 'image' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      selectedArchive.type?.toLowerCase() === 'audio' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                      selectedArchive.type?.toLowerCase() === 'video' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {getFileIcon(selectedArchive.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedArchive.title}</h2>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedArchive.type?.toLowerCase() === 'document' ? 'bg-blue-500/20 text-blue-300' :
                          selectedArchive.type?.toLowerCase() === 'image' ? 'bg-green-500/20 text-green-300' :
                          selectedArchive.type?.toLowerCase() === 'audio' ? 'bg-purple-500/20 text-purple-300' :
                          selectedArchive.type?.toLowerCase() === 'video' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {selectedArchive.type || 'Document'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArchive(null)}
                    className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white ml-4"
                  >
                    <i className="fa-solid fa-times text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                {selectedArchive.description && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-align-left text-[#D4AF37]"></i>
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{selectedArchive.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-info-circle text-[#D4AF37]"></i>
                      Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                        <span className="text-gray-400 flex items-center gap-2">
                          <i className="fa-solid fa-file text-xs"></i>
                          Type:
                        </span>
                        <span className="text-white font-medium">{selectedArchive.type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                        <span className="text-gray-400 flex items-center gap-2">
                          <i className="fa-solid fa-folder text-xs"></i>
                          Category:
                        </span>
                        <span className="text-white font-medium">{selectedArchive.category || 'Other'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                        <span className="text-gray-400 flex items-center gap-2">
                          <i className="fa-solid fa-calendar text-xs"></i>
                          Date:
                        </span>
                        <span className="text-white font-medium">{formatDate(selectedArchive.date)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-400 flex items-center gap-2">
                          <i className="fa-solid fa-clock text-xs"></i>
                          Uploaded:
                        </span>
                        <span className="text-white font-medium">{formatDate(selectedArchive.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedArchive.tags && (
                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-tags text-[#D4AF37]"></i>
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedArchive.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-700/50 text-gray-300 text-sm rounded-lg border border-gray-600/50"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => setSelectedArchive(null)}
                    className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-times"></i>
                    <span>Close</span>
                  </button>
                  <button
                    onClick={() => handleDownload(selectedArchive)}
                    className="px-6 py-3 bg-gradient-to-r from-[#8B6B21] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8B6B21] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalArchive; 