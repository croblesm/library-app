import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ModernApp.css';

// API Base URL
const API_BASE = 'http://localhost:3000';

// Components
function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/authors', label: 'Authors', icon: '👥' },
    { path: '/books', label: 'Books', icon: '📚' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>Library App</h1>
      </div>
      <nav>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a href="#profile">
              <span className="icon">👤</span>
              Profile
            </a>
          </li>
          <li>
            <a href="#logout">
              <span className="icon">🚪</span>
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function Header({ searchTerm, onSearchChange }) {
  return (
    <div className="header">
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter Book Name"
          className="search-input"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="header-actions">
        <button className="btn btn-primary">Search</button>
      </div>
    </div>
  );
}

function BookCard({ book }) {
  return (
    <div className="book-card">
      {book.category && <div className="book-category">{book.category}</div>}
      {book.image_url ? (
        <img 
          src={book.image_url} 
          alt={book.title}
          className="book-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : (
        <div className="book-placeholder">
          📖
        </div>
      )}
      <div className="book-placeholder" style={{display: 'none'}}>
        📖
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">
          {book.authors?.map(a => `${a.first_name} ${a.last_name}`).join(', ') || 'Unknown Author'}
        </div>
        <div className="book-details">
          <span>{book.year}</span>
          <span>{book.pages} pages</span>
        </div>
      </div>
    </div>
  );
}

function HomePage({ books, searchTerm }) {
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="content">
      <h1 className="page-title">Explore Books</h1>
      <div className="books-grid">
        {filteredBooks.map(book => (
          <BookCard key={book.id} book={book} />
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
          <div key={book.id} className="book-card">
            <BookCard book={book} />
            <div style={{padding: '10px'}}>
              <button 
                className="btn btn-secondary"
                onClick={() => handleDelete(book.id)}
                style={{width: '100%'}}
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
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksResponse, authorsResponse] = await Promise.all([
        axios.get(`${API_BASE}/books`),
        axios.get(`${API_BASE}/authors`)
      ]);
      
      setBooks(booksResponse.data);
      setAuthors(authorsResponse.data);
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <Routes>
            <Route 
              path="/" 
              element={<HomePage books={books} searchTerm={searchTerm} />} 
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
        </div>
      </div>
    </Router>
  );
}

export default ModernApp;
