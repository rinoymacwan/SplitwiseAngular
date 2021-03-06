import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { User } from '../models/user';
@Injectable({
  providedIn: 'root'
})
export class AddEditExpensesResolver implements Resolve<any> {

  currentUser: User;
  constructor(private dataService: DataService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
   }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(route.params['id'] > 0)
    {
      const join = forkJoin([
        this.dataService.getFriends(this.currentUser.id),
        this.dataService.getGroupsByUserId(this.currentUser.id),
        this.dataService.getCategories(),
        this.dataService.getUser(this.currentUser.id),
        this.dataService.getExpense(route.params['id']),
        this.dataService.getPayers(),
        this.dataService.getPayees(),
      ]).pipe(map((results) => {
        return {
          friends: results[0],
          groups: results[1],
          categories: results[2],
          user: results[3],
          expense: results[4],
          payers: results[5],
          payees: results[6]
        };
      }));
      return join;
    } else {
      const join = forkJoin([
        this.dataService.getFriends(this.currentUser.id),
        this.dataService.getGroupsByUserId(this.currentUser.id),
        this.dataService.getCategories(),
        this.dataService.getUser(this.currentUser.id),
        this.dataService.getPayers(),
        this.dataService.getPayees(),
      ]).pipe(map((results) => {
        return {
          friends: results[0],
          groups: results[1],
          categories: results[2],
          user: results[3],
          payers: results[4],
          payees: results[5]
        };
      }));
      return join;
    }
  }
}
