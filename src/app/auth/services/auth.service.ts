import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthDataModel} from '../models/auth-data.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token?: string;
  private tokenTimer?: ReturnType<typeof setTimeout>;
  private userId?: string | null;
  private authStatusListener = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  getToken(): string {
    return this.token as string;
  }

  getUserId(): string {
    return this.userId as string;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string): void {
    const authData: AuthDataModel = {email, password};
    this.http.post('http://localhost:3000/api/user/signup', authData).subscribe(
      response => {
        this.router.navigate(['/login']);
      }, error => {
        this.authStatusListener.next(false);
      }
    );
  }

  loginUser(email: string, password: string): void {
    const authData: AuthDataModel = {email, password};
    this.http.post<{ token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        this.token = response.token;

        if (this.token) {

          this.userId = response.userId;
          this.authStatusListener.next(true);
          this.setAuthTimer(response.expiresIn);

          const date = new Date();
          this.saveAuthData(this.token, new Date(date.getTime() + response.expiresIn * 1000), response.userId);
          this.router.navigate(['/']);
        }
      }, () => {
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser(): void {
    const authInformation = this.getAuthData();

    if (!authInformation) {
      return;
    }
    const date = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - date.getTime();
    if (expiresIn <= 0) {
      return;
    }
    this.token = authInformation.token;
    this.setAuthTimer(expiresIn / 1000);
    this.authStatusListener.next(true);
    this.userId = authInformation.userId;
  }

  logoutUser(): void {
    this.token = undefined;
    this.authStatusListener.next(false);
    this.userId = null;
    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
  }

  private setAuthTimer(duration: number): void {
    console.log('duration', duration);
    this.tokenTimer = setTimeout(() => {
      this.logoutUser();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData(): { token: string, expirationDate: Date, userId: string } | void {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate || !userId) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId
    };
  }
}
