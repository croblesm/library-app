import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar, Toolbar, TextField, Button, Box, Grid, Card, CardContent,
  CardMedia, Typography, Slider, FormGroup, FormControlLabel, Checkbox,
  Pagination, Select, MenuItem, FormControl, Snackbar, Alert, Paper, Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Book as BookIcon,
  SearchOff as SearchOffIcon,
  PersonOff as PersonOffIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

const API_BASE = 'http://localhost:3000';
const CHAT_API_BASE = 'http://localhost:8000';

// Hardcoded magazine data (will be replaced with DAB endpoint later)
const MAGAZINES_DATA = [
  { id: 1, title: "Tech Monthly", issue: 1, year: 2025, category: "Science" },
  { id: 2, title: "Quantum Quarterly", issue: 4, year: 2024, category: "Physics" },
  { id: 3, title: "Bio Frontiers", issue: 2, year: 2025, category: "Biology" },
  { id: 4, title: "Robo World", issue: 7, year: 2024, category: "Robotics" },
  { id: 5, title: "Star Gazer", issue: 12, year: 2023, category: "Astronomy" },
];

// Dark theme - True dark mode (almost black background)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    primary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
    },
    secondary: {
      main: '#a78bfa',
      light: '#c4b5fd',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#b0b0b0',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d0d0d',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(96, 165, 250, 0.15)',
            borderColor: 'rgba(96, 165, 250, 0.3)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-track': {
            background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
            border: 'none',
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '& .MuiSlider-thumb': {
            backgroundColor: '#60a5fa',
            boxShadow: '0 0 8px rgba(96, 165, 250, 0.5)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d0d0d',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(96, 165, 250, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#60a5fa',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px',
        },
        outlined: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px',
        },
      },
    },
  },
});

function Header({ searchTerm, onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="sticky" sx={{ zIndex: 1200 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2.5, minHeight: '80px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', minWidth: 200 }} onClick={() => navigate('/')}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.6rem' }}>📚 Library App</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Button 
            component={RouterLink} 
            to="/" 
            color="inherit" 
            sx={{ 
              textTransform: 'none', 
              fontSize: '0.95rem', 
              fontWeight: location.pathname === '/' ? 600 : 400,
              borderBottom: location.pathname === '/' ? '2px solid #60a5fa' : 'none',
              borderRadius: 0,
              px: 2
            }}
          >
            Home
          </Button>
          <Button 
            component={RouterLink} 
            to="/books" 
            color="inherit" 
            sx={{ 
              textTransform: 'none', 
              fontSize: '0.95rem', 
              fontWeight: location.pathname === '/books' ? 600 : 400,
              borderBottom: location.pathname === '/books' ? '2px solid #60a5fa' : 'none',
              borderRadius: 0,
              px: 2
            }}
          >
            Books
          </Button>
          <Button 
            component={RouterLink} 
            to="/authors" 
            color="inherit" 
            sx={{ 
              textTransform: 'none', 
              fontSize: '0.95rem', 
              fontWeight: location.pathname === '/authors' ? 600 : 400,
              borderBottom: location.pathname === '/authors' ? '2px solid #60a5fa' : 'none',
              borderRadius: 0,
              px: 2
            }}
          >
            Authors
          </Button>
          <Button
            component={RouterLink}
            to="/magazines"
            color="inherit"
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: location.pathname === '/magazines' ? 600 : 400,
              borderBottom: location.pathname === '/magazines' ? '2px solid #60a5fa' : 'none',
              borderRadius: 0,
              px: 2
            }}
          >
            Magazines
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 200, justifyContent: 'flex-end' }}>
          <Button variant="outlined" sx={{ color: '#60a5fa', borderColor: '#60a5fa', textTransform: 'none', fontWeight: 500, borderRadius: '6px', '&:hover': { borderColor: '#93c5fd', backgroundColor: 'rgba(96, 165, 250, 0.1)' } }}>Sign Up</Button>
          <Button variant="contained" sx={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', textTransform: 'none', fontWeight: 600, borderRadius: '6px', color: '#000' }}>Sign In</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function BookCardSkeleton() {
  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      width: '200px'
    }}>
      <Skeleton variant="rectangular" height={280} animation="wave" />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Skeleton variant="text" width="90%" height={24} animation="wave" />
        <Skeleton variant="text" width="70%" height={20} animation="wave" sx={{ mt: 0.5 }} />
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 12,
      px: 4,
      textAlign: 'center'
    }}>
      <Box sx={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
        border: '2px solid rgba(96, 165, 250, 0.2)'
      }}>
        <Icon sx={{ fontSize: '3.5rem', color: '#60a5fa', opacity: 0.7 }} />
      </Box>

      <Typography variant="h5" sx={{
        fontWeight: 600,
        color: '#f5f5f5',
        mb: 1.5
      }}>
        {title}
      </Typography>

      <Typography variant="body1" sx={{
        color: '#808080',
        mb: 4,
        maxWidth: 500,
        lineHeight: 1.6
      }}>
        {description}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {onAction && actionLabel && (
          <Button
            variant="contained"
            onClick={onAction}
            sx={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              color: '#000',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1.2,
              borderRadius: '8px',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(96, 165, 250, 0.3)'
              }
            }}
          >
            {actionLabel}
          </Button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <Button
            variant="outlined"
            onClick={onSecondaryAction}
            sx={{
              borderColor: '#404040',
              color: '#b0b0b0',
              textTransform: 'none',
              px: 3,
              py: 1.2,
              borderRadius: '8px',
              '&:hover': {
                borderColor: '#60a5fa',
                color: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.05)'
              }
            }}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}

function BookCard({ book }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '200px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 32px rgba(96, 165, 250, 0.2)',
        }
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: '280px',
          width: '100%',
          background: book.image_url
            ? 'none'
            : 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(167, 139, 250, 0.08) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.display = 'flex';
              e.target.parentElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(167, 139, 250, 0.08) 100%);">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="rgba(96, 165, 250, 0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="rgba(96, 165, 250, 0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <p style="color: rgba(96, 165, 250, 0.5); font-size: 0.75rem; margin-top: 12px; font-weight: 500;">No Cover</p>
                </div>
              `;
            }}
          />
        ) : (
          <>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Typography sx={{ color: 'rgba(96, 165, 250, 0.5)', fontSize: '0.75rem', mt: 1.5, fontWeight: 500 }}>
              No Cover
            </Typography>
          </>
        )}

        {/* Hover overlay with metadata */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            p: 1.5,
            display: 'flex',
            gap: 2,
            justifyContent: 'center'
          }}
        >
          {book.year && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>
                {book.year}
              </Typography>
            </Box>
          )}
          {book.pages && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
                {book.pages}p
              </Typography>
            </Box>
          )}
        </Box>

        {book.category && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            backdropFilter: 'blur(10px)',
            color: '#000',
            px: 1.2,
            py: 0.4,
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: isHovered ? '0 4px 12px rgba(96, 165, 250, 0.3)' : 'none',
            transition: 'box-shadow 0.3s ease'
          }}>
            {book.category}
          </Box>
        )}
      </CardMedia>
      <CardContent sx={{
        p: 1.5,
        '&:last-child': { pb: 1.5 }
      }}>
        <Typography
          variant="h6"
          sx={{
            mb: 0.5,
            fontWeight: 600,
            fontSize: '0.9rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: '#f5f5f5',
            lineHeight: 1.4
          }}
        >
          {book.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#808080',
            fontSize: '0.8rem',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {book.authors?.map(a => `${a.first_name} ${a.last_name}`).join(', ') || 'Unknown Author'}
        </Typography>
      </CardContent>
    </Card>
  );
}

function MagazineCard({ magazine }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '200px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 32px rgba(96, 165, 250, 0.2)',
        }
      }}
    >
      <Box
        sx={{
          height: '280px',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(167, 139, 250, 0.12) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <ArticleIcon sx={{
          fontSize: '4rem',
          color: 'rgba(96, 165, 250, 0.4)',
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }} />
        <Typography sx={{ color: 'rgba(96, 165, 250, 0.5)', fontSize: '0.75rem', mt: 1.5, fontWeight: 500 }}>
          Issue #{magazine.issue}
        </Typography>

        {/* Hover overlay with metadata */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            p: 1.5,
            display: 'flex',
            gap: 2,
            justifyContent: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>
              {magazine.year}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>
              Issue #{magazine.issue}
            </Typography>
          </Box>
        </Box>

        {magazine.category && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            backdropFilter: 'blur(10px)',
            color: '#000',
            px: 1.2,
            py: 0.4,
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: isHovered ? '0 4px 12px rgba(96, 165, 250, 0.3)' : 'none',
            transition: 'box-shadow 0.3s ease'
          }}>
            {magazine.category}
          </Box>
        )}
      </Box>
      <CardContent sx={{
        p: 1.5,
        '&:last-child': { pb: 1.5 }
      }}>
        <Typography
          variant="h6"
          sx={{
            mb: 0.5,
            fontWeight: 600,
            fontSize: '0.9rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: '#f5f5f5',
            lineHeight: 1.4
          }}
        >
          {magazine.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#808080',
            fontSize: '0.8rem',
          }}
        >
          {magazine.year} &middot; Issue {magazine.issue}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to chat
    const newMessages = [...messages, { type: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build conversation history for the API (last 6 messages for context)
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call the RAG chat API with conversation history
      const response = await axios.post(`${CHAT_API_BASE}/chat`, {
        question: userMessage,
        conversation_history: conversationHistory
      });

      // Add AI response to chat
      setMessages([...newMessages, {
        type: 'assistant',
        content: response.data.response,
        results: response.data.results
      }]);
    } catch (error) {
      console.error('Error calling chat API:', error);

      // Provide user-friendly error message
      let errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";

      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = "I'm currently unavailable. The chat service may be offline. Please try again later or contact support if the issue persists.";
      } else if (error.response?.status === 500) {
        errorMessage = "I encountered an error while processing your request. Please try rephrasing your question or try again later.";
      } else if (error.response?.status === 404) {
        errorMessage = "The chat service is not responding. Please try again later.";
      }

      setMessages([...newMessages, {
        type: 'error',
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
          color: '#000',
          boxShadow: '0 8px 24px rgba(96, 165, 250, 0.4)',
          zIndex: 1001,
          minWidth: 'auto',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 12px 32px rgba(96, 165, 250, 0.5)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <ChatIcon sx={{ fontSize: '1.8rem' }} />
      </Button>
    );
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 400,
        height: 600,
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        borderRadius: '12px',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ChatIcon sx={{ fontSize: '1.5rem' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Library Assistant
          </Typography>
        </Box>
        <Button
          onClick={() => setIsOpen(false)}
          sx={{
            minWidth: 'auto',
            width: '32px',
            height: '32px',
            padding: 0,
            color: '#000',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '1.2rem' }} />
        </Button>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#0a0a0a'
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ChatIcon sx={{ fontSize: '3rem', color: 'rgba(96, 165, 250, 0.3)', mb: 2 }} />
            <Typography sx={{ color: '#808080', mb: 1 }}>
              Ask me about books!
            </Typography>
            <Typography variant="body2" sx={{ color: '#606060', fontSize: '0.85rem' }}>
              I can help you find books based on your interests.
            </Typography>
          </Box>
        )}

        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              sx={{
                p: 1.5,
                maxWidth: '80%',
                backgroundColor: message.type === 'user'
                  ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
                  : message.type === 'error'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : '#1a1a1a',
                background: message.type === 'user'
                  ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
                  : 'transparent',
                border: message.type === 'user'
                  ? 'none'
                  : message.type === 'error'
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                boxShadow: message.type === 'user' ? '0 2px 8px rgba(96, 165, 250, 0.3)' : 'none'
              }}
            >
              <Typography
                sx={{
                  color: message.type === 'user' ? '#000' : message.type === 'error' ? '#ef4444' : '#f5f5f5',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {message.content}
              </Typography>

              {/* Display book results if available */}
              {message.results && message.results.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="caption" sx={{ color: '#808080', fontWeight: 600, mb: 1, display: 'block' }}>
                    Book Recommendations:
                  </Typography>
                  {message.results.map((book, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mt: 1,
                        p: 1,
                        backgroundColor: 'rgba(96, 165, 250, 0.05)',
                        borderRadius: '6px',
                        border: '1px solid rgba(96, 165, 250, 0.2)'
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa' }}>
                        {book.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#808080' }}>
                        {book.category} • {book.year} • {(book.similarity_score * 100).toFixed(0)}% match
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}
            >
              <Typography sx={{ color: '#808080', fontSize: '0.9rem' }}>
                Thinking...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#1a1a1a'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Ask about books..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            multiline
            maxRows={3}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#f5f5f5',
                backgroundColor: '#0a0a0a',
                fontSize: '0.9rem',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(96, 165, 250, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#60a5fa',
                },
              },
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
            sx={{
              minWidth: 'auto',
              width: '40px',
              height: '40px',
              padding: 0,
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
              color: '#000',
              borderRadius: '8px',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(96, 165, 250, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            <SendIcon sx={{ fontSize: '1.2rem' }} />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function HomePage({ books }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ yearRange: [1800, new Date().getFullYear()], pagesRange: [1, 2000], selectedGenres: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [showNotification, setShowNotification] = useState(true);

  const genres = [...new Set(books.map(book => book.category).filter(Boolean))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = book.year >= filters.yearRange[0] && book.year <= filters.yearRange[1];
    const matchesPages = book.pages >= filters.pagesRange[0] && book.pages <= filters.pagesRange[1];
    const matchesGenre = filters.selectedGenres.length === 0 || filters.selectedGenres.includes(book.category);
    return matchesSearch && matchesYear && matchesPages && matchesGenre;
  });

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{
        width: 280,
        bgcolor: 'background.paper',
        p: 3,
        overflowY: 'auto'
      }}>
        <Typography variant="subtitle1" sx={{ mb: 3, color: '#b0b0b0', fontWeight: 500 }}>Filters</Typography>

        <Paper sx={{
          p: 2.5,
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          mb: 3
        }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#f5f5f5' }}>Publication Year</Typography>
            <Slider
              value={filters.yearRange}
              onChange={(e, newValue) => setFilters({ ...filters, yearRange: newValue })}
              min={1800}
              max={new Date().getFullYear()}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" sx={{ color: '#808080' }}>{filters.yearRange[0]} - {filters.yearRange[1]}</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#f5f5f5' }}>Number of Pages</Typography>
            <Slider
              value={filters.pagesRange}
              onChange={(e, newValue) => setFilters({ ...filters, pagesRange: newValue })}
              min={1}
              max={2000}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" sx={{ color: '#808080' }}>{filters.pagesRange[0]} - {filters.pagesRange[1]}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#f5f5f5' }}>Genre</Typography>
            <FormGroup>
              {genres.map(genre => (
                <FormControlLabel
                  key={genre}
                  control={
                    <Checkbox
                      checked={filters.selectedGenres.includes(genre)}
                      onChange={() => {
                        const selected = filters.selectedGenres.includes(genre)
                          ? filters.selectedGenres.filter(g => g !== genre)
                          : [...filters.selectedGenres, genre];
                        setFilters({ ...filters, selectedGenres: selected });
                      }}
                      sx={{
                        color: '#808080',
                        '&.Mui-checked': {
                          color: '#60a5fa',
                        }
                      }}
                    />
                  }
                  label={genre}
                  sx={{
                    color: '#b0b0b0',
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.9rem'
                    }
                  }}
                />
              ))}
            </FormGroup>
          </Box>
        </Paper>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            setFilters({ yearRange: [1800, new Date().getFullYear()], pagesRange: [1, 2000], selectedGenres: [] });
            setCurrentPage(1);
          }}
          sx={{
            color: '#808080',
            borderColor: '#404040',
            textTransform: 'none',
            py: 1,
            '&:hover': {
              borderColor: '#606060',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          }}
        >
          Clear all filters
        </Button>
      </Box>

      <Box sx={{ flex: 1, p: 4, overflowY: 'auto', backgroundColor: '#0a0a0a' }}>
        <Box sx={{
          maxWidth: 1400,
          mx: 'auto'
        }}>
          <Paper sx={{
            py: 0.75,
            px: 1.5,
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px'
          }}>
            <TextField
              placeholder="Search books by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#f5f5f5',
                  backgroundColor: 'transparent',
                  fontSize: '0.95rem',
                  '& input': {
                    padding: '8px 0',
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.1rem' }} />
              }}
            />
          </Paper>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}>
            <Typography variant="body2" sx={{ color: '#808080', fontSize: '0.95rem' }}>
              {filteredBooks.length.toLocaleString()} results ({currentPage} of {totalPages})
            </Typography>
            <FormControl size="small">
              <Select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{
                  color: '#f5f5f5',
                  minWidth: '80px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(96, 165, 250, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#60a5fa',
                  },
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {paginatedBooks.length > 0 ? (
            <>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 200px)',
                gap: 2.5,
                justifyContent: 'center',
                mb: 5
              }}>
                {paginatedBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', pb: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#808080',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(96, 165, 250, 0.15)',
                        color: '#60a5fa',
                      },
                    },
                  }}
                />
              </Box>
            </>
          ) : (
            <EmptyState
              icon={SearchOffIcon}
              title="No books found"
              description={
                searchTerm || filters.selectedGenres.length > 0
                  ? "We couldn't find any books matching your search criteria. Try adjusting your filters or search terms."
                  : "It looks like there are no books in the library yet. Start by adding some books to get started!"
              }
              actionLabel="Clear filters"
              onAction={() => {
                setSearchTerm('');
                setFilters({ yearRange: [1800, new Date().getFullYear()], pagesRange: [1, 2000], selectedGenres: [] });
                setCurrentPage(1);
              }}
            />
          )}
        </Box>

        {showNotification && (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              p: 2.5,
              maxWidth: 350,
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              borderRadius: '12px',
              zIndex: 1000
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <BookIcon sx={{ color: '#60a5fa', mt: 0.5, fontSize: '1.5rem' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#f5f5f5' }}>
                  Welcome to the Library App!
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0', lineHeight: 1.5 }}>
                  This is a demo of searching, filtering, and paginating books from a SQL Server database.{' '}
                  <a
                    href="https://aka.ms/vscode-mssql"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Deploy your own
                  </a>.
                </Typography>
              </Box>
              <Button
                onClick={() => setShowNotification(false)}
                sx={{
                  minWidth: 'auto',
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  color: '#808080',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#f5f5f5'
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: '1.1rem' }} />
              </Button>
            </Box>
          </Paper>
        )}

        <ChatBox />
      </Box>
    </Box>
  );
}

function BooksPage({ books, authors, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newBook, setNewBook] = useState({ title: '', year: '', pages: '', category: '', image_url: '', authorId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [sortBy, setSortBy] = useState('title');

  let filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort books
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'year-new':
        return (b.year || 0) - (a.year || 0);
      case 'year-old':
        return (a.year || 0) - (b.year || 0);
      case 'pages':
        return (b.pages || 0) - (a.pages || 0);
      default:
        return 0;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newBook.title || !newBook.year || !newBook.pages || !newBook.authorId) {
      setError('Title, Year, Pages, and Author are required');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/books`, { ...newBook, year: parseInt(newBook.year), pages: parseInt(newBook.pages) });
      setNewBook({ title: '', year: '', pages: '', category: '', image_url: '', authorId: '' });
      setOpenSnackbar(true);
      onRefresh();
    } catch (error) {
      setError('Error creating book');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (window.confirm('Delete this book?')) {
      await axios.delete(`${API_BASE}/books/${bookId}`);
      onRefresh();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#f5f5f5' }}>Manage Books</Typography>

      <Paper sx={{
        p: 3,
        mb: 5,
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px'
      }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#f5f5f5' }}>Add New Book</Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
            <TextField
              label="Title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              required
              fullWidth
              size="small"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#808080'
                }
              }}
            />
            <TextField
              label="Category"
              value={newBook.category}
              onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
              fullWidth
              size="small"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#808080'
                }
              }}
            />
            <FormControl fullWidth required size="small">
              <Select
                value={newBook.authorId}
                onChange={(e) => setNewBook({ ...newBook, authorId: e.target.value })}
                displayEmpty
                sx={{
                  color: newBook.authorId ? '#f5f5f5' : '#808080'
                }}
              >
                <MenuItem value="" disabled>Select an author...</MenuItem>
                {authors.map(author => (
                  <MenuItem key={author.id} value={author.id}>
                    {author.first_name} {author.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Year"
              type="number"
              value={newBook.year}
              onChange={(e) => setNewBook({ ...newBook, year: e.target.value })}
              required
              fullWidth
              size="small"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#808080'
                }
              }}
            />
            <TextField
              label="Pages"
              type="number"
              value={newBook.pages}
              onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
              required
              fullWidth
              size="small"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#808080'
                }
              }}
            />
            <TextField
              label="Image URL (optional)"
              type="url"
              value={newBook.image_url}
              onChange={(e) => setNewBook({ ...newBook, image_url: e.target.value })}
              fullWidth
              size="small"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#808080'
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                color: '#000',
                fontWeight: 600,
                py: 1.2,
                px: 4,
                textTransform: 'none',
                fontSize: '0.95rem',
                minWidth: '150px'
              }}
            >
              {loading ? 'Adding...' : 'Add Book'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          fullWidth
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              color: '#f5f5f5',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(96, 165, 250, 0.3)',
              },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.3rem' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              color: '#f5f5f5',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(96, 165, 250, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#60a5fa',
              },
            }}
          >
            <MenuItem value="title">Sort by Title</MenuItem>
            <MenuItem value="year-new">Newest First</MenuItem>
            <MenuItem value="year-old">Oldest First</MenuItem>
            <MenuItem value="pages">Most Pages</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredBooks.length > 0 ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 200px)',
          gap: 2,
          justifyContent: 'center'
        }}>
          {filteredBooks.map(book => (
            <Box key={book.id} sx={{ position: 'relative' }}>
              <BookCard book={book} />
              <Button
                onClick={() => handleDelete(book.id)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  minWidth: 'auto',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  padding: 0,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  '&:hover': {
                    backgroundColor: '#ef4444',
                    color: '#fff'
                  },
                  zIndex: 1
                }}
              >
                <CloseIcon sx={{ fontSize: '1.2rem' }} />
              </Button>
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyState
          icon={SearchOffIcon}
          title="No books found"
          description={
            searchTerm
              ? "We couldn't find any books matching your search. Try a different search term or add a new book above."
              : "You haven't added any books yet. Use the form above to add your first book to the library!"
          }
          actionLabel={searchTerm ? "Clear search" : undefined}
          onAction={searchTerm ? () => setSearchTerm('') : undefined}
        />
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">Book added successfully!</Alert>
      </Snackbar>
    </Box>
  );
}

function AuthorsPage({ authors, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newAuthor, setNewAuthor] = useState({ first_name: '', middle_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  let filteredAuthors = authors.filter(author =>
    `${author.first_name} ${author.middle_name} ${author.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Sort authors
  filteredAuthors = [...filteredAuthors].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case 'books':
        return (b.books?.length || 0) - (a.books?.length || 0);
      default:
        return 0;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newAuthor.first_name || !newAuthor.last_name) {
      setError('First Name and Last Name are required');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/authors`, newAuthor);
      setNewAuthor({ first_name: '', middle_name: '', last_name: '' });
      setOpenSnackbar(true);
      onRefresh();
    } catch (error) {
      setError('Error creating author');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (authorId) => {
    if (window.confirm('Delete this author? All associated books will also be deleted.')) {
      await axios.delete(`${API_BASE}/authors/${authorId}`);
      onRefresh();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Manage Authors</Typography>

      <Paper sx={{
        p: 3,
        mb: 4,
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px'
      }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#f5f5f5' }}>Add New Author</Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="First Name"
                value={newAuthor.first_name}
                onChange={(e) => setNewAuthor({ ...newAuthor, first_name: e.target.value })}
                required
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#808080'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Middle Name"
                value={newAuthor.middle_name}
                onChange={(e) => setNewAuthor({ ...newAuthor, middle_name: e.target.value })}
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#808080'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Name"
                value={newAuthor.last_name}
                onChange={(e) => setNewAuthor({ ...newAuthor, last_name: e.target.value })}
                required
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#808080'
                  }
                }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                color: '#000',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                py: 1.2,
                px: 4,
                minWidth: '150px'
              }}
            >
              {loading ? 'Adding...' : 'Add Author'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search authors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          fullWidth
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              color: '#f5f5f5',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(96, 165, 250, 0.3)',
              },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.3rem' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              color: '#f5f5f5',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(96, 165, 250, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#60a5fa',
              },
            }}
          >
            <MenuItem value="name">Sort by Name</MenuItem>
            <MenuItem value="books">Most Books</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredAuthors.length > 0 ? (
        <Grid container spacing={2}>
          {filteredAuthors.map(author => {
            const bookCount = author.books?.length || 0;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={author.id}>
                <Paper sx={{
                  p: 2.5,
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(96, 165, 250, 0.2)',
                    borderColor: 'rgba(96, 165, 250, 0.4)'
                  }
                }}>
                  <Button
                    onClick={() => handleDelete(author.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      minWidth: 'auto',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      padding: 0,
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <CloseIcon sx={{ fontSize: '1.2rem' }} />
                  </Button>
                  <Box sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    border: '2px solid rgba(96, 165, 250, 0.3)',
                    fontSize: '1.5rem'
                  }}>
                    👤
                  </Box>
                  <Typography variant="h6" sx={{
                    mb: 1,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#f5f5f5'
                  }}>
                    {author.first_name} {author.middle_name} {author.last_name}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 'auto'
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(96, 165, 250, 0.2)'
                    }}>
                      <BookIcon sx={{ fontSize: '1rem', color: '#60a5fa' }} />
                      <Typography sx={{
                        color: '#60a5fa',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {bookCount}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <EmptyState
          icon={PersonOffIcon}
          title="No authors found"
          description={
            searchTerm
              ? "We couldn't find any authors matching your search. Try a different search term or add a new author above."
              : "You haven't added any authors yet. Use the form above to add your first author to the library!"
          }
          actionLabel={searchTerm ? "Clear search" : undefined}
          onAction={searchTerm ? () => setSearchTerm('') : undefined}
        />
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Author added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

function MagazinesPage({ magazines }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');

  let filteredMagazines = magazines.filter(mag =>
    mag.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mag.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredMagazines = [...filteredMagazines].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'newest':
        return b.year - a.year;
      case 'oldest':
        return a.year - b.year;
      default:
        return 0;
    }
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Magazines</Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search magazines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          fullWidth
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              color: '#f5f5f5',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(96, 165, 250, 0.3)',
              },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.3rem' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              color: '#f5f5f5',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.15)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(96, 165, 250, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#60a5fa',
              },
            }}
          >
            <MenuItem value="title">Sort by Title</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredMagazines.length > 0 ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 200px)',
          gap: 2.5,
          justifyContent: 'center'
        }}>
          {filteredMagazines.map(magazine => (
            <MagazineCard key={magazine.id} magazine={magazine} />
          ))}
        </Box>
      ) : (
        <EmptyState
          icon={SearchOffIcon}
          title="No magazines found"
          description={
            searchTerm
              ? "We couldn't find any magazines matching your search. Try a different search term."
              : "No magazines available yet."
          }
          actionLabel={searchTerm ? "Clear search" : undefined}
          onAction={searchTerm ? () => setSearchTerm('') : undefined}
        />
      )}
    </Box>
  );
}

export default function ModernApp() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
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
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AppBar position="sticky">
          <Toolbar sx={{ py: 2.5, minHeight: '80px' }}>
            <Skeleton variant="text" width={180} height={40} />
            <Box sx={{ flex: 1 }} />
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1, mr: 2 }} />
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
          <Box sx={{ width: 280, bgcolor: 'background.paper', p: 3 }}>
            <Skeleton variant="text" width={60} height={30} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ mb: 2, borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ mb: 2, borderRadius: 2 }} />
          </Box>
          <Box sx={{ flex: 1, p: 4, backgroundColor: '#0a0a0a' }}>
            <Skeleton variant="rectangular" height={48} sx={{ mb: 4, borderRadius: 2, maxWidth: 1400, mx: 'auto' }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: 2.5, justifyContent: 'center', maxWidth: 1400, mx: 'auto' }}>
              {[...Array(12)].map((_, index) => (
                <BookCardSkeleton key={index} />
              ))}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <Routes>
          <Route path="/" element={<HomePage books={books} searchTerm={searchTerm} />} />
          <Route path="/books" element={<BooksPage books={books} authors={authors} onRefresh={fetchData} />} />
          <Route path="/authors" element={<AuthorsPage authors={authors} onRefresh={fetchData} />} />
          <Route path="/magazines" element={<MagazinesPage magazines={MAGAZINES_DATA} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
