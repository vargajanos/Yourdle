import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-forgotten-password',
  imports: [Dialog, FormsModule, ButtonModule, InputTextModule, ToastModule, CommonModule],
  templateUrl: './forgotten-password.component.html',
  styleUrl: './forgotten-password.component.scss',
  providers: [MessageService]
})
export class ForgottenPasswordComponent {
  static instance: ForgottenPasswordComponent;

  email: string = "";
  visible: boolean = false;

  constructor(private api: ApiService, private messageService: MessageService) {
    ForgottenPasswordComponent.instance = this;
  }
 
  

  ForgottenPassword() {
    if (!this.validateEmail(this.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Hiba',
        detail: 'Rossz email cím!'
      });
      return;
    }
    this.api.read('users', 'email', 'eq', this.email).subscribe((res: any) => {
      if (res.length == 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Hiba',
          detail: 'Nincs ilyen email cím az adatbázisban!'
        });
        return;
      }
      
      // Generate reset token for 30 minute expiration with Budapest time
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Use the updateResetToken method that handles time correctly
      this.api.updateResetToken(res[0].id, resetToken).subscribe((updateRes: any) => {
        let data = {
          email: this.email,
          content: `http://localhost:4200/restorepass/${res[0].id}/${resetToken}`
        };
        
        this.api.forgottPassword(data).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sikeres jelszó emlékeztető kérés',
                detail: res.message
              });
              this.closeDialog();
              this.openLoginDialog();
            }
            else {
              this.messageService.add({
                severity: 'error',
                summary: 'Hiba',
                detail: res.message
              });
            }
          },
          error: (err) => {
            const errorMsg = err.error?.message || "Ismeretlen hiba történt.";
            this.messageService.add({
              severity: 'error',
              summary: 'Hiba',
              detail: errorMsg
            });
          }
        });
      });
    });
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showDialog(){
    this.visible = true;
  }

  closeDialog(){
    this.visible = false;
    this.email = "";
  }

  openLoginDialog() {
      if (LoginComponent.instance) {
        LoginComponent.instance.showDialog();
      }
    }

}
