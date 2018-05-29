import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import MediaQuery from 'react-responsive';
import tabStyles from 'react-tabs/style/react-tabs.css';
import VM from 'scratch-vm';
import Renderer from 'scratch-render';

import Blocks from '../../containers/blocks.jsx';
import CostumeTab from '../../containers/costume-tab.jsx';
import TargetPane from '../../containers/target-pane.jsx';
import SoundTab from '../../containers/sound-tab.jsx';
import StageHeader from '../../containers/stage-header.jsx';
import Stage from '../../containers/stage.jsx';

import Box from '../box/box.jsx';
import FeedbackForm from '../feedback-form/feedback-form.jsx';
import MenuBar from '../menu-bar/menu-bar.jsx';
import PreviewModal from '../../containers/preview-modal.jsx';
import WebGlModal from '../../containers/webgl-modal.jsx';

import layout from '../../lib/layout-constants.js';
import styles from './gui.css';
import addExtensionIcon from './icon--extensions.svg';

import RobboGui from '../../RobboGui/RobboGui';

import { ItemTypes } from '../../RobboGui/drag_constants';
import {ActionDropSensorChooseWindow} from '../../RobboGui/actions/sensor_actions';
import {ActionDropColorCorrectorWindow} from '../../RobboGui/actions/sensor_actions'

import { connect } from 'react-redux';

import { DropTarget } from 'react-dnd';

const messages = defineMessages({
    addExtension: {
        id: 'gui.gui.addExtension',
        description: 'Button to add an extension in the target pane',
        defaultMessage: 'Add Extension'
    }
});

const Target = {
  drop(props,monitor) {

    let coords = monitor.getClientOffset();

    let item = monitor.getItem();

    if (item.element_type == ItemTypes.SENSOR_CHOOSE_WINDOW){

      props.onSensorChooseWindowDrop(coords.y, coords.x);

      console.log(`Drop: SensorChooseWindow y:${coords.y}  x:${coords.x}`);


    }else if (item.element_type == ItemTypes.COLOR_CORRECTOR_WINDOW){

        props.onColorCorrectorWindowDrop(coords.y, coords.x);

        console.log(`Drop: ColorCorrectorWindow y:${coords.y}  x:${coords.x}`);

    }


  }
};


const  collect = (connect, monitor) =>  ({

    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()

});

const GUIComponent = props => {
    const {
        basePath,
        children,
        enableExtensions,
        intl,
        feedbackFormVisible,
        vm,
        previewInfoVisible,
        onExtensionButtonClick,
        onTabSelect,
        tabIndex,
        connectDropTarget,
        isOver,
        ...componentProps
    } = props;
    if (children) {
        return (
            <Box {...componentProps}>
                {children}
            </Box>
        );
    }

    const tabClassNames = {
        tabs: styles.tabs,
        tab: classNames(tabStyles.reactTabsTab, styles.tab),
        tabList: classNames(tabStyles.reactTabsTabList, styles.tabList),
        tabPanel: classNames(tabStyles.reactTabsTabPanel, styles.tabPanel),
        tabPanelSelected: classNames(tabStyles.reactTabsTabPanelSelected, styles.isSelected),
        tabSelected: classNames(tabStyles.reactTabsTabSelected, styles.isSelected)
    };

    const isRendererSupported = Renderer.isSupported();

    return (

     connectDropTarget(

       <div className={styles.pageWrapper}>
        <Box
            className={styles.pageWrapper}
            {...componentProps}
        >
            {previewInfoVisible ? (
                <PreviewModal />
            ) : null}
            {feedbackFormVisible ? (
                <FeedbackForm />
            ) : null}
            {isRendererSupported ? null : (
                <WebGlModal />
            )}
            <MenuBar />
            <Box className={styles.bodyWrapper}>
                <Box className={styles.flexWrapper}>
                    <Box className={styles.editorWrapper}>
                        <Tabs
                            className={tabClassNames.tabs}
                            forceRenderTabPanel={true} // eslint-disable-line react/jsx-boolean-value
                            selectedTabClassName={tabClassNames.tabSelected}
                            selectedTabPanelClassName={tabClassNames.tabPanelSelected}
                            onSelect={onTabSelect}
                        >
                            <TabList className={tabClassNames.tabList}>
                                <Tab className={tabClassNames.tab}>Blocks</Tab>
                                <Tab className={tabClassNames.tab}>Costumes</Tab>
                                <Tab className={tabClassNames.tab}>Sounds</Tab>
                                
                            </TabList>
                            <TabPanel className={tabClassNames.tabPanel}>
                                <Box className={styles.blocksWrapper}>
                                    <Blocks
                                        grow={1}
                                        isVisible={tabIndex === 0} // Blocks tab
                                        options={{
                                            media: `${basePath}static/blocks-media/`
                                        }}
                                        vm={vm}
                                    />
                                </Box>
                                <Box className={styles.extensionButtonContainer}>
                                    <button
                                        className={classNames(styles.extensionButton, {
                                            [styles.hidden]: !enableExtensions
                                        })}
                                        title={intl.formatMessage(messages.addExtension)}
                                        onClick={onExtensionButtonClick}
                                    >
                                        <img
                                            className={styles.extensionButtonIcon}
                                            draggable={false}
                                            src={addExtensionIcon}
                                        />
                                    </button>
                                </Box>
                            </TabPanel>
                            <TabPanel className={tabClassNames.tabPanel}>
                                {tabIndex === 1 ? <CostumeTab vm={vm} /> : null}
                            </TabPanel>
                            <TabPanel className={tabClassNames.tabPanel}>
                                {tabIndex === 2 ? <SoundTab vm={vm} /> : null}
                            </TabPanel>

                        </Tabs>
                    </Box>

                    <Box className={styles.stageAndTargetWrapper}>
                        <Box className={styles.stageMenuWrapper}>
                            <StageHeader vm={vm} />
                        </Box>
                        <Box className={styles.stageWrapper}>
                            {/* eslint-disable arrow-body-style */}
                            <MediaQuery minWidth={layout.fullSizeMinWidth}>{isFullSize => {
                                return isRendererSupported ? (
                                    <Stage
                                        height={isFullSize ? layout.fullStageHeight : layout.smallerStageHeight}
                                        shrink={0}
                                        vm={vm}
                                        width={isFullSize ? layout.fullStageWidth : layout.smallerStageWidth}
                                    />
                                ) : null;
                            }}</MediaQuery>
                            {/* eslint-enable arrow-body-style */}
                        </Box>
                         <RobboGui vm={vm}/>
                        <Box className={styles.targetWrapper}>
                            <TargetPane
                                vm={vm}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
      </div>
      )
    );
};
GUIComponent.propTypes = {
    basePath: PropTypes.string,
    children: PropTypes.node,
    enableExtensions: PropTypes.bool,
    feedbackFormVisible: PropTypes.bool,
    intl: intlShape.isRequired,
    onExtensionButtonClick: PropTypes.func,
    onTabSelect: PropTypes.func,
    previewInfoVisible: PropTypes.bool,
    tabIndex: PropTypes.number,
    vm: PropTypes.instanceOf(VM).isRequired,
    connectDropTarget: PropTypes.func,
    isOver: PropTypes.bool,
    onSensorChooseWindowDrop :  PropTypes.func
};
GUIComponent.defaultProps = {
    basePath: './'
};

const mapStateToProps =  state => ({




  });

const mapDispatchToProps = dispatch => ({

  onSensorChooseWindowDrop: (top,left) => {

      dispatch(ActionDropSensorChooseWindow(top,left));
    },

    onColorCorrectorWindowDrop: (top,left) => {

        dispatch(ActionDropColorCorrectorWindow(top,left));
      }


});


export default connect(
        mapStateToProps,
        mapDispatchToProps

    ) (DropTarget([ItemTypes.SENSOR_CHOOSE_WINDOW,ItemTypes.COLOR_CORRECTOR_WINDOW], Target, collect)(injectIntl(GUIComponent)));

//export default injectIntl(GUIComponent);
