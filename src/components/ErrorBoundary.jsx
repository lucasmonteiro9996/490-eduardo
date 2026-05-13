import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Caught by boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" role="alert">
          <div className="error-fallback__panel">
            <h2 className="error-fallback__title">Algo deu errado</h2>
            <p className="error-fallback__text">
              Recarregue a pagina ou tente novamente.
            </p>
            <button
              type="button"
              className="error-fallback__button"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
