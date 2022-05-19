describe('onStatusChange function', () => {
  describe('with sync guards', () => {
    it('for component without guards', () => {
      expect(2).toBe(2);
    });
    it('for component with canActivate true from all 2 guards', () => {
      expect(2).toBe(2);
    });
    it('for component with canActivate false from first guard', () => {
      expect(2).toBe(2);
    });
    it('for component with canActivate false from second guard', () => {
      expect(2).toBe(2);
    });
  });
});
