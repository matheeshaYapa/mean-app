import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {PostsService} from '../services/posts.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {PostModel} from '../models/post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit {

  private mode: 'create' | 'update' = 'create';
  private postId: string | null | undefined;

  public isLoading = false;
  public post?: PostModel;

  constructor(
    private postsService: PostsService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(
      (paramMap: ParamMap) => {
        if (paramMap.has('postId')) {
          this.mode = 'update';
          this.postId = paramMap.get('postId');
          this.isLoading = true;
          this.postsService.getPost(this.postId as string).subscribe(
            post => {
              this.post = post;
              this.isLoading = false;
            }
          );
        } else {
          this.mode = 'create';
          this.postId = null;
        }
      }
    );
  }

  onSavePost(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(form.value.title, form.value.content);
    } else {
      this.postsService.updatePost(this.postId as string, form.value.title, form.value.content);
    }
    form.resetForm();
  }

}
