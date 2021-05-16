import {Component, OnDestroy, OnInit} from '@angular/core';
import {PostModel} from '../models/post.model';
import {PostsService} from '../services/posts.service';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {

  private postsSub!: Subscription;

  public isLoading = false;
  public totalPosts = 0;
  public postsPerPage = 2;
  public currentPage = 1;
  public pageSizeOptions: Array<number> = [1, 2, 5, 10];
  public posts = new Array<PostModel>();

  constructor(
    private postsService: PostsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Array<PostModel>, postCount: number}) => {
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
        this.isLoading = false;
      });
  }

  onDeletePost(postId: string): void {
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(
      () => {
        if (this.posts.length === 1) {
          this.currentPage -= 1;
        }
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      }
    );
  }

  onPageChange(event: PageEvent): void {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.postsPerPage = event.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

}
