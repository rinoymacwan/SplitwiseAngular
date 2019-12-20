import { Component, OnInit } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from '../../shared/models/expense';
import { Payer } from '../../shared/models/payer';
import { Payee } from '../../shared/models/payee';
import { Settlement } from '../../shared/models/settlement';
import { Payment } from '../../shared/models/payment';
import { find } from 'rxjs/operators';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User;
  expenses: Expense[];
  payers: Payer[];
  payees: Payee[];
  settlements: Settlement[];
  owesTab: string[];
  owedTab: string[];
  finalOwesTab: string[];
  finalOwedTab: string[];
  AllOwesTab: string[];
  AllOwedTab: string[];
  payments: Payment[];
  owesPayments: Payment[];
  owedPayments: Payment[];
  finalOwesPayments: Payment[];
  finalOwedPayments: Payment[];
  fixedPayments: Payment[];
  totalOwes: number;
  totalOwed: number;
  grandTotal: number;
  sign: string;
  msgExists: boolean;
  msg: string;
  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {
    // this.expenses = this.route.snapshot.data.resolvedData.expenses;
    const x = this.route.snapshot.data.resolvedData;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // tslint:disable-next-line: no-non-null-assertion
    if (this.router.getCurrentNavigation().extras.state !== undefined) {
      this.msg = this.router.getCurrentNavigation().extras.state.msg;
      this.msgExists = true;
    } else {
      this.msgExists = false;
    }
    this.expenses = x.expenses;
    this.payers = x.payers;
    this.payees = x.payees;
    this.settlements = x.settlements;
    // console.log(JSON.stringify(this.payers));
    // console.log(JSON.stringify(this.payees));
    // console.log(JSON.stringify(this.settlements));
    this.owedTab = [];
    this.owesTab = [];
    this.finalOwedTab = [];
    this.finalOwesTab = [];
    this.AllOwedTab = [];
    this.AllOwesTab = [];
    this.payments = [];
    this.owesPayments = [];
    this.owedPayments = [];
    this.finalOwesPayments = [];
    this.finalOwedPayments = [];
    this.fixedPayments = [];
    this.totalOwed = 0;
    this.totalOwes = 0;
    this.grandTotal = 0;
    this.sign = '';
  }

  ngOnInit() {
    const owesT = this.payees.filter(k => k.payeeId === this.currentUser.id);
    for (const payee of owesT) {
      const payer = this.payers.find(k => k.expenseId === payee.expenseId);
      const expense = this.expenses.find(k => k.id === payee.expenseId);
      const existingPayment = this.owesPayments.find(k => k.from === payer.payerId && k.to === payee.payeeId);
      if (existingPayment !== undefined) {
        existingPayment.amount += payee.payeeShare;
      } else {
        // tslint:disable-next-line: max-line-length
        this.owesPayments.push(new Payment(expense.id, expense.description, payer.payerId, payer.user.name, payee.payeeId, payee.user.name, payee.payeeShare, 0, expense.dateTime));
      }
    }

    const owedT = this.payers.filter(k => k.payerId === this.currentUser.id);
    for (const payer of owedT) {
      // console.log("AAA");
      const payees = this.payees.filter(k => k.expenseId === payer.expenseId);
      for (const payee of payees) {
        const expense = this.expenses.find(k => k.id === payer.expenseId);
        const existingPayment = this.owedPayments.find(k => k.from === payer.payerId && k.to === payee.payeeId);
        if (existingPayment !== undefined) {
          console.log("exists");
          // console.log("exists");
          existingPayment.amount += payee.payeeShare;
        } else {
          console.log("add new");
          // tslint:disable-next-line: max-line-length
          this.owedPayments.push(new Payment(expense.id, expense.description, payer.payerId, payer.user.name, payee.payeeId, payee.user.name, payee.payeeShare, 0, expense.dateTime));
        }
      }

    }
    console.log(this.owedPayments);
    this.owesPayments = this.owesPayments.filter(k => k.from !== k.to);
    this.owedPayments = this.owedPayments.filter(k => k.from !== k.to);

    // owes payments owed payments
    for (const pay of this.owesPayments) {
      const x = this.owedPayments.find(k => k.from === pay.to && k.to === pay.from);
      if (x !== undefined) {
        const diff = x.amount - pay.amount;
        if (diff > 0) {
          x.amount = diff;
          pay.amount = 0;
          // he owes me more
        } else {
          // i owe him more
          pay.amount = diff * -1;
          x.amount = 0;
        }
      }
    }

    for (const pay of this.owesPayments) {
      if (pay.amount !== 0) {
        this.owesTab.push('You owe ' + pay.fromName + ' Rs. ' + pay.amount);
        // this.totalOwes += pay.amount;
      }
    }
    for (const pay of this.owedPayments) {
      if (pay.amount !== 0) {
        this.owedTab.push(pay.toName + ' owes You Rs. ' + pay.amount);
        // this.totalOwed += pay.amount;
      }
    }
    // this.grandTotal = this.totalOwed - this.totalOwes;
    let AllPayments = this.owedPayments.concat(this.owesPayments).filter(k => k.amount !== 0);

    // include settlements
    for (const x of this.settlements) {
      const y = AllPayments.find(k => k.from === x.payerId && k.to === x.payeeId);
      const z = AllPayments.find(k => k.from === x.payeeId && k.to === x.payerId);
      if (y !== undefined) {
        y.amount += x.amount;
        continue;
      } else if (z !== undefined) {
        z.amount -= x.amount;
        continue;
      } else {
        AllPayments.push(new Payment(0, 'settlement', x.payerId, x.payer.name, x.payeeId, x.payee.name, x.amount, 0, x.dateTime));
      }
    }
    AllPayments = AllPayments.filter(k => k.amount !== 0);
    // console.log(AllPayments);
    for (const x of AllPayments) {
      if (x.from === this.currentUser.id) {
        if (x.amount > 0) {
          this.finalOwedTab.push(x.toName + ' owes You Rs. ' + x.amount);
          this.totalOwed += x.amount;
        } else {
          this.finalOwesTab.push('You owe ' + x.toName + ' Rs. ' + (-1 * x.amount));
          this.totalOwes += (-1 * x.amount);
        }
      } else {
        if (x.amount > 0) {
          this.finalOwesTab.push('You owe ' + x.fromName + ' Rs. ' + x.amount);
          this.totalOwes += x.amount;
        } else {
          this.finalOwedTab.push(x.fromName + ' owes You Rs. ' + (-1 * x.amount));
          this.totalOwed += (-1 * x.amount);
        }
      }
    }
    this.grandTotal = this.totalOwed - this.totalOwes;
     // oninit end
  }
}
