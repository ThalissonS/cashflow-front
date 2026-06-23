import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  PapelUsuario,
  RegistroRequest,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'cf_token';
  private readonly USER_KEY = 'cf_user';

  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _nome = signal<string | null>(this._getStoredUser()?.nome ?? null);
  private _papel = signal<PapelUsuario | null>(
    this._getStoredUser()?.papel ?? null
  );

  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._papel() === 'ROLE_ADMIN');
  readonly nome = computed(() => this._nome());
  readonly papel = computed(() => this._papel());

  get token(): string | null {
    return this._token();
  }

  login(req: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, req)
      .pipe(tap((res) => this._saveSession(res)));
  }

  registrar(req: RegistroRequest) {
    return this.http.post<void>(`${environment.apiUrl}/auth/registrar`, req);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._nome.set(null);
    this._papel.set(null);
    this.router.navigate(['/login']);
  }

  private _saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify({ nome: res.nome, papel: res.papel })
    );
    this._token.set(res.token);
    this._nome.set(res.nome);
    this._papel.set(res.papel);
  }

  private _getStoredUser(): { nome: string; papel: PapelUsuario } | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { nome: string; papel: PapelUsuario };
    } catch {
      return null;
    }
  }
}
