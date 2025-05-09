import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để hiển thị UI fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Bạn cũng có thể log lỗi vào một dịch vụ báo cáo lỗi
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Bạn có thể tùy chỉnh UI hiển thị lỗi ở đây
      return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="text-red-500 text-xl font-bold mb-4">Đã xảy ra lỗi</div>
          <p className="text-gray-700 mb-4">Đã có lỗi xảy ra khi tải trang này. Vui lòng thử lại sau.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tải lại trang
          </button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              <p className="font-mono text-sm text-red-600">{this.state.error?.toString()}</p>
              <pre className="font-mono text-xs mt-2 text-gray-800">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;