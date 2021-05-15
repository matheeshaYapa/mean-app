import {Injectable} from '@angular/core';
import {PostModel} from '../models/post.model';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

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
    this.http.get<{message: string, posts: Array<any>}>('http://localhost:3000/api/posts')
      .pipe(map(response => {
        return response.posts.map<PostModel>(post => {
          return {
            ...post,
            id: post._id
          };
        });
      }))
      .subscribe((postData) => {
        this.posts = postData;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener(): Observable<Array<PostModel>> {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string): void {
    const post: PostModel = {id: '', title, content};
    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
      .subscribe((response) => {
        post.id = response.postId;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(postId: string): void {
    this.http.delete(`http://localhost:3000/api/posts/${postId}`)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
