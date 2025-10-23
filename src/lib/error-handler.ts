// Error handling utilities for the Taxify application

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userMessage: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Create a standardized error object
  createError(
    code: string, 
    message: string, 
    details?: any, 
    userMessage?: string
  ): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      userMessage: userMessage || this.getDefaultUserMessage(code)
    };
  }

  // Get user-friendly error messages
  getDefaultUserMessage(code: string): string {
    const messages: Record<string, string> = {
      'AUTH_ERROR': 'Authentication failed. Please try logging in again.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
      'FILE_ERROR': 'File upload failed. Please try again.',
      'DATABASE_ERROR': 'Database operation failed. Please try again.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };
    return messages[code] || 'An error occurred. Please try again.';
  }

  // Handle and show error in one call
  handleAndShowError(error: any, context?: string): AppError {
    let appError: AppError;

    // Detect error type and route to appropriate handler
    if (error instanceof Error && error.name === 'ValidationError') {
      appError = this.handleValidationError([error.message]);
    } else if (error.code && typeof error.code === 'string' &&
               (error.code.startsWith('PGRST') || error.code.match(/^\d{5}$/))) {
      // Supabase/Postgres errors have specific code patterns
      appError = this.handleSupabaseError(error);
    } else if (error instanceof File || (error.file && error.file instanceof File)) {
      // File-related errors
      appError = this.handleFileError(error, error.file);
    } else {
      // Default to API error handling for HTTP/network errors
      appError = this.handleApiError(error);
    }
 
     this.logError(appError, context);
     this.showError(appError);
     return appError;
  }
  // Handle API errors
  handleApiError(error: any): AppError {
    console.error('API Error:', error);

    // Network errors
    if (!error.response) {
      return this.createError(
        'NETWORK_ERROR',
        'Network request failed',
        error,
        'Unable to connect to the server. Please check your internet connection'
      );
    }

    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 401:
        return this.createError(
          'AUTH_INVALID',
          'Authentication failed',
          data,
          'Your session has expired. Please log in again'
        );
      
      case 403:
        return this.createError(
          'AUTH_FORBIDDEN',
          'Access forbidden',
          data,
          'You do not have permission to perform this action'
        );
      
      case 404:
        return this.createError(
          'NOT_FOUND',
          'Resource not found',
          data,
          'The requested information was not found'
        );
      
      case 422:
        return this.createError(
          'VALIDATION_ERROR',
          'Validation failed',
          data,
          'Please check your input and try again'
        );
      
      case 429:
        return this.createError(
          'RATE_LIMIT',
          'Rate limit exceeded',
          data,
          'Too many requests. Please wait a moment and try again'
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return this.createError(
          'SERVER_ERROR',
          'Server error',
          data,
          'Something went wrong on our end. Please try again later'
        );
      
      default:
        return this.createError(
          'UNKNOWN_ERROR',
          'Unknown error occurred',
          { status, data },
          'An unexpected error occurred. Please try again'
        );
    }
  }

  // Handle Supabase errors
  handleSupabaseError(error: any): AppError {
    console.error('Supabase Error:', error);

    if (error.code) {
      switch (error.code) {
        case 'PGRST116':
          return this.createError(
            'NOT_FOUND',
            'Resource not found',
            error,
            'The requested information was not found'
          );
        
        case '23505':
          return this.createError(
            'DUPLICATE_ENTRY',
            'Duplicate entry',
            error,
            'This information already exists'
          );
        
        case '23503':
          return this.createError(
            'FOREIGN_KEY_VIOLATION',
            'Foreign key violation',
            error,
            'Cannot delete this item because it is being used elsewhere'
          );
        
        case '42501':
          return this.createError(
            'AUTH_FORBIDDEN',
            'Insufficient privileges',
            error,
            'You do not have permission to perform this action'
          );
        
        default:
          return this.createError(
            'DATABASE_ERROR',
            'Database error',
            error,
            'Unable to save your data. Please try again'
          );
      }
    }

    return this.createError(
      'UNKNOWN_ERROR',
      'Unknown error occurred',
      error,
      'An unexpected error occurred. Please try again'
    );
  }

  // Handle file upload errors
  handleFileError(error: any, file?: File): AppError {
    console.error('File Error:', error);

    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return this.createError(
          'FILE_TOO_LARGE',
          'File too large',
          { size: file.size, maxSize: 10 * 1024 * 1024 },
          'The file is too large. Please choose a file smaller than 10MB'
        );
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];

      if (!allowedTypes.includes(file.type)) {
        return this.createError(
          'UNSUPPORTED_FILE_TYPE',
          'Unsupported file type',
          { type: file.type, allowedTypes },
          'This file type is not supported. Please choose a PDF, image, Word document, Excel file, or CSV'
        );
      }
    }

    return this.createError(
      'PROCESSING_ERROR',
      'File processing error',
      error,
      'There was an error processing your file. Please try again'
    );
  }

  // Handle validation errors
  handleValidationError(errors: string[]): AppError {
    return this.createError(
      'VALIDATION_ERROR',
      'Validation failed',
      { errors },
      'Please check your input and try again'
    );
  }

  // Log error for debugging
  logError(error: AppError, context?: string): void {
    console.error(`[${context || 'ErrorHandler'}] ${error.code}:`, {
      message: error.message,
      details: error.details,
      timestamp: error.timestamp
    });
  }

  // Show error to user (you can integrate with your notification system)
  showError(error: AppError): void {
    // This would integrate with your notification/toast system
    console.warn('User Error:', error.userMessage);
    
    // Example integration with a toast notification:
    // toast.error(error.userMessage);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility function for React components
export const useErrorHandler = () => {
  return {
    handleError: (error: any, context?: string) => errorHandler.handleAndShowError(error, context),
    createError: (code: string, message: string, details?: any, userMessage?: string) => 
      errorHandler.createError(code, message, details, userMessage),
    showError: (error: AppError) => errorHandler.showError(error)
  };
};
