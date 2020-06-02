import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserInfo} from "../../authentication/user-info.model";
import {UserService} from "../user.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  unsubscribe = new Subject<void>();
  users: UserInfo[];
  isLoading: boolean;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.loadUsers();

    this.userService.usersUpdate
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadUsers();
      })
  }

  //Use for block and unblock
  onBlock(user: UserInfo) {
    user.isBlocked = !user.isBlocked;
    this.isLoading = true;
    this.userService.updateUser(user)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
      this.isLoading = false;
    })
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.userService.deleteUser(id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
      this.isLoading = false;
    });
  }

  private loadUsers() {
    this.isLoading = true;
    this.userService.getUsers()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(users => {
        this.users = users;
        this.isLoading = false;
      })
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
