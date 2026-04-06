import { Page } from "@playwright/test";

export default class ResourcePage {
    page: Page
    constructor(page: Page) {        
        this.page = page;
    }

    get addNewResourceButton(){
        return this.page.getByRole('button', {name: 'Add New Resource'});
    }

    async clickAddNewResourceBtn(){
        await this.addNewResourceButton.click();
    }

    get resourceContainer(){
        return this.page.getByTestId('resource-grid-container');
    }

    async goTo(projectId: string) {
        const target = `/projects/${projectId}/resources`;

        if (!this.page.url().includes(target)) {
            await this.page.goto(target, { waitUntil: 'domcontentloaded' });
        }

        await this.page.waitForURL(new RegExp(`${projectId}/resources`), {
            timeout: 10_000,
        });
    }

}