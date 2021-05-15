import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostModel} from '../models/post.model';
import {PostsService} from '../services/posts.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {

  private postsSub!: Subscription;

  public isLoading = false;
  public posts = new Array<PostModel>();

  constructor(
    private postsService: PostsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((posts: Array<PostModel>) => {
        this.posts = posts;
        this.isLoading = false;
      });
  }

  onDeletePost(postId: string): void {
    this.postsService.deletePost(postId);
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

}
