import { expect, test } from "@playwright/test";
import ProjectPage from "../../../page-model/projects/Project";
import ProjectPopup from "../../../page-model/projects/components-model/ProjectPopup";
import ProjectCard from "../../../page-model/projects/components-model/ProjectCard";
import ConfirmDelete from "../../../page-model/projects/components-model/ConfirmDelete";

let selectedProjectPosition = 1
let updateData = { name: 'test-is-update', version: '/v1' }

test.describe('Projects CRUD', () => {
    test('Create project', async ({ page }) => {
        const insertedData = { name: 'test', version: '/v0' }

        const projectPage = new ProjectPage(page);
        const projectPopup = new ProjectPopup(page, false);

        await projectPage.goTo()
        const projects = projectPage.projectGridContainer.getByTestId('project-name');

        // wait for data render
        await expect(projects.first()).toBeVisible();
        const totalBefore = await projects.count();

        await projectPage.clickAddNewProjectBtn();
        await expect(projectPopup.popup).toBeVisible();
        await projectPopup.fillProjectName(insertedData.name);
        await projectPopup.fillApiVersion(insertedData.version);
        await projectPopup.submit();
        await expect(projectPopup.popup).toBeHidden();
        await expect(projects).toHaveCount(totalBefore + 1);
    }),

    test('Update (n)th project', async ({ page }) => {

        const projectPage = new ProjectPage(page);
        const projectCard = new ProjectCard(page)
        const projectPopup = new ProjectPopup(page, true);

        // Go to Project page
        await projectPage.goTo()

        // Choose selected project and click edit button on project card
        projectCard.setSelectedProjectPosition(selectedProjectPosition);
        await projectCard.clickEditProject();
        await expect(projectPopup.popup).toBeVisible();

        // After popup shown up, then fill out infos
        await projectPopup.fillProjectName(updateData.name);
        await projectPopup.fillApiVersion(updateData.version);
        await projectPopup.submit();

        await expect(projectCard.projectName).toHaveText(updateData.name, { useInnerText: true })
        await expect(projectCard.projectVersion).toHaveText(updateData.version, { useInnerText: true })
    })

    test('Delete nth project', async ({ page }) => {
        const projectPage = new ProjectPage(page);
        const projectCard = new ProjectCard(page);
        const confirmDelete = new ConfirmDelete(page);

        projectCard.setSelectedProjectPosition(selectedProjectPosition);
        await projectPage.goTo();

        const projects = projectPage.projectGridContainer.getByTestId('project-name');

        // wait for data render
        await expect(projects.first()).toBeVisible();
        const totalBefore = await projects.count();

        await projectCard.clickDeleteProject();
        await expect(confirmDelete.popup).toBeVisible();

        await confirmDelete.clickDeleteButton();
        await expect(projects).toHaveCount(totalBefore - 1);
    });
})