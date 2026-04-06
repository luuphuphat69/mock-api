import { Page } from "@playwright/test";

export default class ProjectCard {
    page: Page
    selectedProjectPosition = 0;

    constructor(page: Page) {
        this.page = page
    }
    get projectName() {
        return this.page.getByTestId('project-name').nth(this.selectedProjectPosition);
    }

    get projectVersion() {
        return this.page.getByTestId('project-version').nth(this.selectedProjectPosition);
    }

    get editProjectBtn() {
        return this.page.getByRole('button', { name: 'Edit' }).nth(this.selectedProjectPosition);
    }

    get deleteProjectBtn(){
        return this.page.getByRole('button', {name: 'Delete'}).nth(this.selectedProjectPosition);
    }

    setSelectedProjectPosition(position: number) {
        if (position < 0) throw new Error('position cannot be negative');
        this.selectedProjectPosition = position;
    }

    async clickEditProject() {
        await this.editProjectBtn.click();
    }

    async clickDeleteProject(){
        await this.deleteProjectBtn.click();
    }
}