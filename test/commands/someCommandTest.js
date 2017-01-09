/**
 * Created by sgreenwo on 12/25/16.
 */

import 'babel-polyfill';
import chai from 'chai';
chai.should();

describe('someCommand', () => {

    before(() => {
    });

    describe('#someMethd', () => {
        it('should work', () => {
            const a = [1, 2, 3, 4];
            a.should.have.length(4);
        });
    })
});
