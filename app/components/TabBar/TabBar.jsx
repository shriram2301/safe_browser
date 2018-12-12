
// @flow
import { remote } from 'electron';
import url from 'url';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './tabBar.css';
import logger from 'logger';
import { isInternalPage } from 'utils/urlHelpers';
import { CLASSES, INTERNAL_PAGES } from 'appConstants';
import { Column, Spinner, Row } from 'nessie-ui';
import { Col, Button,Icon } from 'antd';
import 'antd/lib/row/style';
import 'antd/lib/col/style';
import 'antd/lib/button/style';

export default class TabBar extends Component
{
    static propTypes =
    {
        tabInFocus       : PropTypes.number.isRequired,
        tabs             : PropTypes.array.isRequired,
        setActiveTab     : PropTypes.func.isRequired,
        addTab           : PropTypes.func.isRequired,
        closeTab         : PropTypes.func.isRequired,
        selectAddressBar : PropTypes.func.isRequired
    }

    static defaultProps =
    {
        tabInFocus : 0,
        tabs       : []
    }


    constructor( props )
    {
        super( props );
        this.state =
        {
            tabInFocus : 0 // to update when many tabs can exist
        };

        this.handleAddTabClick = ::this.handleAddTabClick;
    }


    handleTabClick( tabData, event )
    {
        event.stopPropagation();

        this.props.setActiveTab( { index: tabData.tabIndex, url: event.target.value } );
    }

    handleTabClose( tabData, event )
    {
        event.stopPropagation();

        const { closeTab } = this.props;

        closeTab( { index: tabData.tabIndex } );
    }

    handleAddTabClick( event )
    {
        event.stopPropagation();

        const { addTab, selectAddressBar } = this.props;
        const newTabUrl = 'about:blank';
        event.preventDefault();
        addTab( { url: newTabUrl, isActiveTab: true, windowId: remote.getCurrentWindow().webContents.id } );
        selectAddressBar();
    }

    getTabs = ( ) =>
    {
        const { tabs } = this.props;

        return tabs.map( ( tab, i ) =>
        {
            let title = tab.title;

            if ( isInternalPage( tab ) )
            {
                // TODO: DRY this out with TabContents.jsx
                const urlObj = url.parse( tab.url );
                switch ( urlObj.host )
                {
                    case INTERNAL_PAGES.HISTORY :
                    {
                        title = 'History';
                        break;
                    }
                    case INTERNAL_PAGES.BOOKMARKS :
                    {
                        title = 'Bookmarks';
                        break;
                    }
                    default :
                    {
                        title = null;
                        break;
                    }
                }
            }

            if ( tab.isClosed )
            {
                return;
            }

            const isActiveTab = tab.isActiveTab;
            let tabStyleClass = styles.tab;
            const tabData = { key: tab.index, tabIndex: tab.index, url: tab.url };

            if ( isActiveTab )
            {
                tabStyleClass = `${styles.activeTab} ${CLASSES.ACTIVE_TAB}`;
            }


            return ( <div
                key={ tab.index }
                className={ `${tabStyleClass} ${CLASSES.TAB}` }
                onClick={ this.handleTabClick.bind( this, tabData ) }
            >

                <Row verticalAlign="middle" gutters="S">
                    <Column align="left" className={ styles.favicon }>
                        {tab.isLoading &&
                            <Spinner size="small" />
                        }
                        {!tab.isLoading && tab.favicon &&
                            <img alt="" id="favicon-img" src={ tab.favicon } />
                        }
                    </Column>
                    <Column className={ styles.tabText } align="left">
                        { title || 'New Tab' }
                    </Column>
                    <Column align="right" className={ styles.favicon }>
                        <Button
                            className={ `${styles.favicon} ${CLASSES.CLOSE_TAB}` }
                            onClick={ this.handleTabClose.bind( this, tabData ) }
                            icon="close"
                            shape="circle"
                            block="true"
                            size="small"
                        />
                    </Column>
                </Row>
            </div> );
        } );
    }

    render()
    {
        return (
            <div className={ styles.container }>
                <div className={ styles.tabBar }>
                    {
                        this.getTabs()
                    }
                    <div className={ `${styles.favicon} ${CLASSES.ADD_TAB}` }>
                        <Button
                            onClick={ this.handleAddTabClick.bind( this ) }
                            className={ styles.tabAddButton }
                            title="New Tab"
                            icon="plus"
                            size="small"
                            shape="circle"
                            block="true"
                        />
                    </div>
                </div>
            </div>
        );
    }
}
