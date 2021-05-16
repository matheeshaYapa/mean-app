import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthDataModel} from '../models/auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) { }

  createUser(email: string, password: string): void {
    const authData: AuthDataModel = {email, password};
    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response);
      });
  }

  loginUser(email: string, password: string): void {
    const authData: AuthDataModel = {email, password};
    this.http.post('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        console.log(response);
      });
  }
}
