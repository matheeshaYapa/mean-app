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

  posts = new Array<PostModel>();
  private postsSub!: Subscription;

  constructor(
    private postsService: PostsService
  ) { }

  ngOnInit(): void {
    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((posts: Array<PostModel>) => {
        this.posts = posts;
      });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
  }

}
