import React, { Component } from 'react';
// import styles from './browser.css';
import { CLASSES, isRunningSpectronTestProcess, startedRunningMock } from 'appConstants';
import { SAFE } from 'extensions/safe/constants';
import { Row,Column, IconButton, Grid, Spinner } from 'nessie-ui';
import _ from 'lodash';
import logger from 'logger';
import styles from './webIdButtons.css';

const hideDropdownTimeout = 0.15; // seconds
const webIdManagerUri = startedRunningMock ? 'http://localhost:1234' : 'safe://webidmgr.dapp';
const authHomeUri = 'safe-auth://home';

export default class WebIdDropdown extends Component
{
    static defaultProps =
    {
        safeBrowserApp : {
            webIds : []
        }
    }

    constructor( props )
    {
        super( props );

        const { getAvailableWebIds } = props;

        if ( !getAvailableWebIds ) return;

        this.debouncedGetWebIds = _.debounce( getAvailableWebIds, 500 );
    }

    handleIdClick = ( webId ) =>
    {
        const { updateActiveTab, windowId, showWebIdDropdown } = this.props;
        // also if only 1 webID? mark as defualt?
        updateActiveTab( { windowId, webId } );
    }

    handleIdButtonClick = ( ) =>
    {
        const { showWebIdDropdown } = this.props;
        this.hoverTime = new Date();
        showWebIdDropdown( true );
    }


    handleMouseEnter = ( ) =>
    {
        this.hoverTime = new Date().getTime();
        this.isMouseOverIdButton = true;

        const { getAvailableWebIds, safeBrowserApp } = this.props;
        const { isFetchingWebIds } = safeBrowserApp;

        if ( safeBrowserApp.appStatus === SAFE.APP_STATUS.AUTHORISED && !isFetchingWebIds )
        {
            this.debouncedGetWebIds();
        }
    }

    launchWebIdManager = () =>
    {
        const { addTab } = this.props;

        addTab( { url: webIdManagerUri, isActiveTab: true } );
    }

    launchAuthenticator = () =>
    {
        const { addTab } = this.props;

        addTab( { url: authHomeUri, isActiveTab: true } );
    }


    authorisePeruse = () =>
    {
        const { setAppStatus } = this.props;
        console.log( setAppStatus );
        setAppStatus( SAFE.APP_STATUS.TO_AUTH );
    }

    handleMouseLeave = ( ) =>
    {
        this.isMouseOverIdButton = false;

        setTimeout( this.closeIfNotOver, hideDropdownTimeout * 1000 );
    }

    closeIfNotOver = () =>
    {
        const { showWebIdDropdown } = this.props;

        const now = new Date().getTime();
        const diff = ( now - this.hoverTime ) / 1000;

        if ( diff > hideDropdownTimeout )
        {
            showWebIdDropdown( false );
        }
    }


    render()
    {
        const { safeBrowserApp, activeTab } = this.props;
        const {
            showingWebIdDropdown
            , webIds
            , experimentsEnabled
            , appStatus
            , networkStatus
            , isFetchingWebIds
        } = safeBrowserApp;

        const activeWebId = activeTab.webId || {};

        const handleIdClick = this.handleIdClick;
        const webIdsList = webIds.map( webId =>
        {
            const nickname = webId['#me'].nick || webId['#me'].name;

            const isSelected = webId['@id'] === activeWebId['@id'];

            if ( isSelected )
            {
                return (
                    <li
                        onClick={ handleIdClick.bind( this, webId ) }
                        key={ webId['@id'] }
                        className={ styles.selectedWebId }
                    >{ nickname }
                    </li>
                );
            }

            return ( <li
                onClick={ handleIdClick.bind( this, webId ) }
                key={ webId['@id'] }
                className={ styles.webId }
            >
                { nickname }
            </li> );
        } );

        let webIdDropdownContents = [];

        switch ( appStatus )
        {
            case SAFE.APP_STATUS.AUTHORISING:
                webIdDropdownContents = [];

                webIdDropdownContents.push( <li
                    className={ styles.webIdInfo }
                    className={ styles.openAuth }
                    key="fetching">
                    <Row align="left">
                        <Column align="left"> 
                            <Spinner size="small" />
                        </Column>
                        <Column align="left">
                            <label>loading...</label>
                        </Column>
                    </Row>
                </li> );
                break;
            case SAFE.APP_STATUS.AUTHORISED:
                if ( isFetchingWebIds )
                {
                    webIdDropdownContents = [];

                    webIdDropdownContents.push( <li
                        className={ styles.webIdInfo }
                        className={ styles.openAuth }
                        key="fetching">
                        <Row align="left">
                            <Column align="left"> 
                                <Spinner size="small" />
                            </Column>
                            <Column align="left">
                                <label>loading...</label>
                            </Column>
                        </Row>
                    </li> );
                    break;
                }
                else if ( webIdsList.length > 0 )
                {
                    webIdDropdownContents = webIdsList;
                }
                else
                {
                    webIdDropdownContents.push( <li
                        className={ styles.webIdInfo }
                        key="noId"
                    >No WebIds Found.</li> );
                }
                break;
            default:
                webIdDropdownContents.push( <li
                    className={ styles.webIdInfo }
                    className={ styles.openAuth }
                    key="noAuth"
                ><label>Login in to see your WebIds</label></li> );
                break;
        }


        return (
            <div
                onMouseEnter={ this.handleMouseEnter }
                onMouseLeave={ this.handleMouseLeave }
            >
                <IconButton
                    onClick={ this.handleIdButtonClick }
                    iconTheme="navigation"
                    iconType="account"
                    size="S"
                    style={ { cursor: 'pointer' } }
                />
                {
                    showingWebIdDropdown &&
                    <ul className={ styles.webIdList }>

                        {webIdDropdownContents}
                        <li
                            onClick={ this.launchWebIdManager }
                            className={ styles.webIdManager }
                        >
                            <a href="#">Launch WebIdManager</a>
                        </li>
                    </ul>
                }
            </div>
        );
    }
};
