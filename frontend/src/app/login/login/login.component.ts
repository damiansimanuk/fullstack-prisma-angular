import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

interface FormModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  group: { [k in keyof FormModel]: any[] } = {
    username: [null, [Validators.required, Validators.minLength(4)]],
    password: [null, [Validators.required]]
  };

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group(this.group);
  }

  ngOnInit(): void {
    this.form.reset();
  }

  onFormSubmit() {
    if (!this.validateForm()) {
      return;
    }

    console.log(this.form.value);
    const username = this.getValue('username');
    const password = this.getValue('password');

    this.authService
      .logIn({ username, password })
      .then(() => this.onValidLogin())
      .catch((e) => this.onInvalidLogin(e));
  }

  onValidLogin() {
    console.log({
      severity: 'success',
      summary: `Bienvenido ${this.authService.user?.username}`
    });

    const redirect = this.route.snapshot.queryParams['redirect'] || '/';
    this.router.navigateByUrl(redirect);
  }

  onInvalidLogin(err: any) {
    alert('Usuario y/o contraseña incorrectos.' + err);
  }

  validateForm() {
    Object.keys(this.form.controls).forEach((key) => {
      const item = this.form?.get(key);
      if (item && item.errors) {
        item.markAsDirty();
      }
    });
    return this.form.valid;
  }

  get errors() {
    const res: { [key: string]: any } = {};
    Object.keys(this.form.controls).forEach((key) => {
      const item = this.form.get(key);
      if (item && item.errors) {
        res[key] = item.errors;
      }
    });
    return res;
  }

  N(key: keyof FormModel) {
    return key;
  }

  getControl(key: keyof FormModel) {
    return this.form?.controls[key] as FormControl;
  }

  getValue<K extends keyof FormModel>(key: K) {
    return <FormModel[K]>(this.form?.controls[key].value ?? undefined);
  }
}
