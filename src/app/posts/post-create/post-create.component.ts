import {Component, OnInit, EventEmitter, Output} from '@angular/core';
import {PostModel} from '../models/post.model';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit {

  @Output() postCreated = new EventEmitter<PostModel>();

  enteredTitle = '';
  enteredContent = '';

  constructor() { }

  ngOnInit(): void {
  }

  onSavePost(): void {
    const post: PostModel = {
      title: this.enteredTitle,
      content: this.enteredContent
    };

    this.postCreated.emit(post);
  }

}
