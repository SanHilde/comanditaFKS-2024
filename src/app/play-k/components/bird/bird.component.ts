import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pp-bird',
  templateUrl: './bird.component.html',
  styleUrls: ['./bird.component.scss']
})
export class BirdComponent implements OnInit {
  @Input() height!: number;
  @Input() width!: number;
  @Input() top!: number;

  constructor() {}

  ngOnInit() {}
}
