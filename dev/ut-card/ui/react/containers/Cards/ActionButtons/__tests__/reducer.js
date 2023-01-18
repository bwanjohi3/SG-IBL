/* global it, describe, expect */
import {cardManagementActionButtons, defaultStateImmutable} from '../reducer.js';
import {actionsList} from '../actions.js';

describe('A suite for <ByTemplate /> Container', function() {
    it('should return the initial state', function() {
        expect(cardManagementActionButtons(undefined, {})).toEqual(defaultStateImmutable);
    });

    it('should handle actionsList.SET_CURRENT_ACTION', function() {
        expect(
            cardManagementActionButtons(undefined, {
                type: actionsList.SET_CURRENT_ACTION,
                params: {
                    action: 'action'
                }
            }))
            .toEqual(defaultStateImmutable.set('currentAction', 'action'));
    });
});
