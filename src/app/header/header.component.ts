import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../auth/services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  public isUserAuthenticated = false;
  private authListenerSubs?: Subscription;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(
      isAuthenticated => {
        this.isUserAuthenticated = isAuthenticated;
      }
    );
  }

  onLogout(): void {
    this.authService.logoutUser();
  }

  ngOnDestroy(): void {
    this.authListenerSubs?.unsubscribe();
  }

}
