import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showWebIdDropdown, getAvailableWebIds } from '../actions/safeBrowserApplication_actions';
import WebIdDropdown from 'extensions/safe/components/webIdDropdown';
import { Row, Col } from 'antd';
import 'antd/lib/row/style';
import 'antd/lib/col/style';
import 'antd/lib/button/style';
import PropTypes from 'prop-types';

// import styles from './wrapAddressBarButtons.css';

function mapStateToProps( state )
{
    return {
        safeBrowserApp : state.safeBrowserApp
    };
}

function mapDispatchToProps( dispatch )
{
    const actions =
        {
            showWebIdDropdown,
            getAvailableWebIds
        };
    return bindActionCreators( actions, dispatch );
}


const wrapAddressBarButtonsLHS = ( AddressBarButtons, extensionFunctionality = {} ) =>
{
    class WrappedAddressBarButtonsLHS extends Component
    {
        static propTypes =
        {
            safeBrowserApp : PropTypes.shape( {
                isMock             : PropTypes.bool,
                experimentsEnabled : PropTypes.bool.isRequired,
                webIds             : PropTypes.arrayOf( PropTypes.shape( {
                    name : PropTypes.string
                } ) )
            } ).isRequired,
        }
        static defaultProps =
        {
            safeBrowserApp : {
                webIds : []
            }
        }

        render()
        {
            const { safeBrowserApp } = this.props;
            const {
                experimentsEnabled
            } = safeBrowserApp;

            return (
                <Row
                    type="flex"
                    justify="end"
                    align="middle"
                    gutter={ { xs: 2, sm: 4, md: 6 } }
                >
                    <Col >
                        <AddressBarButtons { ...this.props } />
                    </Col>
                    {
                        // TODO: use customMenu here.
                        experimentsEnabled &&
                        <Col >
                            <WebIdDropdown
                                { ...this.props }
                            />
                        </Col>
                    }

                </Row>
            );
        }
    }

    const hookedUpInput = connect( mapStateToProps, mapDispatchToProps )( WrappedAddressBarButtonsLHS );

    return hookedUpInput;
};

export default wrapAddressBarButtonsLHS;
