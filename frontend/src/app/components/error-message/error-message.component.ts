import { Component, Input } from '@angular/core';
import { ResponseMessage } from '../../interfaces/response-message';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-error-message',
  imports: [NgClass],
  templateUrl: './error-message.component.html',
  standalone: true,
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  @Input() msg!: ResponseMessage;
}
