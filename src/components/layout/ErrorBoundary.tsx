import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center px-8">
          <View className="bg-red-100 dark:bg-red-900/30 rounded-full p-5 mb-4">
            <AlertTriangle stroke="#EF4444" size={36} />
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            className="bg-brand-500 rounded-2xl px-8 py-3"
            onPress={this.handleReset}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
