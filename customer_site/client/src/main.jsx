import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#09090d',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontFamily: 'Outfit', color: '#d4af37', fontSize: '24px', marginBottom: '12px' }}>
            Saha Men's Store
          </h2>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '12px', maxWidth: '400px' }}>
            Something went wrong while rendering the store view.
          </p>
          <pre style={{ background: '#181820', color: '#ef4444', padding: '12px 20px', borderRadius: '10px', fontSize: '12px', marginBottom: '20px', maxWidth: '600px', overflowX: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              background: '#d4af37',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Reload Store & Reset Session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
