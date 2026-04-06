import { Locator, Page } from "@playwright/test";

export default class ResourceCard{
    page: Page
    selectedCardPosition = 0;
    
    constructor(page: Page) {
        this.page = page
    }

    get card(){
        return this.page.getByTestId('resource-card').nth(this.selectedCardPosition);
    }

    get editButton(){
        return this.card.getByTestId('edit-resource-button').nth(this.selectedCardPosition)
    }

    get deleteButton(){
        return this.card.getByTestId('delete-resource-button').nth(this.selectedCardPosition);
    }

    setSelectedCardPosition(pos: number){
        this.selectedCardPosition = pos;
    }
}