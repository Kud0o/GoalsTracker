/**
 * Core API service for making HTTP requests to the GoalsTracker backend.
 * Wraps Angular HttpClient with base URL resolution and standardized error handling.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  /** Base URL for all API requests, read from environment config. */
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Performs a GET request to the specified API path.
   * @param path - Relative API path (e.g. "/goals").
   * @param params - Optional query parameters as a key-value record.
   * @returns Observable of the typed response.
   */
  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs a POST request to the specified API path.
   * @param path - Relative API path.
   * @param body - Request body to send.
   * @returns Observable of the typed response.
   */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs a PUT request to the specified API path.
   * @param path - Relative API path.
   * @param body - Request body to send.
   * @returns Observable of the typed response.
   */
  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs a DELETE request to the specified API path.
   * @param path - Relative API path.
   * @returns Observable of the response.
   */
  delete(path: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${path}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Extracts a structured ErrorResponse from HTTP error responses.
   * @param error - The raw HTTP error response.
   * @returns An observable that emits the ErrorResponse.
   */
  private handleError(error: any): Observable<never> {
    let message: string;
    let errorCode: string;

    if (error.status === 0) {
      // Network error or service unreachable
      errorCode = 'network_error';
      message = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.status >= 500) {
      // Server error
      errorCode = 'server_error';
      message = 'The server encountered an error. Please try again later.';
    } else if (error.status === 401) {
      errorCode = 'unauthorized';
      message = 'Your session has expired. Please sign in again.';
    } else if (error.status === 403) {
      errorCode = 'forbidden';
      message = 'You do not have permission to perform this action.';
    } else {
      // Business logic errors (400, 404, 409, etc.)
      errorCode = error.error?.error || 'request_error';
      message = error.error?.message || 'Something went wrong. Please try again.';
    }

    const errorResponse: ErrorResponse = {
      error: errorCode,
      message,
      details: error.error?.details,
    };
    return throwError(() => errorResponse);
  }
}
