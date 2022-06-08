import React from 'react';

describe('title in route', () => {
  describe('click on the same link', () => {
    it('with absolute path', () => {
      cy.visit('http://localhost:3006/child/1234').then(() => {
        cy.title().should('eq', '2 test title');

        cy.get('#absolute-link-to-second-child').click();
        cy.wait(1);

        cy.title().should('eq', '2 test title');
      });
    });

    it('with relative path', () => {
      cy.visit('http://localhost:3006/child/1234').then(() => {
        cy.title().should('eq', '2 test title');

        cy.get('#relative-link-to-second-child').click();
        cy.wait(1);

        cy.title().should('eq', '2 test title');
      });
    });
  });
});
