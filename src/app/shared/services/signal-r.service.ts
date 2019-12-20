import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { User } from '../models/user';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from './authentication.service';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  connection: signalR.HubConnection;
  currentUser: User;
  public msgs: BehaviorSubject<string>;
  msg: string;
  baseURl: string;
  local: string;
  azure: string;
  constructor(private messageService: MessageService, private authenticationService: AuthenticationService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    // console.log('XXXXXXXXXXXXXXXXXXX');
    this.msgs = new BehaviorSubject('');
    this.local =  'http://localhost:6800/';
    this.azure = 'https://splitwiseweb20191211032306.azurewebsites.net/';
    this.baseURl = this.local;
   }

   StartService() {
    this.connection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.Information)
    .withUrl(`${this.baseURl}notify`)
    .build();
// http://localhost:6700/
    this.connection.start().then(k =>  {
      console.log('Connected!');
      this.connection.invoke('AddUser', this.currentUser.id);
    }).catch(err => {
      return console.error(err.toString());
    });

    this.connection.on('SendMessage', (type: string, payload: string) => {
      // console.log(payload);
      this.msgs.next(payload);
      // this.messageService.add({ severity: type, summary: payload, detail: 'Via SignalR' });
    });
   }
   SendMessages(message: string, listofUsers: string[]) {
    // console.log('aaaaaa');
    this.connection.invoke('SendNotification', 'success', message, listofUsers);
   }
   StopService() {
     this.connection.invoke('RemoveUser', this.currentUser.id);
   }

}
