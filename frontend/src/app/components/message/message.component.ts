import { Component, Input } from '@angular/core';
import { ResponseMessageInterface } from '../../interfaces/response-message-interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-message',
  imports: [NgClass],
  templateUrl: './message.component.html',
  standalone: true,
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() msg!: ResponseMessageInterface;
}
