import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Activity } from '../models/activity';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense';
import { Payee } from '../models/payee';
import { Payer } from '../models/payer';
import { Group } from '../models/group';
import { User } from '../models/user';
import { Settlement } from '../models/settlement';
import { Category } from '../models/category';
import { GroupMemberMapping } from '../models/group-member-mapping';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseURl: string;
  local: string;
  azure: string;
  constructor(private http: HttpClient) {
    this.local =  'http://localhost:6800/api/';
    this.azure = 'https://splitwiseweb20191211032306.azurewebsites.net/api/';
    this.baseURl = this.local;
   }

  getActivities(UserId: string): Observable<Activity[]> {
    const x = this.http.get<Activity[]>(`${this.baseURl}Activities/ByUserId/${UserId}`);
    return x;
  }
  getExpenses(): Observable<Expense[]> {
    const x = this.http.get<Expense[]>(`${this.baseURl}Expenses`);
    return x;
  }
  getPayersByPayerId(id: string): Observable<Payer[]> {
    const x = this.http.get<Payer[]>(`${this.baseURl}Payers/ByPayerId/${id}`);
    return x;
  }
  getPayersByExpenseId(id: number): Observable<Payer[]> {
    const x = this.http.get<Payer[]>(`${this.baseURl}Payers/ByExpenseId/${id}`);
    return x;
  }
  getPayeesByPayeeId(id: string): Observable<Payee[]> {
    const x = this.http.get<Payee[]>(`${this.baseURl}Payees/ByPayeeId/${id}`);
    return x;
  }
  getPayeesByExpenseId(id: number): Observable<Payee[]> {
    const x = this.http.get<Payee[]>(`${this.baseURl}Payees/ByExpenseId/${id}`);
    return x;
  }
  getPayers(): Observable<Payer[]> {
    const x = this.http.get<Payer[]>(`${this.baseURl}Payers`);
    return x;
  }
  getPayees(): Observable<Payee[]> {
    const x = this.http.get<Payee[]>(`${this.baseURl}Payees`);
    return x;
  }
  getGroupsByUserId(id: string): Observable<Group[]> {
    const x = this.http.get<Group[]>(`${this.baseURl}Groups/ByUserId/${id}`);
    // console.log(JSON.stringify(x));
    return x;
  }
  getFriends(id: string): Observable<User[]> {
    const x = this.http.get<User[]>(`${this.baseURl}Users/${id}/friends`);
    // console.log(JSON.stringify(x));
    return x;
  }
  getSettlementsByUserId(id: string): Observable<Settlement[]> {
    const x = this.http.get<Settlement[]>(`${this.baseURl}Settlements/GetByUserId/${id}`);
    // console.log(JSON.stringify(x));
    return x;
  }
  getGroup(id: number): any {
    const x = this.http.get<any>(`${this.baseURl}Groups/${id}`);
    return x;
  }
  getUser(id: string): Observable<User> {
    const x = this.http.get<any>(`${this.baseURl}Users/${id}`);
    return x;
  }
  getGroupMembers(id: number): Promise<any> {
    const x = this.http.get<any>(`${this.baseURl}Groups/${id}`).toPromise();
    return x;
  }
  getCategories(): Observable<Category[]> {
    const x = this.http.get<Category[]>(`${this.baseURl}Categories`);
    // console.log(JSON.stringify(x));
    return x;
  }
  async AddExpense(expense: Expense): Promise<Expense> {
    return await this.http.post<Expense>(`${this.baseURl}Expenses`, expense).toPromise();
  }
  async AddPayer(payer: Payer) {
    await this.http.post(`${this.baseURl}Payers`, payer).toPromise();
  }
  async AddPayee(payee: Payee) {
    await this.http.post(`${this.baseURl}Payees`, payee).toPromise();
  }
  async addSettlement(settlement: Settlement) {
    await this.http.post(`${this.baseURl}Settlements`, settlement).toPromise();
  }
  async addActivity(activity: Activity) {
    await this.http.post(`${this.baseURl}Activities`, activity).toPromise();
  }
  async addGroup(group: Group): Promise<Group> {
    return await this.http.post<Group>(`${this.baseURl}Groups`, group).toPromise();
  }
  async addGroupMemberMapping(groupMemberMapping: GroupMemberMapping) {
    await this.http.post(`${this.baseURl}GroupMemberMappings`, groupMemberMapping).toPromise();
  }
  getExpense(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseURl}Expenses/${id}`);
  }
  async deleteExpense(expense: Expense): Promise<Expense> {
    return await this.http.delete<Expense>(`${this.baseURl}Expenses/${expense.id}`).toPromise();
  }
  async deleteSettlement(id: number): Promise<any> {
    return await this.http.delete<any>(`${this.baseURl}Settlements/${id}`).toPromise();
  }
  async deleteFriend(removeList: User[]): Promise<any> {
    // tslint:disable-next-line: max-line-length
    return await this.http.delete<any>(`${this.baseURl}UserFriendMappings/delete?user1=${removeList[0].id}&user2=${removeList[1].id}`).toPromise();
  }
  async clearActivities(userId: string) {
    return await this.http.delete(`${this.baseURl}Activities/ByUserId/${userId}`).toPromise();
  }
  async deleteGroup(id: number): Promise<Group> {
    return await this.http.delete<Group>(`${this.baseURl}Groups/${id}`).toPromise();
  }
  async addFriend(email: string, userId: string): Promise<User> {
    // tslint:disable-next-line: max-line-length
    const x = new User();
    x.email = email;
    return await this.http.post<User>(`${this.baseURl}UserFriendMappings/ByEmail/${userId}`, x).toPromise();
  }
  async addUser(user: User): Promise<User> {
    return await this.http.post<User>(`${this.baseURl}Users`, user).toPromise();
  }
}

