import { Locator, Page } from "@playwright/test";

export default class ProjectPage{
    page: Page;
    addProjectBtn: Locator

    constructor(page: Page) {
        this.page = page;
        this.addProjectBtn = page.getByRole('button', {name: 'Add New Project'});
    }

    get projectGridContainer(){
        return this.page.getByTestId('project-grid-container');
    }
    
    async goTo() {
        if (!this.page.url().includes('/projects')) {
            await this.page.goto('/projects', { waitUntil: 'domcontentloaded' });
        }
        await this.page.waitForURL(/\/projects$/, { timeout: 10_000 });
    }

    async clickAddNewProjectBtn(){
        await this.addProjectBtn.click();
    }
}