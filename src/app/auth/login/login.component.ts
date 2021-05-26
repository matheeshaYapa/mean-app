import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  private authStatusSubs?: Subscription;

  public isLoading = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authStatusSubs = this.authService.getAuthStatusListener().subscribe(
      isAuthenticated => {
        this.isLoading = false;
      }
    );
  }

  onLogin(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.loginUser(form.value.email, form.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSubs?.unsubscribe();
  }


}
