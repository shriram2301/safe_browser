import logger from 'logger';
import React from 'react';
import Error from 'components/PerusePages/Error';
import ReactDOMServer from 'react-dom/server';
import { getSafeBrowserAppObject } from 'extensions/safe/safeBrowserApplication';

import { setWebFetchStatus } from 'extensions/safe/actions/web_fetch_actions';
import { addTab, closeTab } from 'actions/tabs_actions';
import { rangeStringToArray, generateResponseStr } from '../utils/safeHelpers';
import errConsts from 'extensions/safe/err-constants';
import { SAFE } from '../constants';

const safeRoute = ( store ) => ( {
    method  : 'GET',
    path    : /safe:\//,
    handler : async ( request, res ) =>
    {
        const link = request.url.substr( 1 ); // remove initial /
        const sendErrResponse = ( error, errSubHeader ) => res.send(
            ReactDOMServer.renderToStaticMarkup(
                <Error error={ { header: error, subHeader: errSubHeader } } />
            )
        );

        try
        {
            const link = request.url.substr( 1 ); // remove initial /

            const app = getSafeBrowserAppObject() || {};
            const headers = request.headers;
            let isRangeReq = false;
            let multipartReq = false;

            let start;
            let end;
            let rangeArray;

            logger.verbose( `Handling SAFE req: ${link}` );

            if ( !app )
            {
                return res.send( 'SAFE not connected yet' );
            }

            if ( headers.range )
            {
                isRangeReq = true;
                rangeArray = rangeStringToArray( headers.range );

                if ( rangeArray.length > 1 )
                {
                    multipartReq = true;
                }
            }

            // setup opts object
            const options = { headers };

            if ( isRangeReq )
            {
                options.range = rangeArray;
            }
            store.dispatch( setWebFetchStatus( {
                fetching : true,
                link,
                options  : JSON.stringify( options )
            } ) );

            let data = null;
            try
            {
                data = await app.webFetch( link, options );
            }
            catch ( error )
            {
                logger.error( error.code, error.message );
                store.dispatch( setWebFetchStatus( { fetching: false, error, options: '' } ) );
                const shouldTryAgain = error.code === errConsts.ERR_OPERATION_ABORTED.code ||
                                       error.code === errConsts.ERR_ROUTING_INTERFACE_ERROR.code ||
                                       error.code === errConsts.ERR_REQUEST_TIMEOUT.code;
                if ( shouldTryAgain )
                {
                    const safeBrowserApp = store.getState().safeBrowserApp;
                    const unsubscribe = store.subscribe( () =>
                    {
                        if ( safeBrowserApp.networkStatus === SAFE.NETWORK_STATE.CONNECTED )
                        {
                            store.getState().tabs.forEach( ( tab ) =>
                            {
                                logger.info( tab.url, link, link.includes( tab.url ) );
                                if ( link.includes( tab.url ) && !tab.isActive )
                                {
                                    store.dispatch( closeTab( { index: tab.index } ) );
                                }
                            } );
                            store.dispatch( addTab( { url: link, isActiveTab: true } ) );
                            unsubscribe();
                        }
                    } );
                    error.message = errConsts.ERR_ROUTING_INTERFACE_ERROR.msg;
                    return sendErrResponse( error.message );
                }
                return sendErrResponse( error.message || error );
            }
            store.dispatch( setWebFetchStatus( { fetching: false, options: '' } ) );

            if ( isRangeReq && multipartReq )
            {
                const responseStr = generateResponseStr( data );
                return res.send( responseStr );
            }
            else if ( isRangeReq )
            {
                return res.status( 206 )
                    .set( {
                        'Content-Type'   : data.headers['Content-Type'],
                        'Content-Range'  : data.headers['Content-Range'],
                        'Content-Length' : data.headers['Content-Length']
                    } )
                    .send( data.body );
            }

            return res.set( {
                'Content-Type'      : data.headers['Content-Type'],
                'Content-Range'     : data.headers['Content-Range'],
                'Transfer-Encoding' : 'chunked',
                'Accept-Ranges'     : 'bytes'
            } )
                .send( data.body );
        }
        catch ( e )
        {
            logger.error( e );

            if ( e.code && e.code === -302 )
            {
                return res.status( 416 ).send( 'Requested Range Not Satisfiable' );
            }
            return sendErrResponse( e.message || e );
        }
    }
} );


export default safeRoute;
