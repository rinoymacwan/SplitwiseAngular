import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    public user: User;
    baseURl: string;
    local: string;
    azure: string;
    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.local =  'http://localhost:6800/api/';
      this.azure = 'https://splitwiseweb20191211032306.azurewebsites.net/api/';
        this.baseURl = this.local;
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        this.user = new User();
        this.user.userName = username;
        this.user.password = password;
        // http://localhost:6700/
        return this.http.post<any>(`${this.baseURl}Users/login`, this.user)
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                // add token
                if (user.email !== null) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        // REMOVE USER FROM LIST IN BACKEND
    }
}
