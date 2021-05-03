import {Injectable} from '@angular/core';
import {PostModel} from '../models/post.model';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private posts: Array<PostModel> = [];

  private postsUpdated = new Subject<PostModel[]>();

  constructor() {
  }

  getPosts(): Array<PostModel> {
    return [...this.posts];
  }

  getPostUpdateListener(): Observable<Array<PostModel>> {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string): void {
    const post: PostModel = {title, content};
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);
  }
}
