import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './ModernApp.css';

// API Base URL
const API_BASE = 'http://localhost:3000';

// Modern Header Component
function Header({ searchTerm, onSearchChange }) {
  return (
    <header className="modern-header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="logo">
            📚 My Book Library
          </Link>
        </div>
        
        <nav className="main-navigation">
          <Link to="/books" className="nav-link">Books</Link>
          <Link to="/authors" className="nav-link">Authors</Link>
        </nav>

        <div className="header-actions">
          <button className="auth-button sign-up">Sign Up</button>
          <button className="auth-button sign-in">Sign In</button>
        </div>
      </div>
    </header>
  );
}

// Filter Sidebar Component
function FilterSidebar({ filters, onFilterChange, books }) {
  const currentYear = new Date().getFullYear();
  const allGenres = [...new Set(books.map(book => book.category).filter(Boolean))];
  const minPages = Math.min(...books.map(book => parseInt(book.pages) || 0));
  const maxPages = Math.max(...books.map(book => parseInt(book.pages) || 1000));

  return (
    <div className="filter-sidebar">
      <div className="search-section">
        <input
          type="text"
          placeholder="Search books..."
          className="search-input-modern"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Publication Year Filter */}
      <div className="filter-group">
        <label className="filter-label">Publication Year</label>
        <div className="range-slider">
          <input
            type="range"
            min="1950"
            max={currentYear}
            value={filters.yearMin}
            onChange={(e) => onFilterChange({ ...filters, yearMin: parseInt(e.target.value) })}
            className="slider"
          />
          <input
            type="range"
            min="1950"
            max={currentYear}
            value={filters.yearMax}
            onChange={(e) => onFilterChange({ ...filters, yearMax: parseInt(e.target.value) })}
            className="slider"
          />
          <div className="range-values">
            <span>{filters.yearMin}</span>
            <span>{filters.yearMax}</span>
          </div>
        </div>
      </div>

      {/* Number of Pages Filter */}
      <div className="filter-group">
        <label className="filter-label">Number of Pages</label>
        <div className="range-slider">
          <input
            type="range"
            min={minPages}
            max={maxPages}
            value={filters.pagesMin}
            onChange={(e) => onFilterChange({ ...filters, pagesMin: parseInt(e.target.value) })}
            className="slider"
          />
          <input
            type="range"
            min={minPages}
            max={maxPages}
            value={filters.pagesMax}
            onChange={(e) => onFilterChange({ ...filters, pagesMax: parseInt(e.target.value) })}
            className="slider"
          />
          <div className="range-values">
            <span>{filters.pagesMin}</span>
            <span>{filters.pagesMax}</span>
          </div>
        </div>
      </div>

      {/* Genre Checkboxes */}
      <div className="filter-group">
        <label className="filter-label">Book Lists</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.genres.includes('Popular')}
              onChange={(e) => {
                const newGenres = e.target.checked 
                  ? [...filters.genres, 'Popular']
                  : filters.genres.filter(g => g !== 'Popular');
                onFilterChange({ ...filters, genres: newGenres });
              }}
            />
            Popular
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.genres.includes('Classics')}
              onChange={(e) => {
                const newGenres = e.target.checked 
                  ? [...filters.genres, 'Classics']
                  : filters.genres.filter(g => g !== 'Classics');
                onFilterChange({ ...filters, genres: newGenres });
              }}
            />
            Classics
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.genres.includes('Sci-Fi & Fantasy')}
              onChange={(e) => {
                const newGenres = e.target.checked 
                  ? [...filters.genres, 'Sci-Fi & Fantasy']
                  : filters.genres.filter(g => g !== 'Sci-Fi & Fantasy');
                onFilterChange({ ...filters, genres: newGenres });
              }}
            />
            Sci-Fi & Fantasy
          </label>
          {allGenres.map(genre => (
            <label key={genre} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.genres.includes(genre)}
                onChange={(e) => {
                  const newGenres = e.target.checked 
                    ? [...filters.genres, genre]
                    : filters.genres.filter(g => g !== genre);
                  onFilterChange({ ...filters, genres: newGenres });
                }}
              />
              {genre}
            </label>
          ))}
        </div>
      </div>

      <button 
        className="clear-filters-btn"
        onClick={() => onFilterChange({
          search: '',
          yearMin: 1950,
          yearMax: currentYear,
          pagesMin: minPages,
          pagesMax: maxPages,
          genres: []
        })}
      >
        Clear all filters
      </button>
    </div>
  );
}

// Notification Component
function NotificationPopup({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="notification-popup">
      <button className="notification-close" onClick={onClose}>×</button>
      <div className="notification-header">
        <span className="notification-icon">📚</span>
        <span className="notification-title">Welcome to My Book Library!</span>
      </div>
      <div className="notification-message">
        This is a demo of searching, filtering, and paginating books from a SQL Server database. <a href="https://aka.ms/vscode-mssql" target="_blank" rel="noopener noreferrer" className="notification-link">Try here</a>
      </div>
    </div>
  );
}

// Modern Book Card Component
function ModernBookCard({ book }) {
  return (
    <div className="modern-book-card">
      <div className="book-image-container">
        {book.image_url ? (
          <img 
            src={book.image_url} 
            alt={book.title}
            className="book-cover-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <div className="book-cover-placeholder">
            <span className="book-icon">📖</span>
          </div>
        )}
        <div className="book-cover-placeholder" style={{display: 'none'}}>
          <span className="book-icon">📖</span>
        </div>
        {book.category && <div className="book-genre-tag">{book.category}</div>}
      </div>
      
      <div className="book-content">
        <h3 className="book-title-modern">{book.title}</h3>
        <p className="book-author-modern">
          {book.authors?.map(a => `${a.first_name} ${a.last_name}`).join(', ') || 'Unknown Author'}
        </p>
        <div className="book-metadata">
          <span className="book-year">{book.year}</span>
          <span className="book-pages">{book.pages} pages</span>
        </div>
      </div>
    </div>
  );
}



function HomePage({ books, filters, onFilterChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         book.category?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         book.authors?.some(a => 
                           `${a.first_name} ${a.last_name}`.toLowerCase().includes(filters.search.toLowerCase())
                         );
    
    const matchesYear = (!book.year) || 
                       (parseInt(book.year) >= filters.yearMin && parseInt(book.year) <= filters.yearMax);
    
    const matchesPages = (!book.pages) || 
                        (parseInt(book.pages) >= filters.pagesMin && parseInt(book.pages) <= filters.pagesMax);
                        
    const matchesGenre = filters.genres.length === 0 || 
                        filters.genres.includes(book.category);
    
    return matchesSearch && matchesYear && matchesPages && matchesGenre;
  });

  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return (
    <div className="modern-content">
      <div className="content-header">
        <div className="title-section">
          <h1 className="modern-page-title">Explore Books</h1>
          <p className="books-count">Showing {startIndex + 1}-{Math.min(endIndex, filteredBooks.length)} of {filteredBooks.length} books</p>
        </div>
        <div className="pagination-section">
          <div className="pagination-info">
            {filteredBooks.length.toLocaleString()} results ({currentPage} of {totalPages.toLocaleString()})
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>
            <button 
              className="pagination-btn" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
          <div className="page-size-selector">
            <span>Show</span>
            <select 
              className="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>
      <div className="modern-books-grid">
        {currentBooks.map(book => (
          <ModernBookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

function BooksPage({ books, authors, onRefresh }) {
  const [newBook, setNewBook] = useState({
    title: '',
    year: '',
    pages: '',
    category: '',
    image_url: '',
    authorId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newBook.title || !newBook.year || !newBook.pages || !newBook.authorId) {
      setError('Title, Year, Pages, and Author are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/books`, {
        ...newBook,
        year: parseInt(newBook.year),
        pages: parseInt(newBook.pages)
      });
      
      setNewBook({
        title: '',
        year: '',
        pages: '',
        category: '',
        image_url: '',
        authorId: ''
      });
      onRefresh();
    } catch (error) {
      setError('Error creating book');
      console.error('Error creating book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API_BASE}/books/${bookId}`);
        onRefresh();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  return (
    <div className="content">
      <h1 className="page-title">Manage Books</h1>
      
      <div className="form-container">
        <h3>Add New Book</h3>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={newBook.title}
                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                value={newBook.category}
                onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                placeholder="e.g., Science Fiction"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Author</label>
              <select
                className="form-select"
                value={newBook.authorId}
                onChange={(e) => setNewBook({...newBook, authorId: e.target.value})}
                required
              >
                <option value="">Select Author</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.first_name} {author.middle_name || ''} {author.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input"
                value={newBook.year}
                onChange={(e) => setNewBook({...newBook, year: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Pages</label>
              <input
                type="number"
                className="form-input"
                value={newBook.pages}
                onChange={(e) => setNewBook({...newBook, pages: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label className="form-label">Image URL (optional)</label>
              <input
                type="url"
                className="form-input"
                value={newBook.image_url}
                onChange={(e) => setNewBook({...newBook, image_url: e.target.value})}
                placeholder="https://example.com/book-cover.jpg"
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>

      <div className="books-grid">
        {books.map(book => (
          <div key={book.id} className="book-management-card">
            <ModernBookCard book={book} />
            <div className="book-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => handleDelete(book.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthorsPage({ authors, onRefresh }) {
  const [newAuthor, setNewAuthor] = useState({
    first_name: '',
    middle_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newAuthor.first_name || !newAuthor.last_name) {
      setError('First name and last name are required');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/authors`, newAuthor);
      
      setNewAuthor({
        first_name: '',
        middle_name: '',
        last_name: ''
      });
      onRefresh();
    } catch (error) {
      setError('Error creating author');
      console.error('Error creating author:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (authorId) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await axios.delete(`${API_BASE}/authors/${authorId}`);
        onRefresh();
      } catch (error) {
        console.error('Error deleting author:', error);
      }
    }
  };

  return (
    <div className="content">
      <h1 className="page-title">Manage Authors</h1>
      
      <div className="form-container">
        <h3>Add New Author</h3>
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={newAuthor.first_name}
                onChange={(e) => setNewAuthor({...newAuthor, first_name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                type="text"
                className="form-input"
                value={newAuthor.middle_name}
                onChange={(e) => setNewAuthor({...newAuthor, middle_name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={newAuthor.last_name}
                onChange={(e) => setNewAuthor({...newAuthor, last_name: e.target.value})}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Author'}
          </button>
        </form>
      </div>

      <div className="authors-list">
        {authors.map(author => (
          <div key={author.id} className="author-card">
            <div className="author-name">
              {author.first_name} {author.middle_name} {author.last_name}
            </div>
            <div className="author-books">
              {author.books?.length || 0} books
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => handleDelete(author.id)}
              style={{marginTop: '10px'}}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main App Component
function ModernApp() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    yearMin: 1950,
    yearMax: new Date().getFullYear(),
    pagesMin: 1,
    pagesMax: 1000,
    genres: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksResponse, authorsResponse] = await Promise.all([
        axios.get(`${API_BASE}/books`),
        axios.get(`${API_BASE}/authors`)
      ]);
      
      setBooks(booksResponse.data);
      setAuthors(authorsResponse.data);
      
      // Update filter ranges based on actual data
      if (booksResponse.data.length > 0) {
        const pages = booksResponse.data.map(book => parseInt(book.pages) || 0);
        const minPages = Math.min(...pages);
        const maxPages = Math.max(...pages);
        
        setFilters(prev => ({
          ...prev,
          pagesMin: minPages,
          pagesMax: maxPages
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="modern-loading">
      <div className="loading-spinner"></div>
      <p>Loading your library...</p>
    </div>;
  }

  return (
    <Router>
      <div className="modern-app">
        <Header />
        <div className="app-body">
          <FilterSidebar 
            filters={filters} 
            onFilterChange={setFilters} 
            books={books}
          />
          <main className="main-content-modern">
            <Routes>
              <Route 
                path="/" 
                element={<HomePage books={books} filters={filters} onFilterChange={setFilters} />} 
              />
              <Route 
                path="/books" 
                element={<BooksPage books={books} authors={authors} onRefresh={fetchData} />} 
              />
              <Route 
                path="/authors" 
                element={<AuthorsPage authors={authors} onRefresh={fetchData} />} 
              />
            </Routes>
          </main>
        </div>
        <NotificationPopup 
          show={showNotification} 
          onClose={() => setShowNotification(false)} 
        />
      </div>
    </Router>
  );
}

export default ModernApp;
