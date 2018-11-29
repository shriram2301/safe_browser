import React from 'react';
import { shallow } from 'enzyme';

import AddressBarButtonsRHS from 'components/AddressBar/ButtonsRHS';

import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

jest.mock( 'extensions/safe/actions/safeBrowserApplication_actions' );

describe( 'AddressBarButtonsRHS', () =>
{
    let wrapper;
    let instance;
    let props;
    let store;

    beforeEach( () =>
    {
        props = {
            windowId           : 1,
            address            : 'about:blank',
            isSelected         : false,
            isBookmarked       : false,
            addBookmark        : jest.fn(),
            removeBookmark     : jest.fn(),
            activeTabBackwards : jest.fn(),
            activeTabForwards  : jest.fn(),
            updateActiveTab    : jest.fn(),
            onBlur             : jest.fn(),
            onSelect           : jest.fn(),
            onFocus            : jest.fn(),
            reloadPage         : jest.fn(),
            activeTab          : { isLoading: false }
        };
    } );

    describe( 'constructor( props )', () =>
    {
        beforeEach( () =>
        {
            store = mockStore( props );

            wrapper = shallow(
                <Provider store={ store } >
                    <AddressBarButtonsRHS { ...props } />
                </Provider> ).dive();
            instance = wrapper.instance();
        } );

        it( 'should have name AddressBarButtonsRHS', () =>
        {
            expect( instance.constructor.name ).toMatch( 'ButtonsRHS' );
        } );
    } );
} );
