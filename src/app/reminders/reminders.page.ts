
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import axios from 'axios';


@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.page.html',
  styleUrls: ['./reminders.page.scss'],
})
export class RemindersPage implements OnInit {
  todoList = [
    { text: 'Item 1', done: false },
    { text: 'Item 2', done: false },
    { text: 'Item 3', done: false }
  ];
  newItem: string = '';
  reminderTime: Date = new Date();
  showReminder: boolean = false;
  todoItem: any;
  constructor(private modalController: ModalController) { 

  }
  async addTodoItemm(item: string) {
    this.todoList.push({ text: item, done: false });
    localStorage.setItem('todoList', JSON.stringify(this.todoList));
  }

  async deleteTodoItemm(index: number) {
    this.todoList.splice(index, 1);
    localStorage.setItem('todoList', JSON.stringify(this.todoList));
  }
  showReminderInput(item: any) {
    this.showReminder = true;
    this.todoItem = item;
  }
 
  async updateTodoItem(index: number, item: string) {
    this.todoList[index].text = item;
    localStorage.setItem('todoList', JSON.stringify(this.todoList));
  }

  async getTodoList() {
    const storedList = localStorage.getItem('todoList');
    return storedList ? JSON.parse(storedList) : [];
  }

  addTodoItem(): void {
    this.addTodoItemm(this.newItem);
    this.newItem = '';
  }

  deleteTodoItem(index: number): void {
    this.deleteTodoItemm(index);
  }
  backButtonClick() {
    this.modalController.dismiss();
  }
  ngOnInit() {
    this.getTodoList().then((list) => {
      this.todoList = list;
      this.todoList.forEach((item) => {
        item.done = !!item.done; // Ensure item.done is a boolean value
      });
    });
  }
  private saveTodoList() {
    localStorage.setItem('todoList', JSON.stringify(this.todoList));
  }

}
