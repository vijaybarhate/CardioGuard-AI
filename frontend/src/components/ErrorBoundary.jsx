import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('UI error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card" role="alert">
          <div className="card-title">Something went wrong</div>
          <div className="card-sub">An unexpected error occurred while rendering this view.</div>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
            {String(this.state.error?.message || this.state.error || 'Unknown error')}
          </p>
          <button className="btn btn-ghost" style={{ marginTop: '1rem' }}
            onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
