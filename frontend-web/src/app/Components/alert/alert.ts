import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class Alert {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' = 'success';
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

}
