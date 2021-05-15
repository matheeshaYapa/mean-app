import {Injectable} from '@angular/core';
import {PostModel} from '../models/post.model';
import {Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private posts: Array<PostModel> = [];

  private postsUpdated = new Subject<PostModel[]>();

  constructor(
    private router: Router,
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

  getPost(postId: string): Observable<PostModel> {
    return this.http.get<{ _id: string, title: string, content: string }>(`http://localhost:3000/api/posts/${postId}`)
      .pipe(map(post => {
        return {
          ...post,
          id: post._id
        };
      }));
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

        this.router.navigate(['/']);
      });
  }

  updatePost(postId: string, title: string, content: string): void {
    const post: PostModel = {
      id: postId, title, content
    };
    this.http.put(`http://localhost:3000/api/posts/${postId}`, post)
      .subscribe(
        response => {
          const tempPosts = [...this.posts];
          const updatedPostIndex = tempPosts.findIndex(p => p.id === post.id);
          tempPosts[updatedPostIndex] = post;
          this.posts = tempPosts;
          this.postsUpdated.next([...this.posts]);

          this.router.navigate(['/']);
        }
      );
  }

  deletePost(postId: string): void {
    this.http.delete(`http://localhost:3000/api/posts/${postId}`)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
