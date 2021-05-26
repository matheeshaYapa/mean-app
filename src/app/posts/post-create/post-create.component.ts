import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PostsService} from '../services/posts.service';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {PostModel} from '../models/post.model';
import {mimeTypeValidator} from './mime-type.validator';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/services/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit, OnDestroy {

  private mode: 'create' | 'update' = 'create';
  private postId: string | null | undefined;
  private authStatusSubs?: Subscription;

  public isLoading = false;
  public post?: PostModel;
  public imagePreview?: string;
  public form: FormGroup = new FormGroup({});

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authStatusSubs = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );

    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeTypeValidator]
        }),
    });

    this.activatedRoute.paramMap.subscribe(
      (paramMap: ParamMap) => {
        if (paramMap.has('postId')) {
          this.mode = 'update';
          this.postId = paramMap.get('postId');
          this.isLoading = true;
          this.postsService.getPost(this.postId as string).subscribe(
            post => {
              this.post = post;
              this.form?.setValue({
                title: post.title,
                content: post.content,
                image: post.imagePath
              });
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

  onImagePick(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.form.patchValue({image: file});
    this.form.get('image')?.updateValueAndValidity();
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.imagePreview = fileReader.result as string;
    };
    fileReader.readAsDataURL(file as Blob);
  }

  onSavePost(): void {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postsService.updatePost(
        this.postId as string, this.form.value.title, this.form.value.content, this.form.value.image
      );
    }
    this.form.reset();
  }

  ngOnDestroy(): void {
    this.authStatusSubs?.unsubscribe();
  }

}
