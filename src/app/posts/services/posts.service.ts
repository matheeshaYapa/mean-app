import {Injectable} from '@angular/core';
import {PostModel} from '../models/post.model';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private posts: Array<PostModel> = [];

  private postsUpdated = new Subject<PostModel[]>();

  constructor(
    private http: HttpClient
  ) {
  }

  getPosts(): void {
    this.http.get<{message: string, posts: Array<PostModel>}>('http://localhost:3000/api/posts')
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener(): Observable<Array<PostModel>> {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string): void {
    const post: PostModel = {id: 0, title, content};
    this.http.post<{message: string}>('http://localhost:3000/api/posts', post)
      .subscribe((response) => {
        console.log(response.message);
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
