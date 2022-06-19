import React, { PropsWithChildren } from 'react';

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: { message: '', stack: '' },
      info: { componentStack: '' }
    };
  }

  componentDidCatch = (error: any, info: any) => {
    this.setState({ error, info });
    this.props.onError(error, info);
  };

  // @ts-ignore
  static getDerivedStateFromError = (error: any) => {
    return { hasError: true };
  };

  render() {
    const { hasError } = this.state as any;
    const { children } = this.props;

    return hasError ? <></> : children;
  }
}

type ErrorBoundaryProps = PropsWithChildren<{ onError: (error: any, errorInfo: any) => void; }>;
