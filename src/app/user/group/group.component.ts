import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../../shared/models/group';
import { User } from '../../shared/models/user';
import { Expense } from '../../shared/models/expense';
import { Payee } from '../../shared/models/payee';
import { Payer } from '../../shared/models/payer';
import { Payment } from '../../shared/models/payment';
import { NgForOf } from '@angular/common';
import { NgForm } from '@angular/forms';
import { DataService } from '../../shared/services/data.service';
import { GroupMemberMapping } from '../../shared/models/group-member-mapping';
import { Activity } from '../../shared/models/activity';
import { SignalRService } from 'src/app/shared/services/signal-r.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  group: Group;
  groupId: number;
  members: User[];
  expenses: Expense[];
  payers: Payer[];
  payees: Payee[];
  payer: Payer;
  payee: Payee;
  payments: Payment[];
  isNew: boolean;
  friends: User[];
  currentUser: User;
  totalOwes: number;
  totalOwed: number;
  grandTotal: number;
  sign: string;
  listOfUsers: string[];
  // tslint:disable-next-line: max-line-length
  constructor(private signalRService: SignalRService, private route: ActivatedRoute, private router: Router, private dataService: DataService) {
    const x = this.route.snapshot.data.resolvedData;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.groupId = +this.route.snapshot.paramMap.get('id');
    this.listOfUsers = [];
    if (this.groupId > 0) {
      this.isNew = false;
      this.expenses = x.expenses;
      this.payers = x.payers;
      this.payees = x.payees;
      this.group = x.group.group;
      this.members = x.group.members;
      this.members = this.members.filter(k => k.id !== this.currentUser.id);
      this.currentUser = x.currentUser;
      this.totalOwed = this.totalOwes = this.grandTotal = 0;
    } else {
      this.isNew = true;
      this.friends = x.friends;
      this.currentUser = x.currentUser;
      this.members = [];
      this.members.push(this.currentUser);
      this.group = new Group();
    }
    // console.log(this.isNew);
    // console.log(JSON.stringify(this.group));
    // console.log(JSON.stringify(this.members));
    this.payments = [];
    this.group.madeById = this.currentUser.id;
  }

  ngOnInit() {
    if (this.isNew === false) {
      this.expenses = this.expenses.filter(k => k.groupId === this.group.id);
      // console.log(JSON.stringify(this.expenses));
      // console.log(JSON.stringify(this.payees));
      // console.log(this.expenses);
      for (const expense of this.expenses) {
        this.payer = this.payers.find(k => k.expenseId === expense.id);
        // why payees isn't here?
        // what if Im not in this group expense
        if (this.payer.payerId === this.currentUser.id) {
          // I Paid
          // tslint:disable-next-line: max-line-length
          this.payments.push(new Payment(expense.id, expense.description, this.payer.payerId, 'You', '0', '', this.payer.amountPaid, this.payer.amountPaid - this.payer.payerShare, expense.dateTime));
          this.totalOwed += this.payer.amountPaid - this.payer.payerShare;
        } else {
          this.payee = this.payees.find(k => k.payeeId === this.currentUser.id && expense.id === k.expenseId);
          if (this.payee === undefined) {
            break;
          }
          // tslint:disable-next-line: max-line-length
          this.payments.push(new Payment(expense.id, expense.description, this.payer.payerId, this.payer.user.name, this.currentUser.id, 'You', this.payer.amountPaid, this.payee.payeeShare, expense.dateTime));
          this.totalOwes += this.payee.payeeShare; // +=?
        }
      }
      this.grandTotal = this.totalOwed - this.totalOwes;
    }
  }
  onSelect(checked: boolean, id: string) {
    if (checked === true) {
      if (id === this.currentUser.id) {
        this.members.push(this.currentUser);
      } else {
        this.members.push(this.friends.find(k => k.id === id));
      }
    } else {
      // delete
      const x = this.members.find(k => k.id === id);
      this.members = this.members.filter(k => k !== x);
    }
    // console.log(JSON.stringify(this.members));
  }

  async onSubmit(form: NgForm) {
    console.log('Adding new group!');
    // console.log(this.group);
    await this.dataService.addGroup(this.group).then(
      k => {
        this.group = k;
      }
    );
    const groupMemberMapping = new GroupMemberMapping();
    groupMemberMapping.groupId = this.group.id;
    for (const x of this.members) {
      groupMemberMapping.memberId = x.id;
      this.listOfUsers.push(x.id);
      await this.dataService.addGroupMemberMapping(groupMemberMapping);
    }

    const str = `${this.currentUser.name} added you in '${this.group.name}' group.` ;
    this.listOfUsers = this.listOfUsers.filter(k => k !== this.currentUser.id);
    this.signalRService.SendMessages(str, this.listOfUsers);
    this.router.navigate(['groups'], { state: { msg: 'Group added.'}});
  }
  async onDelete() {
    if (confirm('Are you sure you want to delete this group and all its expenses?')) {
      // tslint:disable-next-line: max-line-length
      this.dataService.addActivity(new Activity(this.currentUser.id, this.currentUser.name + ' deleted ' + this.group.name + ' group.', new Date(Date.now())));
      await this.dataService.deleteGroup(this.groupId);

      this.members.forEach(element => {
        this.listOfUsers.push(element.id);
      });
      const str = `${this.currentUser.name} deleted group '${this.group.name}'` ;
      this.listOfUsers = this.listOfUsers.filter(k => k !== this.currentUser.id);
      this.signalRService.SendMessages(str, this.listOfUsers);
      this.router.navigate(['groups'], { state: { msg: 'Group deleted.'}});
    }
  }
}
