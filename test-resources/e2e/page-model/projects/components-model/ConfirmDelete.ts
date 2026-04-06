import { Locator, Page } from "@playwright/test";

export default class ConfirmDelete{
    page: Page
    popup: Locator
    constructor(page: Page) {
        this.page = page
        this.popup = page.getByTestId('confirm-delete-project')
    }
    
    get deleteButton(){
        return this.popup.getByRole('button', {name: "Delete"});   
    }

    async clickDeleteButton(){
        await this.deleteButton.click();
    }
}