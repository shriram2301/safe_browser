// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import { Column, Grid } from 'nessie-ui';
import ButtonsLHS from 'components/AddressBar/ButtonsLHS';
import ButtonsRHS from 'components/AddressBar/ButtonsRHS';
import Input from 'components/AddressBar/Input';
import logger from 'logger';

import { Row, Col } from 'antd';
import 'antd/lib/row/style';
import 'antd/lib/col/style';

import styles from './addressBar.css';


export default class AddressBar extends Component
{
    static propTypes =
    {
        address               : PropTypes.string,
        isSelected            : PropTypes.bool,
        settingsMenuIsVisible : PropTypes.bool,
        activeTab             : PropTypes.shape( { url: PropTypes.string } ),
        windowId              : PropTypes.number.isRequired,
        isBookmarked          : PropTypes.bool.isRequired,
        addTab                : PropTypes.func.isRequired,
        addBookmark           : PropTypes.func.isRequired,
        removeBookmark        : PropTypes.func.isRequired,
        onBlur                : PropTypes.func.isRequired,
        onSelect              : PropTypes.func.isRequired,
        onFocus               : PropTypes.func.isRequired,
        reloadPage            : PropTypes.func.isRequired,
        updateActiveTab       : PropTypes.func.isRequired,
        activeTabBackwards    : PropTypes.func.isRequired,
        activeTabForwards     : PropTypes.func.isRequired,
        showSettingsMenu      : PropTypes.func.isRequired,
        hideSettingsMenu      : PropTypes.func.isRequired
    }

    static defaultProps =
    {
        address               : '',
        isSelected            : false,
        settingsMenuIsVisible : false,
        editingUrl            : false
    }

    handleBack = ( ) =>
    {
        const { activeTabBackwards } = this.props;
        activeTabBackwards();
    }

    handleForward = ( ) =>
    {
        const { activeTabForwards } = this.props;
        activeTabForwards();
    }

    handleRefresh = ( event ) =>
    {
        // TODO: if cmd or so clicked, hard.
        event.stopPropagation();
        const { reloadPage } = this.props;
        reloadPage();
    }

    getSettingsMenuItems = () =>
    {
        const { addTab } = this.props;

        const addATab = ( tab ) =>
        {
            addTab( { url: `safe-browser://${tab}`, isActiveTab: true } );
        };

        return [
            <Row
                key={ 'menuItem-bookmarks' }
                type="flex"
                justify="start"
                align="middle"
            >
                <div
                    role="menuitem"
                    tabIndex={ 0 }
                    className={ styles.menuItem }
                    onClick={
                        () => addATab( 'bookmarks' ) }
                >Bookmarks</div>
            </Row>,
            <Row
                key={ 'menuItem-history' }
                type="flex"
                justify="start"
                align="middle"
            >
                <div
                    role="menuitem"
                    tabIndex={ 0 }
                    className={ styles.menuItem }
                    onClick={
                        () => addATab( 'history' ) }
                >History</div>
            </Row>
        ];
    }


    render()
    {
        const props = this.props;

        const {
            address,
            addTab,
            addBookmark,
            removeBookmark,
            isBookmarked,
            activeTab,
            updateActiveTab,
            settingsMenuIsVisible,
            showSettingsMenu,
            hideSettingsMenu
        } = this.props;

        return (
            <div className={ `${styles.container} js-address` } >
                <Row
                    className={ styles.addressBar }
                    type="flex"
                    justify="start"
                    align="middle"
                    gutter={ { xs: 4, sm: 8, md: 12 } }
                >
                    <Col >
                        <ButtonsLHS
                            activeTab={ activeTab }
                            updateActiveTab={ updateActiveTab }
                            handleBack={ this.handleBack }
                            handleForward={ this.handleForward }
                            handleRefresh={ this.handleRefresh }
                            { ...props }
                        />

                    </Col>
                    <Col className={ styles.addressBarCol }>
                        <Input { ...this.props } />
                    </Col>
                    <Col>
                        <ButtonsRHS
                            address={ address }
                            addTab={ addTab }
                            isBookmarked={ isBookmarked }
                            addBookmark={ addBookmark }
                            removeBookmark={ removeBookmark }
                            menuItems={ this.getSettingsMenuItems() }
                            showSettingsMenu={ showSettingsMenu }
                            settingsMenuIsVisible={ settingsMenuIsVisible }
                            hideSettingsMenu={ hideSettingsMenu }
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}
