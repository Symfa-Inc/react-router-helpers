import React from 'react';


describe('lazy loading complex test', () => {
  describe('lazy loading status should be changed if internet speed too slow', () => {
    it('for parent', () => {
      cy.visit('http://localhost:3006').then(() => {
        cy.get('#rerender-counter').should('have.text', 'Counter = 1');
        cy.get('#guard-statuses').should('have.text', 'Guards = 1');
        cy.get('#resolver-statuses').should('have.text', 'Resolvers = 0');
        cy.get('#lazy-loading-statuses').should('have.text', 'Lazy Loading = 0');

        cy.wait(1200);

        cy.get('#rerender-counter').should('have.text', 'Counter = 1');
        cy.get('#guard-statuses').should('have.text', 'Guards = 1, 2');
        cy.get('#resolver-statuses').should('have.text', 'Resolvers = 0, 1, 2');
        cy.get('#lazy-loading-statuses').should('have.text', 'Lazy Loading = 0, 1, 2');

      });
    });
  });

  describe('if guard returns canActivate = false, lazy component should not be loaded', () => {
    it('for child', () => {
      let interceptFlag = false;
      cy.intercept('http://localhost:3006/static/js/src_lazy-components_LazyChild_tsx.chunk.js', (req) => {
        interceptFlag = true;
      })
      cy.visit('http://localhost:3006/child').then(() => {


        cy.wait(1200);

        cy.wrap(interceptFlag).should('eq', false);

      });
    });
  });
});
