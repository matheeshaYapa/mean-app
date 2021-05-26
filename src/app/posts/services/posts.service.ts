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

  private postsUpdated = new Subject<{posts: Array<PostModel>, postCount: number}>();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
  }

  getPosts(postsPerPage: number, currentPage: number): void {
    const queryParams =  `?page=${currentPage}&size=${postsPerPage}`;

    this.http.get<{message: string, posts: Array<any>, maxPosts: number}>(
      'http://localhost:3000/api/posts' + queryParams
    )
      .pipe(map(response => {
        return {posts: response.posts.map<PostModel>(post => {
          return {
            ...post,
            id: post._id,
            userId: post.creator
          };
        }),
          maxPosts: response.maxPosts
        };
      }))
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: postData.maxPosts});
      });
  }

  getPost(postId: string): Observable<PostModel> {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, userId: string }>(`http://localhost:3000/api/posts/${postId}`)
      .pipe(map(post => {
        return {
          ...post,
          id: post._id
        };
      }));
  }

  getPostUpdateListener(): Observable<{posts: Array<PostModel>, postCount: number }> {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File): void {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);

    this.http.post<{message: string, post: PostModel}>('http://localhost:3000/api/posts', postData)
      .subscribe((response) => {
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
      } as PostModel;
    }
    this.http.put(`http://localhost:3000/api/posts/${postId}`, postData)
      .subscribe(
        response => {
          this.router.navigate(['/']);
        }
      );
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/api/posts/${postId}`);
  }
}
