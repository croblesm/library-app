import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);
    const [newAuthor, setNewAuthor] = useState({ first_name: '', middle_name: '', last_name: '' });
    const [newBook, setNewBook] = useState({ title: '', year: '', pages: '' });

    useEffect(() => {
        fetchAuthors();
        fetchBooks();
    }, []);

    const fetchAuthors = async () => {
        try {
            const response = await axios.get('http://0.0.0.0:3000/authors');
            setAuthors(response.data);
        } catch (error) {
            console.error('There was an error fetching the authors!', error);
        }
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://0.0.0.0:3000/books');
            setBooks(response.data);
        } catch (error) {
            console.error('There was an error fetching the books!', error);
        }
    };

    const handleAuthorInputChange = (e) => {
        const { name, value } = e.target;
        setNewAuthor({ ...newAuthor, [name]: value });
    };

    const handleBookInputChange = (e) => {
        const { name, value } = e.target;
        setNewBook({ ...newBook, [name]: value });
    };

    const handleAuthorSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://0.0.0.0:3000/authors', newAuthor);
            setAuthors([...authors, newAuthor]);
            setNewAuthor({ first_name: '', middle_name: '', last_name: '' });
        } catch (error) {
            console.error('There was an error creating the author!', error);
        }
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://0.0.0.0:3000/books', newBook);
            setBooks([...books, newBook]);
            setNewBook({ title: '', year: '', pages: '' });
        } catch (error) {
            console.error('There was an error creating the book!', error);
        }
    };

    const handleDeleteAuthor = async (id) => {
        try {
            await axios.delete(`http://0.0.0.0:3000/authors/${id}`);
            setAuthors(authors.filter(author => author.id !== id));
        } catch (error) {
            console.error('There was an error deleting the author!', error);
        }
    };

    return (
        <div className="container">
            <header>
                <h1>Library Demo</h1>
            </header>
            <div className="main-content">
                <div className="section">
                    <h2>Books</h2>
                    <h3>Add a new book</h3>
                    <form onSubmit={handleBookSubmit} className="form">
                        <input name="title" placeholder="Title" onChange={handleBookInputChange} value={newBook.title} />
                        <input name="year" placeholder="Year" onChange={handleBookInputChange} value={newBook.year} />
                        <input name="pages" placeholder="Pages" onChange={handleBookInputChange} value={newBook.pages} />
                        <button type="submit" className="create-button">Create</button>
                    </form>
                    <div className="grid-container">
                        {books.map(book => (
                            <div key={book.id} className="grid-item">
                                <h3>{book.title}</h3>
                                <p>Year: {book.year}</p>
                                <p>Pages: {book.pages}</p>
                                <p>Authors: {book.authors}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section">
                    <h2>Authors</h2>
                    <h3>Add a new author</h3>
                    <form onSubmit={handleAuthorSubmit} className="form">
                        <input name="first_name" placeholder="First Name" onChange={handleAuthorInputChange} value={newAuthor.first_name} />
                        <input name="middle_name" placeholder="Middle Name" onChange={handleAuthorInputChange} value={newAuthor.middle_name} />
                        <input name="last_name" placeholder="Last Name" onChange={handleAuthorInputChange} value={newAuthor.last_name} />
                        <button type="submit" className="create-button">Create</button>
                    </form>
                    <div className="grid-container">
                        {authors.map(author => (
                            <div key={author.id} className="grid-item">
                                <h3>{author.first_name} {author.middle_name} {author.last_name}</h3>
                                <button className="delete-button" onClick={() => handleDeleteAuthor(author.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
