import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest, VerifyEmailRequest } from '../../models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-wrapper">
        <div class="auth-card card">
          <div class="auth-header">
            <h1 class="auth-title">TaskManager Pro</h1>
            <p class="auth-subtitle"> </p>
          </div>

          <div class="auth-tabs">
            <button 
              class="tab-button" 
              [class.active]="currentMode === 'login'"
              (click)="setMode('login')">
              Login
            </button>
            <button 
              class="tab-button" 
              [class.active]="currentMode === 'register'"
              (click)="setMode('register')">
              Sign Up
            </button>
            <button 
              class="tab-button" 
              [class.active]="currentMode === 'verify'"
              (click)="setMode('verify')"
              *ngIf="showVerifyTab">
              Verify Email
            </button>
          </div>

          <div class="auth-form-container">
            <!-- Login Form -->
            <div *ngIf="currentMode === 'login'" class="auth-form fade-in">
              <form (ngSubmit)="onLogin()" #loginForm="ngForm">
                <div class="form-group">
                  <label for="loginEmail">Email Address</label>
                  <input
                    type="email"
                    id="loginEmail"
                    class="form-control"
                    [(ngModel)]="loginData.email"
                    name="email"
                    required
                    email
                    placeholder="Enter your email"
                  />
                </div>

                <div class="form-group">
                  <label for="loginPassword">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    class="form-control"
                    [(ngModel)]="loginData.password"
                    name="password"
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <div *ngIf="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn-primary auth-btn"
                  [disabled]="!loginForm.valid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
              </form>
            </div>

            <!-- Register Form -->
            <div *ngIf="currentMode === 'register'" class="auth-form fade-in">
              <form (ngSubmit)="onRegister()" #registerForm="ngForm">
                <div class="form-group">
                  <label for="registerUsername">Username</label>
                  <input
                    type="text"
                    id="registerUsername"
                    class="form-control"
                    [(ngModel)]="registerData.username"
                    name="username"
                    required
                    minlength="3"
                    placeholder="Choose a username"
                  />
                </div>

                <div class="form-group">
                  <label for="registerEmail">Email Address</label>
                  <input
                    type="email"
                    id="registerEmail"
                    class="form-control"
                    [(ngModel)]="registerData.email"
                    name="email"
                    required
                    email
                    placeholder="Enter your email"
                  />
                </div>

                <div class="form-group">
              <label for="registerPassword">Password</label>
              <input
              type="password"
              id="registerPassword"
              class="form-control"
              [(ngModel)]="registerData.password"
              name="password"
              required
              placeholder="Create a password"
              (input)="validatePassword()"
              />
              <div class="password-requirements" *ngIf="!isPasswordValid && registerData.password">
              <small class="password-hint text-danger">
                Password must contain at least 8 characters, 1 uppercase letter, and 1 symbol
              </small>
            </div>
            </div>


                <div *ngIf="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn-primary auth-btn"
                  [disabled]="!registerForm.valid || !isPasswordValid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </form>
            </div>

            <!-- Email Verification Form -->
            <div *ngIf="currentMode === 'verify'" class="auth-form fade-in">
              <div class="verification-info">
                <div class="verification-icon">📧</div>
                <h3>Verify Your Email</h3>
                <p>We've sent a 4-digit verification code to:</p>
                <p class="email-highlight"><strong>{{ pendingEmail }}</strong></p>
                <p class="verification-note">Check your inbox and enter the code below to complete your registration.</p>
                <p class="verification-sender">📨 Sent from: taskmanagerai&#64;gmail.com</p>
              </div>

              <form (ngSubmit)="onVerifyEmail()" #verifyForm="ngForm">
                <div class="form-group">
                  <label for="verificationCode">Verification Code</label>
                  <input
                    type="text"
                    id="verificationCode"
                    class="form-control verification-input"
                    [(ngModel)]="verifyData.verificationCode"
                    name="verificationCode"
                    required
                    pattern="[0-9]{4}"
                    maxlength="4"
                    placeholder="Enter 4-digit code"
                    (input)="formatVerificationCode($event)"
                  />
                </div>

                <div *ngIf="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <button
                  type="submit"
                  class="btn-primary auth-btn"
                  [disabled]="!verifyForm.valid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Verifying...' : 'Verify Email' }}
                </button>

                <div class="resend-section">
                  <p class="resend-text">Didn't receive the code?</p>
                  <button
                    type="button"
                    class="resend-btn"
                    (click)="resendCode()"
                    [disabled]="isResending || resendCooldown > 0"
                  >
                    <span *ngIf="isResending" class="spinner"></span>
                    {{ getResendButtonText() }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #000000 100%);
      position: relative;
      overflow: hidden;
      overflow-y: auto;
    }

    .auth-container.verification-mode {
      align-items: flex-start;
      padding-top: 20px;
    }

    .auth-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 80%, rgba(74, 144, 226, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(123, 104, 238, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="0.8" fill="white" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="4s" repeatCount="indefinite"/></circle><circle cx="80" cy="30" r="0.4" fill="white" opacity="0.4"><animate attributeName="opacity" values="0.4;0.1;0.4" dur="5s" repeatCount="indefinite"/></circle><circle cx="40" cy="60" r="0.6" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite"/></circle><circle cx="70" cy="80" r="0.5" fill="white" opacity="0.3"><animate attributeName="opacity" values="0.3;0.1;0.3" dur="4.5s" repeatCount="indefinite"/></circle><circle cx="10" cy="70" r="0.3" fill="white" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite"/></circle><circle cx="90" cy="10" r="0.5" fill="white" opacity="0.4"><animate attributeName="opacity" values="0.4;0.1;0.4" dur="3.5s" repeatCount="indefinite"/></circle><circle cx="30" cy="90" r="0.4" fill="white" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite"/></circle><circle cx="60" cy="40" r="0.4" fill="white" opacity="0.3"><animate attributeName="opacity" values="0.3;0.1;0.3" dur="3.2s" repeatCount="indefinite"/></circle></svg>') repeat;
      pointer-events: none;
      z-index: 1;
      animation: twinkle 15s ease-in-out infinite;
    }

    @keyframes twinkle {
      0%, 100% { 
        transform: translateY(0px) scale(1);
        opacity: 1;
      }
      25% { 
        transform: translateY(-5px) scale(1.02);
        opacity: 0.8;
      }
      50% { 
        transform: translateY(-10px) scale(1.05);
        opacity: 0.6;
      }
      75% { 
        transform: translateY(-5px) scale(1.02);
        opacity: 0.8;
      }
    }

    .auth-wrapper {
      width: 100%;
      max-width: 450px;
      position: relative;
      z-index: 10;
      margin: auto;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: slideInUp 0.8s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .auth-card {
      padding: 40px;
      text-align: center;
      background: 
        linear-gradient(145deg, rgba(30, 30, 45, 0.98) 0%, rgba(20, 20, 35, 0.95) 100%);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(100, 255, 218, 0.2);
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(100, 255, 218, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      max-height: 90vh;
      overflow-y: auto;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .auth-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        #64ffda 25%, 
        #9c27b0 50%, 
        #64ffda 75%, 
        transparent 100%);
      border-radius: 15px 15px 0 0;
      animation: shimmer 3s ease-in-out infinite;
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .auth-card:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(100, 255, 218, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .auth-card::-webkit-scrollbar {
      width: 6px;
    }

    .auth-card::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .auth-card::-webkit-scrollbar-thumb {
      background: rgba(100, 255, 218, 0.3);
      border-radius: 10px;
    }

    .auth-header {
      margin-bottom: 30px;
      position: relative;
    }

    .auth-title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      text-shadow: 0 0 20px rgba(74, 144, 226, 0.2);
    }

    .auth-subtitle {
      color: #b0b0b0;
      font-size: 16px;
      font-weight: 300;
      letter-spacing: 0.5px;
    }

    .auth-tabs {
      display: flex;
      margin-bottom: 30px;
      border-radius: 25px;
      overflow: hidden;
      border: 2px solid rgba(74, 144, 226, 0.3);
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      flex-wrap: wrap;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .tab-button {
      flex: 1;
      min-width: 80px;

      padding: 12px 20px;
      border: none;
      background: transparent;
      color: #b0b0b0;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 14px;
      position: relative;
      overflow: hidden;
    }

    .tab-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.1), transparent);
      transition: left 0.5s ease;
    }

    .tab-button:hover::before {
      left: 100%;
    }

    .tab-button:hover {
      color: #4a90e2;
      background: rgba(74, 144, 226, 0.05);
    }

    .tab-button.active {
      background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
      color: #1a1a2e;
      box-shadow: 
        0 4px 15px rgba(74, 144, 226, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .verification-info {
      text-align: center;
      margin-bottom: 20px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(123, 104, 238, 0.1) 100%);
      border-radius: 25px;
      border: 2px solid rgba(74, 144, 226, 0.2);
      max-width: 100%;
      box-sizing: border-box;
    }

    .verification-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .verification-info h3 {
      color: #fff;
      margin-bottom: 6px;
      font-weight: 600;
      font-size: 18px;
    }

    .verification-info p {
      color: #b0b0b0;
      margin-bottom: 4px;
      line-height: 1.5;
      font-size: 13px;
    }

    .email-highlight {
      background: rgba(74, 144, 226, 0.2);
      padding: 4px 8px;
      border-radius: 15px;
      color: #4a90e2 !important;
      font-weight: 600;
      margin: 6px 0;
      word-break: break-all;
      font-size: 12px;
      display: inline-block;
      max-width: 100%;
      overflow-wrap: break-word;
    }

    .verification-note {
      font-size: 12px;
      font-style: italic;
      color: #ccc !important;
    }

    .verification-sender {
      font-size: 10px;
      color: #888 !important;
      margin-top: 8px;
      border-color: #4a90e2;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
    }

    .verification-input {
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 4px;
      padding: 12px;
    }

    .resend-section {
      text-align: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .resend-text {
      color: #b0b0b0;
      font-size: 12px;
      margin-bottom: 6px;
    }

    .resend-btn {
      background: none;
      border: none;
      color: #4a90e2;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin: 0 auto;
    }

    .resend-btn:disabled {
      color: #666;
      cursor: not-allowed;
      text-decoration: none;
    }

    .auth-form-container {
      text-align: left;
      min-height: auto;
    }

    .auth-form {
      animation: fadeIn 0.3s ease-in;
    }

    .form-group {
      margin-bottom: 18px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #e0e0e0;
      font-size: 14px;
      letter-spacing: 0.3px;
    }

    .auth-btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(135deg, #4a90e2 0%, #7b68ee 100%);
      border: none;
      border-radius: 25px;
      color: #1a1a2e;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
    }

    .auth-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .auth-btn:hover::before {
      left: 100%;
    }

    .auth-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
    }

    .password-requirements {
      margin-top: 8px;
    }

    .password-hint {
      color: #ff6b6b;
      font-size: 12px;
      font-weight: 500;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-height: 700px) {
      .auth-container {
        align-items: flex-start;
        padding: 15px 20px;
      }
      
      .auth-card {
        padding: 25px;
        margin: 0;
        max-height: 85vh;
      }
      
      .verification-info {
        padding: 8px;
        margin-bottom: 12px;
      }
      
      .verification-icon {
        font-size: 28px;
        margin-bottom: 6px;
      }
      
      .verification-info h3 {
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .verification-info p {
        font-size: 11px;
        margin-bottom: 3px;
      }
      
      .email-highlight {
        padding: 3px 6px;
        font-size: 11px;
        margin: 4px 0;
      }
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 10px 15px;
        align-items: flex-start;
      }
      
      .auth-wrapper {
        max-width: 100%;
      }
      
      .auth-card {
        padding: 20px;
        margin: 0;
        max-height: 90vh;
      }
      
      .auth-title {
        font-size: 24px;
      }
      
      .tab-button {
        padding: 10px 15px;
        font-size: 13px;
      }
      
      .verification-info {
        padding: 10px;
        margin-bottom: 15px;
      }
      
      .verification-input {
        font-size: 16px;
        letter-spacing: 3px;
        padding: 10px;
      }
      
      .email-highlight {
        font-size: 10px;
        word-break: break-all;
        padding: 2px 4px;
      }
    }

    @media (max-height: 600px) {
      .auth-container {
        padding: 10px;
      }
      
      .auth-card {
        padding: 15px;
        max-height: 95vh;
      }
      
      .auth-header {
        margin-bottom: 20px;
      }
      
      .auth-title {
        font-size: 22px;
      }
      
      .verification-info {
        padding: 8px;
        margin-bottom: 10px;
      }
      
      .verification-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }
      
      .verification-info h3 {
        font-size: 14px;
        margin-bottom: 3px;
      }
      
      .verification-info p {
        font-size: 10px;
        margin-bottom: 2px;
      }
      
      .email-highlight {
        font-size: 9px;
        padding: 2px 4px;
        margin: 2px 0;
      }
      
      .verification-sender {
        font-size: 8px;
        margin-top: 4px;
        padding-top: 4px;
      }
      
      .form-group {
        margin-bottom: 12px;
      }
      
      .auth-btn {
        padding: 10px;
        font-size: 14px;
        margin-top: 10px;
      }
    }
  `]
})
export class AuthComponent implements OnInit, OnDestroy {
  currentMode: 'login' | 'register' | 'verify' = 'login';
  showVerifyTab = false;
  isLoading = false;
  isResending = false;
  isPasswordValid = false;
  errorMessage = '';
  pendingEmail = '';
  resendCooldown = 0;
  private resendTimer: any;

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: ''
  };

  verifyData: VerifyEmailRequest = {
    email: '',
    verificationCode: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Disable scroll when this component is shown
    document.body.classList.add('noscroll');
  }

  setMode(mode: 'login' | 'register' | 'verify'): void {
    this.currentMode = mode;
    this.errorMessage = '';
    this.resetForms();
  }

  resetForms(): void {
    this.loginData = { email: '', password: '' };
    this.registerData = { username: '', email: '', password: '' };
    this.verifyData = { email: '', verificationCode: '' };
  }

  validatePassword(): void {
    this.isPasswordValid = this.authService.validatePassword(this.registerData.password);
  }

  formatVerificationCode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    this.verifyData.verificationCode = value;
    event.target.value = value;
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  onRegister(): void {
    if (!this.isPasswordValid) {
      this.errorMessage = 'Password does not meet requirements.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.token === 'VERIFICATION_REQUIRED') {
          this.pendingEmail = this.registerData.email;
          this.verifyData.email = this.registerData.email;
          this.showVerifyTab = true;
          this.setMode('verify');
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  onVerifyEmail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Ensure email is set properly
    if (!this.verifyData.email) {
      this.verifyData.email = this.pendingEmail;
    }

    console.log('Verification request:', this.verifyData); // Debug log
    this.authService.verifyEmail(this.verifyData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Verification error:', error); // Debug log
        this.errorMessage = error.error?.message || 'Verification failed. Please try again.';
      }
    });
  }

  resendCode(): void {
    this.isResending = true;
    this.errorMessage = '';

    this.authService.resendVerificationCode({ email: this.pendingEmail }).subscribe({
      next: () => {
        this.isResending = false;
        this.startResendCooldown();
      },
      error: (error) => {
        this.isResending = false;
        this.errorMessage = error.error?.message || 'Failed to resend code. Please try again.';
      }
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60; // 60 seconds cooldown
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  getResendButtonText(): string {
    if (this.isResending) {
      return 'Sending...';
    }
    if (this.resendCooldown > 0) {
      return `Resend in ${this.resendCooldown}s`;
    }
    return 'Resend Code';
  }

  ngOnDestroy(): void {
    document.body.classList.remove('noscroll');
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }
}