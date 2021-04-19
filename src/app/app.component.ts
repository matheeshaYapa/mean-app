import { Component } from '@angular/core';
import {PostModel} from './posts/models/post.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  posts = new Array<PostModel>();

  onPostAdded(post: PostModel): void {
    this.posts.push(post);
  }
}
