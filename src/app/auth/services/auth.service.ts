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
  private authStatusListener = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  getToken(): string {
    return this.token as string;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string): void {
    const authData: AuthDataModel = {email, password};
    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response);
      });
  }

  loginUser(email: string, password: string): void {
    const authData: AuthDataModel = {email, password};
    this.http.post<{token: string, expiresIn: number}>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        this.token = response.token;

        if (this.token) {

          this.authStatusListener.next(true);
          this.setAuthTimer(response.expiresIn);

          const date = new Date();
          this.saveAuthData(this.token, new Date(date.getTime() + response.expiresIn * 1000));
          this.router.navigate(['/']);
        }
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
  }

  logoutUser(): void {
    this.token = undefined;
    this.authStatusListener.next(false);
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

  private saveAuthData(token: string, expirationDate: Date): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData(): { token: string, expirationDate: Date } | void {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate)
    };
  }
}
