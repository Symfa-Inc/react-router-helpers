import React from 'react';

describe('title in route', () => {
  describe('click on the same link', () => {
    it('with absolute path', () => {
      cy.visit('http://localhost:3006/child/1234').then(() => {
        cy.title().should('eq', 'Child2 - Title');

        cy.get('#absolute-link-to-second-child').click();
        cy.wait(1);

        cy.title().should('eq', 'Child2 - Title');
      });
    });

    it('with relative path', () => {
      cy.visit('http://localhost:3006/child/1234').then(() => {
        cy.title().should('eq', 'Child2 - Title');

        cy.get('#relative-link-to-second-child').click();
        cy.wait(1);

        cy.title().should('eq', 'Child2 - Title');
      });
    });
  });

  describe('navigation between children', () => {
    it('hit parent page, click to child1, click to child2 title should be set correctly', () => {
      cy.visit('http://localhost:3006/').then(() => {
        cy.title().should('eq', 'Home - Title');

        cy.get('#link-to-first-child').click();
        cy.wait(1);

        cy.title().should('eq', 'Child1 - Title');

        cy.get('#absolute-link-to-second-child').click();
        cy.wait(1);

        cy.title().should('eq', 'Child2 - Title');
      });
    });
  });
});
