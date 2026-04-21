/**
 * Authentication service managing user sessions with Angular signals.
 * Handles login, registration, token refresh, and session persistence.
 * Stores the access token in a memory signal and the refresh token in localStorage.
 */

import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { TokenResponse } from '../models/user.model';
import { ApiService } from './api.service';

/** LocalStorage key for persisting the refresh token. */
const REFRESH_TOKEN_KEY = 'gt_refresh_token';
/** LocalStorage key for persisting token response data for session restore. */
const TOKEN_DATA_KEY = 'gt_token_data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Internal signal holding the current token response or null if not authenticated. */
  private readonly _currentUser = signal<TokenResponse | null>(null);

  /** Computed signal indicating whether the user is currently authenticated. */
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  /** Computed signal exposing the current token response (read-only). */
  readonly currentUser = computed(() => this._currentUser());

  constructor(private api: ApiService) {
    this.restoreSession();
  }

  /**
   * Authenticates a user with email and password.
   * @param email - User's email address.
   * @param password - User's password.
   * @returns Observable of the token response.
   */
  login(email: string, password: string): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/auth/login', { email, password }).pipe(
      tap((response) => this.setSession(response))
    );
  }

  /**
   * Registers a new user account.
   * @param email - Desired email address.
   * @param userName - Desired display name.
   * @param password - Desired password.
   * @param timezone - Optional IANA timezone string.
   * @returns Observable of the token response.
   */
  register(email: string, userName: string, password: string, timezone?: string): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/auth/register', { email, userName, password, timezone }).pipe(
      tap((response) => this.setSession(response))
    );
  }

  /** Clears the current session and removes stored tokens. */
  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_DATA_KEY);
  }

  /**
   * Refreshes the access token using the stored refresh token.
   * @returns Observable of the new token response, or an error if no refresh token is available.
   */
  refreshToken(): Observable<TokenResponse> {
    const current = this._currentUser();
    const refreshToken = current?.refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.api.post<TokenResponse>('/auth/refresh', { refreshToken }).pipe(
      tap((response) => this.setSession(response)),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /**
   * Returns the current JWT access token, or null if not authenticated.
   * Used by the auth interceptor to attach the Authorization header.
   */
  getToken(): string | null {
    return this._currentUser()?.token ?? null;
  }

  /**
   * Returns the current user's token response.
   * Alias for the currentUser signal value.
   */
  getCurrentUser(): TokenResponse | null {
    return this._currentUser();
  }

  /**
   * Persists the session in the signal and localStorage.
   * @param response - Token response from the API.
   */
  private setSession(response: TokenResponse): void {
    this._currentUser.set(response);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(TOKEN_DATA_KEY, JSON.stringify(response));
  }

  /** Attempts to restore a previous session from localStorage on service init. */
  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(TOKEN_DATA_KEY);
      if (stored) {
        const tokenData: TokenResponse = JSON.parse(stored);
        const expiresAt = new Date(tokenData.expiresAt);
        if (expiresAt > new Date()) {
          this._currentUser.set(tokenData);
        } else {
          localStorage.removeItem(TOKEN_DATA_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
    } catch {
      localStorage.removeItem(TOKEN_DATA_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}
