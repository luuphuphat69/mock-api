import { Locator, Page } from "@playwright/test";
import {vercelAuthQueryParams} from '../../utilities/common'

export default class LoginPage{
    page: Page;
    emailInput: Locator;
    passwordInput: Locator;
    loginBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        this.loginBtn = page.getByRole('button', {name: 'Sign in'});
    }
    async goTo(){
        await this.page.goto('/login?' + vercelAuthQueryParams);
    }

    async fillEmail(email: string){
        await this.emailInput.fill(email)
    }

    async fillPassword(password: string){
        await this.passwordInput.fill(password);
    }

    async submitLoginBtn(){
        await this.loginBtn.click();
    }
}