import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit {

  newPost = 'default value';

  constructor() { }

  ngOnInit(): void {
  }

  onSavePost(postTextArea: HTMLTextAreaElement): void {
    console.dir(postTextArea);
    this.newPost = 'Test';
  }

}
