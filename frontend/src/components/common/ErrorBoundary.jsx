import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log additional debugging info
    console.log('Current localStorage:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user')
    });
  }

  handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert('Storage cleared! Page will reload.');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-gray-600">
                An error occurred in the application.
              </p>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Details:</h3>
              <pre className="text-sm text-red-600 overflow-auto">
                {this.state.error?.toString()}
              </pre>
              {this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    Click for stack trace
                  </summary>
                  <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reload Page
              </button>
              
              <button
                onClick={this.handleClearStorage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear Storage & Reload
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Go to Home
              </button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h4>
              <div className="text-xs text-gray-500 space-y-1">
                <p>LocalStorage token: {localStorage.getItem('token') ? 'Exists' : 'Empty'}</p>
                <p>LocalStorage user: {localStorage.getItem('user') ? 'Exists' : 'Empty'}</p>
                <p>User Agent: {navigator.userAgent}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;