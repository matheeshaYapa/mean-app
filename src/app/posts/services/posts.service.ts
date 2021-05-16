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
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(`http://localhost:3000/api/posts/${postId}`)
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

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<{message: string, post: PostModel}>('http://localhost:3000/api/posts', postData)
      .subscribe((response) => {
        const post: PostModel = {
          id: response.post.id,
          title,
          content,
          imagePath: response.post.imagePath
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);

        this.router.navigate(['/']);
      });
  }

  updatePost(postId: string, title: string, content: string, image: File | string): void {
    let postData: FormData | PostModel;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: postId,
        title,
        content,
        imagePath: image
      };
    }
    this.http.put(`http://localhost:3000/api/posts/${postId}`, postData)
      .subscribe(
        response => {
          const tempPosts = [...this.posts];
          const updatedPostIndex = tempPosts.findIndex(p => p.id === postId);
          const post: PostModel = {
            id: postId,
            title,
            content,
            imagePath: 'response.imagePath'
          };
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
