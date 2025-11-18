// ==UserScript==
// @name         Free4Talk Enhancer
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Enhanced Free4talk
// @author       You
// @match        https://www.free4talk.com/room/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      free4talk.info
// @connect      iplogger.org
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download

// ==/UserScript==



const window = unsafeWindow;
const document = unsafeWindow.document;

(function() {
'use strict';

setupWebSocketInterceptor(null);
let roomParticipantMap = {};
let userToken = null;
let currentUserEID = null;
const friendMessages = {};
let originalStyles = {};
let darkModeStyleElement = null;
const audioManager = AudioManagement();
localStorage.removeItem('fcurrentRoom:Participants');


function GatheredCSS() {

    const fontFamily = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
    const whiteColor = "#fff";
    const textColor = "#e2e8f0";
    const accentColor = "#a5d6a7";
    const borderColor = "rgba(74,85,104,0.3)";
    const notificationBg = "rgba(26,26,26,0.3)";
    const buttonHover = "rgba(74,85,104,0.2)";
    const opaqueWhite = "rgba(255,255,255,0.2)";
    const semiTransparentBlack = "rgba(0,0,0,0.5)";
    const lowOpacityWhite = "rgba(232,245,233,0.8)";
    const cursorPointer = "pointer";
    const zIndexHigh = "9999";
    const zIndexHigher = "10000";
    const zIndexVeryHigh = "99999";
    const boxShadowStandard = "0 4px 12px rgba(0,0,0,0.15)";
    const boxShadowModal = "0 10px 25px rgba(0,0,0,0.3)";
    const transitionEase = "all 0.3s ease";
    const transitionOpacity = "opacity 0.3s ease";
    const backdropBlur = "blur(6px)";
    const backdropBlurStrong = "blur(10px)";
    const borderStandard = "1px solid rgba(255,255,255,0.2)";
    const borderLight = "1px solid rgba(255,255,255,0.1)";
    const paddingStandard = "4px 8px";
    const borderRadiusStandard = "6px";
    const fontSizeSmall = "12px";
    const positionFixedTop10Left10 = "position:fixed;top:10px;";
    const commonButtonStyle = `background:${notificationBg};color:${whiteColor};border:none;padding:${paddingStandard};border-radius:${borderRadiusStandard};font-size:${fontSizeSmall};font-family:${fontFamily};cursor:${cursorPointer};z-index:${zIndexHigh};box-shadow:${boxShadowStandard};transition:${transitionEase};backdrop-filter:${backdropBlur};-webkit-backdrop-filter:${backdropBlur};border:${borderStandard};`;
    const commonModalBackdrop = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:${semiTransparentBlack};z-index:${zIndexHigher};display:flex;justify-content:center;align-items:center;`;
    const commonModalContent = `background:${notificationBg};border-radius:16px;padding:20px;max-width:300px;text-align:center;border:1px solid ${borderColor};box-shadow:${boxShadowModal};color:${textColor};`;
    const commonNotificationStyle = `position:fixed;bottom:20px;left:20px;background:var(--notificationBg);color:var(--textColor);border-radius:12px;border:1px solid var(--borderColor);box-shadow:0 8px 16px rgba(0,0,0,0.35);padding:14px 16px;width:320px;display:flex;align-items:flex-start;gap:12px;z-index:10002;cursor:${cursorPointer};font-family:${fontFamily};opacity:0;transform:translateY(20px);transition:${transitionOpacity}, transform 0.4s ease;`;
    return {
roomSettingsSlidingContainer: `display:flex;width:200%;transition:transform 0.3s ease-in-out;transform:translateX(0);`,
roomSettingsMainContent: `display:flex;flex-direction:column;gap:10px;padding:10px;width:50%;flex-shrink:0;`,
roomSettingsPresetsContent: `display:flex;flex-direction:column;gap:10px;padding:10px;width:50%;flex-shrink:0;`,
roomSettingsWelcomeInput: `width:100%;height:60px;padding:12px;background-color:transparent;border:2px solid rgba(225,225,225,0.2);border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:18px;color:white;outline:none;box-sizing:border-box;transition:border-color 0.2s;`,
roomSettingsWelcomeInputFocus: `border-color:rgba(0,128,0,0.5);`,
roomSettingsWelcomeInputBlur: `border-color:rgba(0,0,0,0.2);`,
roomSettingsButtonContainer: `margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;`,
roomSettingsToggleAllBtn: `padding:8px 16px;background-color:#007bff;color:white;border:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;cursor:pointer;`,
roomSettingsUntoggleAllBtn: `padding:8px 16px;background-color:#dc3545;color:white;border:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;cursor:pointer;`,
roomSettingsPresetsBtn: `padding:8px 16px;background-color:#6c757d;color:white;border:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;cursor:pointer;transition:background-color 0.2s, transform 0.1s;`,
roomSettingsPresetsBtnHover: `background-color:#5a6268;`,
roomSettingsPresetsBtnDefault: `background-color:#6c757d;`,
roomSettingsSubmitBtn: `padding:8px 16px;background-color:#28a745;color:white;border:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;cursor:pointer;transition:background-color 0.2s, transform 0.1s;`,
roomSettingsSubmitBtnHover: `background-color:#218838;transform:scale(1.05);`,
roomSettingsSubmitBtnDefault: `background-color:#28a745;transform:scale(1);`,
roomSettingsBackBtn: `padding:8px 16px;background-color:#6c757d;color:white;border:none;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;cursor:pointer;margin-top:auto;`,
roomSettingsSubmitBtnSave: `background-color:#ffc107;`,
roomSettingsSubmitBtnSaveHover: `background-color:#e0a800;`,
roomSettingsSubmitBtnSaveDefault: `background-color:#ffc107;`,
roomSettingsPanelOverflow: `overflow:hidden;`,
roomSettingsToggleStyles: `.toggle-row {display: flex;flex-wrap: wrap;gap: 12px;margin-top: 12px;}.toggle-block {display: flex;flex-direction: column;align-items: center;width: calc(33.333% - 12px);font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size: 14px;}.checkbox-wrapper-9 .tgl {display: none;}.checkbox-wrapper-9 .tgl,.checkbox-wrapper-9 .tgl:after,.checkbox-wrapper-9 .tgl:before,.checkbox-wrapper-9 .tgl *,.checkbox-wrapper-9 .tgl *:after,.checkbox-wrapper-9 .tgl *:before,.checkbox-wrapper-9 .tgl + .tgl-btn {box-sizing: border-box;}.checkbox-wrapper-9 .tgl::-moz-selection,.checkbox-wrapper-9 .tgl:after::-moz-selection,.checkbox-wrapper-9 .tgl:before::-moz-selection,.checkbox-wrapper-9 .tgl *::-moz-selection,.checkbox-wrapper-9 .tgl *:after::-moz-selection,.checkbox-wrapper-9 .tgl *:before::-moz-selection,.checkbox-wrapper-9 .tgl + .tgl-btn::-moz-selection,.checkbox-wrapper-9 .tgl::selection,.checkbox-wrapper-9 .tgl:after::selection,.checkbox-wrapper-9 .tgl:before::selection,.checkbox-wrapper-9 .tgl *::selection,.checkbox-wrapper-9 .tgl *:after::selection,.checkbox-wrapper-9 .tgl *:before::selection,.checkbox-wrapper-9 .tgl + .tgl-btn::selection {background: none;}.checkbox-wrapper-9 .tgl + .tgl-btn {outline: 0;display: block;width: 4em;height: 2em;position: relative;cursor: pointer;user-select: none;}.checkbox-wrapper-9 .tgl + .tgl-btn:after,.checkbox-wrapper-9 .tgl + .tgl-btn:before {position: relative;display: block;content: "";width: 50%;height: 100%;}.checkbox-wrapper-9 .tgl + .tgl-btn:after {left: 0;}.checkbox-wrapper-9 .tgl + .tgl-btn:before {display: none;}.checkbox-wrapper-9 .tgl:checked + .tgl-btn:after {left: 50%;}.checkbox-wrapper-9 .tgl-flat + .tgl-btn {padding: 2px;transition: all 0.2s ease;background: #fff;border: 4px solid #f2f2f2;border-radius: 2em;}.checkbox-wrapper-9 .tgl-flat + .tgl-btn:after {transition: all 0.2s ease;background: #f2f2f2;content: "";border-radius: 1em;}.checkbox-wrapper-9 .tgl-flat:checked + .tgl-btn {border: 4px solid #7FC6A6;}.checkbox-wrapper-9 .tgl-flat:checked + .tgl-btn:after {left: 50%;background: #7FC6A6;}.preset-item {display: flex;align-items: center;justify-content: space-between;padding: 12px;background: rgba(255,255,255,0.05);border-radius: 8px;margin-bottom: 8px;}.preset-item span {font-size: 16px;color: white;}.preset-item button {padding: 6px 16px;background-color: #007bff;color: white;border: none;border-radius: 6px;cursor: pointer;font-size: 14px;transition: background-color 0.2s;}.preset-item button:hover {background-color: #0056b3;}`,
waitingStyles: `.f4t-shimmer-text {display: inline-block;color: #fff;background: linear-gradient(90deg, #fff 25%, #cccccc 50%, #fff 75%);background-size: 200% 100%;-webkit-background-clip: text;-webkit-text-fill-color: transparent;animation: f4t-shimmer 1.5s infinite linear;}@keyframes f4t-shimmer {0% {background-position: -200% 0;}100% {background-position: 200% 0;}}`,
backdropKeyframes: `@keyframes gradientShift {0% { background-position: 0% 50%; }50% { background-position: 100% 50%; }100% { background-position: 0% 50%; }}@keyframes modalSlideIn {from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); }}@keyframes modalSlideOut {from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }}`,
roomModalTransition: `transition:all 0.3s ease !important;`,
roomUserAvatar: `width:100px;height:100px;border-radius:50%;border:3px solid rgba(255,255,255,0.2);cursor:pointer;`,
roomUserAvatarContainer: `text-align:center;margin-bottom:24px;`,
roomUserName: `margin:16px 0 8px;color:white;`,
roomUserVerified: `color:#4CAF50;margin-bottom:8px;`,
roomUserMagnifierBtn: `background:none;border:none;cursor:pointer;color:white;padding:8px;`,
roomUserReturnBtn: `background:rgba(102,126,234,0.2);border:1px solid rgba(102,126,234,0.3);color:#667eea;padding:10px 20px;border-radius:8px;cursor:pointer;transition:all 0.2s ease;`,
roomUserReturnBtnHover: `background:rgba(102,126,234,0.3);transform:translateY(-2px);`,
roomUserReturnBtnDefault: `background:rgba(102,126,234,0.2);transform:translateY(0);`,
roomUserReturnBtnContainer: `text-align:center;margin-top:24px;`,
roomNoParticipants: `text-align:center;color:rgba(255,255,255,0.5);width:100%;`,
messageNotification: `position:fixed;background:var(--notificationBg);color:var(--textColor);border-radius:12px;border:1px solid var(--borderColor);box-shadow:0 8px 16px rgba(0,0,0,0.35);padding:14px 16px;width:320px;display:flex;align-items:flex-start;gap:12px;z-index:10002;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;opacity:0;transform:translateY(20px);transition:opacity 0.4s ease, transform 0.4s ease;`,
messageNotificationAvatar: `width:42px;height:42px;border-radius:50%;flex-shrink:0;`,
messageNotificationContent: `flex:1;overflow:hidden;`,
messageNotificationHeader: `font-size:13px;font-weight:600;color:var(--accentColor);margin-bottom:4px;`,
messageNotificationName: `font-size:14px;font-weight:500;color:var(--textColor);margin-bottom:2px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;`,
messageNotificationText: `font-size:12px;color:var(--textColor);opacity:0.8;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;`,
messageNotificationArrow: `font-size:14px;color:var(--accentColor);cursor:pointer;opacity:0;transition:opacity 0.2s ease;user-select:none;margin-left:6px;`,
messageNotificationCloseBtn: `font-size:16px;font-weight:bold;color:var(--textColor);opacity:0.6;margin-left:6px;cursor:pointer;transition:opacity 0.2s ease;`,
messageNotificationClearAllBtn: `font-size:16px;font-weight:bold;color:var(--textColor);opacity:0.6;margin-left:12px;cursor:pointer;transition:opacity 0.2s ease;`,
socialBackdrop: `position:fixed;top:0;left:0;width:100vw;height:100vh;background:transparent;z-index:9999;display:none;`,
socialPanel: `position:fixed;top:50px;left:10px;background:rgba(26,26,26,0.3);border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.3);z-index:10000;min-width:320px;max-width:400px;max-height:70vh;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:none;border:1px solid rgba(74,85,104,0.3);backdrop-filter:blur(5px) saturate(150%);overflow:hidden;color:#e2e8f0;transition:opacity 0.3s ease, transform 0.3s ease;`,
socialPanelHeader: `padding:20px;border-bottom:1px solid rgba(74,85,104,0.3);display:flex;justify-content:space-between;align-items:center;`,
socialPanelTitle: `margin:0;font-size:18px;color:#e2e8f0;`,
socialPanelCloseBtn: `background:rgba(74,85,104,0.2);border:none;color:#e2e8f0;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:16px;transition:background 0.3s ease;`,
socialPanelContent: `padding:16px;display:flex;flex-direction:column;overflow-y:auto;max-height:calc(70vh - 60px);`,
socialButtonHoverGradient: `background:linear-gradient(270deg, var(--buttonGradientHover), var(--buttonGradientMid), var(--buttonGradientEnd));`,
socialButtonDefaultGradient: `background:linear-gradient(270deg, var(--buttonGradientStart), var(--buttonGradientMid), var(--buttonGradientEnd));`,
socialButtonHoverTransform: `transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.2);`,
socialButtonDefaultTransform: `transform:translateY(0);box-shadow:0 4px 12px rgba(0,0,0,0.15);`,
searchSpinner: `width:40px;height:40px;border:4px solid rgba(255,255,255,0.3);border-top:4px solid white;border-radius:50%;animation:spin 1s linear infinite;`,
searchSpinnerContainer: `margin-top:15px;display:flex;justify-content:center;`,
historyFollowButton: `color:#2196F3;cursor:pointer;user-select:none;transition:color 0.2s ease;`,
historyFollowButtonFollowing: `color:#4CAF50;`,
loadMoreButton: `padding:10px 24px;border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.2s;`,
loadMoreRoomsButton: `padding:10px 24px;background:rgba(33,150,243,0.3);color:#64B5F6;border:1px solid rgba(33,150,243,0.5);border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.2s;`,
loadMoreRoomsButtonHover: `background:rgba(33,150,243,0.5);`,
loadMoreParticipantsButton: `padding:6px 16px;background:rgba(76,175,80,0.3);color:#81C784;border:1px solid rgba(76,175,80,0.5);border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s;`,
loadMoreParticipantsButtonHover: `background:rgba(76,175,80,0.5);`,
loadMoreSameNameButton: `padding:10px 24px;background:rgba(255,152,0,0.3);color:#FFB74D;border:1px solid rgba(255,152,0,0.5);border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.2s;`,
loadMoreSameNameButtonHover: `background:rgba(255,152,0,0.5);`,
historyButtonContainer: `text-align:center;margin-top:20px;`,
historyButtonContainerSmall: `text-align:center;margin-top:10px;`,
modalContentChildren: `width:100%;opacity:0;transform:translateY(20px);transition:opacity 0.3s ease, transform 0.3s ease, height 0.3s ease, width 0.3s ease;`,
modalContentLoaded: `opacity:1;transform:translateY(0);`,
historySearchContainer: `position:absolute;top:20px;right:80px;display:flex;gap:8px;z-index:10;`,
historySearchInput: `padding:10px 15px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:white;font-size:14px;width:200px;outline:none;transition:all 0.2s;`,
historySearchInputFocus: `background:rgba(255,255,255,0.15);border-color:rgba(100,181,246,0.5);`,
historySearchButton: `padding:10px 15px;background:rgba(33,150,243,0.3);border:1px solid rgba(33,150,243,0.5);border-radius:8px;color:white;font-size:16px;cursor:pointer;transition:all 0.2s;`,
historySearchButtonHover: `background:rgba(33,150,243,0.5);`,
historyLoadingContainer: `text-align:center;padding:40px;color:rgba(255,255,255,0.7);margin-top:40px;`,
historySpinner: `border:4px solid rgba(255,255,255,0.2);border-top:4px solid #fff;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 20px;`,
historyLoadingTitle: `font-size:18px;margin-bottom:10px;`,
historyLoadingText: `font-size:14px;`,
historyHeader: `text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.1);`,
historyAvatar: `width:100px;height:100px;border-radius:50%;border:4px solid rgba(255,255,255,0.3);margin-bottom:15px;`,
historyUserName: `margin:0 0 5px 0;font-size:28px;font-weight:600;`,
historyUserId: `color:rgba(255,255,255,0.6);font-size:14px;margin-bottom:15px;`,
historyStatsContainer: `display:inline-flex;gap:30px;background:rgba(255,255,255,0.1);padding:15px 30px;border-radius:12px;`,
historyStatItem: `text-align:center;`,
historyStatValue: `font-size:24px;font-weight:bold;`,
historyStatLabel: `font-size:12px;color:rgba(255,255,255,0.6);`,
historySection: `margin-bottom:25px;`,
historySectionTitle: `margin:0 0 15px 0;font-size:20px;color:rgba(255,255,255,0.9);display:flex;align-items:center;gap:10px;`,
historySectionCount: `font-size:14px;color:rgba(255,255,255,0.5);`,
historyNameList: `display:flex;gap:10px;flex-wrap:wrap;`,
historyNameItem: `background:rgba(255,255,255,0.1);padding:10px 15px;border-radius:8px;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,0.2);`,
historyNameAvatar: `width:35px;height:35px;border-radius:50%;`,
historyNameText: `font-size:14px;font-weight:500;`,
historyNameDate: `font-size:11px;color:rgba(255,255,255,0.5);`,
historyRoomGrid: `display:grid;grid-template-columns:repeat(auto-fill,minmax(500px,1fr));gap:20px;`,
historyRoomCard: `border:1px solid rgba(255,255,255,0.2);border-radius:15px;padding:20px;transition:all 0.3s;background:rgba(255,255,255,0.1);`,
historyRoomCardHover: `transform:translateY(-3px);border-color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.15);`,
historyRoomHeader: `margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid rgba(255,255,255,0.2);`,
historyRoomTopic: `font-size:18px;font-weight:600;margin-bottom:8px;color:#fff;`,
historyRoomMeta: `display:flex;gap:15px;flex-wrap:wrap;font-size:12px;color:rgba(255,255,255,0.6);`,
historyRoomLanguages: `background:rgba(33,150,243,0.3);padding:4px 10px;border-radius:5px;`,
historyRoomLevel: `background:rgba(76,175,80,0.3);padding:4px 10px;border-radius:5px;`,
historyRoomParticipants: `background:rgba(255,152,0,0.3);padding:4px 10px;border-radius:5px;`,
historyRoomDate: `font-size:11px;color:rgba(255,255,255,0.4);margin-top:8px;`,
historyParticipantsSection: `margin-top:15px;`,
historyParticipantsTitle: `font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:10px;font-weight:500;`,
historyParticipantsGrid: `display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:200px;overflow-y:auto;`,
historyParticipantItem: `display:flex;align-items:center;gap:10px;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px;border:1px solid rgba(255,255,255,0.1);transition:all 0.2s;cursor:pointer;`,
historyParticipantItemHover: `background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);`,
historyParticipantAvatar: `width:32px;height:32px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);`,
historyParticipantInfo: `flex:1;min-width:0;`,
historyParticipantName: `font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`,
historyParticipantFollowers: `font-size:10px;color:rgba(255,255,255,0.5);`,
historyRoomLink: `display:inline-block;margin-top:12px;padding:8px 16px;background:rgba(33,150,243,0.3);color:#64B5F6;text-decoration:none;border-radius:6px;font-size:12px;border:1px solid rgba(33,150,243,0.5);transition:all 0.2s;`,
historyRoomLinkHover: `background:rgba(33,150,243,0.5);`,
historySameNameSection: `margin-top:25px;padding:20px;background:rgba(255,152,0,0.15);border:1px solid rgba(255,152,0,0.4);border-radius:15px;`,
historySameNameTitle: `margin:0 0 15px 0;font-size:18px;color:rgba(255,200,100,0.9);display:flex;align-items:center;gap:10px;`,
historySameNameGrid: `display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;`,
historySameNameItem: `padding:12px;background:rgba(255,255,255,0.1);border-radius:8px;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;transition:all 0.2s;`,
historySameNameItemHover: `background:rgba(255,255,255,0.2);`,
historySameNameAvatar: `width:40px;height:40px;border-radius:50%;`,
historySameNameInfo: `flex:1;min-width:0;`,
historySameNameText: `font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`,
historySameNameId: `font-size:11px;color:rgba(255,255,255,0.5);`,
historyErrorContainer: `text-align:center;padding:40px;margin-top:50px;`,
historyErrorTitle: `font-size:18px;margin-bottom:18px;`,
historyErrorMessage: `text-align:center;padding:40px;color:rgba(255,100,100,0.9);margin-top:50px;`,
historyErrorIcon: `font-size:18px;margin-bottom:10px;`,
historyErrorText: `font-size:14px;`,
modalOverlay: `position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:10000;opacity:0;transition:opacity 0.4s ease;backdrop-filter:blur(0px);`,
modalContent: `position:relative;width:90%;max-width:1200px;max-height:90vh;border-radius:20px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);opacity:1;transform:translateY(0);transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1);overflow-y:auto;`,
modalCloseButton: `position:absolute;top:20px;right:20px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;z-index:10;`,
modalCloseButtonHover: `background:rgba(255,255,255,0.2);`,
searchLoadingContainer: `text-align:center;padding:40px;color:rgba(255,255,255,0.7);margin-top:40px;`,
searchLoadingTitle: `font-size:18px;margin-bottom:10px;`,
searchLoadingText: `font-size:14px;`,
searchResultsContainer: `color:white;margin-top:50px;`,
searchResultsTitle: `text-align:center;margin-bottom:30px;font-size:24px;`,
searchResultsCount: `font-size:16px;color:rgba(255,255,255,0.6);`,
searchResultsGrid: `display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;`,
searchUserCard: `padding:25px;border:1px solid rgba(255,255,255,0.2);border-radius:15px;cursor:pointer;transition:all 0.3s;text-align:center;background:rgba(255,255,255,0.1);`,
searchUserCardHover: `background:rgba(255,255,255,0.2);transform:translateY(-5px);border-color:rgba(255,255,255,0.4);`,
searchUserAvatar: `width:90px;height:90px;border-radius:50%;border:4px solid rgba(255,255,255,0.3);margin-bottom:15px;`,
searchUserName: `font-size:18px;font-weight:600;margin-bottom:8px;color:#fff;`,
searchUserId: `font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:12px;font-family:monospace;`,
searchUserStats: `display:flex;justify-content:center;gap:20px;margin-bottom:10px;`,
searchUserStatItem: `text-align:center;`,
searchUserStatValue: `font-size:16px;font-weight:bold;`,
searchUserStatLabel: `font-size:11px;color:rgba(255,255,255,0.5);`,
searchUserNameChanges: `font-size:11px;color:rgba(255,200,100,0.8);margin-top:10px;padding:5px;background:rgba(255,152,0,0.2);border-radius:5px;`,
searchUserSupporter: `font-size:11px;color:rgba(255,215,0,0.9);margin-top:8px;`,
searchNoResults: `text-align:center;padding:40px;color:rgba(255,200,100,0.9);margin-top:50px;`,
searchNoResultsIcon: `font-size:48px;margin-bottom:20px;`,
searchNoResultsTitle: `font-size:20px;margin-bottom:10px;`,
searchNoResultsText: `font-size:14px;color:rgba(255,255,255,0.6);`,
searchError: `text-align:center;padding:40px;color:rgba(255,100,100,0.9);margin-top:50px;`,
searchErrorIcon: `font-size:48px;margin-bottom:20px;`,
searchErrorTitle: `font-size:20px;margin-bottom:10px;`,
searchErrorText: `font-size:14px;`,
msgButton: `${positionFixedTop10Left10}${commonButtonStyle}`,
moderationButton: `${positionFixedTop10Left10}${commonButtonStyle}`,
gearButton: `${positionFixedTop10Left10}${commonButtonStyle}`,
socialButton: `${positionFixedTop10Left10}${commonButtonStyle.replace('padding:4px 8px;', 'padding:4px 6px;')}`,
toggleButton: `${positionFixedTop10Left10}${commonButtonStyle.replace('transition:all 0.3s ease;', 'transition:left 0.3s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, background 0.3s ease-in-out;')}`,
hideUI: `[id^="f4t-"]:not(#f4t-toggle-interface-btn):not(#f4t-dark-overlay){transition:opacity 0.3s ease;}body.f4t-script-ui-hidden [id^="f4t-"]:not(#f4t-toggle-interface-btn):not(#f4t-dark-overlay){opacity:0!important;pointer-events:none!important;}`,
backdropStyle: `position:fixed;top:0;left:0;width:100%;height:100%;overflow:hidden;backdrop-filter:blur(35px) saturate(180%);-webkit-backdrop-filter:blur(35px) saturate(180%);background:linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.25));background-size:400% 400%;animation:gradientShift 8s ease infinite;transition:all 0.5s cubic-bezier(0.4, 0, 0.2, 1);z-index:${zIndexHigh};opacity:0;`,
messageElementAlign: "align-items:flex-end;display:flex;flex-direction:column;",
messageElementAlignStart: "align-items:flex-start;display:flex;flex-direction:column;",
bubbleInline: "display:inline-block;position:relative;",
stickerSize: "width:120px;height:120px;",
imageLink: "max-width:200px;max-height:200px;border-radius:6px;display:block;margin-top:4px;",
reactionsContainerStyle: `display:flex;gap:4px;margin-top:4px;z-index:${zIndexVeryHigh};font-size:14px;flex-wrap:wrap;`,
reactionsAlignEnd: "align-self:flex-end;",
reactionsAlignStart: "align-self:flex-start;",
reactionElem: "background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;cursor:default;",
seenElement: `margin-top:0px;font-size:10px;color:${lowOpacityWhite};`,
emojiMenuFixed: `position:fixed;background:rgba(0,0,0,0.9);border-radius:25px;padding:8px 12px;display:flex;z-index:${zIndexVeryHigh};gap:8px;opacity:0;transition:opacity 0.2s ease;z-index:1001;`,
emojiMenuAbsolute: `position:absolute;background:rgba(0,0,0,0.9);border-radius:25px;padding:8px 12px;display:flex;z-index:${zIndexVeryHigh};gap:8px;opacity:0;transition:opacity 0.2s ease;z-index:1001;`,
emojiButton: `background:none;border:none;font-size:20px;cursor:${cursorPointer};padding:4px;border-radius:50%;z-index:${zIndexVeryHigh};transition:transform 0.2s ease;`,
suggestionsDivStyle: `position:absolute;background:rgba(255, 255, 255, 0.05);backdrop-filter:${backdropBlurStrong};border:1px solid rgba(255, 255, 255, 0.18);box-shadow:0 4px 30px rgba(0, 0, 0, 0.1);padding:8px;border-radius:16px;font-size:14px;color:white;z-index:${zIndexHigh};display:none;flex-wrap:wrap;max-width:400px;gap:12px;opacity:0;transform:scale(0.95);pointer-events:none;transition:${transitionOpacity}, transform 0.3s ease-in-out;`,
suggestionWrapperStyle: "position:relative;display:inline-block;",
keyBadgeStyle: "position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:14px;color:limegreen;font-weight:bold;",
suggestionButtonStyle: "padding:4px 8px;font-size:14px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:white;cursor:pointer;",
closeBtnStyle: "align-self:flex-end;padding:4px 6px;border:none;border-radius:4px;background:rgba(34,34,34,0.8);color:#fff;font-size:14px;cursor:pointer;margin-bottom:4px;",
searchInputStyle: `width:100%;padding:6px 8px;border-radius:4px;border:1px solid rgba(74,85,104,0.5);background:rgba(0,0,0,0.6);color:${whiteColor};margin-bottom:8px;`,
gifGridStyle: "display:grid;grid-template-columns:repeat(5, 1fr);grid-auto-rows:100px;gap:8px;overflow-y:auto;flex:1;",
gifMenuStyle: `position:absolute;bottom:70px;left:16px;width:600px;height:400px;background:${notificationBg};border:1px solid ${borderColor};border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px;z-index:10002;box-shadow:0 4px 12px rgba(0,0,0,0.3);backdrop-filter:blur(5px);opacity:0;transition:opacity 0.2s ease-in-out;`,
gifImageStyle: `width:100%;height:100%;object-fit:cover;border-radius:${borderRadiusStandard};cursor:${cursorPointer};`,
gifOverlayStyle: `position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:${zIndexHigh};backdrop-filter:blur(4px);opacity:0;transition:opacity .25s ease;`,
gifViewerStyle: "background:rgba(255,255,255,.15);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.25);padding:20px 30px;border-radius:16px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.3);color:white;transform:scale(.95);opacity:0;transition:all .25s ease;",
gifPreviewStyle: "max-width:320px;max-height:320px;border-radius:12px;margin-bottom:15px;",
gifButtonsContainerStyle: "display:flex;justify-content:center;gap:15px;",
gifButtonBaseStyle: "padding:8px 18px;border:none;border-radius:8px;font-size:14px;cursor:pointer;transition:.2s;",
userInfoModalBackdrop: `${commonModalBackdrop}`,
userInfoModal: `${commonModalContent}`,
userInfoModalAvatar: "width:80px;height:80px;border-radius:50%;margin-bottom:16px;",
userInfoModalName: "margin:0 0 16px;font-size:18px;",
userInfoModalStats: "display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;",
userInfoModalStatLabel: `font-size:12px;color:rgba(232,245,233,0.7);`,
userInfoModalStatValue: "font-size:16px;font-weight:500;",
participantElement: `display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;transition:${transitionEase};border:${borderLight};margin-bottom:6px;cursor:${cursorPointer};background:linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));`,
participantAvatar: `width:36px;height:36px;border-radius:50%;border:2px solid ${opaqueWhite};`,
participantNameContainer: "flex:1;",
participantName: `font-weight:600;font-size:15px;color:var(--textColor);`,
participantModalBackdrop: `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);display:flex;justify-content:center;align-items:center;z-index:99000;opacity:0;transition:${transitionOpacity};backdrop-filter:blur(5px) saturate(150%);-webkit-backdrop-filter:blur(5px) saturate(150%);`,
participantModalContent: `border-radius:20px;padding:32px;max-width:450px;width:90%;transform:translateY(30px);opacity:0;transition:transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);text-align:center;position:relative;background:${notificationBg};color:${textColor};box-shadow:${boxShadowModal};border:1px solid ${borderColor};font-family:${fontFamily};backdrop-filter:${backdropBlurStrong} saturate(150%);-webkit-backdrop-filter:${backdropBlurStrong} saturate(150%);`,
participantModalCloseButton: `position:absolute;top:12px;right:12px;background:${opaqueWhite};border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:${cursorPointer};transition:background 0.2s ease;color:rgba(232,245,233,0.9);`,
participantModalAvatar: `width:100px;height:100px;border-radius:50%;border:3px solid ${opaqueWhite};margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:${cursorPointer};transition:transform 0.2s ease;`,
participantModalTitle: "font-size:28px;font-weight:700;margin-bottom:16px;letter-spacing:0.5px;",
participantModalStatsGrid: `display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;font-size:16px;color:rgba(232,245,233,0.9);padding:16px;background:rgba(0,0,0,0.1);border-radius:12px;`,
participantModalStatItem: "transition:transform 0.2s ease;",
participantModalStatValue: "font-weight:600;font-size:18px;",
participantModalStatLabel: "font-size:13px;opacity:0.8;",
emptyParticipantList: `text-align:center;color:var(--textColor);opacity:0.7;padding:20px;`,
messageContainer: `padding:12px;margin-bottom:8px;border-radius:8px;background:rgba(255,255,255,0.1);border:1px solid ${opaqueWhite};backdrop-filter:${backdropBlurStrong};transition:background 0.2s ease, transform 0.3s ease, opacity 0.3s ease;cursor:default;opacity:0;transform:translateY(10px);`,
messageHeader: `display:flex;align-items:center;gap:10px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid ${borderLight};`,
messageAvatar: "width:28px;height:28px;border-radius:50%;",
messageName: "font-weight:600;",
messageTimestamp: "font-size:10px;opacity:0.7;margin-left:auto;",
messageContent: "display:flex;flex-direction:column;gap:6px;",
messageTextDiv: `cursor:${cursorPointer};transition:background 0.2s ease;`,
messageImage: `max-width:200px;border-radius:${borderRadiusStandard};cursor:${cursorPointer};transition:transform 0.2s ease;`,
messageSticker: `max-width:120px;border-radius:${borderRadiusStandard};cursor:${cursorPointer};transition:transform 0.2s ease;`,
historyListContent: `padding:16px;display:flex;flex-direction:column;overflow-y:auto;max-height:calc(70vh-80px);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.3) transparent;`,
historyBackdrop: `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0);z-index:${zIndexHigh};display:none;`,
historyPanel: `position:fixed;top:50px;left:10px;background:var(--notificationBg);border-radius:16px;box-shadow:${boxShadowModal};z-index:${zIndexHigher};min-width:320px;max-width:400px;max-height:70vh;font-family:${fontFamily};display:none;border:1px solid var(--borderColor);overflow:hidden;color:var(--textColor);transition:${transitionOpacity}, transform 0.3s ease;`,
historyPanelHeader: `padding:20px;border-bottom:1px solid var(--borderColor);display:flex;justify-content:space-between;align-items:center;`,
historyPanelTitle: `margin:0;font-size:18px;color:var(--textColor);`,
historyPanelCloseBtn: `background:var(--buttonHover);border:none;color:var(--textColor);border-radius:50%;width:30px;height:30px;cursor:${cursorPointer};font-size:16px;transition:background 0.3s ease;`,
historyPanelContent: `padding:16px;display:flex;flex-direction:column;overflow-y:auto;max-height:calc(70vh - 60px);`,
emptyHistoryMessage: `text-align:center;color:var(--textColor);opacity:0.7;padding:20px;`,
waitingMessage: `position:fixed;top:10px;left:10px;color:${textColor};font-size:12px;font-family:${fontFamily};z-index:${zIndexHigh};padding:6px 12px;background:${notificationBg};border-radius:8px;border:1px solid ${borderColor};box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;gap:4px;opacity:1;transition:opacity 0.5s ease,transform 0.5s ease;`,
waitingMessageInner: `display:inline-flex;align-items:center;gap:8px;`,
circlePulse: `width:10px;height:10px;border-radius:50%;background:${textColor};animation:f4t-pulseCircle 1.5s infinite;box-shadow:0 0 8px rgba(76,175,239,0.18),inset 0 -2px 4px rgba(0,0,0,0.12);`,
pulseCircleAnimation: `@keyframes f4t-pulseCircle{0%{transform:scale(0.8);opacity:0.7;}50%{transform:scale(1.4);opacity:0.3;}100%{transform:scale(0.8);opacity:0.7;}}`,
gearPanel: `position:fixed;top:50px;left:10px;background:${notificationBg};border-radius:16px;box-shadow:${boxShadowModal};z-index:${zIndexHigher};max-height:80vh;font-family:${fontFamily};display:none;border:1px solid ${borderColor};backdrop-filter:blur(5px) saturate(150%);overflow:hidden;`,
gearPanelHeader: `padding:20px;border-bottom:1px solid ${borderColor};display:flex;justify-content:space-between;align-items:center;`,
gearPanelTitle: `margin:0;font-size:18px;transition:${transitionOpacity};`,
gearPanelCloseButton: `background:${buttonHover};border:none;color:${textColor};border-radius:50%;width:30px;height:30px;cursor:${cursorPointer};font-size:16px;`,
gearPanelContent: `padding:16px;display:flex;flex-direction:column;max-height:calc(80vh - 60px);`,
rangeInput: `width:100%;`,
actionButton: `width:100%;padding:10px;border-radius:8px;border:1px solid ${borderColor};background:${buttonHover};color:${textColor};font-size:14px;cursor:${cursorPointer};`,
checkboxLabel: `display:flex;align-items:center;gap:8px;color:${textColor};`,
panelToggleTransition: `transition:left 0.3s ease,opacity 0.3s ease,transform 0.3s ease,box-shadow 0.3s ease !important;`,
notificationAvatar: `width:42px;height:42px;border-radius:50%;flex-shrink:0;`,
notificationContent: `flex:1;overflow:hidden;`,
notificationHeader: `font-size:13px;font-weight:600;color:${accentColor};margin-bottom:4px;`,
notificationName: `font-size:14px;font-weight:500;color:${textColor};margin-bottom:2px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;`,
notificationMessage: `font-size:12px;color:${lowOpacityWhite};text-overflow:ellipsis;overflow:hidden;white-space:nowrap;`,
notificationCloseButton: `font-size:16px;font-weight:bold;color:rgba(232,245,233,0.6);margin-left:6px;cursor:${cursorPointer};transition:color 0.2s ease;background:none;border:none;padding:0;outline:none;`,
imageViewerStyles: `.f4t-image-viewer{position:fixed;z-index:1000001;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);backdrop-filter:${backdropBlurStrong};z-index:1000001;display:flex;align-items:center;justify-content:center;opacity:0;transition:${transitionOpacity};user-select:none;}.f4t-image-viewer.show{opacity:1;}.f4t-image-content{position:relative;z-index:1000001;width:90vw;height:90vh;display:flex;align-items:center;justify-content:center;transform:scale(0.8);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);}.f4t-image-viewer.show .f4t-image-content{transform:scale(1);}.f4t-image-container{position:relative;width:100%;height:100%;overflow:hidden;cursor:grab;border-radius:12px;box-shadow:0 25px 50px rgba(0,0,0,0.5);background:#000;display:flex;align-items:center;justify-content:center;}.f4t-image-container.dragging{cursor:grabbing;}.f4t-image-container img{display:block;transition:transform 0.3s ease;user-select:none;-webkit-user-drag:none;transform-origin:center center;}.f4t-image-close{position:absolute;top:0px;right:0;width:40px;height:40px;background:${opaqueWhite};border:2px solid rgba(255,255,255,0.3);border-radius:50%;color:white;font-size:20px;cursor:${cursorPointer};display:flex;align-items:center;justify-content:center;transition:${transitionEase};backdrop-filter:${backdropBlurStrong};z-index:10;}.f4t-image-close:hover{background:rgba(255,255,255,0.3);border-color:rgba(255,255,255,0.5);transform:scale(1.1);}.f4t-zoom-controls{position:absolute;bottom:-30px;left:50%;transform:translateX(-50%);display:flex;gap:8px;background:rgba(0,0,0,0.7);backdrop-filter:${backdropBlurStrong};border-radius:25px;padding:8px 12px;border:1px solid ${opaqueWhite};}.f4t-zoom-btn{width:36px;height:36px;border:none;border-radius:50%;background:${opaqueWhite};color:white;font-size:16px;cursor:${cursorPointer};display:flex;align-items:center;justify-content:center;transition:${transitionEase};font-weight:bold;}.f4t-zoom-btn:hover{background:rgba(255,255,255,0.3);transform:scale(1.1);}.f4t-zoom-btn:disabled{opacity:0.5;cursor:not-allowed;transform:scale(1);}.f4t-zoom-level{display:flex;align-items:center;color:white;font-size:12px;min-width:50px;justify-content:center;font-weight:500;}.f4t-image-info{position:absolute;top:0px;left:0;background:rgba(0,0,0,0.7);backdrop-filter:${backdropBlurStrong};color:white;padding:8px 12px;border-radius:20px;font-size:12px;border:1px solid ${opaqueWhite};opacity:0.8;}@media (max-width:768px){.f4t-image-content{width:95vw;height:95vh;}.f4t-zoom-controls{bottom:20px;position:fixed;left:50%;transform:translateX(-50%);}.f4t-image-close{top:20px;right:20px;position:fixed;}.f4t-image-info{top:20px;left:20px;position:fixed;}}`,
scrollbarAndMiscStyles: `.f4t-friends-scrollable::-webkit-scrollbar,.f4t-messages-container::-webkit-scrollbar{width:8px;}.f4t-friends-scrollable::-webkit-scrollbar-track,.f4t-messages-container::-webkit-scrollbar-track{background:rgba(26,60,52,0.2);border-radius:4px;}.f4t-friends-scrollable::-webkit-scrollbar-thumb,.f4t-messages-container::-webkit-scrollbar-thumb{background:rgba(104,159,56,0.5);border-radius:4px;transition:background 0.3s ease;}.f4t-friends-scrollable::-webkit-scrollbar-thumb:hover,.f4t-messages-container::-webkit-scrollbar-thumb:hover{background:rgba(104,159,56,0.7);}.f4t-loading-spinner{display:inline-block;width:20px;height:20px;border:2px solid rgba(104,159,56,0.3);border-radius:50%;border-top-color:rgba(104,159,56,0.8);animation:f4t-spin 1s ease-in-out infinite;}@keyframes f4t-spin{to{transform:rotate(360deg);}}.f4t-image-viewer{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.9);z-index:20000;display:flex;justify-content:center;align-items:center;opacity:0;transition:${transitionOpacity};}.f4t-image-viewer.show{opacity:1;}.f4t-image-content{position:relative;max-width:90vw;max-height:90vh;transform:scale(0.8);transition:transform 0.3s ease;}.f4t-image-viewer.show .f4t-image-content{transform:scale(1);}.f4t-image-viewer img{max-width:100%;max-height:100%;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.5);}.f4t-image-close{position:absolute;top:-40px;right:0;background:rgba(26,60,52,0.9);border:none;color:#e8f5e9;border-radius:50%;width:36px;height:36px;cursor:${cursorPointer};font-size:18px;font-weight:bold;transition:${transitionEase};backdrop-filter:blur(5px);}.f4t-image-close:hover{background:rgba(104,159,56,0.8);transform:scale(1.1);}`,
newMessageFriendItem: `display:flex;align-items:center;gap:6px;margin-bottom:8px;padding:6px 0 4px 6px;cursor:${cursorPointer};border-radius:4px;transition:background-color 0.2s ease;`,
newMessageIndicator: `width:8px;height:8px;background:#ff0000;border-radius:50%;box-shadow:0 0 6px rgba(255,0,0,0.6);animation:pulse-red 2s infinite;`,
newMessageAvatar: `width:20px;height:20px;border-radius:50%;`,
newMessageUserName: `font-family:${fontFamily};font-size:12px;font-weight:600;color:white;`,
newMessagePreview: `font-size:11px;color:#ddd;margin-left:6px;`,
redPulseAnimation: `@keyframes pulse-red{0%{box-shadow:0 0 6px rgba(255,0,0,0.6);}50%{box-shadow:0 0 12px rgba(255,0,0,1);}100%{box-shadow:0 0 6px rgba(255,0,0,0.6);}}`,
onlineFriendItem: `display:flex;align-items:center;gap:6px;margin-bottom:8px;padding:6px 0 4px 6px;cursor:${cursorPointer};border-radius:4px;transition:background-color 0.2s ease,opacity 0.3s ease,transform 0.3s ease;`,
onlineIndicator: `width:8px;height:8px;background:#68d391;border-radius:50%;box-shadow:0 0 6px rgba(0,255,0,0.6);animation:pulse 2s infinite;`,
onlineFriendAvatar: `width:20px;height:20px;border-radius:50%;`,
onlineFriendName: `font-family:${fontFamily};font-size:12px;font-weight:400;color:white;`,
pulseAnimation: `@keyframes pulse{0%{box-shadow:0 0 6px rgba(0,255,0,0.6);}50%{box-shadow:0 0 12px rgba(0,255,0,1);}100%{box-shadow:0 0 6px rgba(0,255,0,0.6);}}`,
modalStyles: `.room-modal-overlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 1.3s ease;}.room-modal-overlay.show{opacity:1;}.room-modal{background:${notificationBg};border-radius:16px;box-shadow:${boxShadowModal};border:1px solid ${borderColor};backdrop-filter:blur(5px) saturate(150%);padding:0;max-width:600px;width:90%;max-height:0;overflow:hidden;transform:translateY(-50px) scale(0.9);opacity:0;transition:max-height 1.5s ease,width 1.5s ease,opacity 0.4s ease,transform 1.5s ease;}.room-modal-overlay.show .room-modal{transform:translateY(0) scale(1);opacity:1;max-height:90vh;}.room-modal-header{background:transparent;border-bottom:1px solid ${borderColor};padding:11px 24px;color:white;position:relative;overflow:hidden;}.room-modal-header::before{content:none;}.room-modal-title{font-family:${fontFamily};font-size:17px;font-weight:700;margin:0;position:relative;z-index:1;color:white;min-height:1.2em;transition:${transitionEase};text-shadow:none;}.room-modal-close{position:absolute;top:2px;right:2px;background:${opaqueWhite};border:none;color:white;font-size:24px;width:32px;height:32px;border-radius:50%;cursor:${cursorPointer};display:flex;align-items:center;justify-content:center;transition:${transitionEase};z-index:2;}.room-modal-close:hover{background:rgba(255,255,255,0.3);transform:scale(1.1);}.room-modal-body{padding:24px;color:white;position:relative;}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;opacity:1;transition:opacity 1.3s ease;}.loading-container.hide{opacity:0;}.loading-spinner{width:60px;height:60px;border:4px solid rgba(102,126,234,0.2);border-left:4px solid #667eea;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px;}.loading-text{font-size:16px;color:rgba(255,255,255,0.8);margin-bottom:8px;}.loading-subtext{font-size:14px;color:rgba(255,255,255,0.5);}.content-container{position:relative;opacity:0;transform:translateY(20px);max-height:0;overflow:hidden;transition:max-height 1.6s ease,opacity 0.4s ease,transform 0.4s ease;}.content-container.show{opacity:1;transform:translateY(0);max-height:2000px;overflow:visible;}.room-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}.room-info-item{background:rgba(255,255,255,0.05);border:1px solid ${borderLight};border-radius:8px;padding:6px;}.room-info-label{font-size:12px;color:${textColor};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;}.room-info-value{font-size:10px;font-weight:600;color:white;}.clients-section{margin-top:24px;}.clients-title{font-size:13px;font-weight:600;margin-bottom:16px;color:white;display:flex;align-items:center;gap:8px;}.clients-count{background:rgba(102,126,234,0.2);color:#667eea;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:500;}.clients-grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;}.client-card{display:flex;flex-direction:column;align-items:center;text-align:center;min-width:80px;}.client-avatar{width:60px;height:60px;border-radius:50%;border:3px solid transparent;background:linear-gradient(135deg,#1a1a1a,#121212);padding:2px;margin-bottom:8px;transition:${transitionEase};cursor:${cursorPointer};}.client-avatar:hover{transform:scale(1.1);box-shadow:0 8px 25px rgba(26,26,26,0.4);}.client-avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;}.client-name{font-size:12px;font-weight:500;color:white;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.client-stats{font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px;}.room-url-section{margin-top:20px;text-align:center;}.room-url{display:inline-flex;align-items:center;gap:8px;background:rgba(26,26,26,0.2);border:1px solid rgba(26,26,26,0.3);color:${textColor};text-decoration:none;padding:8px 16px;border-radius:8px;font-size:13px;transition:${transitionEase};}.room-url:hover{background:rgba(26,26,26,0.3);transform:translateY(-2px);box-shadow:0 4px 12px rgba(26,26,26,0.3);}.verified-badge{color:#4CAF50;font-size:10px;margin-left:4px;}.error-container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;text-align:center;}.error-icon{font-size:48px;margin-bottom:16px;opacity:0.7;}.error-title{font-size:18px;color:#ff6b6b;margin-bottom:8px;}.error-message{font-size:14px;color:rgba(255,255,255,0.6);}@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`,
onlineFriendsDisplay: `position:fixed;top:60px;left:10px;z-index:9998;display:none;flex-direction:column;gap:8px;transition:${transitionEase};transform:translateY(0);`,
friendElement: `display:flex;align-items:center;gap:12px;padding:12px;cursor:${cursorPointer};border-radius:8px;transition:background-color 0.2s ease,opacity 0.3s ease,transform 0.3s ease;border:1px solid transparent;margin-bottom:4px;`,
onlineStatusIndicator: `position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;background:#68d391;border:2px solid rgba(26,60,52,0.95);border-radius:50%;`,
friendInfo: `flex:1;`,
friendName: `font-weight:500;font-size:14px;color:${textColor};`,
friendStatus: `font-size:12px;`,
sectionHeader: `font-size:12px;font-weight:600;padding:8px 12px 4px 12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;`,
onlineHeader: `color:#68d391;border-bottom:1px solid rgba(76,175,80,0.3);`,
offlineHeader: `color:rgba(232,245,233,0.7);padding:16px 12px 4px 12px;border-bottom:1px solid rgba(232,245,233,0.2);`,
noFriendsMessage: `text-align:center;opacity:0.7;padding:20px;color:${textColor};`,
animatedElement: `opacity:0;transform:translateY(10px);transition:${transitionOpacity},transform 0.3s ease;`,
settingsBackdrop: `position:fixed;top:0;left:0;width:100vw;height:100vh;background:transparent;z-index:${zIndexHigh};display:none;`,
settingsPanel: `position:fixed;top:50px;left:10px;background:${notificationBg};border-radius:16px;box-shadow:${boxShadowModal};z-index:${zIndexHigher};min-width:320px;max-width:400px;max-height:70vh;font-family:${fontFamily};display:none;border:1px solid ${borderColor};backdrop-filter:blur(5px) saturate(150%);overflow:hidden;`,
settingsHeader: `padding:20px;border-bottom:1px solid ${borderColor};`,
settingsHeaderFlex: `display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;`,
settingsTitle: `margin:0;font-size:18px;color:${textColor};`,
settingsCloseButton: `background:${buttonHover};border:none;color:${textColor};border-radius:50%;width:30px;height:30px;cursor:${cursorPointer};font-size:16px;`,
searchInput: `width:100%;padding:8px 12px;border:1px solid ${borderColor};border-radius:8px;background:rgba(255,255,255,0.1);color:${textColor};font-family:${fontFamily};font-size:14px;outline:none;`,
friendsListContainer: `display:flex;flex-direction:column;gap:8px;padding:16px;overflow-y:auto;max-height:calc(70vh - 140px);`,
loadingText: `text-align:center;color:${textColor};opacity:0.7;padding:20px;`,
settingsPanelTransition: `opacity:0;transform:translateY(-20px);`,
onlineFriendsDisplayTransition: `transform:translateY(0);`,
backdropTransition: `display:none;`,
messageElement: `margin-bottom:12px;display:flex;flex-direction:column;`,
bubble: `border-radius:12px;max-width:80%;font-family:${fontFamily};font-size:14px;`,
bubbleMedia: `overflow:hidden;position:relative;`,
image: `max-width:200px;max-height:200px;border-radius:8px;cursor:${cursorPointer};display:block;`,
mediaLabel: `position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.7);color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;`,
timeElement: `font-size:11px;color:rgba(232,245,233,0.6);margin-top:4px;font-family:${fontFamily};`,
backdrop: `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0);z-index:10001;display:flex;justify-content:center;align-items:center;transition:background-color 0.3s ease;`,
modal: `background:${notificationBg};color:${textColor};border-radius:16px;box-shadow:${boxShadowModal};width:700px;height:815px;display:flex;flex-direction:column;border:1px solid ${borderColor};backdrop-filter:blur(5px) saturate(150%);font-family:${fontFamily};opacity:0;transform:scale(0.8) translateY(-20px);transition:${transitionEase};`,
modalHeader: `display:flex;align-items:center;padding:20px;border-bottom:1px solid ${borderColor};`,
avatar: `width:40px;height:40px;border-radius:50%;margin-right:12px;`,
title: `margin:0;flex:1;font-size:18px;color:${textColor};`,
closeButton: `background:${buttonHover};border:none;color:${textColor};border-radius:50%;width:30px;height:30px;cursor:${cursorPointer};font-size:16px;`,
messagesContainer: `flex:1;overflow-y:auto;padding:16px;display:flex;justify-content:center;align-items:center;`,
inputContainer: `display:flex;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid ${borderColor};background:${notificationBg};backdrop-filter:blur(5px) saturate(150%);`,
iconButton: `background:${buttonHover};border:1px solid ${borderColor};color:${textColor};border-radius:8px;width:40px;height:40px;cursor:${cursorPointer};font-size:18px;display:flex;align-items:center;justify-content:center;transition:background 0.2s ease,transform 0.2s ease;`,
emojiMenu: `position:absolute;bottom:70px;left:16px;background:${notificationBg};border:1px solid ${borderColor};border-radius:8px;padding:10px;max-height:200px;overflow-y:auto;display:none;z-index:10002;box-shadow:0 4px 12px rgba(0,0,0,0.3);backdrop-filter:blur(5px);`,
emojiCategory: `margin-bottom:8px;`,
emojiCategoryTitle: `font-size:12px;color:rgba(232,245,233,0.7);margin-bottom:4px;font-weight:500;`,
emojiContainer: `display:flex;flex-wrap:wrap;gap:4px;`,
emojiButton: `background:none;border:none;font-size:18px;cursor:${cursorPointer};padding:4px;border-radius:4px;`,
textInput: `flex:1;padding:8px 12px;border:1px solid ${borderColor};border-radius:8px;background:rgba(255,255,255,0.1);color:${textColor};font-family:${fontFamily};font-size:14px;outline:none;transition:border-color 0.2s ease;resize:none;height:40px;line-height:20px;overflow-y:auto;`,
loadingSpinner: `display:flex;flex-direction:column;align-items:center;gap:16px;color:rgba(232,245,233,0.7);`
    };
}


function AudioManagement() {
    const apiKey = "2Bxaf7DrfWPBqdB8U49znwmAlfoubC4LxHJkfH0i";
    const soundIds = {
        online: 803504,
        followers: null,
        message: 400697,
        Loaded: 634086,
        MessageSent: 537061,
        HideShowInterface: 220207,
        DarkModeOn: 588241,
        ShowModals: 398661,
        Stylish: 320664
    };
    let volume = parseFloat(localStorage['AudioManager:Volume'] || 0.5);
    const audios = {
        online: new Audio(),
        followers: new Audio("https://www.myinstants.com/media/sounds/tethys.mp3"),
        message: new Audio(),
        Loaded: new Audio(),
        MessageSent: new Audio(),
        HideShowInterface: new Audio(),
        DarkModeOn: new Audio(),
        ShowModals: new Audio(),
        Stylish: new Audio(),
    };
    Object.values(audios).forEach(a => a.volume = volume);
    for (const [key, id] of Object.entries(soundIds)) {
        if (id) {
            fetch(`https://freesound.org/apiv2/sounds/${id}/?token=${apiKey}`)
                .then(res => res.json())
                .then(data => {
                    audios[key].src = data.previews['preview-hq-mp3'];
                })
                .catch(err => console.error(`Failed to load Freesound audio for ${key}:`, err));
        }
    }
    const setVolume = (v) => {
        volume = v;
        localStorage['AudioManager:Volume'] = v;
        Object.values(audios).forEach(a => a.volume = volume);
    };
    const play = (key) => {
        if (audios[key] && volume > 0) audios[key].play();
    };
    const getVolume = () => volume;
    return { setVolume, play, getVolume };
}

function openScreenRecorderModal() {
    // Remove any existing bar first
    document.getElementById('tm-screen-recorder-bar')?.remove();
    document.getElementById('tm-screen-recorder-settings')?.remove();

    // ===== BAR POSITION: CHANGE LEFT AND TOP VALUES HERE =====
    const barLeft = '20%';  // Change this value for horizontal position
    const barTop = '9px';   // Change this value for vertical position
    // ========================================================

    // Create minimalistic bar
    const bar = document.createElement('div');
    bar.id = 'tm-screen-recorder-bar';
    bar.style = `
        position: fixed;
        left: ${barLeft};
        top: -50px;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0);
        backdrop-filter: blur(20px);
        padding: 2px 8px;
        border-radius: 7px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border: 1px solid rgba(255,255,255,0.08);
        transition: top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    bar.innerHTML = `
        <button id="tm-rec-record" style="
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ef4444;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
        " title="Start Recording"></button>

        <button id="tm-rec-stop" style="
            width: 18px;
            height: 18px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.15);
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: none;
        " title="Stop Recording">
            <div style="width: 8px; height: 8px; background: white; margin: auto; border-radius: 1px;"></div>
        </button>

        <span id="tm-rec-timer" style="
            color: white;
            font-size: 12px;
            font-weight: 500;
            min-width: 38px;
            text-align: center;
            display: none;
            font-variant-numeric: tabular-nums;
        ">00:00</span>

        <button id="tm-rec-settings" style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: transparent;
            border: none;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
            transition: all 0.2s;
        " title="Settings">⚙</button>

        <button id="tm-rec-close" style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: transparent;
            border: none;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.6);
            font-size: 18px;
            transition: all 0.2s;
            line-height: 1;
        " title="Close">×</button>
    `;

    document.body.appendChild(bar);

    // Animate slide down
    setTimeout(() => {
        bar.style.top = barTop;
    }, 10);

    // Create settings panel
    const settings = document.createElement('div');
    settings.id = 'tm-screen-recorder-settings';
    settings.style = `
        position: fixed;
        left: ${barLeft};
        top: calc(${barTop} + 38px);
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.04);
        backdrop-filter: blur(20px);
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 999998;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border: 1px solid rgba(255,255,255,0.08);
        min-width: 160px;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;

settings.innerHTML = `
    <div style="margin-bottom: 8px;">
        <label style="display: block; margin-bottom: 4px; font-size: 9px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">Audio</label>
        <select id="tm-rec-audio" style="width: 100%; padding: 5px; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 5px; color: white; font-size: 11px;">
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="none">No Audio</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="system" selected>System Audio</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="microphone">Microphone</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="both">System + Mic</option>
        </select>
    </div>

    <div style="margin-bottom: 8px;">
        <label style="display: block; margin-bottom: 4px; font-size: 9px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">FPS</label>
        <select id="tm-rec-fps" style="width: 100%; padding: 5px; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 5px; color: white; font-size: 11px;">
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="15">15 FPS</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="24">24 FPS</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="30" selected>30 FPS</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="60">60 FPS</option>
        </select>
    </div>

    <div style="margin-bottom: 8px;">
        <label style="display: block; margin-bottom: 4px; font-size: 9px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">Quality</label>
        <select id="tm-rec-quality" style="width: 100%; padding: 5px; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 5px; color: white; font-size: 11px;">
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="standard">Standard (5 Mbps)</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="high" selected>High (10 Mbps)</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="ultra">Ultra (20 Mbps)</option>
        </select>
    </div>

    <div>
        <label style="display: block; margin-bottom: 4px; font-size: 9px; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.5px;">Format</label>
        <select id="tm-rec-format" style="width: 100%; padding: 5px; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 5px; color: white; font-size: 11px;">
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="webm">WebM</option>
            <option style="background: rgba(0, 0, 0, 0.95); color: white;" value="mp4">MP4</option>
        </select>
    </div>
`;

    document.body.appendChild(settings);

    let recorder, chunks = [], stream, micStream, startTime, timerInterval;
    const recordBtn = bar.querySelector('#tm-rec-record');
    const stopBtn = bar.querySelector('#tm-rec-stop');
    const timerSpan = bar.querySelector('#tm-rec-timer');
    const settingsBtn = bar.querySelector('#tm-rec-settings');
    const closeBtn = bar.querySelector('#tm-rec-close');
    const audioSelect = settings.querySelector('#tm-rec-audio');
    const fpsSelect = settings.querySelector('#tm-rec-fps');
    const formatSelect = settings.querySelector('#tm-rec-format');

    // Close function with slide up animation
    const closeBar = () => {
        bar.style.top = '-50px';
        settings.style.opacity = '0';
        setTimeout(() => {
            bar.remove();
            settings.remove();
            if (stream) stream.getTracks().forEach(t => t.stop());
            if (micStream) micStream.getTracks().forEach(t => t.stop());
            if (timerInterval) clearInterval(timerInterval);
        }, 300);
    };

    closeBtn.onclick = closeBar;

    // Toggle settings
    settingsBtn.onclick = (e) => {
        e.stopPropagation();
        if (settings.style.display === 'none') {
            settings.style.display = 'block';
            setTimeout(() => settings.style.opacity = '1', 10);
        } else {
            settings.style.opacity = '0';
            setTimeout(() => settings.style.display = 'none', 200);
        }
    };

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settings.contains(e.target) && e.target !== settingsBtn) {
            settings.style.opacity = '0';
            setTimeout(() => settings.style.display = 'none', 200);
        }
    });

    recordBtn.onclick = async () => {
        try {
            const audioOption = audioSelect.value;
            const fps = parseInt(fpsSelect.value);

            stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: fps },
                audio: audioOption === 'system' || audioOption === 'both'
            });

            let audioTracks = [];

            if (audioOption === 'microphone' || audioOption === 'both') {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioTracks.push(...micStream.getAudioTracks());
            }

            if (audioOption === 'system' || audioOption === 'both') {
                audioTracks.push(...stream.getAudioTracks());
            }

            const combinedStream = new MediaStream([
                ...stream.getVideoTracks(),
                ...audioTracks
            ]);

            let mimeType = formatSelect.value === 'mp4'
                ? 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
                : 'video/webm; codecs=vp9,opus';

            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = formatSelect.value === 'mp4' ? 'video/mp4' : 'video/webm';
            }

            recorder = new MediaRecorder(combinedStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000
            });

            chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: recorder.mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const extension = formatSelect.value === 'mp4' ? 'mp4' : 'webm';
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                a.download = `recording-${timestamp}.${extension}`;
                a.click();
                URL.revokeObjectURL(url);

                stream.getTracks().forEach(t => t.stop());
                if (micStream) micStream.getTracks().forEach(t => t.stop());
                clearInterval(timerInterval);

                recordBtn.style.display = 'block';
                stopBtn.style.display = 'none';
                timerSpan.style.display = 'none';
                recordBtn.style.background = '#ef4444';
                audioSelect.disabled = false;
                fpsSelect.disabled = false;
                formatSelect.disabled = false;
            };

            recorder.start();
            startTime = Date.now();

            timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                timerSpan.textContent = `${minutes}:${seconds}`;
            }, 1000);

            recordBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            timerSpan.style.display = 'block';
            settings.style.opacity = '0';
            setTimeout(() => settings.style.display = 'none', 200);
            audioSelect.disabled = true;
            fpsSelect.disabled = true;
            formatSelect.disabled = true;

        } catch (err) {
            alert('Recording failed: ' + err.message);
        }
    };

    stopBtn.onclick = () => {
        if (recorder && recorder.state === 'recording') {
            recorder.stop();
        }
    };

    // Hover effects
    recordBtn.onmouseenter = () => {
        if (recordBtn.style.display !== 'none') {
            recordBtn.style.transform = 'scale(1.1)';
        }
    };
    recordBtn.onmouseleave = () => {
        recordBtn.style.transform = 'scale(1)';
    };

    stopBtn.onmouseenter = () => {
        stopBtn.style.background = 'rgba(239, 68, 68, 0.8)';
    };
    stopBtn.onmouseleave = () => {
        stopBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    };

    settingsBtn.onmouseenter = () => {
        settingsBtn.style.color = 'rgba(255, 255, 255, 1)';
    };
    settingsBtn.onmouseleave = () => {
        settingsBtn.style.color = 'rgba(255, 255, 255, 0.7)';
    };

    closeBtn.onmouseenter = () => {
        closeBtn.style.color = 'rgba(255, 255, 255, 1)';
    };
    closeBtn.onmouseleave = () => {
        closeBtn.style.color = 'rgba(255, 255, 255, 0.7)';
    };
}












function openUserHistoryModal(userId) {
    const css = GatheredCSS();
    let modal = document.getElementById('user-history-modal');
    let modalContent, isNewModal = false;

    if (modal) {
        modalContent = modal.querySelector('.modal-content-inner');
        modalContent.innerHTML = '';
    } else {
        isNewModal = true;
        modal = document.createElement('div');
        modal.id = 'user-history-modal';
        modal.style.cssText = css.modalOverlay;
        modalContent = document.createElement('div');
        modalContent.className = 'modal-content-inner';
        modalContent.style.cssText = css.modalContent;
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    const createButton = (innerHTML, baseStyle, hoverStyle, onClick) => {
        const btn = document.createElement('button');
        btn.innerHTML = innerHTML;
        btn.style.cssText = baseStyle;
        btn.onmouseenter = () => btn.style.cssText = baseStyle + hoverStyle;
        btn.onmouseleave = () => btn.style.cssText = baseStyle;
        if (onClick) btn.onclick = onClick;
        return btn;
    };

    const closeButton = createButton(
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>',
        css.modalCloseButton,
        css.modalCloseButtonHover
    );

    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = css.historySearchContainer;
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Type a name here...';
    searchInput.style.cssText = css.historySearchInput;
    searchInput.onfocus = () => searchInput.style.cssText = css.historySearchInput + css.historySearchInputFocus;
    searchInput.onblur = () => searchInput.style.cssText = css.historySearchInput;

    const performSearch = () => {
        const searchName = searchInput.value.trim();
        closeModal();
        searchByName(searchName);
    };

    const searchButton = createButton('Search', css.historySearchButton, css.historySearchButtonHover, e => {
        e.stopPropagation();
        performSearch();
    });

    searchInput.onkeypress = e => e.key === 'Enter' && performSearch();
    searchContainer.append(searchInput, searchButton);

    modalContent.innerHTML = `<div style="${css.historyLoadingContainer}"><div class="spinner" style="${css.historySpinner}"></div><div style="${css.historyLoadingTitle}">Fetching user history...</div><div style="${css.historyLoadingText}">Please wait</div></div>`;
    modalContent.append(searchContainer, closeButton);

    if (isNewModal) {
        void modal.offsetHeight;
        modal.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
        modalContent.style.opacity = '1';
    }

    const cleanup = () => {
        const contentDiv = modalContent.querySelector('[style*="color: white"]');
        if (contentDiv) contentDiv.innerHTML = '';
    };

    const closeModal = () => {
        cleanup();
        modal.style.opacity = '0';
        modalContent.style.transform = 'translateY(30px)';
        modalContent.style.opacity = '0';
        setTimeout(() => modal.remove(), 500);
    };

    modal.onclick = e => e.target === modal && (closeModal(), closeBackdrop());
    closeButton.onclick = e => (e.stopPropagation(), closeModal(), closeBackdrop());
    modalContent.onclick = e => e.stopPropagation();

    modalContent.addEventListener('click', e => {
        const participantItem = e.target.closest('.participant-item');
        if (participantItem) {
            e.stopPropagation();
            cleanup();
            openUserHistoryModal(participantItem.getAttribute('data-fftid'));
            return;
        }

        const sameNameUser = e.target.closest('.same-name-user');
        if (sameNameUser) {
            e.stopPropagation();
            cleanup();
            openUserHistoryModal(sameNameUser.getAttribute('data-fftid'));
            return;
        }

        const followBtn = e.target.closest('.follow-btn');
        if (followBtn) {
            e.stopPropagation();
            const userId = followBtn.getAttribute('data-fftid');
            followBtn.textContent = 'Following...';
            followBtn.style.opacity = '0.6';
            followBtn.style.pointerEvents = 'none';
            followUser(userId).then(result => {
                if (result.success) {
                    followBtn.textContent = 'Following';
                    followBtn.style.cssText = css.historyUserId + css.historyFollowButton + css.historyFollowButtonFollowing + 'opacity:1;';
                } else {
                    followBtn.textContent = 'Follow';
                    followBtn.style.cssText = css.historyUserId + css.historyFollowButton + 'opacity:1;pointer-events:auto;';
                    console.error('Follow failed:', result.error);
                    alert(`Failed to follow user: ${result.error}`);
                }
            });
            return;
        }

        if (e.target.closest('#load-more-rooms-btn') && window.currentLoadRoomsFunction) {
            e.stopPropagation();
            window.currentLoadRoomsFunction();
            return;
        }

        const loadMoreParticipantsBtn = e.target.closest('.load-more-participants-btn');
        if (loadMoreParticipantsBtn) {
            e.stopPropagation();
            const roomIndex = loadMoreParticipantsBtn.getAttribute('data-room-index');
            window.participantLoaders?.[roomIndex]?.();
            return;
        }

        if (e.target.closest('#load-more-samename-btn') && window.currentLoadSameNameFunction) {
            e.stopPropagation();
            window.currentLoadSameNameFunction();
        }
    });

    GM_xmlhttpRequest({
        method: "GET",
        url: `https://free4talk.info/data-api/user-details/${userId}`,
        headers: {"accept": "application/json, text/plain, */*"},
        onload: response => {
            try {
                const data = JSON.parse(response.responseText);
                const profile = data.user.profileHistory[0] || {};

                modalContent.innerHTML = `<div style="color: white; margin-top: 50px;">
                    <div style="${css.historyHeader}">
                        <img src="${profile.avatar || ''}" style="${css.historyAvatar}">
                        <h2 style="${css.historyUserName}">${profile.name || 'Unknown'}</h2>
                        <div style="${css.historyUserId}">ID: ${data.user.fftId}</div>
                        <div id="follow-btn-${data.user.fftId}" class="follow-btn" style="${css.historyUserId}${css.historyFollowButton}" data-fftid="${data.user.fftId}">Follow</div>
                        <div style="${css.historyStatsContainer}">
                            <div style="${css.historyStatItem}"><div style="${css.historyStatValue};color:#4CAF50;">${profile.followers || 0}</div><div style="${css.historyStatLabel}">Followers</div></div>
                            <div style="${css.historyStatItem}"><div style="${css.historyStatValue};color:#2196F3;">${profile.following || 0}</div><div style="${css.historyStatLabel}">Following</div></div>
                            <div style="${css.historyStatItem}"><div style="${css.historyStatValue};color:#FF9800;">${profile.friends || 0}</div><div style="${css.historyStatLabel}">Friends</div></div>
                        </div>
                    </div>
                    ${data.user.profileHistory.length > 1 ? `<div style="${css.historySection}">
                        <h3 style="${css.historySectionTitle}"><span></span> Name History</h3>
                        <div style="${css.historyNameList}">${data.user.profileHistory.map(p => `<div style="${css.historyNameItem}"><img src="${p.avatar}" style="${css.historyNameAvatar}"><div><div style="${css.historyNameText}">${p.name}</div><div style="${css.historyNameDate}">${new Date(p.createdAt).toLocaleDateString()}</div></div></div>`).join('')}</div>
                    </div>` : ''}
                    <div style="${css.historySection}">
                        <h3 style="${css.historySectionTitle}"><span></span> Room History <span style="${css.historySectionCount}">(${data.totalRooms} total)</span></h3>
                        <div id="room-history-container" style="${css.historyRoomGrid}"></div>
                        ${data.rooms.length > 6 ? `<div style="${css.historyButtonContainer}"><button id="load-more-rooms-btn" style="${css.loadMoreRoomsButton}">Load More Rooms (${data.rooms.length - 6} remaining)</button></div>` : ''}
                    </div>
                    ${data.usersWithSameName.length > 0 ? `<div style="${css.historySameNameSection}">
                        <h3 style="${css.historySameNameTitle}"><span></span> Users with Same Name (${data.usersWithSameName.length})</h3>
                        <div id="same-name-users-container" style="${css.historySameNameGrid}"></div>
                        ${data.usersWithSameName.length > 6 ? `<div style="${css.historyButtonContainer}"><button id="load-more-samename-btn" style="${css.loadMoreSameNameButton}" onmouseenter="this.style.cssText='${css.loadMoreSameNameButton}${css.loadMoreSameNameButtonHover}'" onmouseleave="this.style.cssText='${css.loadMoreSameNameButton}'">Load More Users (${data.usersWithSameName.length - 6} remaining)</button></div>` : ''}
                    </div>` : ''}
                </div>`;

                modalContent.append(searchContainer, closeButton);

                const loadMoreRoomsBtn = modalContent.querySelector('#load-more-rooms-btn');
                if (loadMoreRoomsBtn) {
                    loadMoreRoomsBtn.onmouseenter = function() {!this.disabled && (this.style.cssText = css.loadMoreRoomsButton + css.loadMoreRoomsButtonHover)};
                    loadMoreRoomsBtn.onmouseleave = function() {!this.disabled && (this.style.cssText = css.loadMoreRoomsButton)};
                }

                let allRooms = [...data.rooms], currentRoomIndex = 0, currentPage = 1, isLoadingMorePages = false;
                const {totalRooms} = data, roomsPerLoad = 6;
                window.participantLoaders = {};

                const loadRooms = () => {
                    const container = modalContent.querySelector('#room-history-container');
                    const loadMoreBtn = modalContent.querySelector('#load-more-rooms-btn');
                    const roomsToLoad = allRooms.slice(currentRoomIndex, currentRoomIndex + roomsPerLoad);

                    roomsToLoad.forEach((room, index) => {
                        const actualRoomIndex = currentRoomIndex + index;
                        const roomCard = document.createElement('div');
                        roomCard.style.cssText = css.historyRoomCard;
                        roomCard.onmouseenter = () => roomCard.style.cssText = css.historyRoomCard + css.historyRoomCardHover;
                        roomCard.onmouseleave = () => roomCard.style.cssText = css.historyRoomCard;

                        roomCard.innerHTML = `<div style="${css.historyRoomHeader}">
                            <div style="${css.historyRoomTopic}">${room.topic || ' No Topic'}</div>
                            <div style="${css.historyRoomMeta}">
                                <span style="${css.historyRoomLanguages}"> ${room.languages.join(', ')}</span>
                                <span style="${css.historyRoomLevel}"> ${room.level}</span>
                                <span style="${css.historyRoomParticipants}"> ${room.clients.length} participants</span>
                            </div>
                            <div style="${css.historyRoomDate}"> ${new Date(room.roomCreatedAt).toLocaleString()}</div>
                        </div>
                        <div style="${css.historyParticipantsSection}">
                            <div style="${css.historyParticipantsTitle}">Participants:</div>
                            <div class="participants-grid-${actualRoomIndex}" style="${css.historyParticipantsGrid}"></div>
                            ${room.clients.length > 6 ? `<div style="${css.historyButtonContainerSmall}"><button class="load-more-participants-btn" data-room-index="${actualRoomIndex}" style="${css.loadMoreParticipantsButton}" onmouseenter="this.style.cssText='${css.loadMoreParticipantsButton}${css.loadMoreParticipantsButtonHover}'" onmouseleave="this.style.cssText='${css.loadMoreParticipantsButton}'">Load More Participants (${room.clients.length - 6} remaining)</button></div>` : ''}
                        </div>
                        <a href="${room.url}" target="_blank" style="${css.historyRoomLink}" onmouseenter="this.style.cssText='${css.historyRoomLink}${css.historyRoomLinkHover}'" onmouseleave="this.style.cssText='${css.historyRoomLink}'"> Link</a>`;

                        container.appendChild(roomCard);

                        let currentParticipantIndex = 0;
                        const participantsPerLoad = 6;

                        window.participantLoaders[actualRoomIndex] = () => {
                            const participantsGrid = roomCard.querySelector(`.participants-grid-${actualRoomIndex}`);
                            const loadMoreParticipantsBtn = roomCard.querySelector('.load-more-participants-btn');
                            const participantsToLoad = room.clients.slice(currentParticipantIndex, currentParticipantIndex + participantsPerLoad);

                            participantsToLoad.forEach(client => {
                                const participantDiv = document.createElement('div');
                                participantDiv.className = 'participant-item';
                                participantDiv.setAttribute('data-fftid', client.fftId);
                                participantDiv.style.cssText = css.historyParticipantItem;
                                participantDiv.onmouseenter = () => participantDiv.style.cssText = css.historyParticipantItem + css.historyParticipantItemHover;
                                participantDiv.onmouseleave = () => participantDiv.style.cssText = css.historyParticipantItem;
                                participantDiv.innerHTML = `<img src="${client.avatar}" style="${css.historyParticipantAvatar}"><div style="${css.historyParticipantInfo}"><div style="${css.historyParticipantName}">${client.name}</div><div style="${css.historyParticipantFollowers}">${client.followers} followers</div></div>`;
                                participantsGrid.appendChild(participantDiv);
                            });

                            currentParticipantIndex += participantsPerLoad;
                            if (loadMoreParticipantsBtn) {
                                const remaining = room.clients.length - currentParticipantIndex;
                                remaining > 0 ? loadMoreParticipantsBtn.textContent = `Load More Participants (${remaining} remaining)` : loadMoreParticipantsBtn.style.display = 'none';
                            }
                        };

                        window.participantLoaders[actualRoomIndex]();
                    });

                    currentRoomIndex += roomsPerLoad;

                    if (loadMoreBtn) {
                        const remainingInCurrentPage = allRooms.length - currentRoomIndex;
                        const hasMorePages = currentRoomIndex < totalRooms;

                        if (remainingInCurrentPage > 0) {
                            loadMoreBtn.textContent = `Load More Rooms (${remainingInCurrentPage} remaining)`;
                            loadMoreBtn.style.display = 'block';
                        } else if (hasMorePages && !isLoadingMorePages) {
                            loadMoreBtn.textContent = 'More History';
                            loadMoreBtn.style.display = 'block';
                        } else if (isLoadingMorePages) {
                            loadMoreBtn.textContent = 'Loading...';
                            loadMoreBtn.disabled = true;
                            loadMoreBtn.style.opacity = '0.6';
                        } else {
                            loadMoreBtn.style.display = 'none';
                        }
                    }
                };

                const fetchNextPage = () => {
                    if (isLoadingMorePages) return;
                    isLoadingMorePages = true;
                    const loadMoreBtn = modalContent.querySelector('#load-more-rooms-btn');
                    if (loadMoreBtn) {
                        loadMoreBtn.textContent = 'Loading...';
                        loadMoreBtn.disabled = true;
                        loadMoreBtn.style.opacity = '0.6';
                    }

                    GM_xmlhttpRequest({
                        method: "GET",
                        url: `https://free4talk.info/data-api/user-rooms/${userId}?page=${++currentPage}&limit=12`,
                        headers: {"accept": "application/json, text/plain, */*"},
                        onload: response => {
                            try {
                                allRooms = [...allRooms, ...JSON.parse(response.responseText).rooms];
                                isLoadingMorePages = false;
                                if (loadMoreBtn) {
                                    loadMoreBtn.disabled = false;
                                    loadMoreBtn.style.opacity = '1';
                                }
                                loadRooms();
                            } catch(e) {
                                console.error('Error loading more rooms:', e);
                                isLoadingMorePages = false;
                                if (loadMoreBtn) {
                                    loadMoreBtn.textContent = 'Error - Try Again';
                                    loadMoreBtn.disabled = false;
                                    loadMoreBtn.style.opacity = '1';
                                }
                            }
                        },
                        onerror: error => {
                            console.error("Error fetching next page:", error);
                            isLoadingMorePages = false;
                            if (loadMoreBtn) {
                                loadMoreBtn.textContent = 'Error - Try Again';
                                loadMoreBtn.disabled = false;
                                loadMoreBtn.style.opacity = '1';
                            }
                        }
                    });
                };

                window.currentLoadRoomsFunction = () => {
                    const remainingInCurrentPage = allRooms.length - currentRoomIndex;
                    remainingInCurrentPage > 0 ? loadRooms() : currentRoomIndex < totalRooms && fetchNextPage();
                };

                loadRooms();

                if (data.usersWithSameName.length > 0) {
                    let currentSameNameIndex = 0;
                    const sameNamePerLoad = 6;

                    window.currentLoadSameNameFunction = () => {
                        const container = modalContent.querySelector('#same-name-users-container');
                        const loadMoreBtn = modalContent.querySelector('#load-more-samename-btn');
                        const usersToLoad = data.usersWithSameName.slice(currentSameNameIndex, currentSameNameIndex + sameNamePerLoad);

                        usersToLoad.forEach(user => {
                            const userDiv = document.createElement('div');
                            userDiv.className = 'same-name-user';
                            userDiv.setAttribute('data-fftid', user.fftId);
                            userDiv.style.cssText = css.historySameNameItem;
                            userDiv.onmouseenter = () => userDiv.style.cssText = css.historySameNameItem + css.historySameNameItemHover;
                            userDiv.onmouseleave = () => userDiv.style.cssText = css.historySameNameItem;
                            userDiv.innerHTML = `<img src="${user.profileHistory[0]?.avatar}" style="${css.historySameNameAvatar}"><div style="${css.historySameNameInfo}"><div style="${css.historySameNameText}">${user.profileHistory[0]?.name}</div><div style="${css.historySameNameId}">ID: ${user.fftId}</div></div>`;
                            container.appendChild(userDiv);
                        });

                        currentSameNameIndex += sameNamePerLoad;
                        if (loadMoreBtn) {
                            const remaining = data.usersWithSameName.length - currentSameNameIndex;
                            remaining > 0 ? loadMoreBtn.textContent = `Load More Users (${remaining} remaining)` : loadMoreBtn.style.display = 'none';
                        }
                    };

                    window.currentLoadSameNameFunction();
                }
            } catch(e) {
                console.error('Parse error:', e);
                modalContent.innerHTML = `<div style="${css.historyErrorContainer}"><div style="${css.historyErrorTitle}">Search for users</div></div>`;
                modalContent.append(searchContainer, closeButton);
            }
        },
        onerror: error => {
            console.error("ERROR:", error);
            modalContent.innerHTML = `<div style="${css.historyErrorMessage}"><div style="${css.historyErrorIcon}">❌ Error</div><div style="${css.historyErrorText}">Failed to fetch user details</div></div>`;
            modalContent.append(searchContainer, closeButton);
        }
    });
}

function extractTokenFromLocalStorage() {
        try {
            const authData = localStorage.getItem('auth');
            if (authData) {
                const parsedAuth = JSON.parse(authData);
                if (parsedAuth && parsedAuth.token) {
                    return parsedAuth.token;
                }
            }
        } catch (error) {
        }
        return null;
    }
function getUserInfo(userId) {
    try {
        const userMapStr = localStorage['friends:userMap'];
        if (!userMapStr) return null;
        const userMap = JSON.parse(userMapStr);
        const userData = userMap.data[userId];
        if (!userData) return null;
        return { name: userData.name, avatar: userData.avatar };
    } catch (e) {
        console.error('Error in getUserInfo:', e);
        return null;
    }
}
function getLocalToken() {
        const tokenStr = localStorage['user:token'];
        if (!tokenStr) return null;
        try {
            const tokenObj = JSON.parse(tokenStr);
            return tokenObj.data;
        } catch (e) {
            console.error("Invalid JSON in localStorage['user:token']", e);
            return null;
        }
    }
function decodeJwtPayload(jwt) {
        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) return null;
            const payload = atob(parts[1]);
            return JSON.parse(payload);
        } catch (e) {
            console.error('Error decoding JWT', e);
            return null;
        }
    }
function generateToken() {
        const loadTime = Date.now() - Math.floor(Math.random() * 5000);
        const iso = new Date(loadTime).toISOString();
        const rand = Math.random();
        const s = `${loadTime}|${iso}|${rand}`;
        const bytes = Array.from(s).map(c => c.charCodeAt(0) ^ 104);
        return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }
function objectIdToMs(oid) {
        if (!oid || typeof oid !== 'string' || oid.length < 8) return null;
        try {
            const seconds = parseInt(oid.slice(0, 8), 16);
            return seconds * 1000;
        } catch (e) {
            return null;
        }
    }
function getMsgTime(msg) {
        const keys = ['time', 'ts', 't', 'createdAt', 'created_at', 'timestamp', 'createdAtMillis'];
        for (const k of keys) {
            if (msg[k] != null) {
                const v = msg[k];
                if (typeof v === 'number') return v;
                if (typeof v === 'string') {
                    if (/^\d+$/.test(v)) return Number(v);
                    const d = Date.parse(v);
                    if (!isNaN(d)) return d;
                }
            }
        }
        if (msg._id) {
            const ms = objectIdToMs(msg._id);
            if (ms) return ms;
        }
        return null;
    }
function getUserMap() {
        const userMapStr = localStorage['friends:userMap'];
        if (!userMapStr) return {};
        try {
            const userMapObj = JSON.parse(userMapStr);
            return userMapObj.data || {};
        } catch (e) {
            console.error("Invalid JSON in localStorage['friends:userMap']", e);
            return {};
        }
    }
function repositionOnlineFriendsDisplay(panelElement) {
    const onlineFriendsDisplay = document.getElementById('online-friends-display');
    if (!onlineFriendsDisplay) return;


    if (panelElement && panelElement.style.display !== 'none') {
        const rect = panelElement.getBoundingClientRect();
        onlineFriendsDisplay.style.transition = 'transform 0.3s ease';
        onlineFriendsDisplay.style.transform = `translateY(${rect.bottom + 30 - 58}px)`;
    } else {
        onlineFriendsDisplay.style.transition = 'transform 0.3s ease';
        onlineFriendsDisplay.style.transform = 'translateY(0)';
    }
}
async function fetchRelationships() {
    const cached = localStorage['friends:relationships'];
    if (cached) {
        try {
            const cachedData = JSON.parse(cached);
            if (Date.now() - cachedData.timestamp < 300000) {
                if (cachedData.data) {
                    const token = extractTokenFromLocalStorage() || getLocalToken();
                    if (token) {
                        try {
                            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                            currentUserEID = tokenPayload.eid;
                            userToken = token;
                        } catch (e) {
                            console.log('Could not parse token');
                        }
                    }
                    return cachedData.data;
                }
            }
        } catch (e) {}
    }

    const token = extractTokenFromLocalStorage() || getLocalToken();
    if (!token) {
        console.log('No token found for relationships request');
        return null;
    }

    const generatedToken = generateToken();

    try {
        const response = await fetch(`https://free4talk-identity.herokuapp.com/identity/get/relationships/?a=identity-get-relationships&v=536-1&t=${Date.now()}`, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
                "content-type": "text/plain;charset=UTF-8",
                "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            body: JSON.stringify({
                token: token,
                body: {},
                _: generatedToken
            }),
            mode: "cors",
            credentials: "omit"
        });

        const data = await response.json();
        if (data.success && data.data) {
            const friends = data.data.friends || [];

            localStorage['friends:relationships'] = JSON.stringify({
                data: friends,
                timestamp: Date.now()
            });

            if (token) {
                try {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    currentUserEID = tokenPayload.eid;
                    userToken = token;
                } catch (e) {
                    console.log('Could not parse token');
                }
            }
            return friends;
        }
    } catch (error) {
        console.log('Error fetching relationships:', error);
    }
    return [];
}

async function Rephraser(text, session = "") {
  const apiKey = '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';

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
      "content-type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrer": "https://www.free4talk.com/",
    "body": JSON.stringify({
      messages: [
        {
          role: 'user',
          content: text
        }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 1000
    }),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  });

  const groqData = await response.json();

  // Extract the AI message
  const aiMessage = groqData.choices?.[0]?.message?.content || 'No response generated';
  console.log('AI Response:', aiMessage);

  // Return in the EXACT format your code expects: result.data.message
  return {
    data: {
      message: aiMessage
    },
    session: session,
    rawGroqResponse: groqData // Keep original response in case you need it
  };
}




///////// DONE /////////
let _cachedBackdropCSS = null;
function getCachedBackdropCSS() {
    if (!_cachedBackdropCSS) {
        _cachedBackdropCSS = GatheredCSS();
    }
    return _cachedBackdropCSS;
}

function injectBackdropStyles() {
    if (document.getElementById('glassmorphism-keyframes')) {
        return; // Already injected
    }

    const css = getCachedBackdropCSS();
    const style = document.createElement('style');
    style.id = 'glassmorphism-keyframes';
    style.textContent = `
        ${css.backdropKeyframes}

        #my-backdrop {
            opacity: 0;
            transition: opacity 0.5s ease;
            will-change: opacity;
        }
        #my-backdrop.visible {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

function createBackdropElement() {
    const css = getCachedBackdropCSS();
    const backdrop = document.createElement('div');
    backdrop.id = 'my-backdrop';
    backdrop.style.cssText = css.backdropStyle;
    backdrop.classList.add('backdrop-hidden'); // Start hidden
    document.body.appendChild(backdrop);
    return backdrop;
}

function Backdrop() {
    // Inject styles once
    injectBackdropStyles();

    // Get or create backdrop
    let backdrop = document.getElementById('my-backdrop');

    if (!backdrop) {
        backdrop = createBackdropElement();
    }

    requestAnimationFrame(() => {
        backdrop.classList.add('visible');
        backdrop.style.opacity = '1';
    });
    backdrop.style.pointerEvents = 'auto';


    return backdrop;
}

function closeBackdrop() {
    const backdrop = document.getElementById('my-backdrop');
    if (!backdrop) return;

    backdrop.classList.remove('visible');
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';

}

function removeBackdrop() {
    const backdrop = document.getElementById('my-backdrop');
    if (!backdrop) return;

    backdrop.style.opacity = '0';

    setTimeout(() => {
        if (backdrop.parentNode) {
            backdrop.remove();
        }
    }, 500);
}

function resetBackdropCache() {
    _cachedBackdropCSS = null;
}
///////// DONE /////////


function Arabicz(input) {
    if (!input) return false;
if (input._arabiczEnabled) {
    input._arabiczEnabled = false;

    if (input._arabiczObserver) {
        input._arabiczObserver.disconnect();
        input._arabiczObserver = null;
    }

    if (input._suggestionsDiv) input._suggestionsDiv.remove();
    input.removeEventListener('keydown', input._arabiczKeyHandler);
    input.removeEventListener('input', input._arabiczInputHandler);
    input.removeEventListener('click', input._arabiczClickHandler);
    window.removeEventListener('scroll', input._arabiczScrollHandler);
    window.removeEventListener('resize', input._arabiczScrollHandler);
    return false;
}


    input._arabiczEnabled = true;
const suggestionsDiv = document.createElement('div');
    suggestionsDiv.style.cssText = GatheredCSS().suggestionsDivStyle;
    document.body.appendChild(suggestionsDiv);
    input._suggestionsDiv = suggestionsDiv;
    const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const removedNode of mutation.removedNodes) {
            if (removedNode.id === 'my-backdrop') {
                hideSuggestions();
            }
        }
    }
});
observer.observe(document.body, { childList: true, subtree: true });
input._arabiczObserver = observer;

    suggestionsDiv.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity' && suggestionsDiv.style.opacity === '0') {
            suggestionsDiv.style.display = 'none';
        }
    });

    const azertyKeys = ['&','é','"',"'",'(','-','è','_','ç','à'];
    const separators = [' ', '.', ',', '!', '?', ';', ':'];
    const arabicPunct = { '?': '؟', '!': '!', '.': '.', ',': '،', ';': '؛', ':': ':' };
    const punctChars = new Set(Object.values(arabicPunct));

    input._arabicToLatin = new Map();

    function isArabic(text) { return /[\u0600-\u06FF]/.test(text); }

    async function transliterate(text) {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ar-t-i0-und&num=10`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]?.length) return data[1][0][1];
        } catch(e) { console.error(e); }
        return [text];
    }

    function updateSuggestionsPosition() {
        const rect = input.getBoundingClientRect();
        const topSpace = rect.top;
        const bottomSpace = window.innerHeight - rect.bottom;
        const needsBelow = bottomSpace > topSpace;
        suggestionsDiv.style.top = needsBelow
            ? `${rect.bottom + 8}px`
            : `${rect.top - suggestionsDiv.offsetHeight - 8}px`;
        suggestionsDiv.style.left = `${rect.left}px`;
    }

    function replaceLastWord(word, originalLatin) {
        const value = input.value;
        const match = value.match(/([^\s]+)$/);
        const rest = match ? value.slice(0, match.index) : value;
        input.value = rest + word + ' ';
        input.focus();
        input._arabicToLatin.set(word, originalLatin);
    }

    function replaceWordAt(word, start, end, originalLatin) {
        const value = input.value;
        input.value = value.substring(0, start) + word + value.substring(end);
        input.focus();
        input.selectionStart = input.selectionEnd = start + word.length;
        hideSuggestions();
        input._arabicToLatin.set(word, originalLatin);
    }

    function getWordAtCursor() {
        const value = input.value;
        const cursorPos = input.selectionStart;
        let start = cursorPos, end = cursorPos;
        while (start > 0 && !/\s/.test(value[start - 1])) start--;
        while (end < value.length && !/\s/.test(value[end])) end++;
        return { word: value.substring(start, end), start, end };
    }

    let lastWordBeingTyped = '';
    let clickedWordInfo = null;
    let lastRequestId = 0;

    function showSuggestions() {
        suggestionsDiv.style.display = 'flex';
        setTimeout(() => {
            updateSuggestionsPosition();
            suggestionsDiv.style.opacity = '1';
            suggestionsDiv.style.transform = 'scale(1)';
            suggestionsDiv.style.pointerEvents = 'auto';
        }, 0);
    }

    function hideSuggestions() {
        suggestionsDiv.style.opacity = '0';
        suggestionsDiv.style.transform = 'scale(0.95)';
        suggestionsDiv.style.pointerEvents = 'none';
    }

    async function fetchAndShowSuggestions(lastWord, isFromClick = false) {
        if (!lastWord) { hideSuggestions(); return; }
        if (!isFromClick && lastWord !== lastWordBeingTyped) return;

        let pureWord = lastWord, trailingPunct = '';
        while (pureWord.length && punctChars.has(pureWord[pureWord.length-1])) {
            trailingPunct = pureWord.slice(-1) + trailingPunct;
            pureWord = pureWord.slice(0, -1);
        }

        let originalLatin = pureWord;
        if (isArabic(pureWord)) {
            const storedLatin = input._arabicToLatin.get(pureWord);
            if (storedLatin) originalLatin = storedLatin;
            else { hideSuggestions(); return; }
        }

        const requestId = ++lastRequestId;
        const options = await transliterate(originalLatin);
        if (requestId !== lastRequestId) return;

        suggestionsDiv.innerHTML = '';

       options.slice(0,10).forEach((opt, idx) => {
            const hotkey = azertyKeys[idx];
            const visualNumber = idx + 1;
            const wrapper = document.createElement('div');
            wrapper.style.cssText = GatheredCSS().suggestionWrapperStyle;
            const keyBadge = document.createElement('div');
            keyBadge.textContent = visualNumber;
            keyBadge.style.cssText = GatheredCSS().keyBadgeStyle;
            wrapper.appendChild(keyBadge);
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.style.cssText = GatheredCSS().suggestionButtonStyle;
            btn.dataset.hotkey = hotkey;
            btn.onclick = () => {
                if (clickedWordInfo) {
                    const pureStart = clickedWordInfo.start;
                    const pureEnd = pureStart + pureWord.length;
                    replaceWordAt(opt, pureStart, pureEnd, originalLatin);
                    clickedWordInfo = null;
                } else {
                    replaceLastWord(opt, originalLatin);
                }
            };
            wrapper.appendChild(btn);
            suggestionsDiv.appendChild(wrapper);
        });

        showSuggestions();
    }

    const keyHandler = async (e) => {
        const suggestionBtn = input._suggestionsDiv?.querySelector(`button[data-hotkey="${e.key}"]`);
        if (suggestionBtn) {
            e.preventDefault();
            suggestionBtn.click();
            return;
        }

        const value = input.value;
        const match = value.match(/([^\s]+)$/);
        const lastWord = match ? match[0] : '';

        if (separators.includes(e.key)) {
            e.preventDefault();
            if (!lastWord) input.value += arabicPunct[e.key] || e.key;
            else {
                const translitOptions = await transliterate(lastWord);
                const chosen = translitOptions[0];
                const rest = value.slice(0, match.index);
                input.value = rest + chosen + (arabicPunct[e.key] || e.key);
                input._arabicToLatin.set(chosen, lastWord);
            }
            hideSuggestions();
            lastWordBeingTyped = '';
            return;
        }

        lastWordBeingTyped = lastWord;
    };
    input.addEventListener('keydown', keyHandler);
    input._arabiczKeyHandler = keyHandler;

    const inputHandler = async () => {
        const value = input.value;
        const match = value.match(/([^\s]+)$/);
        lastWordBeingTyped = match ? match[0] : '';
        clickedWordInfo = null;
        if (!lastWordBeingTyped) hideSuggestions();
        else fetchAndShowSuggestions(lastWordBeingTyped);
    };
    input.addEventListener('input', inputHandler);
    input._arabiczInputHandler = inputHandler;

    const clickHandler = async () => {
        const wordInfo = getWordAtCursor();
        if (wordInfo.word && wordInfo.word.trim()) {
            clickedWordInfo = wordInfo;
            await fetchAndShowSuggestions(wordInfo.word, true);
        } else {
            hideSuggestions();
            clickedWordInfo = null;
        }
    };
    input.addEventListener('click', clickHandler);
    input._arabiczClickHandler = clickHandler;

    const scrollHandler = updateSuggestionsPosition;
    window.addEventListener('scroll', scrollHandler);
    window.addEventListener('resize', scrollHandler);
    input._arabiczScrollHandler = scrollHandler;

    return true;
}
async function searchTenorGifs(apiKey, searchTerm = 'Funny', limit = 20, nextToken = null) {
    const clientKey = 'AIzaSyAgxxv_EpUiL_TVNAFJGzmKAa2WfCB-bjw';
    let url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchTerm)}&key=${apiKey}&client_key=${clientKey}&limit=${limit}`;
    if (nextToken) url += `&pos=${nextToken}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const gifs = data.results.map(item => ({
            id: item.id,
            title: item.content_description || '',
            gifUrl: item.media_formats.gif.url
        }));

        return {
            gifs,
            next: data.next || null
        };
    } catch (err) {
        console.error('Error searching GIFs:', err);
        return { gifs: [], next: null };
    }
}
function createEmojiPicker(textInput, stickerBtn) {
    const css = GatheredCSS();

    const emojiMenu = document.createElement('div');
    emojiMenu.style.cssText = css.emojiMenu;

    const emojis = {
        'Love & Romance': '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 😍 🥰 😘 😚 😙 😻 💋 💌 🌹 🥀 💍 💑 👩‍❤️‍👨 👩‍❤️‍👩 👨‍❤️‍👨'.split(' '),
        'Faces & Emotions': '😀 😃 😄 😁 😆 😅 😂 🤣 🙂 🙃 😉 😊 😍 🥰 😘 😗 😋 😎 🤩 🥳 😏 😒 🙄 😔 😢 😭 😤 😡 🤬 🤯 😳 🥺 🤔 🤨 😴 🥱 😷 🤒 🤕 🤢 🤮 🤧'.split(' '),
        'Hands & Gestures': '👍 👎 👊 ✊ 🤛 🤜 👏 🙌 👐 🤲 🤝 ✋ 🖐️ 🤚 👋 🤟 🤘 🤞 🤙 🤲 🤏 👌'.split(' '),
        'Popular Feelings / Actions': '🙏 🤲 💪 🥂 🍻 🍷 🍺 🍕 🍔 🍟 🍦 🎂 🎉 🎊 🎁 🎶 🎵 🔥 💯 ✨ 🌟 ☀️ 🌙 ⭐'.split(' '),
        'Flags': '🇺🇸 🇬🇧 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇧🇷 🇦🇷 🇲🇽 🇨🇳 🇯🇵 🇰🇷 🇹🇷 🇸🇦 🇦🇪 🇮🇳 🇵🇰 🇹🇳 🇲🇦 🇩🇿 🇪🇬 🇵🇸 🇮🇱 🇷🇺 🇺🇦'.split(' ')
    };

    Object.entries(emojis).forEach(([category, emojiList]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.style.cssText = css.emojiCategory;

        const categoryTitle = document.createElement('div');
        categoryTitle.textContent = category;
        categoryTitle.style.cssText = css.emojiCategoryTitle;
        categoryDiv.appendChild(categoryTitle);

        const emojiContainer = document.createElement('div');
        emojiContainer.style.cssText = css.emojiContainer;

        emojiList.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.textContent = emoji;
            emojiBtn.style.cssText = css.emojiButton;
            emojiBtn.onmouseenter = () => {
                emojiBtn.style.background = 'var(--buttonHover)';
            };
            emojiBtn.onmouseleave = () => {
                emojiBtn.style.background = 'none';
            };
            emojiBtn.onclick = () => {
                const start = textInput.selectionStart;
                const end = textInput.selectionEnd;
                const text = textInput.value;
                textInput.value = text.substring(0, start) + emoji + text.substring(end);
                textInput.focus();
                textInput.selectionStart = textInput.selectionEnd = start + emoji.length;
                emojiMenu.style.display = 'none';
            };
            emojiContainer.appendChild(emojiBtn);
        });

        categoryDiv.appendChild(emojiContainer);
        emojiMenu.appendChild(categoryDiv);
    });

    stickerBtn.onclick = () => {
        emojiMenu.style.display = emojiMenu.style.display === 'none' ? 'block' : 'none';
    };

    return emojiMenu;
}
function createGifPicker(inputContainer, css) {
    const gifBtn = document.createElement('button');
    gifBtn.innerHTML = 'GIF';
    gifBtn.title = 'GIFs';
    gifBtn.style.cssText = css.iconButton + `font-size: 14px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;`;
    gifBtn.onmouseenter = () => {
        gifBtn.style.background = 'var(--buttonHover)';
        gifBtn.style.transform = 'scale(1.1)';
    };
    gifBtn.onmouseleave = () => {
        gifBtn.style.background = 'var(--buttonHover)';
        gifBtn.style.transform = 'scale(1)';
    };

    gifBtn.onclick = () => {
        let menu = document.getElementById('gifMenu');
        if (menu) {
            if (menu.style.opacity === '0') {
                menu.style.display = 'flex';
                setTimeout(() => menu.style.opacity = '1', 10);
            } else {
                menu.style.opacity = '0';
                setTimeout(() => menu.style.display = 'none', 200);
            }
            return;
        }
        menu = document.createElement('div');
        menu.id = 'gifMenu';
        menu.style.cssText = GatheredCSS().gifMenuStyle;
        setTimeout(() => menu.style.opacity = '1', 10);
  const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.title = 'Close';
        closeBtn.style.cssText = GatheredCSS().closeBtnStyle;
        closeBtn.onclick = () => {
            menu.style.opacity = '0';
            setTimeout(() => menu.remove(), 200);
        };
        menu.appendChild(closeBtn);
const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search GIFs...';
        searchInput.style.cssText = GatheredCSS().searchInputStyle;
        menu.appendChild(searchInput);
        const gifGrid = document.createElement('div');
        gifGrid.style.cssText = GatheredCSS().gifGridStyle;
        menu.appendChild(gifGrid);
        inputContainer.appendChild(menu);
        function renderGifs(gifs) {
            gifs.forEach(gif => {
                const img = document.createElement('img');
                img.src = gif.gifUrl;
                img.title = gif.title;
                img.style.cssText = GatheredCSS().gifImageStyle;
                img.onclick = () => {
                    const overlay = document.createElement("div");
                    overlay.style.cssText = GatheredCSS().gifOverlayStyle;
                    const viewer = document.createElement("div");
                    viewer.style.cssText = GatheredCSS().gifViewerStyle;
                    const gifPreview = document.createElement("img");
                    gifPreview.src = gif.gifUrl;
                    gifPreview.style.cssText = GatheredCSS().gifPreviewStyle;
                    const buttons = document.createElement("div");
                    buttons.style.cssText = GatheredCSS().gifButtonsContainerStyle;
                    const base = GatheredCSS().gifButtonBaseStyle;

                    const cancel = document.createElement("button");
                    cancel.textContent = "Cancel";
                    cancel.style.cssText = base + `background:rgba(255,255,255,.2);color:#fff;`;
                    cancel.onmouseenter = () => (cancel.style.background = "rgba(255,255,255,.35)");
                    cancel.onmouseleave = () => (cancel.style.background = "rgba(255,255,255,.2)");

                    const send = document.createElement("button");
                    send.textContent = "Send";
                    send.style.cssText = base + `background:rgba(0,150,255,.5);color:#fff;`;
                    send.onmouseenter = () => (send.style.background = "rgba(0,150,255,.7)");
                    send.onmouseleave = () => (send.style.background = "rgba(0,150,255,.5)");

                    cancel.onclick = () => fadeOut();
                    send.onclick = () => {
                        const input = document.getElementById("ChatInputArea");
                        if (input) {
                            input.value += gif.gifUrl + " ";
                            document.getElementById("SendingButton")?.click();
                        }
                        fadeOut();
                    };

                    buttons.append(cancel, send);
                    viewer.append(gifPreview, buttons);
                    overlay.append(viewer);
                    document.body.appendChild(overlay);

                    requestAnimationFrame(() => {
                        overlay.style.opacity = "1";
                        viewer.style.opacity = "1";
                        viewer.style.transform = "scale(1)";
                    });

                    function fadeOut() {
                        viewer.style.opacity = "0";
                        viewer.style.transform = "scale(.95)";
                        overlay.style.opacity = "0";
                        setTimeout(() => overlay.remove(), 250);
                    }

                    const modal = document.getElementById("gifMenu");
                    if (modal) {
                        modal.style.opacity = "0";
                        setTimeout(() => modal.remove(), 200);
                    }
                };

                gifGrid.appendChild(img);
            });
        }

        let currentSearch = 'Hello';
        let nextToken = null;
        let loading = false;

        async function loadGifs(searchTerm, append = false) {
            if (loading) return;
            loading = true;
            if (!append) {
                gifGrid.innerHTML = '';
                nextToken = null;
            }
            const { gifs, next } = await searchTenorGifs(
                'AIzaSyAgxxv_EpUiL_TVNAFJGzmKAa2WfCB-bjw',
                searchTerm,
                20,
                nextToken
            );
            renderGifs(gifs);
            nextToken = next;
            loading = false;
        }

        gifGrid.addEventListener('scroll', () => {
            if (gifGrid.scrollTop + gifGrid.clientHeight >= gifGrid.scrollHeight - 10) {
                if (nextToken) loadGifs(currentSearch, true);
            }
        });

        searchInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value.trim();
                if (!term) return;
                currentSearch = term;
                await loadGifs(term, false);
            }
        });

        loadGifs('Hello', false);
    };

    return gifBtn;
}
///////// DONE /////////
async function fetchMessageChunk(chatId, beforeTime = null) {
        const localToken = getLocalToken();
        if (!localToken) throw new Error("No valid token found");

        const generatedToken = generateToken();
        const bodyObj = { chatId };
        if (beforeTime !== null) bodyObj.beforeTime = beforeTime;

        const requestBody = JSON.stringify({
            token: localToken,
            body: bodyObj,
            _: generatedToken
        });

        const url = `https://free4talk-messenger.herokuapp.com/messenger/get/messages/?a=messenger-get-messages&v=536-1&t=${Date.now()}`;

        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
                "content-type": "text/plain;charset=UTF-8",
                "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            referrer: "https://www.free4talk.com/",
            body: requestBody,
            mode: "cors",
            credentials: "omit"
        });

        const json = await resp.json();
        let messages = [];
        if (json && json.success) {
            if (Array.isArray(json.data)) messages = json.data;
            else if (json.data && Array.isArray(json.data.messages)) messages = json.data.messages;
        }


        return messages;
    }
function createMessageElement(msg, myId, chatId, isLastSeen = false) {
    const css = GatheredCSS();
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = css.messageElement + `
        align-items: ${msg.fromId === myId ? 'flex-end' : 'flex-start'};
        display: flex;
        flex-direction: column;
    `;
    msgDiv.dataset.messageId = msg._id;


    let otherId;
    if (chatId) {
        const chatParts = chatId.split(':');
        otherId = chatParts.find(id => id !== myId && id !== 'pm');
    }

    let contentObj;
    try {
        contentObj = JSON.parse(msg.content);
    } catch (e) {
        contentObj = { text: msg.content };
    }

    const isMedia = contentObj.image || contentObj.sticker;
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.style.cssText = css.bubble + `
        padding: ${isMedia ? '4px' : '8px 12px'};
        background-color: ${msg.fromId === myId ? 'rgba(0, 128, 255, 0.2)' : 'rgba(255,255,255,0.1)'};
        border: 1px solid var(--borderColor);
        color: var(--textColor);
        ${isMedia ? css.bubbleMedia : ''}
        display: inline-block;
        position: relative;
    `;

    if (contentObj.image) {
        const img = document.createElement('img');
        img.src = contentObj.image.url;
        img.style.cssText = css.image;
        img.onclick = () => openImageViewer(contentObj.image.url);
        bubble.appendChild(img);
        if (contentObj.image.giphy || contentObj.image.url.includes('.gif')) {
            const gifLabel = document.createElement('div');
            gifLabel.textContent = 'GIF';
            gifLabel.style.cssText = css.mediaLabel;
            bubble.appendChild(gifLabel);
        }
    } else if (contentObj.sticker) {
        const stickerImg = document.createElement('img');
        stickerImg.src = contentObj.sticker.animationx2 || contentObj.sticker.x2 || contentObj.sticker.sticker;
        stickerImg.style.cssText = css.image + css.stickerSize;
        stickerImg.onclick = () => openImageViewer(stickerImg.src);
        bubble.appendChild(stickerImg);
        const stickerLabel = document.createElement('div');
        stickerLabel.textContent = 'STICKER';
        stickerLabel.style.cssText = css.mediaLabel;
        bubble.appendChild(stickerLabel);
    } else if (contentObj.text) {
        const urlRegex = /(https?:\/\/\S+\.(?:gif|png|jpg|jpeg))/gi;
        const urls = contentObj.text.match(urlRegex);

        if (urls) {
            urls.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = css.imageLink;
                bubble.appendChild(img);
            });

            const textWithoutUrls = contentObj.text.replace(urlRegex, '').trim();
            if (textWithoutUrls) {
                const span = document.createElement('span');
                span.textContent = textWithoutUrls;
                bubble.appendChild(span);
            }

        } else {
            const linkRegex = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/g;
            const linkify = (text) => text.replace(linkRegex, (url) => {
                const href = url.startsWith('www.') ? `https://${url}` : url;
                return `<a href="${href}" target="_blank" style="color:var(--textColor);text-decoration:underline;">${url}</a>`;
            });
            bubble.innerHTML = linkify(contentObj.text);
        }
    } else {
        bubble.innerHTML = '<i>Deleted message</i>';
    }

    msgDiv.appendChild(bubble);

    const emojiMap = {
        'Like': '👍',
        'Love': '❤️',
        'Care': '🥰',
        'Haha': '😂',
        'Wow': '😮',
        'Sad': '😢',
        'Angry': '😡'
    };

    const reactionsContainer = document.createElement('div');
    reactionsContainer.className = 'reactions-container';
    reactionsContainer.style.cssText = css.reactionsContainerStyle + (msg.fromId === myId ? css.reactionsAlignEnd : css.reactionsAlignStart);
    msgDiv.appendChild(reactionsContainer);

    const updateReactionsUI = (reactMap) => {
        reactionsContainer.innerHTML = '';
        if (!reactMap) return;
        Object.entries(reactMap).forEach(([reaction, users]) => {
            if (users.length > 0) {
                const reactionElem = document.createElement('span');
                reactionElem.textContent = emojiMap[reaction] || reaction;
                reactionElem.style.cssText = css.reactionElem;
                reactionsContainer.appendChild(reactionElem);
            }
        });
    };
    updateReactionsUI(msg.reactMap);

    const timeElem = document.createElement('span');
    timeElem.style.cssText = css.timeElement;
    timeElem.textContent = new Date(msg.time).toLocaleString();
    msgDiv.appendChild(timeElem);

if (isLastSeen && msg.fromId === myId) {
    const seenElem = document.createElement('span');
    seenElem.textContent = 'Seen';
    seenElem.style.cssText = css.timeElement + css.seenElement;
    msgDiv.appendChild(seenElem);
}

    let hoverTimeout, reactButton, emojiMenu;
msgDiv.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showEmojiMenu(e.clientX, e.clientY);
});


 const showEmojiMenu = (x = null, y = null) => {
    if (emojiMenu) return;
    emojiMenu = document.createElement('div');
    emojiMenu.style.cssText = x !== null && y !== null ? css.emojiMenuFixed : css.emojiMenuAbsolute;

    if (x !== null && y !== null) {
        emojiMenu.style.left = x + 'px';
        emojiMenu.style.top = y + 'px';
        emojiMenu.style.transform = 'translate(-50%, -50%)';
    } else {
        emojiMenu.style.bottom = '-55px';
        emojiMenu.style.left = msg.fromId === myId ? 'auto' : '0';
        emojiMenu.style.right = msg.fromId === myId ? '0' : 'auto';
    }

    const reactions = [
        { emoji: '👍', name: 'Like' },
        { emoji: '❤️', name: 'Love' },
        { emoji: '🥰', name: 'Care' },
        { emoji: '😂', name: 'Haha' },
        { emoji: '😮', name: 'Wow' },
        { emoji: '😢', name: 'Sad' },
        { emoji: '😡', name: 'Angry' }
    ];

    reactions.forEach(r => {
        const btn = document.createElement('button');
        btn.textContent = r.emoji;
        btn.style.cssText = css.emojiButton;
        btn.onmouseenter = () => btn.style.transform = 'scale(1.3)';
        btn.onmouseleave = () => btn.style.transform = 'scale(1)';
        btn.onclick = async (e) => {
            e.stopPropagation();
            if (!msg.reactMap) msg.reactMap = {};
            if (!msg.reactMap[r.name]) msg.reactMap[r.name] = [];
            if (!msg.reactMap[r.name].includes(myId)) msg.reactMap[r.name].push(myId);
            updateReactionsUI(msg.reactMap);

            try {
                await sendMessage(chatId, null, true, msg._id, r.name);
            } catch (err) {
                console.error('Failed to send reaction:', err);
            }

            hideEmojiMenu();
        };
        emojiMenu.appendChild(btn);
    });
emojiMenu.style.zIndex = '9990000';

    document.body.appendChild(emojiMenu);
    setTimeout(() => emojiMenu.style.opacity = '1', 10);

    const closeMenu = (ev) => {
        if (!emojiMenu.contains(ev.target)) {
            hideEmojiMenu();
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 50);
};



    const hideEmojiMenu = () => {
        if (emojiMenu) {
            emojiMenu.style.opacity = '0';
            setTimeout(() => { emojiMenu?.parentNode?.removeChild(emojiMenu); emojiMenu = null; }, 200);
        }
        if (reactButton) {
            reactButton.style.opacity = '0';
            setTimeout(() => { reactButton?.parentNode?.removeChild(reactButton); reactButton = null; }, 200);
        }
    };

    return msgDiv;
}
async function openMessagesModal(myId, friendId, friendName, friendAvatar) {
    const chatId = 'pm:' + [friendId, myId].sort().join(':');
    const css = GatheredCSS();

    const settingsPanel = document.getElementById('f4t-settings-panel');
    if (settingsPanel && settingsPanel.style.display !== 'none') {
        closeSettings();
    }

const backdrop = Backdrop();

    const modal = document.createElement('div');
    modal.id = 'OpenMessagesModalContainer';
    modal.style.cssText = css.modal + `

        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
        animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    `;

    const header = document.createElement('div');
    header.style.cssText = css.modalHeader;

    const avatar = document.createElement('img');
    avatar.src = friendAvatar;
    avatar.style.cssText = css.avatar;
    header.appendChild(avatar);

    const title = document.createElement('h3');
    title.id = 'SenderName';
    title.textContent = friendName;
    title.style.cssText = css.title;
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = css.closeButton;

    const closeModal = () => {
        modal.style.animation = 'modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        backdrop.style.opacity = '0';
        backdrop.style.backdropFilter = 'blur(0px) saturate(100%)';
        backdrop.style.webkitBackdropFilter = 'blur(0px) saturate(100%)';

        setTimeout(() => {
            if (backdrop.parentNode) {
                document.body.removeChild(backdrop);
            }
        }, 600);

        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    };

    closeBtn.onclick = closeModal;
    header.appendChild(closeBtn);
if (!document.getElementById('f4t-messages-font-style')) {
  const s = document.createElement('style');
  s.id = 'f4t-messages-font-style';
  s.textContent = `
    .f4t-messages-container, .f4t-messages-container * {
      font-size: var(--f4t-msg-font-size, 14px) !important;
    }
  `;
  document.head.appendChild(s);
}

const FONT_KEY = 'MessagesModal:FontSize';
let modalFontSize = parseInt(localStorage[FONT_KEY] || '14', 10);
if (isNaN(modalFontSize)) modalFontSize = 14;

function setModalFont(size) {
  modalFontSize = Math.max(10, Math.min(36, parseInt(size, 10) || 14));
  localStorage[FONT_KEY] = modalFontSize;
  document.documentElement.style.setProperty('--f4t-msg-font-size', modalFontSize + 'px');
}


const decFontBtn = document.createElement('button');
decFontBtn.type = 'button';
decFontBtn.title = 'Decrease message font size';
decFontBtn.textContent = '-';
decFontBtn.style.cssText = css.iconButton + ' margin-left:0;';

const incFontBtn = document.createElement('button');
incFontBtn.type = 'button';
incFontBtn.title = 'Increase message font size';
incFontBtn.textContent = '+';
incFontBtn.style.cssText = css.iconButton + ' margin-left:6px;';

header.style.display = 'flex';
header.style.alignItems = 'center';

const fontControls = document.createElement('div');
fontControls.style.display = 'flex';
fontControls.style.gap = '6px';
fontControls.appendChild(decFontBtn);
fontControls.appendChild(incFontBtn);
fontControls.style.transform = 'translateX(-15px)';


header.appendChild(fontControls);

header.appendChild(closeBtn);
closeBtn.style.marginLeft = 'auto';

setModalFont(modalFontSize);

incFontBtn.addEventListener('click', () => setModalFont(modalFontSize + 1));
decFontBtn.addEventListener('click', () => setModalFont(modalFontSize - 1));



    modal.appendChild(header);

    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'f4t-messages-container';
    messagesContainer.style.cssText = css.messagesContainer;

    messagesContainer.innerHTML = `
        <div style="${css.loadingSpinner}">
            <div class="f4t-loading-spinner"></div>
            <span>Loading messages...</span>
        </div>
    `;

    modal.appendChild(messagesContainer);

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = css.inputContainer;

    const stickerBtn = document.createElement('button');
    stickerBtn.innerHTML = '⚉';
    stickerBtn.title = 'Emojis';
    stickerBtn.style.cssText = css.iconButton;
    stickerBtn.onmouseenter = () => {
        stickerBtn.style.background = 'var(--buttonHover)';
        stickerBtn.style.transform = 'scale(1.1)';
    };
    stickerBtn.onmouseleave = () => {
        stickerBtn.style.background = 'var(--buttonHover)';
        stickerBtn.style.transform = 'scale(1)';
    };

    inputContainer.appendChild(stickerBtn);


    const handleClickOutside = (e) => {
        if (stickerBtn.contains(e.target) || emojiMenu.contains(e.target)) {
            return;
        }
        if (emojiMenu.style.display !== 'none') {
            emojiMenu.style.display = 'none';
        }

        if (e.target === backdrop) {
            closeModal();
        }
    };

    backdrop.addEventListener('click', handleClickOutside);




if (!document.getElementById('arabicz-glow-style')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'arabicz-glow-style';
    styleTag.textContent = `
    @keyframes glowCircle {
        0% {
            border-color: rgba(0, 255, 0, 0.4);
            box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
            background-position: -200% 0;
        }
        50% {
            border-color: rgba(0, 255, 0, 0.6);
            box-shadow: 0 0 12px rgba(0, 255, 0, 0.3);
            background-position: 200% 0;
        }
        100% {
            border-color: rgba(0, 255, 0, 0.4);
            box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
            background-position: -200% 0;
        }
    }

    @keyframes fadeIcon {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }`;
    document.head.appendChild(styleTag);
};


    const imageBtn = document.createElement('button');
    imageBtn.innerHTML = '🌐';
    imageBtn.title = 'Translate';
    imageBtn.style.cssText = css.iconButton;
    imageBtn.onmouseenter = () => {
        imageBtn.style.background = 'var(--buttonHover)';
        imageBtn.style.transform = 'scale(1.1)';
    };
    imageBtn.onmouseleave = () => {
        imageBtn.style.background = 'var(--buttonHover)';
        imageBtn.style.transform = 'scale(1)';
    };

const originalIcon = '🌐';
const activeIcon = '🟢';

const originalStyles = {
    background: imageBtn.style.background,
    border: imageBtn.style.border,
    backdropFilter: imageBtn.style.backdropFilter,
    animation: imageBtn.style.animation,
    display: imageBtn.style.display,
    justifyContent: imageBtn.style.justifyContent,
    alignItems: imageBtn.style.alignItems
};

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && (e.key === '!' || (e.key === '1' && e.shiftKey))) {
    e.preventDefault();
    imageBtn.click();
  }
});
    imageBtn.onclick = () => {
    const enabled = Arabicz(textInput);
    imageBtn._arabiczEnabled = enabled;

    if (enabled) {
        imageBtn.innerText = activeIcon;
        imageBtn.style.background = 'rgba(0,0,0,0.2)';
        imageBtn.style.border = '2px solid rgba(0,255,0,0.4)';
        imageBtn.style.backdropFilter = 'blur(6px)';
        imageBtn.style.animation = 'glowCircle 1.5s infinite ease-in-out, fadeIcon 1.5s infinite ease-in-out';
        imageBtn.style.display = 'flex';
        imageBtn.style.justifyContent = 'center';
        imageBtn.style.alignItems = 'center';
    } else {
        imageBtn.innerText = originalIcon;
        imageBtn.style.background = originalStyles.background;
        imageBtn.style.border = originalStyles.border;
        imageBtn.style.backdropFilter = originalStyles.backdropFilter;
        imageBtn.style.animation = originalStyles.animation;
        imageBtn.style.display = originalStyles.display;
        imageBtn.style.justifyContent = originalStyles.justifyContent;
        imageBtn.style.alignItems = originalStyles.alignItems;
    }
};





inputContainer.appendChild(imageBtn);



    const textInput = document.createElement('textarea');
    textInput.placeholder = 'Type a message...';
    textInput.id = 'ChatInputArea';
    textInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});
    textInput.style.cssText = css.textInput;
    textInput.onfocus = () => {
        textInput.style.borderColor = 'var(--borderColor)';
    };
    textInput.onblur = () => {
        textInput.style.borderColor = 'var(--borderColor)';
    };
    const rephraseBtn = document.createElement('button');
rephraseBtn.innerHTML = '✨';
rephraseBtn.title = 'Rephrase';
rephraseBtn.style.cssText = css.iconButton;
rephraseBtn.onmouseenter = () => {
    rephraseBtn.style.background = 'var(--buttonHover)';
    rephraseBtn.style.transform = 'scale(1.1)';
};
rephraseBtn.onmouseleave = () => {
    rephraseBtn.style.background = 'var(--buttonHover)';
    rephraseBtn.style.transform = 'scale(1)';
};
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === ':') {
    e.preventDefault();
    rephraseBtn.click();
  }
});
rephraseBtn.onclick = async () => {
    const text = textInput.value.trim();
    if (!text) return;

    rephraseBtn.disabled = true;
    rephraseBtn.innerHTML = '⏳';

    try {
const prompt = `Fix the following sentence. If the structure is wrong or the meaning does not make sence, rephrase it too. Return only the corrected text, no explanations, don't use semicolons, keep commas where they belong, and keep it casual and natural like a human would type it. The sentence is: ${text}`;
//const prompt = `Write the following sentence in Egyptian Arabic (Arabic script). Keep the same tone and dialect as a native speaker would write it online, without any explanation or translation — just output the Arabic sentence exactly. The sentence is: ${text}`;
        const result = await Rephraser(prompt);
        if (result?.data?.message) {
            textInput.value = result.data.message;
        }
    } catch (error) {
        console.error('Rephrase error:', error);
    } finally {
        rephraseBtn.disabled = false;
        rephraseBtn.innerHTML = '✨';
    }
};

inputContainer.appendChild(rephraseBtn);
    inputContainer.appendChild(textInput);
    const emojiMenu = createEmojiPicker(textInput, stickerBtn);

        const gifBtn = createGifPicker(inputContainer, css);
    inputContainer.appendChild(gifBtn);
    inputContainer.appendChild(emojiMenu);



    const sendBtn = document.createElement('button');
    sendBtn.innerHTML = '➤';
    sendBtn.title = 'Send';
    sendBtn.id = 'SendingButton';
    sendBtn.style.cssText = css.iconButton;
    sendBtn.onmouseenter = () => {
        sendBtn.style.background = 'var(--buttonHover)';
        sendBtn.style.transform = 'scale(1.1)';
    };
    sendBtn.onmouseleave = () => {
        sendBtn.style.background = 'var(--buttonHover)';
        sendBtn.style.transform = 'scale(1)';
    };

    const sendMessageHandler = async () => {

        const messageText = textInput.value.trim();
        if (!messageText) return;

        try {
            const response = await sendMessage(chatId, messageText);
            let responseData;
            try {
                responseData = JSON.parse(response);
            } catch (e) {
                console.error('Failed to parse response:', response);
                throw new Error('Invalid response format');
            }

            if (responseData.success) {
                const newMessage = {
                    fromId: myId,
                    content: JSON.stringify({ text: messageText }),
                    time: Date.now(),
                    _id: responseData.data?._id || `temp-${Date.now()}`
                };

                const msgElem = createMessageElement(newMessage, myId);
                msgElem.style.opacity = '0';
                msgElem.style.transition = 'opacity 0.5s ease';
                messagesContainer.appendChild(msgElem);

                setTimeout(() => {
                    audioManager.play("MessageSent");
                    msgElem.style.opacity = '1';
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);

                textInput.value = '';
            } else {
                console.error('Failed to send message:', responseData);
                alert('Failed to send message: ' + (responseData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message: ' + error.message);
        }
    };

    sendBtn.onclick = sendMessageHandler;
    inputContainer.appendChild(sendBtn);

    textInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessageHandler();
        }
    });

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    modal.appendChild(inputContainer);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    setTimeout(() => {
backdrop.style.background = `
        linear-gradient(45deg,
            rgba(0, 0, 0, 0.3),
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.1),
            rgba(0, 0, 0, 0.25)
        )
    `;
    backdrop.style.backgroundSize = '400% 400%';
    backdrop.style.animation = 'gradientShift 8s ease infinite';
    backdrop.style.opacity = '1';
    }, 10);

    let latestTime = 0;
    let pollInterval = null;

    try {
        const messages = await fetchMessageChunk(chatId, null);
        await new Promise(resolve => setTimeout(resolve, 1000));

        messagesContainer.style.cssText = `flex:1;overflow-y:auto;padding:16px;`;
        messagesContainer.innerHTML = '';

        let sortedMessages = [];

        if (messages.length === 0) {
            const noMessages = document.createElement('div');
            noMessages.style.cssText = `text-align:center;color:rgba(232,245,233,0.6);padding:20px;font-style:italic;opacity:0;transition:opacity 0.5s ease;`;
            noMessages.textContent = 'No messages yet';
            messagesContainer.appendChild(noMessages);
            setTimeout(() => noMessages.style.opacity = '1', 100);
        } else {
            sortedMessages = messages.sort((a, b) => {
                const timeA = getMsgTime(a) || 0;
                const timeB = getMsgTime(b) || 0;
                return timeA - timeB;
            });

            const fragment = document.createDocumentFragment();
sortedMessages.forEach((msg, index) => {
const isLast = index === sortedMessages.length - 1 && msg.fromId === myId;

    const msgElem = createMessageElement(msg, myId, chatId, isLast);
    msgElem.style.opacity = '0';
    msgElem.style.transition = 'opacity 0.5s ease';
    fragment.appendChild(msgElem);
});


            messagesContainer.appendChild(fragment);

            setTimeout(() => {
                Array.from(messagesContainer.children).forEach(msgElem => {
                    msgElem.style.opacity = '1';
                });
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }

        if (sortedMessages.length > 0) {
            const times = sortedMessages.map(getMsgTime).filter(t => t != null);
            latestTime = Math.max(...times);
        }

window.pullMessages = function() {

    const originalPollInterval = pollInterval;

   pollInterval = async function() {
    try {
        const newChunk = await fetchMessageChunk(chatId, null);
        if (newChunk.length === 0) return;

        const newerMessages = newChunk.filter(msg => {
            const msgTime = getMsgTime(msg);
            return msgTime != null && msgTime > latestTime;
        });
        if (newerMessages.length === 0) return;

        newerMessages.sort((a, b) => (getMsgTime(a) || 0) - (getMsgTime(b) || 0));

        const fragment = document.createDocumentFragment();
        newerMessages.forEach((msg, index) => {
            const isLast = index === newerMessages.length - 1;
            const msgElem = createMessageElement(msg, myId, chatId, isLast);
            msgElem.style.opacity = '0';
            msgElem.style.transition = 'opacity 0.5s ease';
            fragment.appendChild(msgElem);
        });

        const wasAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 50;
        messagesContainer.appendChild(fragment);

       setTimeout(() => {
    Array.from(messagesContainer.children)
        .slice(-newerMessages.length)
        .forEach(msgElem => {
            msgElem.style.opacity = '1';
        });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}, 50);

        const newTimes = newerMessages.map(getMsgTime).filter(t => t != null);
        latestTime = Math.max(latestTime, ...newTimes);

    } catch (error) {
        console.error('Error polling new messages:', error);
    }
};


    if (pollInterval) pollInterval();
};

        pollInterval = async function() {
    try {
        const newChunk = await fetchMessageChunk(chatId, null);
        if (newChunk.length === 0) return;

        const newerMessages = newChunk.filter(msg => {
            const msgTime = getMsgTime(msg);
            return msgTime != null && msgTime > latestTime;
        });

        if (newerMessages.length === 0) return;

        newerMessages.sort((a, b) => (getMsgTime(a) || 0) - (getMsgTime(b) || 0));

        const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 10;

        const noMessagesDiv = messagesContainer.querySelector('div[style*="text-align:center; color:rgba(232,245,233,0.6);"]');
        if (noMessagesDiv) noMessagesDiv.remove();

        const fragment = document.createDocumentFragment();
newerMessages.forEach((msg, index) => {
    const isLast = index === newerMessages.length - 1;
    const msgElem = createMessageElement(msg, myId, chatId, isLast);
    msgElem.style.opacity = '0';
    msgElem.style.transition = 'opacity 0.5s ease';
    fragment.appendChild(msgElem);
});


        messagesContainer.appendChild(fragment);

        setTimeout(() => {
            Array.from(messagesContainer.children).slice(-newerMessages.length).forEach(msgElem => {
                msgElem.style.opacity = '1';
            });

            const newTimes = newerMessages.map(getMsgTime).filter(t => t != null);
            latestTime = Math.max(latestTime, ...newTimes);

            if (isAtBottom) messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    } catch (error) {
        console.error('Error polling new messages:', error);
    }
};




        let beforeTime = null;
        let isLoading = false;
        let hasMore = true;

        if (messages.length > 0) {
            const times = messages.map(getMsgTime).filter(t => t != null);
            const earliest = Math.min(...times);
            beforeTime = earliest - 1;
        }

        messagesContainer.addEventListener('scroll', async () => {
            const scrollPercentage = messagesContainer.scrollTop / (messagesContainer.scrollHeight - messagesContainer.clientHeight);
            if (scrollPercentage < 0.3 && !isLoading && hasMore) {
                isLoading = true;

                const loadingDiv = document.createElement('div');
                loadingDiv.style.cssText = `display:flex;justify-content:center;align-items:center;padding:16px;gap:8px;color:rgba(232,245,233,0.7);font-size:12px;`;
                loadingDiv.innerHTML = `<div class="f4t-loading-spinner"></div><span>Loading older messages...</span>`;
                messagesContainer.insertBefore(loadingDiv, messagesContainer.firstChild);

                try {
                    const olderMessages = await fetchMessageChunk(chatId, beforeTime);

                    loadingDiv.remove();

                    if (olderMessages.length === 0) {
                        hasMore = false;
                        isLoading = false;
                        return;
                    }

                    const sortedOlderMessages = olderMessages.sort((a, b) => {
                        const timeA = getMsgTime(a) || 0;
                        const timeB = getMsgTime(b) || 0;
                        return timeA - timeB;
                    });

                    const times = sortedOlderMessages.map(getMsgTime).filter(t => t != null);
                    const earliest = Math.min(...times);
                    beforeTime = earliest - 1;

                    const scrollFromBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;

                    const fragment = document.createDocumentFragment();
sortedOlderMessages.forEach(msg => {
    if (messagesContainer.querySelector(`[data-message-id="${msg._id}"]`)) {
        return;
    }
    const msgElem = createMessageElement(msg, myId, chatId);
    fragment.appendChild(msgElem);
});


                    messagesContainer.insertBefore(fragment, messagesContainer.firstChild);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight - scrollFromBottom;

                } catch (e) {
                    console.error(e);
                    if (loadingDiv.parentNode) {
                        loadingDiv.remove();
                    }
                } finally {
                    isLoading = false;
                }
            }
        });

    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.style.cssText = `flex:1;overflow-y:auto;padding:16px;`;
        messagesContainer.innerHTML = `<div style="text-align:center;color:rgba(232,245,233,0.6);padding:20px;">Failed to load messages</div>`;
    }
}
async function sendMessage(chatId, messageText, isReaction = false, messageId = null, emoji = null) {
    const token = extractTokenFromLocalStorage() || getLocalToken();
    if (!token) {
        console.error('No valid token found');
        return Promise.reject(new Error('No valid token found'));
    }


    const generatedToken = generateToken();
    let requestBody, url;

    if (isReaction) {
        requestBody = JSON.stringify({
            token: token,
            body: {
                chatId: chatId,
                messageId: messageId,
                action: "set",
                emoji: emoji
            },
            _: generatedToken
        });
        url = `https://free4talk-messenger.herokuapp.com/messenger/post/react-message/?a=messenger-post-react-message&v=538-1&t=${Date.now()}`;
    } else {
        requestBody = JSON.stringify({
            token: token,
            body: {
                chatId: chatId,
                messageList: [{ content: JSON.stringify({ text: messageText }) }]
            },
            _: generatedToken
        });
        url = `https://free4talk-messenger.herokuapp.com/messenger/post/messages/?a=messenger-post-messages&v=536-1&t=${Date.now()}`;
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": `Bearer ${token}`,
                "Accept-Language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
                "Sec-Ch-Ua": "\"Not;A=Brand\";v=\"99\", \"Google Chrome\";v=\"139\", \"Chromium\";v=\"139\"",
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": "\"Windows\"",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site"
            },
            referrer: "https://www.free4talk.com/",
            body: requestBody,
            mode: "cors",
            credentials: "omit"
        });


        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const responseData = await response.json();

        if (responseData.success && responseData.data) {
            return JSON.stringify(responseData);
        } else {
            console.error('Invalid response structure:', responseData);
            throw new Error(`Failed to send message: ${responseData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
///////// DONE /////////

///////// DONE /////////
async function loadFriendsList() {
    try {
        const friendIds = await fetchRelationships();

        // Early return if no friends
        if (!friendIds || friendIds.length === 0) {
            return [];
        }

        const userMap = getUserMap();

        // Single-pass: build results array directly, skip nulls
        const friends = [];
        for (let i = 0; i < friendIds.length; i++) {
            const id = friendIds[i];
            const user = userMap[id];
            if (user) {
                friends.push({ id, ...user });
            }
        }

        return friends;

    } catch (error) {
        console.error('Error loading friends list:', error);
        return [];
    }
}
///////// DONE /////////

function closeSettings() {
    const css = GatheredCSS();
    const panel = document.getElementById('f4t-settings-panel');
    const backdrop = document.getElementById('f4t-settings-backdrop');
    const onlineFriendsDisplay = document.getElementById('online-friends-display');

    if (onlineFriendsDisplay) {
        onlineFriendsDisplay.style.transition = 'transform 0.3s ease';
        onlineFriendsDisplay.style.cssText += css.onlineFriendsDisplayTransition;
    }

    if (panel) {
        panel.style.cssText += css.settingsPanelTransition;
        setTimeout(() => {
            panel.style.display = 'none';
            if (backdrop) backdrop.style.cssText += css.backdropTransition;
        }, 300);
    }
}

///////// DONE /////////
function createMessagesUI() {
    const css = GatheredCSS();

    const settingsHTML = `
        <div id="f4t-settings-backdrop" style="${css.settingsBackdrop}"></div>
        <div id="f4t-settings-panel" style="${css.settingsPanel} color:var(--textColor); opacity: 0; transform: translateY(-20px); transition: opacity 0.3s ease, transform 0.3s ease;">
            <div style="${css.settingsHeader}">
                <div style="${css.settingsHeaderFlex}">
                    <h3 style="${css.settingsTitle}">Messages</h3>
                    <button id="f4t-close-settings" style="${css.settingsCloseButton}">×</button>
                </div>
                <input id="friends-search" type="text" placeholder="Search friends..." autocomplete="off" style="${css.searchInput}">
            </div>
            <div id="friends-list" class="f4t-friends-scrollable" style="${css.friendsListContainer}">
                <div style="${css.loadingText}">
                    Loading friends...
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', settingsHTML);

    const backdrop = document.getElementById('f4t-settings-backdrop');
    const panel = document.getElementById('f4t-settings-panel');
    const closeBtn = document.getElementById('f4t-close-settings');

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        });
    });

    backdrop.onclick = closeSettings;
    closeBtn.onclick = closeSettings;

    const friendsList = document.getElementById('friends-list');
    if (friendsList) {
        friendsList.scrollTop = 0;
    }
}
async function populateFriendsList() {
    const css = GatheredCSS();
    const friendsListContainer = document.getElementById('friends-list');
    if (!friendsListContainer) return;

    const currentHeight = friendsListContainer.offsetHeight;
    friendsListContainer.style.height = currentHeight + 'px';
    friendsListContainer.style.maxHeight = 'none';
    friendsListContainer.style.overflowY = 'hidden';
    friendsListContainer.style.transition = 'height 0.4s ease, opacity 0.2s ease';

    try {
        await checkOnlineFriends();
        const friends = await loadFriendsList();

        // Parse localStorage ONCE and cache
        const lastChatMapRaw = JSON.parse(localStorage['friends:lastChatMap'] || '{}');
        const lastChatMap = lastChatMapRaw.data || lastChatMapRaw;
        const favouriteUsers = JSON.parse(localStorage['friends:favouriteUsers'] || '[]');
        const favouriteSet = new Set(favouriteUsers); // Use Set for O(1) lookup

        // Build unread map once
        const unreadMap = {};
        for (const chatId in lastChatMap) {
            const msg = lastChatMap[chatId];
            if (msg.fromId !== currentUserEID && !(msg.viewers || []).includes(currentUserEID)) {
                unreadMap[chatId] = msg;

            }
        }

        // Build message time and preview maps
        window.lastMessageTime = {};
        window.lastMessagePreview = {};

        for (const chatId in lastChatMap) {
            if (chatId.startsWith('pm:')) {
                const [, user1, user2] = chatId.split(':');
                const friendId = (user1 === currentUserEID) ? user2 : user1;
                const messageData = lastChatMap[chatId];

                window.lastMessageTime[friendId] = messageData.time;

                if (messageData.content && messageData.content.text) {
                    let preview = messageData.content.text;
                    if (preview.length > 40) {
                        preview = preview.substring(0, 40) + '...';
                    }
                    window.lastMessagePreview[friendId] = preview;

                }
            }
        }

        // Optimized unread check using cached data
        function hasUnreadMessages(friendId) {
            const chatIds = [`pm:${friendId}:${currentUserEID}`, `pm:${currentUserEID}:${friendId}`];
            for (let i = 0; i < chatIds.length; i++) {
                if (unreadMap[chatIds[i]]) return true;
            }
            return false;
        }

        // Get last seen data once
        const lastSeenData = getLastSeenData();
        const onlineFriends = window.currentOnlineFriends || new Set();

        function getActivityTime(friend) {
            const msgTime = window.lastMessageTime?.[friend.id] || 0;
            const seenTime = lastSeenData[friend.id] || 0;
            return Math.max(msgTime, seenTime);
        }

        function createFriendElement(friend, isOnline) {
            const msgTime = window.lastMessageTime?.[friend.id] || 0;
            const seenTime = lastSeenData[friend.id] || 0;
            const activityTime = Math.max(msgTime, seenTime);

            let statusText, statusColor;
            if (isOnline) {
                statusText = 'Online';
                statusColor = 'var(--onlineIndicator)';
            } else {
                statusText = activityTime > 0 ? formatLastSeen(activityTime) : 'Long time ago';
                statusColor = 'rgba(232,245,233,0.7)';
            }

            const messagePreview = window.lastMessagePreview?.[friend.id] || '';
            const hasUnread = hasUnreadMessages(friend.id);



            const friendElement = document.createElement('div');
            friendElement.style.cssText = css.friendElement + `
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            `;

            const avatarWrapper = document.createElement('div');
            avatarWrapper.style.position = 'relative';

            const avatarImg = document.createElement('img');
            avatarImg.src = friend.avatar;
            avatarImg.alt = friend.name;
            avatarImg.style.cssText = 'width:40px;height:40px;border-radius:50%;';
            avatarWrapper.appendChild(avatarImg);

            if (isOnline) {
                const onlineIndicator = document.createElement('div');
                onlineIndicator.style.cssText = css.onlineStatusIndicator;
                avatarWrapper.appendChild(onlineIndicator);
            }

            friendElement.appendChild(avatarWrapper);

            const infoDiv = document.createElement('div');
            infoDiv.style.cssText = css.friendInfo;

            const nameDiv = document.createElement('div');
            nameDiv.style.cssText = css.friendName + (hasUnread ? '; color: white; font-weight: bold;' : '');
            nameDiv.textContent = friend.name;


            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = `${css.friendStatus}; color:${statusColor};${hasUnread ? ' color: white; font-weight: bold;' : ''}`;
            statusDiv.textContent = statusText;

            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(statusDiv);

            if (messagePreview) {
                const previewDiv = document.createElement('div');
                previewDiv.style.cssText = `
                    font-size: 11px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 150px;
                    margin-top: 2px;
                    font-style: ${hasUnread ? 'normal' : 'italic'};
                    font-weight: ${hasUnread ? 'bold' : 'normal'};
                    color: ${hasUnread ? 'white' : 'rgb(160 160 160 / 60%)'};
                `;
                previewDiv.textContent = messagePreview;
                infoDiv.appendChild(previewDiv);
            }

            friendElement.appendChild(infoDiv);

            // Use proper event listeners instead of inline handlers
            friendElement.addEventListener('mouseenter', () => {
                friendElement.style.backgroundColor = 'var(--buttonHover)';
                friendElement.style.borderColor = 'var(--borderColor)';
            });
            friendElement.addEventListener('mouseleave', () => {
                friendElement.style.backgroundColor = 'transparent';
                friendElement.style.borderColor = 'transparent';
            });

            friendElement.addEventListener('click', () => {
                if (currentUserEID) {
                    openMessagesModal(currentUserEID, friend.id, friend.name, friend.avatar);
                    document.getElementById('ChatInputArea')?.focus();
                } else {
                    alert('Unable to get user ID. Please refresh the page.');
                }
            });

            return friendElement;
        }

        function sortByUnreadAndActivity(section) {
            return section.sort((a, b) => {
                const aHasUnread = hasUnreadMessages(a.id);
                const bHasUnread = hasUnreadMessages(b.id);

                if (aHasUnread && !bHasUnread) return -1;
                if (!aHasUnread && bHasUnread) return 1;

                return getActivityTime(b) - getActivityTime(a);
            });
        }

        function renderFriends(friendsToShow) {
            // Categorize friends in single pass
            const onlineSection = [];
            const favouriteSection = [];
            const offlineSection = [];

            for (let i = 0; i < friendsToShow.length; i++) {
                const friend = friendsToShow[i];
                if (onlineFriends.has(friend.id)) {
                    onlineSection.push(friend);
                } else if (favouriteSet.has(friend.id)) {
                    favouriteSection.push(friend);
                } else {
                    offlineSection.push(friend);
                }
            }

            // Sort sections
            sortByUnreadAndActivity(onlineSection);
            sortByUnreadAndActivity(favouriteSection);
            sortByUnreadAndActivity(offlineSection);

            friendsListContainer.style.opacity = '0';

            setTimeout(() => {
                friendsListContainer.innerHTML = '';

                function appendSection(headerText, section, sectionCss) {
                    if (section.length === 0) return;

                    const header = document.createElement('div');
                    header.style.cssText = css.sectionHeader + sectionCss;
                    header.textContent = `${headerText} (${section.length})`;
                    friendsListContainer.appendChild(header);

                    const fragment = document.createDocumentFragment();
                    for (let i = 0; i < section.length; i++) {
                        const friend = section[i];
                        const elem = createFriendElement(friend, onlineFriends.has(friend.id));
                        fragment.appendChild(elem);

                        // Stagger animations
                        ((index, element) => {
                            setTimeout(() => {
                                element.style.opacity = '1';
                                element.style.transform = 'translateY(0)';
                            }, 50 + (index * 30));
                        })(i, elem);
                    }
                    friendsListContainer.appendChild(fragment);
                }

                appendSection('Online', onlineSection, css.onlineHeader);
                appendSection('Favourites', favouriteSection, css.favouriteHeader || '');
                appendSection('Offline', offlineSection, css.offlineHeader);

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const newHeight = friendsListContainer.scrollHeight;
                        const maxAllowedHeight = window.innerHeight * 0.7 - 140;

                        friendsListContainer.style.height = (newHeight > maxAllowedHeight ? maxAllowedHeight : newHeight) + 'px';
                        friendsListContainer.style.opacity = '1';

                        setTimeout(() => {
                            friendsListContainer.style.height = '';
                            friendsListContainer.style.maxHeight = 'calc(70vh - 140px)';
                            friendsListContainer.style.overflowY = 'auto';

                            const panel = document.getElementById('f4t-settings-panel');
                            if (typeof repositionOnlineFriendsDisplay === 'function') {
                                repositionOnlineFriendsDisplay(panel);
                            }
                        }, 400);
                    });
                });
            }, 200);
        }

        renderFriends(friends);

        // Debounced search
        const searchInput = document.getElementById('friends-search');
        if (searchInput) {
            let searchTimeout = null;
            searchInput.addEventListener('input', (e) => {
                if (searchTimeout) clearTimeout(searchTimeout);

                searchTimeout = setTimeout(() => {
                    const searchTerm = e.target.value.toLowerCase();
                    if (searchTerm === '') {
                        renderFriends(friends);
                    } else {
                        const filteredFriends = friends.filter(friend =>
                            friend.name.toLowerCase().includes(searchTerm)
                        );
                        renderFriends(filteredFriends);
                    }
                }, 150);
            });
        }

    } catch (error) {
        console.error('Error in populateFriendsList:', error);
        if (friendsListContainer) {
            friendsListContainer.innerHTML = `
                <div style="${css.noFriendsMessage}">
                    Error loading friends
                </div>
            `;
        }
    }
}

async function logUnreadFriendsVerbose() {
    try {
        // --- Data load & unread detection ---
        const friends = await loadFriendsList();
        const lastChatMapRaw = JSON.parse(localStorage['friends:lastChatMap'] || '{}');
        const lastChatMap = lastChatMapRaw.data || lastChatMapRaw;

        const unreadMap = {};
        for (const chatId in lastChatMap) {
            const msg = lastChatMap[chatId];
            if (msg.fromId !== currentUserEID && !(msg.viewers || []).includes(currentUserEID)) {
                unreadMap[chatId] = msg;
            }
        }

        function hasUnreadMessages(friendId) {
            const chatIds = [
                `pm:${friendId}:${currentUserEID}`,
                `pm:${currentUserEID}:${friendId}`
            ];
            return chatIds.some(id => !!unreadMap[id]);
        }

        const lastMessagePreview = {};
        const lastMessageTime = {};
        for (const chatId in lastChatMap) {
            if (!chatId.startsWith('pm:')) continue;
            const [, u1, u2] = chatId.split(':');
            const friendId = (u1 === currentUserEID) ? u2 : u1;
            const m = lastChatMap[chatId];
            if (m) {
                if (m.content && m.content.text) {
                    lastMessagePreview[friendId] = (m.content.text.length > 200) ? m.content.text.slice(0,200) + '...' : m.content.text;
                }
                lastMessageTime[friendId] = m.time || 0;
            }
        }

        const lastSeenData = (typeof getLastSeenData === 'function') ? getLastSeenData() : (window.lastSeenData || {});
        const onlineSet = window.currentOnlineFriends || new Set();

        const unreadFriends = [];
        for (const friend of friends) {
            if (!hasUnreadMessages(friend.id)) continue;
            unreadFriends.push({
                id: friend.id,
                name: friend.name,
                avatar: friend.avatar,
                isOnline: onlineSet.has(friend.id),
            });
        }

        // --- Bottom-right avatar bubbles ---
        const containerId = 'f4t-unread-notifier';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.cssText = `
                position: fixed;
                bottom: 876px;
                left: 220px;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                gap: 8px;
                z-index: 9999;
                pointer-events: auto;
                align-items: flex-end;
            `;
            document.body.appendChild(container);
        }

        // Get current friend IDs in container
        const currentIDs = unreadFriends.map(f => f.id).join(',');
        const previousIDs = container.dataset.lastIds || '';

        if (currentIDs === previousIDs) return;

        // Identify removed friends
        const previousIDsArray = previousIDs ? previousIDs.split(',') : [];
        const currentIDsArray = unreadFriends.map(f => f.id);
        const removedIDs = previousIDsArray.filter(id => !currentIDsArray.includes(id));

        // Fade out removed circles
        const fadeOutPromises = [];
        removedIDs.forEach(id => {
            const existingCircle = container.querySelector(`[data-friend-id="${id}"]`);
            if (existingCircle) {
                existingCircle.style.opacity = '0';
                existingCircle.style.transform = 'translateY(10px)';
                const promise = new Promise(resolve => {
                    setTimeout(() => {
                        if (existingCircle.parentNode) {
                            existingCircle.remove();
                        }
                        resolve();
                    }, 500);
                });
                fadeOutPromises.push(promise);
            }
        });

        // Wait for fade-out to complete before adding new ones
        await Promise.all(fadeOutPromises);

        // Add new circles
        unreadFriends.slice(0, 5).forEach(friend => {
            // Skip if already exists
            if (container.querySelector(`[data-friend-id="${friend.id}"]`)) {
                return;
            }

            const wrap = document.createElement('div');
            wrap.dataset.friendId = friend.id;
            wrap.style.cssText = `
                width: 20px; height: 20px; border-radius: 50%;
                position: relative; cursor: pointer; overflow: hidden;
                box-shadow: 0 0 4px rgba(0,0,0,0.45); background: #00000010;
                opacity: 0;
                transform: translateY(10px);
            `;

            // Set transition after a brief delay to prevent initial flash
            setTimeout(() => {
                wrap.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }, 10);

            const img = document.createElement('img');
            img.src = friend.avatar || '';
            img.alt = friend.name || '';
            img.style.cssText = `width:100%; height:100%; object-fit: cover; display:block;`;
            wrap.appendChild(img);

            wrap.addEventListener('click', () => {
                openMessagesModal(currentUserEID, friend.id, friend.name, friend.avatar);
            });

            container.appendChild(wrap);

            // Fade-in animation with double requestAnimationFrame for reliability
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    wrap.style.opacity = '1';
                    wrap.style.transform = 'translateY(0)';
                });
            });
        });

        // Update stored IDs
        container.dataset.lastIds = currentIDs;

    } catch (err) {
        console.error('Error in logUnreadFriendsVerbose:', err);
    }
}

(function() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('/messenger/post/view-message')) {
setTimeout(logUnreadFriendsVerbose, 1000);

        }
        return originalFetch.apply(this, args);
    };
})();



///////// DONE /////////


function createSettingsUi() {
    const css = GatheredCSS();

    if (!document.getElementById('f4t-keyframes')) {
        const style = document.createElement('style');
        style.id = 'f4t-keyframes';
        style.textContent = css.keyframesAnimations;
        document.head.appendChild(style);
    }

    const buttonHTML = `
        <button id="f4t-msg-btn" title="Messages">
            🗨️
        </button>
    `;

    document.body.insertAdjacentHTML('beforeend', buttonHTML);

    const btn = document.getElementById('f4t-msg-btn');
    btn.style.cssText = css.msgButton + `left:10px;`;

    btn.addEventListener('click', async () => {
        const panel = document.getElementById('f4t-settings-panel');
        const backdrop = document.getElementById('f4t-settings-backdrop');
        const onlineFriendsDisplay = document.getElementById('online-friends-display');

        if (panel.style.display === 'none' || !panel.style.display) {
            backdrop.style.display = 'block';
            panel.style.display = 'block';
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-20px)';
            panel.style.transition = 'all 0.3s ease';

            populateFriendsList();

            const friendsList = document.getElementById('friends-list');
            if (friendsList) {
                friendsList.scrollTop = 0;
            }

            setTimeout(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';

                if (onlineFriendsDisplay) {
                    const modalRect = panel.getBoundingClientRect();
                    const modalBottom = modalRect.bottom;
                    const offsetFromTop = modalBottom + 30;

                    onlineFriendsDisplay.style.transition = 'transform 0.3s ease';
                    onlineFriendsDisplay.style.transform = `translateY(${offsetFromTop - 58}px)`;
                }
            }, 10);
        } else {
            if (onlineFriendsDisplay) {
                onlineFriendsDisplay.style.transition = 'transform 0.3s ease';
                onlineFriendsDisplay.style.transform = 'translateY(0)';
            }

            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                panel.style.display = 'none';
                backdrop.style.display = 'none';
            }, 300);
        }
    });

        btn.addEventListener('mouseenter', () => {
        btn.style.background = `linear-gradient(270deg, var(--buttonGradientHover), var(--buttonGradientMid), var(--buttonGradientEnd))`;
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.background = `linear-gradient(270deg, var(--buttonGradientStart), var(--buttonGradientMid), var(--buttonGradientEnd))`;
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
}
async function checkOnlineFriends() {
    const generatedToken = generateToken();
    let friendsList = [];

    try {
        const localFriendsData = localStorage['friends:userMap'];
        if (localFriendsData) {
            const parsedFriendsData = JSON.parse(localFriendsData);
            if (parsedFriendsData.data && typeof parsedFriendsData.data === 'object') {
                friendsList = Object.keys(parsedFriendsData.data);
            }
        }
    } catch (error) {
        return [];
    }

    try {
        const groupsResponse = await fetch(`https://free4talk-sync.herokuapp.com/sync/get/free4talk/groups/?a=sync-get-free4talk-groups&v=536-1&t=${Date.now()}`, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
                "content-type": "text/plain;charset=UTF-8"
            },
            body: JSON.stringify({ body: {}, _: generatedToken }),
            mode: "cors",
            credentials: "omit"
        });

        const groupsData = await groupsResponse.json();
        window.UpdatedGroupsData = groupsData;
        const onlineUsers = [];

        if (groupsData.success && groupsData.data) {


            Object.values(groupsData.data).forEach(group => {
                if (group && group.clients && Array.isArray(group.clients)) {
                    group.clients.forEach(client => {
                        if (client && client.name && client.id && client.avatar) {
                            onlineUsers.push({
                                name: client.name,
                                id: client.id,
                                avatar: client.avatar
                            });
                        }
                    });
                }
            });
        }

        const onlineFriends = [];
        const seenIds = new Set();
        const onlineFriendIds = new Set();

        onlineUsers.forEach(user => {
            if (friendsList.includes(user.id) && !seenIds.has(user.id)) {
                seenIds.add(user.id);
                onlineFriendIds.add(user.id);
                onlineFriends.push(user);
                updateLastSeen(user.id, Date.now());
            }
        });

        window.currentOnlineFriends = onlineFriendIds;

        return onlineFriends;
    } catch (error) {
        return [];
    }
}
function createDisplayElement() {
    const css = GatheredCSS();
    let displayDiv = document.getElementById('online-friends-display');

    if (displayDiv) {
        return displayDiv;
    }

    displayDiv = document.createElement('div');
    displayDiv.id = 'online-friends-display';
    displayDiv.style.cssText = css.onlineFriendsDisplay;
    document.body.appendChild(displayDiv);
    return displayDiv;
}
function updateDisplay(onlineFriends) {
    const css = GatheredCSS();
    const displayDiv = createDisplayElement();

    const currentUsers = new Set(Array.from(displayDiv.children).map(child =>
        child.getAttribute('data-user-id')
    ));
    const newUsers = new Set(onlineFriends.map(friend => friend.id));

    Array.from(displayDiv.children).forEach(child => {
        const userId = child.getAttribute('data-user-id');
        if (!newUsers.has(userId)) {
            child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            child.style.opacity = '0';
            child.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                if (child.parentNode) {
                    child.remove();
                }
            }, 300);
        }
    });

  onlineFriends.forEach(friend => {

    if (!currentUsers.has(friend.id)) {
        const friendElement = document.createElement('div');
        friendElement.setAttribute('data-user-id', friend.id);
        friendElement.style.cssText = css.onlineFriendItem + `
            opacity: 0;
            transform: translateX(-20px);
        `;

        friendElement.onmouseenter = () => {
            friendElement.style.backgroundColor = 'rgba(255,255,255,0.1)';
        };
        friendElement.onmouseleave = () => {
            friendElement.style.backgroundColor = 'transparent';
        };
        friendElement.onclick = () => {
            showRoomModal(friend.id);
            Backdrop();
        };

        friendElement.innerHTML = `
            <div style="${css.onlineIndicator}"></div>
            <img src="${friend.avatar}" style="${css.onlineFriendAvatar}" alt="${friend.name}">
            <span style="${css.onlineFriendName}">${friend.name}</span>
        `;
        audioManager.play("online");
        displayDiv.appendChild(friendElement);

        setTimeout(() => {
            friendElement.style.opacity = '1';
            friendElement.style.transform = 'translateX(0)';
        }, 50);
    }
});


    const totalUsers = displayDiv.children.length;
    displayDiv.style.display = totalUsers > 0 ? 'flex' : 'none';

    if (!document.getElementById('online-friends-styles')) {
        const style = document.createElement('style');
        style.id = 'online-friends-styles';
        style.textContent = css.pulseAnimation;
        document.head.appendChild(style);
    }
}
const RoomModalManager = {
    overlay: null,
    roomData: null,
    originalContent: null,
    originalTitle: null,

    init() {
        if (document.getElementById('room-modal-styles')) return;
        const css = GatheredCSS();
        const style = document.createElement('style');
        style.id = 'room-modal-styles';
        style.textContent = css.modalStyles + `
            .room-modal-body {
                ${css.roomModalTransition}
            }
        `;
        document.head.appendChild(style);
    },

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'room-modal-overlay';
        overlay.className = 'room-modal-overlay';
        overlay.innerHTML = `
            <div class="room-modal">
                <div class="room-modal-header">
                    <h2 class="room-modal-title"><span class="title-text"></span></h2>
                </div>
                <div class="room-modal-body">
                    <div class="loading-container" id="loading-container">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">Fetching room information</div>
                        <div class="loading-subtext">Please wait a moment...</div>
                    </div>
                    <div class="content-container" id="content-container">
                    </div>
                </div>
            </div>
        `;

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close();
        });

        return overlay;
    },

   async fetchAndDisplay(userId) {
    try {
        const data = window.UpdatedGroupsData;

        if (data && data.success && data.data) {
            let foundRoom = null;
            for (const roomId in data.data) {
                const room = data.data[roomId];
                if (room.clients && room.clients.some(client => client.id === userId)) {
                    foundRoom = room;
                    break;
                }
            }
            if (foundRoom) {
                this.roomData = foundRoom;
                this.renderView('room');
            } else {
                this.renderView('error', `No room found for user ${userId}`);
            }
        } else {
            this.renderView('error', "Invalid response data received from server");
        }
    } catch (error) {
        console.error("Error fetching room data:", error);
        this.renderView('error', "Failed to fetch room data");
    }
},

    renderView(viewType, data = null) {
        const contentContainer = this.overlay.querySelector('#content-container');
        const loadingContainer = this.overlay.querySelector('#loading-container');
        const titleElement = this.overlay.querySelector('.room-modal-title');

        if (viewType === 'room') {
            this.originalContent = null;
            this.originalTitle = this.roomData.topic || '';

            titleElement.textContent = this.originalTitle;
            audioManager.play("ShowModals");

            contentContainer.innerHTML = this.getRoomHTML();

            loadingContainer.style.display = 'none';
            contentContainer.classList.remove('show');
            requestAnimationFrame(() => {
                contentContainer.classList.add('show');
            });

            this.attachAvatarHandlers();

        } else if (viewType === 'user') {
            const user = data;

            if (!this.originalContent) {
                this.originalContent = contentContainer.innerHTML;
                this.originalTitle = titleElement.textContent;
            }

            contentContainer.classList.remove('show');
            setTimeout(() => {
                titleElement.textContent = user.name || 'User Info';
                contentContainer.innerHTML = this.getUserHTML(user);
                this.attachUserHandlers(user);
                requestAnimationFrame(() => {
                    contentContainer.classList.add('show');
                });
            }, 1000);

        } else if (viewType === 'error') {
            titleElement.textContent = 'Error Loading Room';
            contentContainer.innerHTML = this.getErrorHTML(data);

            loadingContainer.style.display = 'none';
            contentContainer.classList.remove('show');
            requestAnimationFrame(() => {
                contentContainer.classList.add('show');
            });
        }
    },

    getRoomHTML() {
        const css = GatheredCSS();
        const formatDate = (dateStr) => {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return `
            <div class="room-info-grid">
                <div class="room-info-item">
                    <div class="room-info-label">Language</div>
                    <div class="room-info-value">${this.roomData.language || 'Not specified'}</div>
                </div>
                <div class="room-info-item">
                    <div class="room-info-label">Level</div>
                    <div class="room-info-value">${this.roomData.level || 'Not specified'}</div>
                </div>
                <div class="room-info-item">
                    <div class="room-info-label">Capacity</div>
                    <div class="room-info-value">${this.roomData.clients ? this.roomData.clients.length : 0}/${this.roomData.maxPeople}</div>
                </div>
                <div class="room-info-item">
                    <div class="room-info-label">Created</div>
                    <div class="room-info-value">${this.roomData.createdAt ? formatDate(this.roomData.createdAt) : 'Unknown'} | Creator: ${this.roomData.creator.name}</div>
                </div>
            </div>

            <div class="clients-section">
                <div class="clients-title">
                    Participants
                    <span class="clients-count">${this.roomData.clients ? this.roomData.clients.length : 0}</span>
                </div>
                <div class="clients-title">
                    Microphone:
                    <span class="clients-count">${this.roomData.settings && this.roomData.settings.noMic ? 'Off' : 'On'}</span>
                </div>

                <div class="clients-grid">
                    ${this.roomData.clients && this.roomData.clients.length > 0 ? this.roomData.clients.map(client => `
                        <div class="client-card">
                            <div class="client-avatar" data-client-id="${client.id}">
                                <img src="${client.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><circle cx="12" cy="8" r="4"/><path d="M20 20c0-4.4-3.6-8-8-8s-8 3.6-8 8"/></svg>'}" alt="${client.name || 'User'}" />
                            </div>
                            <div class="client-name">${client.name || 'Anonymous'}${client.isVerified ? '<span class="verified-badge">✓</span>' : ''}</div>
                            ${client.followers ? `<div class="client-stats">${client.followers} followers</div>` : ''}
                        </div>
                    `).join('') : `<div style="${css.roomNoParticipants}">No participants found</div>`}
                </div>
            </div>

            ${this.roomData.url ? `
                <div class="room-url-section">
                    <a href="${this.roomData.url}" target="_blank" class="room-url">
                        <span></span>
                        Join Room
                    </a>
                </div>
            ` : ''}
        `;
    },

    getUserHTML(user) {
        const css = GatheredCSS();
        return `
            <div style="${css.roomUserAvatarContainer}">
                <img src="${user.avatar}" alt="${user.name}" style="${css.roomUserAvatar}" id="user-avatar-img">
                <h3 style="${css.roomUserName}">${user.name}</h3>
                ${user.isVerified ? `<div style="${css.roomUserVerified}">Verified User</div>` : ''}
                <button id="magnifier-btn" style="${css.roomUserMagnifierBtn}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </button>
            </div>
            <div class="room-info-grid">
                <div class="room-info-item">
                    <div class="room-info-label">Followers</div>
                    <div class="room-info-value">${user.followers || 0}</div>
                </div>
                <div class="room-info-item">
                    <div class="room-info-label">Following</div>
                    <div class="room-info-value">${user.following || 0}</div>
                </div>
                <div class="room-info-item">
                    <div class="room-info-label">Friends</div>
                    <div class="room-info-value">${user.friends || 0}</div>
                </div>
            </div>
            <div style="${css.roomUserReturnBtnContainer}">
                <button id="return-to-room-btn" style="${css.roomUserReturnBtn}">Return to Room</button>
            </div>
        `;
    },

    getErrorHTML(errorMessage) {
        return `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <div class="error-title">Failed to Load Room Data</div>
                <div class="error-message">${errorMessage}</div>
            </div>
        `;
    },

    attachAvatarHandlers() {
        const avatarElements = this.overlay.querySelectorAll('.client-avatar');
        avatarElements.forEach(avatar => {
            avatar.style.cursor = 'pointer';
            avatar.addEventListener('click', (e) => {
                e.stopPropagation();
                const clientId = avatar.getAttribute('data-client-id');
                const client = this.roomData.clients.find(c => c.id === clientId);

                if (client) {
                    this.renderView('user', client);
                }
            });
        });
    },

    attachUserHandlers(user) {
        const css = GatheredCSS();
        const avatarImg = this.overlay.querySelector('#user-avatar-img');
        avatarImg.addEventListener('click', (e) => {
            e.stopPropagation();
            openImageViewer(user.avatar);
        });

        const magnifierBtn = this.overlay.querySelector('#magnifier-btn');
        magnifierBtn.addEventListener('click', () => {
            document.getElementById('room-modal-overlay')?.click();
            setTimeout(() => {
                Backdrop();
                openUserHistoryModal(user.id)
                Backdrop();
            }, 500);
        });

        const returnBtn = this.overlay.querySelector('#return-to-room-btn');
        returnBtn.addEventListener('click', () => this.returnToRoom());
        returnBtn.addEventListener('mouseover', () => {
            returnBtn.style.cssText = css.roomUserReturnBtn + css.roomUserReturnBtnHover;
        });
        returnBtn.addEventListener('mouseout', () => {
            returnBtn.style.cssText = css.roomUserReturnBtn + css.roomUserReturnBtnDefault;
        });
    },

    returnToRoom() {
        const contentContainer = this.overlay.querySelector('#content-container');
        const titleElement = this.overlay.querySelector('.room-modal-title');

        contentContainer.classList.remove('show');
        setTimeout(() => {
            titleElement.textContent = this.originalTitle;
            contentContainer.innerHTML = this.originalContent;
            this.attachAvatarHandlers();
            requestAnimationFrame(() => {
                contentContainer.classList.add('show');
            });
        }, 1000);
    },

    close() {
        closeBackdrop();
        this.overlay.classList.remove('show');
        setTimeout(() => {
            this.overlay.remove();
            document.body.style.overflow = '';
        }, 300);
    }
};
function showRoomModal(userId) {
    RoomModalManager.init();
    RoomModalManager.overlay = RoomModalManager.createOverlay();
    document.body.appendChild(RoomModalManager.overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        RoomModalManager.overlay.classList.add('show');
    });
    RoomModalManager.fetchAndDisplay(userId);
}
function addUserWithNewMessage(userId, userName, userAvatar, messageText = "New message") {
    const css = GatheredCSS();
    const displayDiv = document.getElementById('online-friends-display');
    if (!displayDiv) return;

    if (!friendMessages[userId]) {
        friendMessages[userId] = [];
    }
    friendMessages[userId].push(messageText);

    let friendElement = displayDiv.querySelector(`[data-user-id="${userId}"]`);

    if (friendElement) {
        const msgSpan = friendElement.querySelector(".f4t-msg-preview");
        if (msgSpan) {
            msgSpan.textContent = friendMessages[userId].join(" • ");
        }
        return;
    }

    friendElement = document.createElement('div');
    friendElement.setAttribute('data-user-id', userId);
    friendElement.style.cssText = css.newMessageFriendItem;

    friendElement.onmouseenter = () => {
        friendElement.style.backgroundColor = 'rgba(255,255,255,0.1)';
    };
    friendElement.onmouseleave = () => {
        friendElement.style.backgroundColor = 'transparent';
    };
    friendElement.onclick = () => {
        if (currentUserEID) {

            openMessagesModal(currentUserEID, userId, userName, userAvatar);
            delete friendMessages[userId];
            friendElement.remove();
        }
    };

    friendElement.innerHTML = `
        <div style="${css.newMessageIndicator}"></div>
        <img src="${userAvatar}" style="${css.newMessageAvatar}" alt="${userName}">
        <span style="${css.newMessageUserName}">${userName}</span>
        <span class="f4t-msg-preview" style="${css.newMessagePreview}">${messageText}</span>
    `;

    displayDiv.insertBefore(friendElement, displayDiv.firstChild);
    displayDiv.style.display = 'flex';

    if (!document.getElementById('red-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'red-pulse-style';
        style.textContent = css.redPulseAnimation;
        document.head.appendChild(style);
    }
}
async function checkAndDisplayOnlineFriends() {
        try {
            updateDisplay(await checkOnlineFriends());
        } catch (error) {}
    }
function setupNotificationSystem() {
    let lastMessageIds = new Set();
    let isInitialized = false;

    function parseMessageContent(contentStr) {
        try {
            if (typeof contentStr === 'string') {
                const content = JSON.parse(contentStr);
                return content.text || content.message || "New message";
            }
            return contentStr?.text || contentStr?.message || "New message";
        } catch (e) {
            return contentStr || "New message";
        }
    }



       (function setupInterceptors() {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this._method = method;
            this._url = url;
            return originalXHROpen.call(this, method, url, async, user, password);
        };

        XMLHttpRequest.prototype.send = function(data) {
            if (this._url && this._url.includes('messenger/get/last-messages')) {
                this.addEventListener('readystatechange', function() {
                    if (this.readyState === 4 && this.status === 200) {
                        try {
                            const response = JSON.parse(this.responseText);
                            if (response && response.success && response.data && response.data.messages) {
                                processMessages(response.data.messages);
                            }
                        } catch (e) {
                        }
                    }
                });
            }
            return originalXHRSend.call(this, data);
        };

        if (window.fetch) {
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const url = args[0];
                return originalFetch.apply(this, args).then(response => {
                    if (url && url.includes && url.includes('messenger/get/last-messages')) {
                        const clonedResponse = response.clone();
                        clonedResponse.json().then(data => {
                            if (data && data.success && data.data && data.data.messages) {
                                processMessages(data.data.messages);
                            }
                        }).catch(e => {
                        });
                    }
                    return response;
                });
            };
        }
    })();
}
function createImageViewerStyles() {
    if (document.getElementById('f4t-image-viewer-styles')) return;

    const style = document.createElement('style');
    style.id = 'f4t-image-viewer-styles';
    style.textContent = GatheredCSS().imageViewerStyles;
    document.head.appendChild(style);
}
function openImageViewer(imageSrc) {
createImageViewerStyles();
    const existingViewer = document.getElementById('f4t-image-viewer');
    if (existingViewer) {
        existingViewer.remove();
    }

    const viewer = document.createElement('div');
    viewer.id = 'f4t-image-viewer';
    viewer.className = 'f4t-image-viewer';

    const content = document.createElement('div');
    content.className = 'f4t-image-content';

    const container = document.createElement('div');
    container.className = 'f4t-image-container';

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Viewing image';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'f4t-image-close';
    closeBtn.innerHTML = '×';

    const zoomControls = document.createElement('div');
    zoomControls.className = 'f4t-zoom-controls';

    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'f4t-zoom-btn';
    zoomOutBtn.innerHTML = '−';

    const zoomLevel = document.createElement('span');
    zoomLevel.className = 'f4t-zoom-level';
    zoomLevel.textContent = '100%';

    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'f4t-zoom-btn';
    zoomInBtn.innerHTML = '+';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'f4t-zoom-btn';
    resetBtn.innerHTML = '⌂';
    resetBtn.title = 'Reset zoom and position';

    const imageInfo = document.createElement('div');
    imageInfo.className = 'f4t-image-info';

    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomLevel);
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(resetBtn);

    let currentZoom = 1;
    let minZoom = 0.1;
    let maxZoom = 5;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let imgNaturalWidth = 0;
    let imgNaturalHeight = 0;
    let initialFitScale = 1;

    function calculateInitialFit() {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        if (imgNaturalWidth === 0 || imgNaturalHeight === 0) return 1;

        const scaleX = containerWidth / imgNaturalWidth;
        const scaleY = containerHeight / imgNaturalHeight;
        const fitScale = Math.min(scaleX, scaleY);

        return fitScale;
    }

    function updateImageTransform() {
        img.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
        zoomLevel.textContent = Math.round(currentZoom / initialFitScale * 100) + '%';

        zoomOutBtn.disabled = currentZoom <= minZoom;
        zoomInBtn.disabled = currentZoom >= maxZoom;
    }

    function zoomIn() {
        if (currentZoom < maxZoom) {
            const zoomFactor = 1.2;
            currentZoom = Math.min(currentZoom * zoomFactor, maxZoom);
            updateImageTransform();
        }
    }

    function zoomOut() {
        if (currentZoom > minZoom) {
            const zoomFactor = 1.2;
            currentZoom = Math.max(currentZoom / zoomFactor, minZoom);
            updateImageTransform();
        }
    }

    function resetZoomAndPosition() {
        currentZoom = initialFitScale;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
    }

    function startDrag(clientX, clientY) {
        if (currentZoom <= initialFitScale) return;

        isDragging = true;
        dragStartX = clientX - translateX;
        dragStartY = clientY - translateY;
        container.classList.add('dragging');
    }

    function drag(clientX, clientY) {
        if (!isDragging) return;

        translateX = clientX - dragStartX;
        translateY = clientY - dragStartY;

        updateImageTransform();
    }

    function endDrag() {
        isDragging = false;
        container.classList.remove('dragging');
    }

    container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            drag(e.clientX, e.clientY);
        }
    });

    document.addEventListener('mouseup', endDrag);

    container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            drag(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    document.addEventListener('touchend', endDrag);

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });

    zoomInBtn.onclick = zoomIn;
    zoomOutBtn.onclick = zoomOut;
    resetBtn.onclick = resetZoomAndPosition;

    img.onload = () => {
        imgNaturalWidth = img.naturalWidth;
        imgNaturalHeight = img.naturalHeight;

        initialFitScale = 1;
        currentZoom = 1;
        minZoom = 0.1;
        maxZoom = 5;

        updateImageTransform();

        imageInfo.textContent = `${imgNaturalWidth} × ${imgNaturalHeight}`;
    };

    const closeViewer = () => {
        viewer.classList.remove('show');
        setTimeout(() => {
            if (viewer.parentNode) {
                viewer.remove();
            }
            document.removeEventListener('keydown', escHandler);
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', endDrag);
        }, 300);
    };

    closeBtn.onclick = closeViewer;
    viewer.onclick = (e) => {
        if (e.target === viewer) {
            closeViewer();
        }
    };

    const escHandler = (e) => {
        switch(e.key) {
            case 'Escape':
                closeViewer();
                break;
            case '=':
            case '+':
                e.preventDefault();
                zoomIn();
                break;
            case '-':
                e.preventDefault();
                zoomOut();
                break;
            case '0':
                e.preventDefault();
                resetZoomAndPosition();
                break;
        }
    };

    document.addEventListener('keydown', escHandler);

    document.body.style.overflow = 'hidden';
    viewer.addEventListener('remove', () => {
        document.body.style.overflow = '';
    });

    container.appendChild(img);
    content.appendChild(imageInfo);
    content.appendChild(container);
    content.appendChild(closeBtn);
    content.appendChild(zoomControls);
    viewer.appendChild(content);
    document.body.appendChild(viewer);

    setTimeout(() => {
        viewer.classList.add('show');
    }, 10);
}
function getLastSeenData() {
    try {
        const lastSeenStr = localStorage['friends:lastSeen'];
        if (!lastSeenStr) return {};

        const lastSeenObj = JSON.parse(lastSeenStr);
        return lastSeenObj.data || {};
    } catch (e) {
        console.error("Invalid JSON in localStorage['friends:lastSeen']", e);
        return {};
    }
}
function setLastSeenData(data) {
    try {
        const lastSeenObj = {
            data: data,
            timestamp: Date.now()
        };
        localStorage['friends:lastSeen'] = JSON.stringify(lastSeenObj);
    } catch (e) {
        console.log('Could not save last seen data to localStorage');
    }
}
function updateLastSeen(userId, timestamp = Date.now()) {
    const lastSeenData = getLastSeenData();
    lastSeenData[userId] = timestamp;
    setLastSeenData(lastSeenData);
}
function formatLastSeen(timestamp) {
    if (!timestamp) return 'Long time ago';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
}
function MessagesNotificationSystem() {
    const activeNotifications = [];
    const notificationMap = new Map();
    const css = GatheredCSS();

    const createNotification = (senderId, messageText, userInfo) => {
        const notification = document.createElement('div');
        notification.setAttribute('data-sender-id', senderId);
        notification.classList.add('stacked-message-notification');
        notification.style.cssText = css.messageNotification + `left:20px;bottom:${20 + activeNotifications.length * 100}px;`;

        const avatar = document.createElement('img');
        avatar.src = userInfo.avatar;
        avatar.style.cssText = css.messageNotificationAvatar;
        notification.appendChild(avatar);

        const content = document.createElement('div');
        content.style.cssText = css.messageNotificationContent;

        const header = document.createElement('div');
        header.textContent = "New message";
        header.style.cssText = css.messageNotificationHeader;
        content.appendChild(header);

        const name = document.createElement('div');
        name.textContent = userInfo.name;
        name.style.cssText = css.messageNotificationName;
        content.appendChild(name);

        const message = document.createElement('div');
        message.textContent = messageText.length > 60 ? messageText.slice(0, 57) + '...' : messageText;
        message.style.cssText = css.messageNotificationText;
        content.appendChild(message);

        notification.appendChild(content);

        const leftArrow = document.createElement('div');
        leftArrow.textContent = '<';
        leftArrow.style.cssText = css.messageNotificationArrow;
        leftArrow.onclick = (e) => {
            e.stopPropagation();
            if (notification._currentMessageIndex > 0) {
                notification._currentMessageIndex--;
                updateMessageDisplay();
            }
        };
        notification.appendChild(leftArrow);

        const rightArrow = document.createElement('div');
        rightArrow.textContent = '>';
        rightArrow.style.cssText = css.messageNotificationArrow;
        rightArrow.onclick = (e) => {
            e.stopPropagation();
            if (notification._currentMessageIndex < notification._messages.length - 1) {
                notification._currentMessageIndex++;
                updateMessageDisplay();
            }
        };
        notification.appendChild(rightArrow);

        const closeBtn = document.createElement('div');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = css.messageNotificationCloseBtn;
        closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
        closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.6';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            fadeOutAndRemove(notification, senderId);
        };
        notification.appendChild(closeBtn);

        const clearAllBtn = document.createElement('div');
        clearAllBtn.textContent = '🗑';
        clearAllBtn.style.cssText = css.messageNotificationClearAllBtn;
        clearAllBtn.onmouseenter = () => clearAllBtn.style.opacity = '1';
        clearAllBtn.onmouseleave = () => clearAllBtn.style.opacity = '0.6';
        clearAllBtn.onclick = (e) => {
            e.stopPropagation();
            const notificationsToRemove = [...activeNotifications];
            activeNotifications.length = 0;
            notificationMap.clear();
            notificationsToRemove.forEach((notif, index) => {
                setTimeout(() => {
                    fadeOutAndRemove(notif, null, false);
                }, index * 50);
            });
        };
        notification.appendChild(clearAllBtn);

        notification._messageElement = message;
        notification._headerElement = header;
        notification._leftArrow = leftArrow;
        notification._rightArrow = rightArrow;
        notification._messages = [messageText];
        notification._messageCount = 1;
        notification._currentMessageIndex = 0;

        const updateMessageDisplay = () => {
            const currentMessage = notification._messages[notification._currentMessageIndex];
            notification._messageElement.textContent = currentMessage.length > 60 ? currentMessage.slice(0, 57) + '...' : currentMessage;

            notification._leftArrow.style.opacity = notification._currentMessageIndex > 0 ? '0.6' : '0';
            notification._rightArrow.style.opacity = notification._currentMessageIndex < notification._messages.length - 1 ? '0.6' : '0';

            if (notification._messageCount > 1) {
                notification._headerElement.textContent = `Message ${notification._currentMessageIndex + 1} of ${notification._messageCount}`;
            }
        };

        notification.onclick = () => {
            if (currentUserEID) {
                openMessagesModal(currentUserEID, senderId, userInfo.name, userInfo.avatar);
                fadeOutAndRemove(notification, senderId);
                document.getElementById('ChatInputArea')?.focus();
            } else {
                console.error('currentUserEID not set');
                alert('Unable to open chat. Please refresh the page.');
            }
        };

        document.body.appendChild(notification);
        activeNotifications.push(notification);
        notificationMap.set(senderId, notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        repositionNotifications();
    };

    const updateExisting = (senderId, messageText, userInfo) => {
        const notification = notificationMap.get(senderId);
        if (!notification) return;

        notification._messages.push(messageText);
        notification._messageCount++;

        notification._currentMessageIndex = notification._messages.length - 1;

        const updateMessageDisplay = () => {
            const currentMessage = notification._messages[notification._currentMessageIndex];
            notification._messageElement.textContent = currentMessage.length > 60 ? currentMessage.slice(0, 57) + '...' : currentMessage;

            notification._leftArrow.style.opacity = notification._currentMessageIndex > 0 ? '0.6' : '0';
            notification._rightArrow.style.opacity = notification._currentMessageIndex < notification._messages.length - 1 ? '0.6' : '0';

            if (notification._messageCount > 1) {
                notification._headerElement.textContent = `Message ${notification._currentMessageIndex + 1} of ${notification._messageCount}`;
            }
        };

        updateMessageDisplay();

        notification.style.transform = 'scale(1.05)';
        setTimeout(() => {
            notification.style.transform = 'scale(1)';
        }, 200);

        clearTimeout(notification._autoHideTimer);
    };

    const fadeOutAndRemove = (notification, senderId = null, updateMap = true) => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';

        setTimeout(() => {
            notification.remove();
            const index = activeNotifications.indexOf(notification);
            if (index !== -1) activeNotifications.splice(index, 1);

            if (updateMap && senderId) {
                notificationMap.delete(senderId);
            }

            repositionNotifications();
        }, 300);
    };

    const repositionNotifications = () => {
        activeNotifications.forEach((notif, index) => {
            notif.style.bottom = `${20 + index * 100}px`;
        });
    };

    return {
        showNotification: (senderId, messageText, userInfo) => {
            if (notificationMap.has(senderId)) {
                updateExisting(senderId, messageText, userInfo);
            } else {
                createNotification(senderId, messageText, userInfo);
            }
        }
    };
}
const messageNotifications = MessagesNotificationSystem();
function FollowersManagement() {
    const offsetX = 185, offsetY = 14;
    const notificationHeight = 40;
    const baseBottom = 873;
    const notifications = [];

    const showNotification = (msg, color) => {
        const n = document.createElement("div");
        n.innerHTML = `<span style="flex:1">${msg}</span><button>×</button>`;

        const notificationStyle = GatheredCSS().notificationContainer ||
            `position:fixed;bottom:${baseBottom}px;left:308px;background:rgba(26,26,26,0.3);color:#fff;border-radius:12px;border:1px solid rgba(74,85,104,0.3);box-shadow:0 4px 12px rgba(0,0,0,0.25);padding:3px 16px;width:240px;display:flex;align-items:flex-start;gap:12px;z-index:10002;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;opacity:0;transform:translateX(-50px);transition:opacity 0.3s ease,transform 0.3s ease-in-out,bottom 0.3s ease-in-out;backdrop-filter:blur(5px) saturate(150%);`;

        const bottomPosition = baseBottom - (notifications.length * (notificationHeight + offsetY));
        n.style.cssText = notificationStyle.replace("color:#fff", `color:${color}`).replace(`bottom:${baseBottom}px`, `bottom:${bottomPosition}px`);

        n.querySelector("button").style.cssText = GatheredCSS().notificationCloseButton ||
            `font-size:16px;font-weight:bold;color:rgba(232,245,233,0.6);margin-left:6px;cursor:pointer;transition:color 0.2s ease;background:none;border:none;padding:0;outline:none;`;

        notifications.push(n);
        document.body.appendChild(n);
        requestAnimationFrame(() => n.style.opacity = 1);

        n.querySelector("button").onclick = () => {
            n.style.opacity = 0;
            setTimeout(() => {
                n.remove();
                const index = notifications.indexOf(n);
                if (index > -1) notifications.splice(index, 1);
                notifications.forEach((notif, i) => {
                    const newBottom = baseBottom - (i * (notificationHeight + offsetY));
                    notif.style.bottom = `${newBottom}px`;
                });
            }, 300);
        };
    };

    const wrap = (msg, color) => {
        audioManager.play("followers");
        showNotification(msg, color);
    };

    return {
     onNewFollower: () => wrap("You got a new follower", "#4ade80"),
        onUnfollow: () => wrap("Someone unfollowed you", "#f87171"),
        onNewFriend: () => wrap("You got a new friend", "#4ade80"),
        onUnfriend: () => wrap("A friend unfollowed you", "#f87171")
    };
}
const followersManager = FollowersManagement();
function setupWebSocketInterceptor(myId) {
    if (window.WebSocket._intercepted) return;

    const originalWebSocket = window.WebSocket;

    const WebSocketWrapper = function (url, protocols) {
        console.log('[WS INTERCEPTOR] Captured WebSocket creation:', url);
        const ws = new originalWebSocket(url, protocols);
        window.ws = ws;


        ws.addEventListener("message", async (event) => {
            try {
                if (!event.data.startsWith("42")) return;

                const jsonStr = event.data.slice(2);
                const data = JSON.parse(jsonStr);
if (Array.isArray(data) && data[0] === "messages:create") {
   setTimeout(logUnreadFriendsVerbose, 1000);

    const { chatId, messageIds } = data[1] || {};
    if (!chatId || !messageIds || !messageIds.length) return;

    const messages = await fetchMessageChunk(chatId, null);
    const newMessages = messages.filter(msg => messageIds.includes(msg._id));

for (const msg of newMessages) {
    const senderId = msg.fromId;
    if (senderId && senderId !== myId) {

        const getUserInfo = () => {
            try {
                const userMapStr = localStorage['friends:userMap'];
                if (!userMapStr) return null;
                const userMap = JSON.parse(userMapStr);
                const userData = userMap.data[senderId];
                if (!userData) return null;
                return { name: userData.name, avatar: userData.avatar };

            } catch (e) {
                console.error('Error in getUserInfo:', e);
                return null;
            }

        };

        const userInfo = getUserInfo();
        if (userInfo) {
            const modal = document.getElementById('OpenMessagesModalContainer');
            if (modal) {
                const senderNameEl = modal.querySelector('#SenderName');
                if (senderNameEl && senderNameEl.textContent.trim() === userInfo.name) {
                    if (window.pullMessages) window.pullMessages();
                    audioManager.play("message");

                    let skippedText = msg.content;
                    try {
                        const parsed = JSON.parse(msg.content);
                        skippedText = parsed.text || parsed.message || skippedText;
                    } catch (e) { /* ignore parse errors */ }

                    continue;
                }
            }

            if (window.pullMessages) {
                window.pullMessages();
            }

            let messageText = msg.content;
            try {
                const contentObj = JSON.parse(msg.content);
                messageText = contentObj.text || contentObj.message || "New message";
            } catch (e) {
                messageText = msg.content || "New message";
            }

            messageNotifications.showNotification(senderId, messageText, userInfo);
            audioManager.play("message");

            if (!document.hasFocus()) {
                let originalTitle = "Free4Talk";
                let toggle = false;
                let titleInterval = setInterval(() => {
                    document.title = toggle ? "💬 New message!" : `💬 From ${userInfo.name}`;
                    toggle = !toggle;
                }, 2000);

                window.addEventListener("focus", () => {
                    clearInterval(titleInterval);
                    document.title = originalTitle;
                }, { once: true });
            }
        }
    }
}

}

               if (Array.isArray(data) && data[0] === "messages:react") {
    const { chatId, messageIds } = data[1] || {};
    if (!chatId || !messageIds?.length) return;


    messageIds.forEach(async (msgId) => {
        const messages = await fetchMessageChunk(chatId, null);
        const updatedMsg = messages.find(m => m._id === msgId);
        if (!updatedMsg) return;

        const msgElem = document.querySelector(`[data-message-id="${msgId}"]`);
        if (!msgElem) return;

        const oldContainer = msgElem.querySelector('.reactions-container');
        if (oldContainer) oldContainer.remove();

        if (updatedMsg.reactMap && Object.keys(updatedMsg.reactMap).length > 0) {
            const emojiMap = {
                'Like': '👍',
                'Love': '❤️',
                'Care': '🥰',
                'Haha': '😂',
                'Wow': '😮',
                'Sad': '😢',
                'Angry': '😡'
            };



            const reactionsContainer = document.createElement('div');
            reactionsContainer.className = 'reactions-container';
            reactionsContainer.style.cssText = `
                display: flex;
                gap: 4px;
                margin-top: 4px;
                font-size: 14px;
                align-self: flex-end;
            `;

            Object.entries(updatedMsg.reactMap).forEach(([reaction, users]) => {
                if (users.length > 0) {
                    const reactionElem = document.createElement('span');
                    reactionElem.textContent = emojiMap[reaction] || reaction;
                    reactionElem.style.cssText = `
                        background: rgba(255,255,255,0.1);
                        padding: 2px 6px;
                        border-radius: 12px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    reactionsContainer.appendChild(reactionElem);
                }
            });

            msgElem.querySelector('.message-bubble')?.appendChild(reactionsContainer);
        }
    });
}

if (Array.isArray(data) && data[0] === "messages:view") {

    const { chatId, messageIds } = data[1] || {};
    if (!chatId || !messageIds?.length) return;


    messageIds.forEach(async (msgId) => {
        try {
            const messages = await fetchMessageChunk(chatId, null);
            const updatedMsg = messages.find(m => m._id === msgId);
            if (!updatedMsg) return;

            let msgElem = document.querySelector(`[data-message-id="${msgId}"]`);
            if (!msgElem) {
                const tempElems = document.querySelectorAll(`[data-message-id^="temp-"]`);
                for (const el of tempElems) {
                    const bubble = el.querySelector('.message-bubble');
                    if (!bubble) continue;
                    let bubbleText = "";
                    try { bubbleText = JSON.parse(updatedMsg.content).text; } catch(e){}
                    if (bubbleText && bubble.textContent.trim() === bubbleText && updatedMsg.fromId) {
                        msgElem = el;
                        msgElem.setAttribute('data-message-id', updatedMsg._id);
                        break;
                    }
                }
            }

            if (!msgElem) return;

            const oldSeen = msgElem.querySelector('.seen-indicator');
            if (oldSeen) oldSeen.remove();

            const seen = updatedMsg.viewers && updatedMsg.viewers.length > 0;
            if (!seen) return;

            const seenElem = document.createElement('span');
            seenElem.className = 'seen-indicator';
            seenElem.textContent = 'Seen';
            seenElem.style.cssText = `
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                margin-top: 0px;
                font-size: 10px;
                color: rgba(232, 245, 233, 0.8);
            `;

            msgElem.appendChild(seenElem);

        } catch (err) {
            console.error("Error processing view event for", msgId, err);
        }
    });
}



window.addEventListener('load', () => {
    localStorage['fcurrentRoom:Participants'] = '[]';
});

const url = window.location.href;
const match = url.match(/\/room\/([^?]+)/);
const roomId = match ? match[1] : null;

if (roomId && Array.isArray(data) && data[0] === `room:[${roomId}]:participants`) {
    const payload = data[1];

    if (!payload.myself && payload.participantMap) {
        let stored = JSON.parse(localStorage['fcurrentRoom:Participants'] || '[]');
        const participants = Object.values(payload.participantMap);

        for (const p of participants) {
            const entry = {
                name: p.name,
                avatar: p.avatar,
                id: p.id,
                pid: p.pid,
                followers: p.followers,
                following: p.following,
                friends: p.friends

            };

            const existingIndex = stored.findIndex(s => s.id === entry.id);

            if (existingIndex === -1) {
                stored.push(entry);
            } else if (stored[existingIndex].pid !== entry.pid) {
                stored[existingIndex].pid = entry.pid;

            } else {

            }
        }

        localStorage['fcurrentRoom:Participants'] = JSON.stringify(stored);
    }
}


                if (Array.isArray(data) && data[0] === "friends:new:follower") {
                    followersManager.onNewFollower();
                }

                if (Array.isArray(data) && data[0] === "friends:unfollow") {
                   followersManager.onUnfollow();
                }

                if (Array.isArray(data) && data[0] === "friends:make:friend") {
                    followersManager.onNewFriend();
                }

                if (Array.isArray(data) && data[0] === "friends:unfriend") {
                    followersManager.onUnfriend();
                }

                if (Array.isArray(data) && typeof data[0] === 'string' && data[0].startsWith("room:") && data[0].endsWith(":participants")) {
                    const participantMap = data[1]?.participantMap || {};
                    if (Object.keys(participantMap).length > 0) {
                        Object.assign(roomParticipantMap, participantMap);
                        updateSocialParticipantList();
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        });

        return ws;
    };

    Object.defineProperty(window, 'WebSocket', {
        configurable: false,
        writable: false,
        value: WebSocketWrapper
    });

    window.WebSocket._intercepted = true;
}




async function followUser(toId) {
    const token = extractTokenFromLocalStorage() || getLocalToken();
    if (!token) {
        console.error('No valid token found for follow request');
        return { success: false, error: 'No valid token found' };
    }

    const generatedToken = generateToken();

    const requestBody = JSON.stringify({
        token: token,
        body: { toId: toId },
        _: generatedToken
    });

    const timestamp = Date.now();
    const url = `https://identity.free4talk.com/identity/post/follow/?a=identity-post-follow&v=538-1&t=${timestamp}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
                "content-type": "text/plain;charset=UTF-8",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            referrer: "https://www.free4talk.com/",
            body: requestBody,
            mode: "cors",
            credentials: "omit"
        });

        const data = await response.json();
        if (data.success) {
            const cached = localStorage['friends:relationships'];
            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    if (cachedData.data && !cachedData.data.includes(toId)) {
                        cachedData.data.push(toId);
                        localStorage['friends:relationships'] = JSON.stringify({
                            data: cachedData.data,
                            timestamp: Date.now()
                        });
                    }
                } catch (e) {
                    console.error('Error updating relationships cache:', e);
                }
            }
            return { success: true, data: data };
        } else {
            console.error('Failed to follow user:', data.error || 'Unknown error');
            return { success: false, error: data.error || 'Unknown error' };
        }
    } catch (error) {
        console.error('Error in followUser request:', error);
        return { success: false, error: error.message };
    }
}
async function unfollowUser(toId) {
    const token = extractTokenFromLocalStorage() || getLocalToken();
    if (!token) {
        console.error('No valid token found for unfollow request');
        return { success: false, error: 'No valid token found' };
    }

    const generatedToken = generateToken();

    const requestBody = JSON.stringify({
        token: token,
        body: { toId: toId },
        _: generatedToken
    });

    const timestamp = Date.now();
    const url = `https://free4talk-identity.herokuapp.com/identity/post/unfollow/?a=identity-post-unfollow&v=541-3&t=${timestamp}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
                "content-type": "text/plain;charset=UTF-8",
                "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site"
            },
            referrer: "https://www.free4talk.com/",
            body: requestBody,
            mode: "cors",
            credentials: "omit"
        });

        const data = await response.json();
        if (data.success) {
            return { success: true, data: data };
        } else {
            console.error('Failed to unfollow user:', data.error || 'Unknown error');
            return { success: false, error: data.error || 'Unknown error' };
        }
    } catch (error) {
        console.error('Error in unfollowUser request:', error);
        return { success: false, error: error.message };
    }
}

window.followUser = followUser;
window.unfollowUser = unfollowUser;

async function FollowersManager() {
    // Check if followUser and unfollowUser exist in global scope
    if (typeof window.followUser !== 'function') {
        console.error('❌ followUser function not found! Make sure it exists before calling FollowersManager()');
        alert('Error: followUser function not found in your script. Please check the console.');
        return;
    }
    if (typeof window.unfollowUser !== 'function') {
        console.error('❌ unfollowUser function not found! Make sure it exists before calling FollowersManager()');
        alert('Error: unfollowUser function not found in your script. Please check the console.');
        return;
    }

    // Use the global functions
    const followUser = window.followUser;
    const unfollowUser = window.unfollowUser;

    console.log('✅ Found followUser and unfollowUser functions');

    const batchFollowOperation = async (selectedUserIds, onProgress) => {
        console.log(`\n🚀 [BATCH FOLLOW] Starting batch follow operation`);
        console.log(`📊 [BATCH FOLLOW] Total users to follow: ${selectedUserIds.length}`);

        const batchSize = 80;
        let successCount = 0;
        const followedUsers = new Set();
        const triedUsers = new Set();
        const successfulFollows = [];
        let usersToProcess = selectedUserIds.map(id => ({ id }));

        // --- FOLLOW BATCH ---
        console.log(`\n📦 [FOLLOW PHASE] Starting with batch size: ${batchSize}`);

        while (successCount < batchSize && usersToProcess.length > 0) {
            let needed = batchSize - successCount;
            let currentBatch = usersToProcess
                .filter(u => !followedUsers.has(u.id) && !triedUsers.has(u.id))
                .slice(0, needed);

            if (currentBatch.length === 0) {
                console.log("⚠️ [FOLLOW PHASE] No more new users to try.");
                break;
            }

            console.log(`\n🔄 [FOLLOW PHASE] Processing batch of ${currentBatch.length} users`);
            currentBatch.forEach(u => {
                triedUsers.add(u.id);
                console.log(`  ➤ Added to tried: ${u.id}`);
            });

            const results = await Promise.all(
                currentBatch.map(async (user) => {
                    const userId = user.id;
                    try {
                        console.log(`  🔹 Calling followUser for: ${userId}`);
                        const res = await followUser(userId);
                        console.log(`  ✓ Response for ${userId}:`, res);
                        return { userId, res };
                    } catch (err) {
                        console.error(`  ✗ Exception for ${userId}:`, err);
                        return { userId, res: { success: false, error: 'exception', details: err } };
                    }
                })
            );

            const retryUsers = [];
            results.forEach(({ userId, res }) => {
                if (res.success) {
                    console.log(`✅ Followed ${userId}`);
                    successCount++;
                    followedUsers.add(userId);
                    successfulFollows.push(userId);
                } else if (res.error === 'server_error') {
                    console.log(`⚠️ Server error for ${userId}, will retry in next batch`);
                    retryUsers.push({ id: userId });
                } else if (res.error === 'unverified') {
                    console.log(`⛔ User ${userId} unverified, skipping`);
                    followedUsers.add(userId);
                } else {
                    console.log(`❌ Unknown error for ${userId}:`, res);
                    followedUsers.add(userId);
                }
            });

            usersToProcess = retryUsers.concat(
                usersToProcess.filter(u => !followedUsers.has(u.id) && !retryUsers.some(r => r.id === u.id))
            );

            if (onProgress) onProgress(successCount, selectedUserIds.length, `Following: ${successCount} successful`);
        }

        console.log(`\n🎯 [FOLLOW PHASE] Complete. Total followed: ${successCount}`);
        console.log(`📝 [FOLLOW PHASE] Successfully followed IDs:`, successfulFollows);

        return { followed: successfulFollows, followCount: successCount };
    };

    // State management
    let allUsers = [];
    let displayedUsers = [];
    let selectedUsers = new Set();
    let loadedCount = 0;
    const LOAD_INCREMENT = 20;

    // Create modal HTML
    const modalHTML = `
        <div id="followers-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; overflow: auto;">
            <div style="position: relative; margin: 50px auto; width: 90%; max-width: 800px; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <button id="close-modal" style="position: absolute; top: 15px; right: 15px; background: #ff4444; color: white; border: none; border-radius: 5px; padding: 8px 15px; cursor: pointer; font-weight: bold;">✕</button>

                <h2 style="margin: 0 0 20px 0; color: #333;">Followers Manager</h2>

                <div id="file-section" style="margin-bottom: 20px;">
                    <button id="load-users-btn" style="background: #4CAF50; color: white; border: none; border-radius: 5px; padding: 12px 24px; cursor: pointer; font-size: 16px; font-weight: bold;">📁 Load Users</button>
                    <input type="file" id="file-input" accept=".txt,.json" style="display: none;">
                    <span id="file-status" style="margin-left: 15px; color: #666;"></span>
                </div>

                <div id="users-section" style="display: none;">
                    <div style="margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <button id="select-all-btn" style="background: #2196F3; color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; font-weight: bold;">Select All</button>
                        <button id="unselect-all-btn" style="background: #9E9E9E; color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; font-weight: bold;">Unselect All</button>
                        <button id="follow-btn" style="background: #4CAF50; color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; font-weight: bold;">👥 Follow Selected</button>
                        <button id="unfollow-btn" style="background: #FF9800; color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; font-weight: bold;">👋 Unfollow Selected</button>
                    </div>

                    <div style="margin-bottom: 10px; color: #666;">
                        <strong>Selected: <span id="selected-count">0</span> / <span id="total-count">0</span></strong>
                    </div>

                    <div id="users-list" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; padding: 10px; background: #f9f9f9;">
                        <!-- Users will be loaded here -->
                    </div>

                    <div style="margin-top: 15px; text-align: center;">
                        <button id="load-more-btn" style="background: #607D8B; color: white; border: none; border-radius: 5px; padding: 10px 30px; cursor: pointer; font-weight: bold; display: none;">Load More (20)</button>
                    </div>
                </div>

                <div id="progress-section" style="display: none; margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
                    <div style="margin-bottom: 10px; color: #333; font-weight: bold;">Processing...</div>
                    <div style="background: #ddd; border-radius: 10px; height: 25px; overflow: hidden;">
                        <div id="progress-bar" style="background: linear-gradient(90deg, #4CAF50, #45a049); height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;"></div>
                    </div>
                    <div id="progress-text" style="margin-top: 10px; color: #666; font-size: 14px;"></div>
                </div>
            </div>
        </div>
    `;

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'followers-manager-toggle';
    toggleButton.innerHTML = '👥 Manager';
    toggleButton.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; background: #4CAF50; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-size: 16px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: all 0.3s;';
    toggleButton.onmouseover = () => toggleButton.style.transform = 'scale(1.05)';
    toggleButton.onmouseout = () => toggleButton.style.transform = 'scale(1)';

    // Add elements to page
    document.body.appendChild(toggleButton);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get elements
    const modal = document.getElementById('followers-modal');
    const closeBtn = document.getElementById('close-modal');
    const loadUsersBtn = document.getElementById('load-users-btn');
    const fileInput = document.getElementById('file-input');
    const fileStatus = document.getElementById('file-status');
    const usersSection = document.getElementById('users-section');
    const usersList = document.getElementById('users-list');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const unselectAllBtn = document.getElementById('unselect-all-btn');
    const followBtn = document.getElementById('follow-btn');
    const unfollowBtn = document.getElementById('unfollow-btn');
    const selectedCount = document.getElementById('selected-count');
    const totalCount = document.getElementById('total-count');
    const progressSection = document.getElementById('progress-section');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    // Helper functions
    const updateCounts = () => {
        selectedCount.textContent = selectedUsers.size;
        totalCount.textContent = allUsers.length;
    };

    const renderUsers = (users) => {
        const fragment = document.createDocumentFragment();

        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.style.cssText = 'display: flex; align-items: center; padding: 10px; margin-bottom: 8px; background: white; border-radius: 5px; border: 1px solid #e0e0e0; transition: all 0.2s;';
            userDiv.onmouseover = () => userDiv.style.background = '#f5f5f5';
            userDiv.onmouseout = () => userDiv.style.background = 'white';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedUsers.has(user.id);
            checkbox.style.cssText = 'margin-right: 12px; width: 18px; height: 18px; cursor: pointer;';
            checkbox.onchange = (e) => {
                if (e.target.checked) {
                    selectedUsers.add(user.id);
                } else {
                    selectedUsers.delete(user.id);
                }
                updateCounts();
            };

            const avatar = document.createElement('img');
            avatar.src = user.avatar;
            avatar.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; object-fit: cover;';
            avatar.onerror = () => avatar.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23ccc"/%3E%3C/svg%3E';

            const info = document.createElement('div');
            info.style.cssText = 'flex: 1;';
            info.innerHTML = `<strong style="color: #333;">${user.name}</strong><br><span style="color: #999; font-size: 12px;">${user.id}</span>`;

            userDiv.appendChild(checkbox);
            userDiv.appendChild(avatar);
            userDiv.appendChild(info);
            fragment.appendChild(userDiv);
        });

        usersList.appendChild(fragment);
    };

    const loadMoreUsers = () => {
        const nextBatch = allUsers.slice(loadedCount, loadedCount + LOAD_INCREMENT);
        displayedUsers.push(...nextBatch);
        renderUsers(nextBatch);
        loadedCount += nextBatch.length;

        if (loadedCount >= allUsers.length) {
            loadMoreBtn.style.display = 'none';
        }
    };

    const showProgress = (current, total, message) => {
        progressSection.style.display = 'block';
        const percentage = Math.round((current / total) * 100);
        progressBar.style.width = percentage + '%';
        progressBar.textContent = percentage + '%';
        progressText.textContent = message;
    };

    const hideProgress = () => {
        progressSection.style.display = 'none';
        progressBar.style.width = '0%';
    };

    // Event listeners
    toggleButton.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    loadUsersBtn.onclick = () => fileInput.click();

    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            allUsers = JSON.parse(text);

            usersList.innerHTML = '';
            displayedUsers = [];
            selectedUsers.clear();
            loadedCount = 0;

            fileStatus.textContent = `✅ Loaded ${allUsers.length} users`;
            fileStatus.style.color = '#4CAF50';
            usersSection.style.display = 'block';

            loadMoreUsers();
            if (loadedCount < allUsers.length) {
                loadMoreBtn.style.display = 'inline-block';
            }

            updateCounts();
        } catch (err) {
            fileStatus.textContent = '❌ Error loading file';
            fileStatus.style.color = '#ff4444';
            console.error('Error loading users:', err);
        }
    };

    loadMoreBtn.onclick = loadMoreUsers;

    selectAllBtn.onclick = () => {
        allUsers.forEach(user => selectedUsers.add(user.id));
        usersList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        updateCounts();
    };

    unselectAllBtn.onclick = () => {
        selectedUsers.clear();
        usersList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        updateCounts();
    };

    followBtn.onclick = async () => {
        if (selectedUsers.size === 0) {
            console.warn('⚠️ [FOLLOWERS MANAGER] No users selected to follow');
            return;
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎬 [FOLLOWERS MANAGER] Follow button clicked`);
        console.log(`📊 [FOLLOWERS MANAGER] Selected users count: ${selectedUsers.size}`);
        console.log(`📋 [FOLLOWERS MANAGER] Selected user IDs:`, Array.from(selectedUsers));
        console.log(`${'='.repeat(60)}\n`);

        const confirmFollow = confirm(`Follow ${selectedUsers.size} selected users?`);
        if (!confirmFollow) {
            console.log(`❌ [FOLLOWERS MANAGER] User cancelled operation`);
            return;
        }

        followBtn.disabled = true;
        unfollowBtn.disabled = true;
        const userIds = Array.from(selectedUsers);

        showProgress(0, userIds.length, 'Starting follow operation...');

        try {
            const result = await batchFollowOperation(userIds, showProgress);

            hideProgress();
            console.log(`\n✅ [FOLLOWERS MANAGER] Operation complete!`);
            console.log(`📊 [FOLLOWERS MANAGER] Results:`, result);
            console.log(`✅ Follow operation complete! Followed: ${result.followCount} users`);
        } catch (err) {
            console.error(`\n❌ [FOLLOWERS MANAGER] Critical error:`, err);
            hideProgress();
            console.error(`❌ Error during follow operation: ${err.message}`);
        } finally {
            followBtn.disabled = false;
            unfollowBtn.disabled = false;
        }
    };

    unfollowBtn.onclick = async () => {
        if (selectedUsers.size === 0) {
            console.warn('⚠️ [FOLLOWERS MANAGER] No users selected to unfollow');
            return;
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎬 [FOLLOWERS MANAGER] Unfollow button clicked`);
        console.log(`📊 [FOLLOWERS MANAGER] Selected users count: ${selectedUsers.size}`);
        console.log(`📋 [FOLLOWERS MANAGER] Selected user IDs:`, Array.from(selectedUsers));
        console.log(`${'='.repeat(60)}\n`);

        const confirmUnfollow = confirm(`Unfollow ${selectedUsers.size} selected users?`);
        if (!confirmUnfollow) {
            console.log(`❌ [FOLLOWERS MANAGER] User cancelled operation`);
            return;
        }

        unfollowBtn.disabled = true;
        followBtn.disabled = true;
        const userIds = Array.from(selectedUsers);

        console.log(`\n📦 [DIRECT UNFOLLOW] Starting direct unfollow for ${userIds.length} users`);
        showProgress(0, userIds.length, 'Starting unfollow operation...');

        let unfollowQueue = [...userIds];
        const maxRetries = 3;
        const retryCount = {};
        let successCount = 0;

        while (unfollowQueue.length > 0) {
            console.log(`\n🔄 [DIRECT UNFOLLOW] Processing ${unfollowQueue.length} users`);

            const results = await Promise.all(
                unfollowQueue.map(async (userId) => {
                    try {
                        console.log(`  🔹 Calling unfollowUser for: ${userId}`);
                        const res = await unfollowUser(userId);
                        console.log(`  ✓ Response for ${userId}:`, res);
                        return { userId, res };
                    } catch (err) {
                        console.error(`  ✗ Exception for ${userId}:`, err);
                        return { userId, res: { success: false, error: 'exception', details: err } };
                    }
                })
            );

            const nextQueue = [];
            results.forEach(({ userId, res }) => {
                if (res.success) {
                    console.log(`✅ Unfollowed ${userId}`);
                    successCount++;
                } else {
                    retryCount[userId] = (retryCount[userId] || 0) + 1;
                    if (retryCount[userId] <= maxRetries) {
                        console.log(`⚠️ Error unfollowing ${userId}, retry ${retryCount[userId]}`);
                        nextQueue.push(userId);
                    } else {
                        console.log(`❌ Max retries reached for ${userId}, skipping`);
                    }
                }
            });

            if (nextQueue.length > 0) {
                console.log(`⏳ [DIRECT UNFOLLOW] Waiting 2 seconds before retry...`);
                await new Promise(r => setTimeout(r, 2000));
            }

            unfollowQueue = nextQueue;
            showProgress(successCount, userIds.length, `Unfollowing: ${successCount}/${userIds.length}`);
        }

        hideProgress();
        console.log(`\n🎯 [DIRECT UNFOLLOW] Complete. Successfully unfollowed: ${successCount}/${userIds.length}`);
        console.log(`✅ Unfollow operation complete! Unfollowed: ${successCount}/${userIds.length} users`);

        unfollowBtn.disabled = false;
        followBtn.disabled = false;
    };

    console.log('✅ FollowersManager initialized');
}

//FollowersManager();



function searchByName(searchName) {
    if (!searchName || !searchName.trim()) {
        console.error('Search name is required');
        return;
    }

    const css = GatheredCSS();

    const modal = document.createElement('div');
    modal.style.cssText = css.modalOverlay;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = css.modalContent;

    const closeButton = document.createElement('button');
    closeButton.style.cssText = css.modalCloseButton;
    closeButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
    `;
    closeButton.onmouseenter = () => {
        closeButton.style.cssText = css.modalCloseButton + css.modalCloseButtonHover;
    };
    closeButton.onmouseleave = () => {
        closeButton.style.cssText = css.modalCloseButton;
    };

    modalContent.innerHTML = `
        <div style="${css.modalContentChildren}">
            <div style="${css.historyLoadingContainer}">
                <div style="${css.historyLoadingTitle}">Searching for "${searchName}"...</div>
                <div style="${css.historyLoadingText}">Please wait</div>
                <div style="${css.searchSpinnerContainer}">
                    <div style="${css.searchSpinner}"></div>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }`;
    document.head.appendChild(style);

    setTimeout(() => modalContent.firstElementChild.style.cssText = css.modalContentLoaded, 0);

    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    Backdrop();

    void modal.offsetHeight;
    modal.style.opacity = '1';

    const closeModal = () => {
        modal.style.opacity = '0';
        modalContent.style.transform = 'translateY(30px)';
        modalContent.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 500);
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
            closeBackdrop();
        }
    };

    closeButton.onclick = (e) => {
        e.stopPropagation();
        closeModal();
        closeBackdrop();
    };

    modalContent.onclick = (e) => {
        e.stopPropagation();
    };

    GM_xmlhttpRequest({
        method: "GET",
        url: `https://free4talk.info/data-api/search-users?name=${encodeURIComponent(searchName)}&fftId=${encodeURIComponent(searchName)}`,
        headers: {
            "accept": "application/json, text/plain, */*",
        },
        onload: function(response) {
            try {
                const results = JSON.parse(response.responseText);

                if (results && results.length > 0) {
                    let resultsHTML = `
                        <div style="${css.searchResultsContainer}">
                            <h2 style="${css.searchResultsTitle}">
                                Search Results for "${searchName}" <span style="${css.searchResultsCount}">(${results.length} found)</span>
                            </h2>
                            <div style="${css.searchResultsGrid}">
                                ${results.map(user => {
                                    const currentProfile = user.profileHistory[0];
                                    return `
                                        <div class="search-result-user" data-fftid="${user.fftId}" style="${css.searchUserCard}"
                                             onmouseenter="this.style.cssText='${css.searchUserCard}${css.searchUserCardHover}'"
                                             onmouseleave="this.style.cssText='${css.searchUserCard}'">
                                            <img src="${currentProfile.avatar}" style="${css.searchUserAvatar}">
                                            <div style="${css.searchUserName}">
                                                ${currentProfile.name}
                                            </div>
                                            <div style="${css.searchUserId}">
                                                ID: ${user.fftId}
                                            </div>
                                            <div id="follow-btn-${user.fftId}" class="follow-btn" style="${css.historyUserId}${css.historyFollowButton}"
                                                 data-fftid="${user.fftId}">
                                                Follow
                                            </div>
                                            <div style="${css.searchUserStats}">
                                                <div style="${css.searchUserStatItem}">
                                                    <div style="${css.searchUserStatValue};color:#4CAF50;">${currentProfile.followers}</div>
                                                    <div style="${css.searchUserStatLabel}">Followers</div>
                                                </div>
                                                <div style="${css.searchUserStatItem}">
                                                    <div style="${css.searchUserStatValue};color:#2196F3;">${currentProfile.following}</div>
                                                    <div style="${css.searchUserStatLabel}">Following</div>
                                                </div>
                                                <div style="${css.searchUserStatItem}">
                                                    <div style="${css.searchUserStatValue};color:#FF9800;">${currentProfile.friends}</div>
                                                    <div style="${css.searchUserStatLabel}">Friends</div>
                                                </div>
                                            </div>
                                            ${user.profileHistory.length > 1 ? `
                                                <div style="${css.searchUserNameChanges}">
                                                    📝 ${user.profileHistory.length} name changes
                                                </div>
                                            ` : ''}
                                            ${currentProfile.supporter === 1 ? `
                                                <div style="${css.searchUserSupporter}">
                                                    ⭐ Supporter
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;

                    modalContent.innerHTML = `<div style="${css.modalContentChildren}">${resultsHTML}</div>`;
                    setTimeout(() => modalContent.firstElementChild.style.cssText = css.modalContentLoaded, 0);
                    modalContent.appendChild(closeButton);

                    const resultUsers = modalContent.querySelectorAll('.search-result-user');
                    resultUsers.forEach(item => {
                        item.onclick = (e) => {
                            e.stopPropagation();
                            const clickedUserId = item.getAttribute('data-fftid');
                            closeModal();
                            setTimeout(() => {
                                openUserHistoryModal(clickedUserId);
                            }, 500);
                        };

                        const followBtn = item.querySelector('.follow-btn');
                        if (followBtn) {
                            followBtn.onclick = async (e) => {
                                e.stopPropagation();
                                const userId = followBtn.getAttribute('data-fftid');
                                followBtn.textContent = 'Following...';
                                followBtn.style.opacity = '0.6';
                                followBtn.style.pointerEvents = 'none';

                                const result = await followUser(userId);
                                if (result.success) {
                                    followBtn.textContent = 'Following';
                                    followBtn.style.cssText = css.historyUserId + css.historyFollowButton + css.historyFollowButtonFollowing + 'opacity:1;';
                                    const followerCountEl = item.querySelector(`[style*="${css.searchUserStatValue};color:#4CAF50"]`);
                                    if (followerCountEl) {
                                        const currentCount = parseInt(followerCountEl.textContent) || 0;
                                        followerCountEl.textContent = currentCount + 1;
                                    }
                                } else {
                                    followBtn.textContent = 'Follow';
                                    followBtn.style.cssText = css.historyUserId + css.historyFollowButton + 'opacity:1;pointer-events:auto;';
                                    console.error('Follow failed:', result.error);
                                    alert(`Failed to follow user: ${result.error}`);
                                }
                            };
                        }
                    });
                } else {
                    modalContent.innerHTML = `
                        <div style="${css.modalContentChildren}">
                            <div style="${css.searchNoResults}">
                                <div style="${css.searchNoResultsIcon}">🔍</div>
                                <div style="${css.searchNoResultsTitle}">No Results Found</div>
                                <div style="${css.searchNoResultsText}">No users found with name "${searchName}"</div>
                            </div>
                        </div>
                    `;
                    setTimeout(() => modalContent.firstElementChild.style.cssText = css.modalContentLoaded, 0);
                    modalContent.appendChild(closeButton);
                }
            } catch(e) {
                console.error('Parse error:', e);
                modalContent.innerHTML = `
                    <div style="${css.modalContentChildren}">
                        <div style="${css.searchError}">
                            <div style="${css.searchErrorIcon}">❌</div>
                            <div style="${css.searchErrorTitle}">Error</div>
                            <div style="${css.searchErrorText}">Failed to parse search results</div>
                        </div>
                    </div>
                `;
                setTimeout(() => modalContent.firstElementChild.style.cssText = css.modalContentLoaded, 0);
                modalContent.appendChild(closeButton);
            }
        },
        onerror: function(error) {
            console.error("Search ERROR:", error);
            modalContent.innerHTML = `
                <div style="${css.modalContentChildren}">
                    <div style="${css.searchError}">
                        <div style="${css.searchErrorIcon}">⚠️</div>
                        <div style="${css.searchErrorTitle}">Connection Error</div>
                        <div style="${css.searchErrorText}">Failed to search for users</div>
                    </div>
                </div>
            `;
            setTimeout(() => modalContent.firstElementChild.style.cssText = css.modalContentLoaded, 0);
            modalContent.appendChild(closeButton);
        }
    });
}


/////
function showUserInfoModal(user) {
    let existingModal = document.getElementById('f4t-user-info-modal');
    if (existingModal) existingModal.remove();
    const backdrop = document.createElement('div');
    backdrop.style.cssText = GatheredCSS().userInfoModalBackdrop;
    const modal = document.createElement('div');
    modal.id = 'f4t-user-info-modal';
    modal.style.cssText = GatheredCSS().userInfoModal;
    modal.innerHTML = `
        <img src="${user.avatar}" style="${GatheredCSS().userInfoModalAvatar}" alt="${user.name}">
        <h3 style="${GatheredCSS().userInfoModalName}">${user.name}</h3>
        <div style="${GatheredCSS().userInfoModalStats}">
            <div>
                <div style="${GatheredCSS().userInfoModalStatLabel}">Followers</div>
                <div style="${GatheredCSS().userInfoModalStatValue}">${user.followers}</div>
            </div>
            <div>
                <div style="${GatheredCSS().userInfoModalStatLabel}">Following</div>
                <div style="${GatheredCSS().userInfoModalStatValue}">${user.following}</div>
            </div>
            <div>
                <div style="${GatheredCSS().userInfoModalStatLabel}">Friends</div>
                <div style="${GatheredCSS().userInfoModalStatValue}">${user.friends}</div>
            </div>
        </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    });
}
//////

function updateSocialParticipantList() {
    const socialPanel = document.getElementById('f4t-social-panel');
    if (!socialPanel || socialPanel.style.display === 'none') return;

    const participantList = socialPanel.querySelector('#f4t-participant-list');
    if (!participantList) return;

    participantList.innerHTML = '';

    const uniqueParticipants = new Map();
    Object.values(roomParticipantMap).forEach(participant => {
        if (!uniqueParticipants.has(participant.name)) {
            uniqueParticipants.set(participant.name, {
                name: participant.name,
                avatar: participant.avatar,
                followers: participant.followers,
                following: participant.following,
                id: participant.id,
                friends: participant.friends
            });
        }

    });

    const participants = Array.from(uniqueParticipants.values());

    participants.forEach(part => {
        const participantElement = document.createElement('div');
        participantElement.style.cssText = GatheredCSS().participantElement;

participantElement.innerHTML = `
    <img src="${part.avatar}" style="${GatheredCSS().participantAvatar}" alt="${part.name}">
    <div style="${GatheredCSS().participantNameContainer}">
        <div style="${GatheredCSS().participantName}">${part.name}</div>
    </div>
    <button class="magnifier-btn" style="
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        padding: 0;
        margin-left: auto;
    ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
    </button>
`;

const magnifierBtn = participantElement.querySelector('.magnifier-btn');
magnifierBtn.onmouseenter = () => {
    magnifierBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    magnifierBtn.style.transform = 'scale(1.1)';
};
magnifierBtn.onmouseleave = () => {
    magnifierBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    magnifierBtn.style.transform = 'scale(1)';
};
magnifierBtn.onclick = (e) => {
    e.stopPropagation();
    Backdrop();
    openUserHistoryModal(part.id);
    const f4tSocialBtn = document.getElementById('f4t-social-btn');
f4tSocialBtn?.click();

};

        participantElement.onmouseenter = () => {
            participantElement.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
            participantElement.style.borderColor = 'rgba(255,255,255,0.3)';
            participantElement.style.transform = 'translateY(-2px)';
        };
        participantElement.onmouseleave = () => {
            participantElement.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))';
            participantElement.style.borderColor = 'rgba(255,255,255,0.1)';
            participantElement.style.transform = 'translateY(0)';
        };

        participantElement.onclick = () => {


            const modal = document.createElement('div');
            modal.style.cssText = GatheredCSS().participantModalBackdrop;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = GatheredCSS().participantModalContent;

            const closeButton = document.createElement('button');
            closeButton.style.cssText = GatheredCSS().participantModalCloseButton;
            closeButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
            `;
            closeButton.onmouseenter = () => {
                closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
            };
            closeButton.onmouseleave = () => {
                closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
            };

            modalContent.innerHTML = `
                <img id="modal-avatar-img" src="${part.avatar}" style="${GatheredCSS().participantModalAvatar}" alt="${part.name}">
                <h2 style="${GatheredCSS().participantModalTitle}">${part.name}</h2>
                <div style="${GatheredCSS().participantModalStatsGrid}">
                    <div style="${GatheredCSS().participantModalStatItem}" onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'">
                        <div style="${GatheredCSS().participantModalStatValue}">${part.followers}</div>
                        <div style="${GatheredCSS().participantModalStatLabel}">Followers</div>
                    </div>
                    <div style="${GatheredCSS().participantModalStatItem}" onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'">
                        <div style="${GatheredCSS().participantModalStatValue}">${part.following}</div>
                        <div style="${GatheredCSS().participantModalStatLabel}">Following</div>
                    </div>
                    <div style="${GatheredCSS().participantModalStatItem}" onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform='scale(1)'">
                        <div style="${GatheredCSS().participantModalStatValue}">${part.friends}</div>
                        <div style="${GatheredCSS().participantModalStatLabel}">Friends</div>
                    </div>
                </div>
            `;

            modalContent.appendChild(closeButton);
            modal.appendChild(modalContent);

            setTimeout(() => {
                const avatarImg = document.getElementById('modal-avatar-img');
                if (avatarImg) {

                    avatarImg.style.cursor = 'pointer';

                    avatarImg.addEventListener('mouseenter', () => {
                        avatarImg.style.transform = 'scale(1.05)';
                    });

                    avatarImg.addEventListener('mouseleave', () => {
                        avatarImg.style.transform = 'scale(1)';
                    });

                    avatarImg.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (typeof openImageViewer === 'function') {
                            openImageViewer(part.avatar);

                        } else {
                        }
                    });
                }
            }, 100);
            document.body.appendChild(modal);

            Backdrop();
            document.getElementById('f4t-social-btn')?.click();

            void modal.offsetHeight;

            modal.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.opacity = '1';

            const closeModal = () => {
                closeBackdrop();
                modal.style.opacity = '0';
                modalContent.style.transform = 'translateY(30px)';
                modalContent.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                }, 500);
            };

            modal.onclick = (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            };

            closeButton.onclick = (e) => {
                e.stopPropagation();
                closeModal();
            };

            modalContent.onclick = (e) => {
                e.stopPropagation();
            };
        };

        participantList.appendChild(participantElement);
    });

    if (participants.length === 0) {
        participantList.innerHTML = `<div style="${GatheredCSS().emptyParticipantList}">No participants yet</div>`;
    }
}

///////// DONE /////////
function createModerationButton() {
    const gearBtn = document.getElementById('f4t-gear-btn');
    if (!gearBtn) return;

    const historyBtn = document.createElement('button');
    historyBtn.id = 'f4t-Moderation-btn';
    historyBtn.innerHTML = '👑&#xfe0e;';
    historyBtn.title = 'Moderation panel';

    const css = GatheredCSS();
    historyBtn.style.cssText = css.moderationButton + `left:114px;`;

    // Use CSS transitions instead of inline handlers
    historyBtn.addEventListener('mouseenter', () => {
        historyBtn.style.transform = 'translateY(-2px)';
        historyBtn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    });
    historyBtn.addEventListener('mouseleave', () => {
        historyBtn.style.transform = 'translateY(0)';
        historyBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });

    let panel = document.getElementById('f4t-history-panel');
    let isPanelOpen = false;

    // Cache room ID to avoid repeated regex matching
    let cachedRoomId = null;
    function getRoomId() {
        if (!cachedRoomId) {
            const url = window.location.href;
            const match = url.match(/\/room\/([^?]+)/);
            cachedRoomId = match ? match[1] : null;
        }
        return cachedRoomId;
    }

    // Add styles once
    const style = document.createElement('style');
    style.id = 'moderation-styles';
    style.textContent = `
        .magnifier-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            padding: 0;
            margin-left: auto;
        }
        .magnifier-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.1);
        }
        .context-menu-btn {
            background: #1f2937;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 4px 8px;
            cursor: pointer;
            text-align: left;
            font-size: 13px;
            transition: background 0.2s;
        }
        .context-menu-btn:hover {
            background: #374151;
        }
        .modal-close-btn {
            background: rgba(255, 255, 255, 0.1);
        }
        .modal-close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .modal-stat-item {
            transition: transform 0.2s;
        }
        .modal-stat-item:hover {
            transform: scale(1.1);
        }
        @keyframes pulse-red {
            0%, 100% { box-shadow: 0 0 15px 3px rgba(255, 0, 0, 0.6); }
            50% { box-shadow: 0 0 25px 5px rgba(255, 0, 0, 0.9); }
        }
    `;
    if (!document.getElementById('moderation-styles')) {
        document.head.appendChild(style);
    }

    if (!panel) {
        const backdrop = document.createElement('div');
        backdrop.id = 'f4t-history-backdrop';
        backdrop.style.cssText = css.historyBackdrop;
        document.body.appendChild(backdrop);

        panel = document.createElement('div');
        panel.id = 'f4t-history-panel';
        panel.style.cssText = css.historyPanel;

        const header = document.createElement('div');
        header.style.cssText = css.historyPanelHeader;

        const title = document.createElement('h3');
        title.textContent = 'Moderation panel';
        title.style.cssText = css.historyPanelTitle;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = css.historyPanelCloseBtn;

        header.appendChild(title);
        header.appendChild(closeBtn);
        panel.appendChild(header);

        const content = document.createElement('div');
        content.id = 'f4t-history-list';
        content.style.cssText = css.historyPanelContent;
        panel.appendChild(content);

        document.body.appendChild(panel);

        const closePanel = () => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-20px)';
            backdrop.style.display = 'none';
            setTimeout(() => {
                panel.style.display = 'none';
                isPanelOpen = false;
            }, 300);
        };

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePanel();
        });

        backdrop.addEventListener('click', () => {
            closePanel();
            setTimeout(() => repositionOnlineFriendsDisplay(panel), 300);
        });
    }

    const openConfirmationModal = (action, participant, mouseX, mouseY, onYes) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: ${mouseY}px;
            left: ${mouseX}px;
            background: rgba(26,26,26,0.7);
            backdrop-filter: blur(8px) saturate(180%);
            border-radius: 12px;
            padding: 8px 12px;
            color: #fff;
            z-index: 20000;
            display: flex;
            gap: 6px;
            align-items: center;
            box-shadow: 0 6px 16px rgba(0,0,0,0.3);
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        document.body.appendChild(modal);

        const span = document.createElement('span');
        span.textContent = `${action} ${participant.name}?`;
        modal.appendChild(span);

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'Yes';
        yesBtn.style.cssText = `
            background: #1f2937;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 2px 6px;
            cursor: pointer;
        `;
        modal.appendChild(yesBtn);

        const noBtn = document.createElement('button');
        noBtn.textContent = 'No';
        noBtn.style.cssText = `
            background: #374151;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 2px 6px;
            cursor: pointer;
        `;
        modal.appendChild(noBtn);

        setTimeout(() => modal.style.opacity = '1', 0);

        yesBtn.onclick = (ev) => {
            ev.stopPropagation();
            onYes?.();
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 200);
        };

        noBtn.onclick = (ev) => {
            ev.stopPropagation();
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 200);
        };

        const removeModal = (e) => {
            if (!modal.contains(e.target)) {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 200);
                document.removeEventListener('click', removeModal);
            }
        };
        setTimeout(() => document.addEventListener('click', removeModal), 0);
    };

    // Optimized permanent mute with debounced observer
    function setupPermanentMute(participant) {
        const roomId = getRoomId();
        if (!roomId) return;

        if (!window.permanentlyMutedUsers) {
            window.permanentlyMutedUsers = new Set();
        }
        window.permanentlyMutedUsers.add(participant.name);

        const findAndStyleUser = () => {
            const allUserElements = document.querySelectorAll('.sc-dUjcNx');
            for (let i = 0; i < allUserElements.length; i++) {
                const elem = allUserElements[i];
                const nameDiv = elem.querySelector('.name div');
                if (nameDiv && nameDiv.textContent.trim() === participant.name) {
                    elem.style.boxShadow = '0 0 15px 3px rgba(255, 0, 0, 0.6)';
                    elem.style.border = '2px solid rgba(255, 0, 0, 0.8)';
                    elem.style.borderRadius = '8px';
                    elem.style.animation = 'pulse-red 2s infinite';
                    return elem;
                }
            }
            return null;
        };

        setTimeout(findAndStyleUser, 500);

        // Debounced mutation checking
        let checkTimeout = null;
        const checkAndRemute = () => {
            if (!window.permanentlyMutedUsers || !window.permanentlyMutedUsers.has(participant.name)) {
                return;
            }

            const allUserElements = document.querySelectorAll('.sc-dUjcNx');
            for (let i = 0; i < allUserElements.length; i++) {
                const elem = allUserElements[i];
                const nameDiv = elem.querySelector('.name div');
                if (nameDiv && nameDiv.textContent.trim() === participant.name) {
                    const meterDiv = elem.querySelector('div.meter');
                    if (meterDiv && window.ws) { // Is unmuted
                        const payload = `42["room:owner:command",{"roomId":"${roomId}","targetPid":"${participant.pid}","command":"muted"}]`;
                        try {
                            window.ws.send(payload);
                        } catch (e) {
                            console.error('[REMUTE] Error:', e);
                        }
                    }
                    break;
                }
            }
        };

        const debouncedCheck = () => {
            if (checkTimeout) clearTimeout(checkTimeout);
            checkTimeout = setTimeout(checkAndRemute, 100);
        };

        const participantsContainer = document.querySelector('.sc-emmjRN.doPAKM');
        if (!participantsContainer) return;

        const observer = new MutationObserver(debouncedCheck);
        observer.observe(participantsContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'] // Only watch class changes
        });

        if (!window.permanentMuteObservers) {
            window.permanentMuteObservers = new Map();
        }
        window.permanentMuteObservers.set(participant.name, observer);
    }

    function sendCommand(command, participant, params = {}) {
        if (!window.ws || typeof window.ws.send !== 'function') {
            console.error('WebSocket unavailable');
            return;
        }

        const roomId = getRoomId();
        if (!roomId || !participant.pid) {
            console.error('Missing required data');
            return;
        }

        const data = {
            roomId,
            targetPid: participant.pid,
            command
        };

        if (participant.id) data.targetUserId = participant.id;
        if (Object.keys(params).length > 0) data.params = params;

        const payload = `42["room:owner:command",${JSON.stringify(data)}]`;

        try {
            window.ws.send(payload);
        } catch (e) {
            console.error(`[${command}] Error:`, e);
        }
    }

    const createContextMenu = (participantElement, participant) => {
        participantElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            const existingMenu = document.getElementById('f4t-context-menu');
            if (existingMenu) existingMenu.remove();

            const isPermanentlyMuted = window.permanentlyMutedUsers?.has(participant.name);

            const menu = document.createElement('div');
            menu.id = 'f4t-context-menu';
            menu.style.cssText = `
                position: fixed;
                top: ${e.clientY}px;
                left: ${e.clientX}px;
                background: rgba(26,26,26,0.7);
                backdrop-filter: blur(8px) saturate(180%);
                border-radius: 12px;
                padding: 8px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                z-index: 15000;
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                opacity: 0;
                transition: opacity 0.2s ease;
            `;

            const actions = [
                "🎙️ Mute",
                isPermanentlyMuted ? "👂 Unmute Permanently" : "🔕 Permanently Mute",
                "👟 Kick",
                "🗑️ Clear chat",
                "👑 Give Co-owner",
                "👑 Give Ownership",
                "👂 Release All"
            ];

            actions.forEach(action => {
                const btn = document.createElement('button');
                btn.textContent = action;
                btn.className = 'context-menu-btn';

                btn.onclick = (ev) => {
                    ev.stopPropagation();
                    openConfirmationModal(action, participant, e.clientX + 10, e.clientY + 10, () => {

                        if (action === "🎙️ Mute") {
                            sendCommand("muted", participant);
                        }
                        else if (action === "🔕 Permanently Mute") {
                            sendCommand("muted", participant);
                            setTimeout(() => setupPermanentMute(participant), 500);
                        }
                        else if (action === "👂 Unmute Permanently") {
                            if (window.permanentlyMutedUsers) {
                                window.permanentlyMutedUsers.delete(participant.name);
                            }
                            if (window.permanentMuteObservers?.has(participant.name)) {
                                window.permanentMuteObservers.get(participant.name).disconnect();
                                window.permanentMuteObservers.delete(participant.name);
                            }
                            // Remove styling
                            const allUserElements = document.querySelectorAll('.sc-dUjcNx');
                            for (let i = 0; i < allUserElements.length; i++) {
                                const nameDiv = allUserElements[i].querySelector('.name div');
                                if (nameDiv && nameDiv.textContent.trim() === participant.name) {
                                    allUserElements[i].style.cssShadow = '';
                                    allUserElements[i].style.border = '';
                                    allUserElements[i].style.borderRadius = '';
                                    allUserElements[i].style.animation = '';
                                    break;
                                }
                            }
                        }
                        else if (action === "👂 Release All") {
                            if (window.permanentlyMutedUsers && window.permanentlyMutedUsers.size > 0) {
                                const mutedUsers = Array.from(window.permanentlyMutedUsers);

                                if (window.permanentMuteObservers) {
                                    window.permanentMuteObservers.forEach(obs => obs.disconnect());
                                    window.permanentMuteObservers.clear();
                                }

                                const allUserElements = document.querySelectorAll('.sc-dUjcNx');
                                for (let i = 0; i < allUserElements.length; i++) {
                                    const nameDiv = allUserElements[i].querySelector('.name div');
                                    if (nameDiv && mutedUsers.includes(nameDiv.textContent.trim())) {
                                        allUserElements[i].style.boxShadow = '';
                                        allUserElements[i].style.border = '';
                                        allUserElements[i].style.borderRadius = '';
                                        allUserElements[i].style.animation = '';
                                    }
                                }

                                window.permanentlyMutedUsers.clear();
                            }
                        }
                        else if (action === "👟 Kick") {
                            sendCommand("blocked", participant, {});
                        }
                        else if (action === "🗑️ Clear chat") {
                            sendCommand("remove-messages", participant);
                        }
                        else if (action === "👑 Give Co-owner") {
                            sendCommand("set-mod", participant);
                        }
                        else if (action === "👑 Give Ownership") {
                            sendCommand("transfer-group", participant, { removeWelcomeMsg: false });
                        }
                    });
                    menu.style.opacity = '0';
                    setTimeout(() => menu.remove(), 200);
                };

                menu.appendChild(btn);
            });

            document.body.appendChild(menu);
            setTimeout(() => menu.style.opacity = '1', 0);

            const removeMenu = () => {
                menu.style.opacity = '0';
                setTimeout(() => menu.remove(), 200);
                document.removeEventListener('click', removeMenu);
            };
            setTimeout(() => document.addEventListener('click', removeMenu), 0);
        });
    };

    historyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const backdrop = document.getElementById('f4t-history-backdrop');
        const content = document.getElementById('f4t-history-list');

        if (!isPanelOpen) {
            panel.style.display = 'block';
            backdrop.style.display = 'block';
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-20px)';

            content.innerHTML = '';

            const stored = JSON.parse(localStorage['fcurrentRoom:Participants'] || '[]');

            if (stored.length === 0) {
                content.innerHTML = `<div style="${css.emptyHistoryMessage}">Room is currently empty</div>`;
            } else {
                const fragment = document.createDocumentFragment();

                stored.forEach(part => {
                    const participantElement = document.createElement('div');
                    participantElement.style.cssText = css.participantElement;

                    const img = document.createElement('img');
                    img.src = part.avatar;
                    img.alt = part.name;
                    img.style.cssText = css.participantAvatar;

                    const nameContainer = document.createElement('div');
                    nameContainer.style.cssText = css.participantNameContainer;
                    const nameDiv = document.createElement('div');
                    nameDiv.style.cssText = css.participantName;
                    nameDiv.textContent = part.name;
                    nameContainer.appendChild(nameDiv);

                    const magnifierBtn = document.createElement('button');
                    magnifierBtn.className = 'magnifier-btn';
                    magnifierBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    `;

                    magnifierBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        Backdrop();
                        openUserHistoryModal(part.id);
                        document.getElementById('f4t-Moderation-btn')?.click();
                    };

                    participantElement.appendChild(img);
                    participantElement.appendChild(nameContainer);
                    participantElement.appendChild(magnifierBtn);

                    participantElement.addEventListener('mouseenter', () => {
                        participantElement.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
                        participantElement.style.borderColor = 'rgba(255,255,255,0.3)';
                        participantElement.style.transform = 'translateY(-2px)';
                    });
                    participantElement.addEventListener('mouseleave', () => {
                        participantElement.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))';
                        participantElement.style.borderColor = 'rgba(255,255,255,0.1)';
                        participantElement.style.transform = 'translateY(0)';
                    });

                    participantElement.onclick = () => openParticipantModal(part);

                    createContextMenu(participantElement, part);
                    fragment.appendChild(participantElement);
                });

                content.appendChild(fragment);
            }

            setTimeout(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
                repositionOnlineFriendsDisplay(panel);
            }, 100);

            isPanelOpen = true;
        } else {
            panel.style.display = 'none';
            backdrop.style.display = 'none';
            repositionOnlineFriendsDisplay(panel);
            isPanelOpen = false;
        }
    });

    function openParticipantModal(part) {
        const modal = document.createElement('div');
        modal.style.cssText = css.participantModalBackdrop;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = css.participantModalContent;

        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close-btn';
        closeButton.style.cssText = css.participantModalCloseButton;
        closeButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
        `;

        const avatarImg = document.createElement('img');
        avatarImg.src = part.avatar;
        avatarImg.alt = part.name;
        avatarImg.style.cssText = css.participantModalAvatar;
        avatarImg.style.cursor = 'pointer';

        avatarImg.addEventListener('mouseenter', () => {
            avatarImg.style.transform = 'scale(1.05)';
        });
        avatarImg.addEventListener('mouseleave', () => {
            avatarImg.style.transform = 'scale(1)';
        });
        avatarImg.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (typeof openImageViewer === 'function') {
                openImageViewer(part.avatar);
            }
        });

        const title = document.createElement('h2');
        title.style.cssText = css.participantModalTitle;
        title.textContent = part.name;

        const statsGrid = document.createElement('div');
        statsGrid.style.cssText = css.participantModalStatsGrid;

        const stats = [
            { value: part.followers, label: 'Followers' },
            { value: part.following, label: 'Following' },
            { value: part.friends, label: 'Friends' }
        ];

        stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'modal-stat-item';
            statItem.style.cssText = css.participantModalStatItem;

            const statValue = document.createElement('div');
            statValue.style.cssText = css.participantModalStatValue;
            statValue.textContent = stat.value;

            const statLabel = document.createElement('div');
            statLabel.style.cssText = css.participantModalStatLabel;
            statLabel.textContent = stat.label;

            statItem.appendChild(statValue);
            statItem.appendChild(statLabel);
            statsGrid.appendChild(statItem);
        });

        modalContent.appendChild(avatarImg);
        modalContent.appendChild(title);
        modalContent.appendChild(statsGrid);
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        Backdrop();
        document.getElementById('f4t-Moderation-btn')?.click();

        void modal.offsetHeight;
        modal.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
        modalContent.style.opacity = '1';

        const closeModal = () => {
            closeBackdrop();
            modal.style.opacity = '0';
            modalContent.style.transform = 'translateY(30px)';
            modalContent.style.opacity = '0';
            setTimeout(() => modal.remove(), 500);
        };

        modal.onclick = (ev) => {
            if (ev.target === modal) closeModal();
        };

        closeButton.onclick = (ev) => {
            ev.stopPropagation();
            closeModal();
        };

        modalContent.onclick = (ev) => {
            ev.stopPropagation();
        };
    }
// Add context menu to native participant elements
function attachContextMenuToNativeElements() {
    const participantsContainer = document.querySelector('.sc-emmjRN.doPAKM');
    if (!participantsContainer) return;

    const nativeParticipants = participantsContainer.querySelectorAll('.sc-dUjcNx');

    nativeParticipants.forEach(elem => {
        // Skip if already has context menu attached
        if (elem.dataset.contextMenuAttached) return;
        elem.dataset.contextMenuAttached = 'true';

        const nameDiv = elem.querySelector('.name div');
        const avatarImg = elem.querySelector('.avatar img');

        if (!nameDiv) return;

        const name = nameDiv.textContent.trim();
        const avatar = avatarImg ? avatarImg.src : null;

        // Find matching participant from localStorage
        const stored = JSON.parse(localStorage['fcurrentRoom:Participants'] || '[]');
        const participant = stored.find(p => {
            const nameMatch = p.name === name;
            const avatarMatch = !avatar || p.avatar === avatar;
            return nameMatch && avatarMatch;
        });

        if (participant) {
            createContextMenu(elem, participant);
        }
    });
}

// Initial attachment
setTimeout(() => attachContextMenuToNativeElements(), 1000);

// Observer to watch for new participants
const participantsContainer = document.querySelector('.sc-emmjRN.doPAKM');
if (participantsContainer) {
    const nativeObserver = new MutationObserver(() => {
        attachContextMenuToNativeElements();
    });

    nativeObserver.observe(participantsContainer, {
        childList: true,
        subtree: true
    });
}
    document.body.appendChild(historyBtn);
}
///////// DONE /////////


///////// DONE /////////
function createUserSearchButton() {
    const existingBtn = document.getElementById('f4t-usersearch-btn');
    if (existingBtn) return;

    const searchBtn = document.createElement('button');
    searchBtn.id = 'f4t-usersearch-btn';
    searchBtn.innerHTML = '🔍&#xfe0e;';
    searchBtn.title = 'User Search';

    const css = GatheredCSS();
    searchBtn.style.cssText = css.moderationButton;
    searchBtn.style.left = '148px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by name...';
    searchInput.disabled = true;
    searchInput.style.cssText = `
        position: fixed;
        top: 49px;
        left: 14px;
        width: 0;
        opacity: 0;
        padding: 0 24px 0 10px;
        transition: all 0.3s ease;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(0,0,0,0.0);
        color: white;
        font-size: 14px;
        z-index: 9999;
    `;
    document.body.appendChild(searchInput);

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.style.cssText = `
        position: fixed;
        top: 72px;
        left: 14px;
        width: 200px;
        max-height: 300px;
        overflow-y: auto;
        background: rgba(26,26,26,0.3);
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
        padding: 8px 0;
        backdrop-filter: blur(5px) saturate(150%);
    `;
    document.body.appendChild(suggestionsContainer);

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        position: fixed;
        top: 48px;
        left: 219px;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
    `;
    document.body.appendChild(spinner);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .suggestion-item {
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            color: white;
            font-size: 14px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            transition: background 0.2s ease;
        }
        .suggestion-item:hover {
            background: rgba(255,255,255,0.1);
        }
        .suggestion-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .suggestion-name {
            font-weight: 500;
        }
        .suggestion-stats {
            font-size: 12px;
            color: rgba(255,255,255,0.6);
        }
    `;
    document.head.appendChild(style);

    let expanded = false;
    let abortController = null;
    let searchTimeout = null;

    // Cache the online friends display element
    let onlineFriendsDisplay = null;

    function getOnlineFriendsDisplay() {
        if (!onlineFriendsDisplay) {
            onlineFriendsDisplay = document.getElementById('online-friends-display');
        }
        return onlineFriendsDisplay;
    }

    function setOnlineFriendsTransform(yValue) {
        const display = getOnlineFriendsDisplay();
        if (display) {
            display.style.transition = 'transform 0.3s ease';
            display.style.transform = `translateY(${yValue}px)`;
        }
    }

    function showSpinner() {
        spinner.style.opacity = '1';
        spinner.style.visibility = 'visible';
    }

    function hideSpinner() {
        spinner.style.opacity = '0';
        spinner.style.visibility = 'hidden';
    }

    function showSuggestions() {
        suggestionsContainer.style.opacity = '1';
        suggestionsContainer.style.visibility = 'visible';
    }

    function hideSuggestions() {
        suggestionsContainer.style.opacity = '0';
        suggestionsContainer.style.visibility = 'hidden';
    }

    function collapseSearch() {
        expanded = false;
        searchInput.style.width = '0';
        searchInput.style.opacity = '0';
        searchInput.value = '';
        searchInput.disabled = true;
        hideSuggestions();
        hideSpinner();
        setOnlineFriendsTransform(0);

        if (abortController) {
            abortController.abort();
            abortController = null;
        }
    }

    function createSuggestionElement(user) {
        const currentProfile = user.profileHistory[0];
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.dataset.fftid = user.fftId;

        item.innerHTML = `
            <img src="${currentProfile.avatar}" class="suggestion-avatar" alt="">
            <div style="flex:1;">
                <div class="suggestion-name">${currentProfile.name}</div>
                <div class="suggestion-stats">
                    ${currentProfile.followers} Followers • ${currentProfile.following} Following • ${currentProfile.friends} Friends
                </div>
            </div>
        `;

        return item;
    }

    function handleSuggestionClick(e) {
        const item = e.target.closest('.suggestion-item');
        if (!item) return;

        e.stopPropagation();
        const clickedUserId = item.dataset.fftid;

        hideSuggestions();
        searchInput.value = '';
        searchInput.style.width = '0';
        searchInput.style.opacity = '0';
        expanded = false;
        setOnlineFriendsTransform(0);

        setTimeout(() => {
            Backdrop();
            openUserHistoryModal(clickedUserId);
        }, 200);
    }

    // Use event delegation for suggestion clicks
    suggestionsContainer.addEventListener('click', handleSuggestionClick);

    searchBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        if (!expanded) {
            setOnlineFriendsTransform(20);
            expanded = true;
            searchInput.disabled = false;
            searchInput.style.width = '200px';
            searchInput.style.opacity = '1';
            searchInput.focus();
        } else {
            searchInput.disabled = true;
            hideSuggestions();
            hideSpinner();

            if (abortController) {
                abortController.abort();
                abortController = null;
            }
        }
    });

    searchInput.addEventListener('input', () => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
            searchTimeout = null;
        }

        const name = searchInput.value.trim();

        if (abortController) {
            abortController.abort();
            abortController = null;
        }

        if (name) {
            showSpinner();
            hideSuggestions();

            searchTimeout = setTimeout(() => {
                abortController = new AbortController();
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://free4talk.info/data-api/search-users?name=${encodeURIComponent(name)}&fftId=${encodeURIComponent(name)}`,
                    headers: {
                        "accept": "application/json, text/plain, */*",
                    },
                    signal: abortController.signal,
                    onload: function(response) {
                        hideSpinner();
                        abortController = null;

                        try {
                            const results = JSON.parse(response.responseText);

                            if (results && results.length > 0) {
                                // Clear and rebuild suggestions efficiently
                                const fragment = document.createDocumentFragment();

                                for (let i = 0; i < results.length; i++) {
                                    fragment.appendChild(createSuggestionElement(results[i]));
                                }

                                suggestionsContainer.innerHTML = '';
                                suggestionsContainer.appendChild(fragment);
                                showSuggestions();

                                setTimeout(() => {
                                    repositionOnlineFriendsDisplay(suggestionsContainer);
                                }, 100);
                            } else {
                                suggestionsContainer.innerHTML = `
                                    <div style="padding:8px 12px;color:white;font-size:14px;">
                                        No users found for "${name}"
                                    </div>
                                `;
                                showSuggestions();
                            }
                        } catch (e) {
                            if (e.name === 'AbortError') return;

                            suggestionsContainer.innerHTML = `
                                <div style="padding:8px 12px;color:white;font-size:14px;">
                                    Error loading results
                                </div>
                            `;
                            showSuggestions();
                        }
                    },
                    onerror: function(error) {
                        if (error.name === 'AbortError') return;

                        hideSpinner();
                        suggestionsContainer.innerHTML = `
                            <div style="padding:8px 12px;color:white;font-size:14px;">
                                Connection error
                            </div>
                        `;
                        showSuggestions();
                    }
                });
            }, 300);
        } else {
            hideSpinner();
            hideSuggestions();
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const name = searchInput.value.trim();
            if (name) {
                searchByName(name);
                collapseSearch();
            }
        }
    });

    // Global click handler with early exit optimization
    document.addEventListener('click', (e) => {
        if (!expanded) return; // Early exit if not expanded

        const target = e.target;
        if (searchBtn.contains(target) ||
            searchInput.contains(target) ||
            suggestionsContainer.contains(target)) {
            return;
        }

        collapseSearch();
    });

    document.body.appendChild(searchBtn);
}
///////// DONE /////////

///////// DONE /////////
function createRoomSettingsButton() {
    const RoomSettingsButton = document.createElement('button');
    RoomSettingsButton.id = 'f4t-roomSettings-btn';
    RoomSettingsButton.innerHTML = '🏠&#xfe0e;';
    RoomSettingsButton.title = 'Room settings';
    RoomSettingsButton.style.cssText = GatheredCSS().moderationButton + `left:81px;`;
    document.body.appendChild(RoomSettingsButton);

    let panel = document.getElementById('f4t-roomSettings-panel');
    let isPanelOpen = false;
    let currentView = 'main';
    let selectedPreset = null;

    // Cache DOM elements
    let cachedElements = null;

    // Cache presets in memory to avoid repeated localStorage parsing
    let presetsCache = null;
    let presetsCacheDirty = true;

    function loadPresets() {
        if (!presetsCacheDirty && presetsCache !== null) {
            return presetsCache;
        }
        try {
            const stored = localStorage['settings:presets'];
            presetsCache = stored ? JSON.parse(stored) : {};
            presetsCacheDirty = false;
            return presetsCache;
        } catch (e) {
            presetsCache = {};
            presetsCacheDirty = false;
            return {};
        }
    }

    function savePresets(presets) {
        try {
            localStorage['settings:presets'] = JSON.stringify(presets);
            presetsCache = presets;
            presetsCacheDirty = false;
        } catch (e) {
            console.error('Failed to save presets:', e);
        }
    }

    function cacheElements() {
        if (!cachedElements) {
            cachedElements = {
                welcomeMessageInput: document.getElementById('welcomeMessageInput'),
                checkboxes: {
                    noMic: document.getElementById('noMic'),
                    noCam: document.getElementById('noCam'),
                    noEM: document.getElementById('noEM'),
                    noST: document.getElementById('noST'),
                    noGI: document.getElementById('noGI'),
                    noUL: document.getElementById('noUL'),
                    noAI: document.getElementById('noAI'),
                    noSP: document.getElementById('noSP'),
                    noYT: document.getElementById('noYT'),
                    noSS: document.getElementById('noSS'),
                    noWB: document.getElementById('noWB'),
                    noDO: document.getElementById('noDO'),
                    noSM: document.getElementById('noSM'),
                    noGP: document.getElementById('noGP'),
                    noWP: document.getElementById('noWP')
                },
                allCheckboxes: null // Will be set on first use
            };
            // Cache all checkboxes for toggle operations
            cachedElements.allCheckboxes = Object.values(cachedElements.checkboxes);
        }
        return cachedElements;
    }

    function getSettingsFromUI() {
        const els = cacheElements();
        return {
            welcomeMsg: els.welcomeMessageInput.value.trim(),
            noMic: !els.checkboxes.noMic.checked,
            noCam: !els.checkboxes.noCam.checked,
            noEM: !els.checkboxes.noEM.checked,
            noST: !els.checkboxes.noST.checked,
            noGI: !els.checkboxes.noGI.checked,
            noUL: !els.checkboxes.noUL.checked,
            noAI: !els.checkboxes.noAI.checked,
            noSP: !els.checkboxes.noSP.checked,
            noYT: !els.checkboxes.noYT.checked,
            noSS: !els.checkboxes.noSS.checked,
            noWB: !els.checkboxes.noWB.checked,
            noDO: !els.checkboxes.noDO.checked,
            noSM: !els.checkboxes.noSM.checked,
            noGP: !els.checkboxes.noGP.checked,
            noWP: !els.checkboxes.noWP.checked
        };
    }

    function applySettingsToUI(settings) {
        const els = cacheElements();
        els.welcomeMessageInput.value = settings.welcomeMsg || '';
        els.checkboxes.noMic.checked = !settings.noMic;
        els.checkboxes.noCam.checked = !settings.noCam;
        els.checkboxes.noEM.checked = !settings.noEM;
        els.checkboxes.noST.checked = !settings.noST;
        els.checkboxes.noGI.checked = !settings.noGI;
        els.checkboxes.noUL.checked = !settings.noUL;
        els.checkboxes.noAI.checked = !settings.noAI;
        els.checkboxes.noSP.checked = !settings.noSP;
        els.checkboxes.noYT.checked = !settings.noYT;
        els.checkboxes.noSS.checked = !settings.noSS;
        els.checkboxes.noWB.checked = !settings.noWB;
        els.checkboxes.noDO.checked = !settings.noDO;
        els.checkboxes.noSM.checked = !settings.noSM;
        els.checkboxes.noGP.checked = !settings.noGP;
        els.checkboxes.noWP.checked = !settings.noWP;
    }

    function scheduleRepositionOnce() {
        if (scheduleRepositionOnce.timeout) {
            clearTimeout(scheduleRepositionOnce.timeout);
        }
        scheduleRepositionOnce.timeout = setTimeout(() => {
            repositionOnlineFriendsDisplay(panel);
            scheduleRepositionOnce.timeout = null;
        }, 300);
    }

    if (!panel) {
        const css = GatheredCSS();
        const backdrop = document.createElement('div');
        backdrop.id = 'f4t-roomSettings-backdrop';
        backdrop.style.cssText = css.historyBackdrop;
        document.body.appendChild(backdrop);

        panel = document.createElement('div');
        panel.id = 'f4t-roomSettings-panel';
        panel.style.cssText = css.historyPanel + css.roomSettingsPanelOverflow;

        const header = document.createElement('div');
        header.style.cssText = css.historyPanelHeader;

        const title = document.createElement('h3');
        title.id = 'panel-title';
        title.textContent = 'Room Settings';
        title.style.cssText = css.historyPanelTitle;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = css.historyPanelCloseBtn;

        header.appendChild(title);
        header.appendChild(closeBtn);
        panel.appendChild(header);

        const slidingContainer = document.createElement('div');
        slidingContainer.id = 'sliding-container';
        slidingContainer.style.cssText = css.roomSettingsSlidingContainer;

        // Pre-build toggle items array to avoid repeated string concatenation
        const toggleItems = [
            ['noMic', 'Microphone'],
            ['noCam', 'Camera'],
            ['noEM', 'Emojis'],
            ['noST', 'Stickers'],
            ['noGI', 'GIFs'],
            ['noUL', 'Upload Images'],
            ['noAI', 'AI Chat Bot'],
            ['noSP', 'Spotify'],
            ['noYT', 'YouTube'],
            ['noSS', 'Share Screen'],
            ['noWB', 'Whiteboard'],
            ['noDO', 'Document'],
            ['noSM', 'Streaming'],
            ['noGP', 'Games Party'],
            ['noWP', 'Watch Party']
        ];

        const mainContent = document.createElement('div');
        mainContent.id = 'f4t-roomSettings-content';
        mainContent.style.cssText = css.historyPanelContent + css.roomSettingsMainContent;

        // Build HTML more efficiently
        const toggleHTML = toggleItems.map(([id, label]) =>
            `<div class="toggle-block">
                <span>${label}</span>
                <div class="checkbox-wrapper-9">
                    <input class="tgl tgl-flat" id="${id}" type="checkbox" checked />
                    <label class="tgl-btn" for="${id}"></label>
                </div>
            </div>`
        ).join('');

        mainContent.innerHTML = `
            <style>${css.roomSettingsToggleStyles}</style>
            <input type="text" id="welcomeMessageInput" value="Hello [username]@, Speak up please" placeholder="Enter welcome message" style="${css.roomSettingsWelcomeInput}">
            <div class="toggle-row">${toggleHTML}</div>
            <div style="${css.roomSettingsButtonContainer}">
                <button id="toggleAllBtn" style="${css.roomSettingsToggleAllBtn}">Toggle All</button>
                <button id="untoggleAllBtn" style="${css.roomSettingsUntoggleAllBtn}">Untoggle All</button>
                <button id="presetsButton" style="${css.roomSettingsPresetsBtn}">Presets</button>
                <button id="submitWelcomeMessage" style="${css.roomSettingsSubmitBtn}">Set</button>
            </div>
        `;

        const presetsContent = document.createElement('div');
        presetsContent.id = 'f4t-presets-content';
        presetsContent.style.cssText = css.historyPanelContent + css.roomSettingsPresetsContent;

        const presetHTML = [1, 2, 3, 4].map(i =>
            `<div class="preset-item">
                <span>Preset ${i}</span>
                <button class="select-preset-btn" data-preset="${i}">Select</button>
            </div>`
        ).join('');

        presetsContent.innerHTML = `
            <div id="presets-list">${presetHTML}</div>
            <button id="backToMainButton" style="${css.roomSettingsBackBtn}">← Back</button>
        `;

        slidingContainer.appendChild(mainContent);
        slidingContainer.appendChild(presetsContent);
        panel.appendChild(slidingContainer);
        document.body.appendChild(panel);

        // Add focus/blur handlers properly
        const welcomeInput = document.getElementById('welcomeMessageInput');
        welcomeInput.addEventListener('focus', function() {
            this.style.cssText = css.roomSettingsWelcomeInput + css.roomSettingsWelcomeInputFocus;
        });
        welcomeInput.addEventListener('blur', function() {
            this.style.cssText = css.roomSettingsWelcomeInput + css.roomSettingsWelcomeInputBlur;
        });

        const closePanel = () => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-20px)';
            backdrop.style.display = 'none';
            setTimeout(() => {
                panel.style.display = 'none';
                isPanelOpen = false;
                slidingContainer.style.transform = 'translateX(0)';
                currentView = 'main';
                title.textContent = 'Room Settings';
            }, 300);
        };

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePanel();
            scheduleRepositionOnce();
        });

        backdrop.addEventListener('click', () => {
            closePanel();
            scheduleRepositionOnce();
        });

        // Toggle All button
        document.getElementById('toggleAllBtn').addEventListener('click', () => {
            const els = cacheElements();
            for (let i = 0; i < els.allCheckboxes.length; i++) {
                els.allCheckboxes[i].checked = true;
            }
        });

        // Untoggle All button
        document.getElementById('untoggleAllBtn').addEventListener('click', () => {
            const els = cacheElements();
            for (let i = 0; i < els.allCheckboxes.length; i++) {
                els.allCheckboxes[i].checked = false;
            }
        });

        // Presets button
        const presetsButton = document.getElementById('presetsButton');
        presetsButton.addEventListener('click', () => {
            slidingContainer.style.transform = 'translateX(-50%)';
            currentView = 'presets';
            title.textContent = 'Presets';
        });
        presetsButton.addEventListener('mouseenter', function() {
            this.style.cssText = css.roomSettingsPresetsBtn + css.roomSettingsPresetsBtnHover;
        });
        presetsButton.addEventListener('mouseleave', function() {
            this.style.cssText = css.roomSettingsPresetsBtn + css.roomSettingsPresetsBtnDefault;
        });

        // Back button
        document.getElementById('backToMainButton').addEventListener('click', () => {
            slidingContainer.style.transform = 'translateX(0)';
            currentView = 'main';
            title.textContent = 'Room Settings';
        });

        // Select preset buttons
        document.querySelectorAll('.select-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetNum = btn.getAttribute('data-preset');
                selectedPreset = presetNum;

                const presets = loadPresets();
                if (presets[presetNum]) {
                    applySettingsToUI(presets[presetNum]);
                }

                slidingContainer.style.transform = 'translateX(0)';
                currentView = 'main';
                title.textContent = `Preset ${presetNum}`;

                const submitBtn = document.getElementById('submitWelcomeMessage');
                submitBtn.textContent = 'Save';
                submitBtn.style.cssText = css.roomSettingsSubmitBtn + css.roomSettingsSubmitBtnSave;
            });
        });

        // Submit button
        const submitWelcomeMessage = document.getElementById('submitWelcomeMessage');
        submitWelcomeMessage.addEventListener('mouseenter', function() {
            if (selectedPreset) {
                this.style.cssText = css.roomSettingsSubmitBtn + css.roomSettingsSubmitBtnSave + css.roomSettingsSubmitBtnSaveHover;
            } else {
                this.style.cssText = css.roomSettingsSubmitBtn + css.roomSettingsSubmitBtnHover;
            }
        });
        submitWelcomeMessage.addEventListener('mouseleave', function() {
            if (selectedPreset) {
                this.style.cssText = css.roomSettingsSubmitBtn + css.roomSettingsSubmitBtnSave + css.roomSettingsSubmitBtnSaveDefault;
            } else {
                this.style.cssText = css.roomSettingsSubmitBtn + css.roomSettingsSubmitBtnDefault;
            }
        });

        submitWelcomeMessage.addEventListener('click', () => {
            const settings = getSettingsFromUI();

            if (selectedPreset) {
                const presets = loadPresets();
                presets[selectedPreset] = settings;
                savePresets(presets);

                submitWelcomeMessage.textContent = 'Set';
                submitWelcomeMessage.style.cssText = css.roomSettingsSubmitBtn;
                title.textContent = 'Room Settings';
                selectedPreset = null;
            } else {
                if (!window.ws || typeof window.ws.send !== 'function') {
                    return;
                }

                const fullSettings = {
                    ...settings,
                    welcomeMsg: settings.welcomeMsg.replace(/"/g, '\\"'),
                    alMicON: false,
                    alMicCO: false,
                    alMicGU: false,
                    alCamON: false,
                    alCamCO: false,
                    alCamGU: false,
                    roomKey: "",
                    shareKey: false,
                    autoApprove: false
                };

                const url = window.location.href;
                const match = url.match(/\/room\/([^?]+)/);
                const roomId = match ? match[1] : null;
                const payload = `420["room:settings:update",{"roomId":"${roomId}","settings":${JSON.stringify(fullSettings)}}]`;

                try {
                    window.ws.send(payload);
                } catch (e) {
                    console.error('Failed to send settings:', e);
                }
            }

            closePanel();
            scheduleRepositionOnce();
        });
    }

    RoomSettingsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const backdrop = document.getElementById('f4t-roomSettings-backdrop');
        if (!isPanelOpen) {
            panel.style.display = 'block';
            backdrop.style.display = 'block';
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            }, 100);
            isPanelOpen = true;
            scheduleRepositionOnce();
        } else {
            panel.style.display = 'none';
            backdrop.style.display = 'none';
            isPanelOpen = false;
        }
    });
}
///////// DONE /////////





///////////////////////////////////////////////////////////////////


const base64Tile = "https://i.postimg.cc/bYBXj486/download.jpg"
let stylishBgInterval = null;
let transparencyEnabled = false;
let stylishBgEnabled = false;
let welcomeMessageObserver = null;
let globalAvatarBorderMonitor = null;
let globalAudioGlowMonitor = null;

///////// DONE /////////
function addAvatarBorder(enable = true) {
  // If disabling, stop the existing monitor
  if (!enable) {
    if (globalAvatarBorderMonitor) {
      globalAvatarBorderMonitor.disconnect();
      globalAvatarBorderMonitor = null;

      // Remove all border overlays
      document.querySelectorAll('.avatar-border-overlay, .avatar-stroke-animation, .avatar-stroke-continuous').forEach(el => {
        el.remove();
      });
    }
    return null;
  }

  // If already running, don't create a new instance
  if (globalAvatarBorderMonitor) {
    return globalAvatarBorderMonitor;
  }

  const processedAvatars = new WeakSet();
  const AVATAR_SELECTOR = '.sc-krvtoX';
  const CIRCLE_SELECTOR = '.ant-avatar-circle';

  // Cache the style element check
  let styleInjected = false;

  // Add keyframe animation (only once)
  if (!document.getElementById('avatar-border-keyframes')) {
    const style = document.createElement('style');
    style.id = 'avatar-border-keyframes';
    style.textContent = `
      @keyframes drawCircle {
        0% { transform: rotate(0deg); opacity: 1; }
        100% { transform: rotate(360deg); opacity: 0; }
      }
      @keyframes continuousCircle {
        0% { transform: rotate(0deg); opacity: 0; }
        50% { transform: rotate(180deg); opacity: 1; }
        100% { transform: rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    styleInjected = true;
  }

  function addModernBorder(avatarElement) {
    // Find the actual circular avatar span
    const avatarCircle = avatarElement.querySelector(CIRCLE_SELECTOR);

    if (!avatarCircle || processedAvatars.has(avatarCircle)) {
      return false;
    }

    // Mark as processed early to prevent double-processing
    processedAvatars.add(avatarCircle);

    // Get the width-adjusting container
    const container = avatarElement.querySelector('.width-adjusting-to-height .content');
    if (!container) {
      return false;
    }

    // Batch style updates using cssText
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    avatarCircle.style.cssText += 'position: relative; z-index: 1;';

    // Create border overlay
    const borderOverlay = document.createElement('div');
    borderOverlay.className = 'avatar-border-overlay';
    borderOverlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      border: 4px solid rgba(255, 255, 255, 0.25); border-radius: 50%;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05);
      pointer-events: none; z-index: 2; opacity: 0;
      transition: opacity 0.4s ease; box-sizing: border-box;
    `;

    // Initial stroke animation
    const stroke = document.createElement('div');
    stroke.className = 'avatar-stroke-animation';
    stroke.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      border-radius: 50%; border: 4px solid transparent;
      border-top-color: rgba(255, 255, 255, 0.6);
      pointer-events: none; z-index: 3; opacity: 0;
      animation: drawCircle 0.6s ease-out forwards;
      box-sizing: border-box;
    `;

    // Continuous stroke
    const continuousStroke = document.createElement('div');
    continuousStroke.className = 'avatar-stroke-continuous';
    continuousStroke.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      border-radius: 50%; border: 4px solid transparent;
      border-top-color: rgba(255, 255, 255, 0.6);
      pointer-events: none; z-index: 3; opacity: 0;
      animation: continuousCircle 2s linear infinite;
      animation-delay: 1s; box-sizing: border-box;
    `;

    // Batch DOM insertions
    avatarCircle.appendChild(borderOverlay);
    avatarCircle.appendChild(stroke);
    avatarCircle.appendChild(continuousStroke);

    // Use RAF for smoother animation trigger
    requestAnimationFrame(() => {
      borderOverlay.style.opacity = '1';
    });

    // Clean up initial stroke after animation
    setTimeout(() => {
      if (stroke.parentNode) {
        stroke.remove();
      }
    }, 650);

    return true;
  }

  function scanAvatars() {
    const avatars = document.querySelectorAll(AVATAR_SELECTOR);
    let count = 0;

    avatars.forEach(avatar => {
      if (addModernBorder(avatar)) {
        count++;
      }
    });

    return count;
  }

  // Initial scan
  scanAvatars();

  // Debounced rescan
  let rescanTimeout;
  let rafId;

  function debouncedRescan() {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    clearTimeout(rescanTimeout);

    rescanTimeout = setTimeout(() => {
      rafId = requestAnimationFrame(() => {
        scanAvatars();
      });
    }, 150); // Slightly longer debounce for better performance
  }

  // Optimized mutation observer
  const observer = new MutationObserver((mutations) => {
    let shouldRescan = false;

    // Check only added nodes for our specific avatar class
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { // Element node
            // Direct class check (fastest)
            if (node.classList?.contains('sc-krvtoX')) {
              shouldRescan = true;
              break;
            }
            // Check children only if necessary
            if (node.querySelector?.(AVATAR_SELECTOR)) {
              shouldRescan = true;
              break;
            }
          }
        }
        if (shouldRescan) break;
      }
    }

    if (shouldRescan) {
      debouncedRescan();
    }
  });

  // Observe with optimized config
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    // Ignore attributes and character data changes (React internal updates)
    attributes: false,
    characterData: false
  });

  const monitor = {
    disconnect: () => {
      observer.disconnect();
      clearTimeout(rescanTimeout);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // Clean up all overlays
      document.querySelectorAll('.avatar-border-overlay, .avatar-stroke-animation, .avatar-stroke-continuous').forEach(el => {
        el.remove();
      });
    },
    rescan: () => {
      return scanAvatars();
    }
  };

  globalAvatarBorderMonitor = monitor;
  return monitor;
}

function toggleClock(show = true) {
  // Create once
  if (!window._cornerClockEl) {
    const style = document.createElement("style");
    style.textContent = `
      .corner-clock-container {
        position: fixed;
        top: 10px;
        right: 331px;
        font-family: 'Share Tech Mono', monospace;
        pointer-events: none;
        opacity: 0;
        transition: opacity .4s ease;
      }
      .corner-clock .date {
        text-align: right;
        font-size: 14px;
        margin-bottom: -4px;
        color: #fff;
        text-shadow: 0 0 6px #aeb6bf, 0 0 10px #34495e;
      }
      .corner-clock .hr, .corner-clock .min, .corner-clock .sec, .corner-clock .colon {
        color: #fff;
        text-shadow: 0 0 8px #aeb6bf, 0 0 12px #34495e;
        font-size: 24px;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);

    window._cornerClockEl = document.createElement("div");
    window._cornerClockEl.className = "corner-clock-container";
    window._cornerClockEl.style.cssText = "opacity: 0; display: none;";

    window._cornerClockEl.innerHTML = `
      <div class='corner-clock'>
        <div class='date'></div>
        <div class='hr'></div>
        <div class='colon'>:</div>
        <div class='min'></div>
        <div class='colon'>:</div>
        <div class='sec'></div>
      </div>
    `;
    document.body.appendChild(window._cornerClockEl);

    // Cache DOM references (query once, reuse forever)
    const clockRefs = {
      date: window._cornerClockEl.querySelector('.date'),
      hr: window._cornerClockEl.querySelector('.hr'),
      min: window._cornerClockEl.querySelector('.min'),
      sec: window._cornerClockEl.querySelector('.sec')
    };

    // Pre-computed weekday array
    const WEEKDAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

    // Cached previous values to avoid unnecessary DOM updates
    let prevDate = '';
    let prevHr = '';
    let prevMin = '';
    let prevSec = '';

    function updateClock() {
      const d = new Date();

      // Format date (only update if changed)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const wd = WEEKDAYS[d.getDay()];
      const dateStr = `${year}-${month}-${day} ${wd}`;

      if (dateStr !== prevDate) {
        clockRefs.date.textContent = dateStr;
        prevDate = dateStr;
      }

      // Format time (always update these since seconds change)
      const hr = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      const sec = String(d.getSeconds()).padStart(2, "0");

      if (hr !== prevHr) {
        clockRefs.hr.textContent = hr;
        prevHr = hr;
      }
      if (min !== prevMin) {
        clockRefs.min.textContent = min;
        prevMin = min;
      }
      if (sec !== prevSec) {
        clockRefs.sec.textContent = sec;
        prevSec = sec;
      }
    }

    // Store interval ID for cleanup
    window._cornerClockInterval = null;

    // Store update function reference
    window._cornerClockUpdate = updateClock;

    // Initial update
    updateClock();
  }

  // Fade in and start interval
  if (show) {
    window._cornerClockEl.style.display = "block";

    // Single RAF for smooth fade-in
    requestAnimationFrame(() => {
      window._cornerClockEl.style.opacity = "1";
    });

    // Start interval only when visible
    if (!window._cornerClockInterval) {
      window._cornerClockUpdate(); // Immediate update
      window._cornerClockInterval = setInterval(window._cornerClockUpdate, 1000);
    }

  } else {
    // Stop interval when hidden (saves CPU!)
    if (window._cornerClockInterval) {
      clearInterval(window._cornerClockInterval);
      window._cornerClockInterval = null;
    }

    // Fade out
    window._cornerClockEl.style.opacity = "0";
    setTimeout(() => {
      window._cornerClockEl.style.display = "none";
    }, 400); // Match transition duration
  }
}

function Transparency(enable) {
    // Cache static selectors
    const SELECTORS = {
        buttonContainer: '.iVfUra > div',
        drawerContent: '.ant-drawer-content',
        textareaContainer: '.sc-bRBYWo.icHwXn',
        textareaInputBox: '.ant-mentions.input-box',
        sendButton: 'button.send-box.ant-btn-primary',
        callButtonsContainer: '.ant-row-flex.gutter4.my-bg',
        friendListCard: '.ant-card.ant-card-bordered',
        friendListBody: '.ant-card-body',
        tabsContainer: '.ant-tabs.ant-tabs-top.menu-tabs',
        searchContainer: '.ant-row-flex.search.glow.nowrap',
        userListContainer: '.user-list',
        messageListContainer: '.list',
        welcomeContainer: '.sc-hwwEjo.essUit',
        textOverflow: '.html.text-overflow',
        tabsExtra: '.ant-tabs-extra-content',
        namePrimary: '.name.primary',
        avatars: '.ant-avatar',
        typography: '.ant-typography, .ant-typography-secondary'
    };

    // Track processed avatars
    const processedAvatars = new WeakSet();

    // Inject CSS once (class-based styling is MUCH faster than inline)
    if (!document.getElementById('transparency-styles')) {
        const style = document.createElement('style');
        style.id = 'transparency-styles';
        style.textContent = `
            /* Transparency styles */
            .glass-effect {
                background: rgba(255,255,255,0.5) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
            }
            .glass-button {
                background: rgba(24, 144, 255, 0.5) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
            }
            .glass-welcome-title {
                background: rgba(255, 255, 255, 0.40) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                color: #fff !important;
                text-shadow: 0px 1px 3px rgba(0,0,0,0.6), 0px 1px 5px rgba(0,0,0,0.6) !important;
                font-weight: 600 !important;
            }
            .glass-welcome-msg {
                color: white !important;
                text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6) !important;
                font-weight: 500 !important;
            }
            .glass-text-overflow {
                color: #1a1a1a !important;
                text-shadow: 0 1px 2px rgba(255,255,255,0.8) !important;
                font-weight: 500 !important;
            }
            .glass-tabs-extra {
                color: #1421b3 !important;
            }
            .glass-name-primary {
                color: #a90009 !important;
            }
            .glass-typography {
                color: #fff !important;
                text-shadow: 0 0 1px rgba(0,0,0,0), 0 0 1px rgba(0,0,0,3) !important;
            }
            .glass-tabs-color {
                color: black !important;
            }
            .glass-avatar {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    // Optimized apply functions using classes
    function applyWelcomeMessageStyles() {
        const container = document.querySelector(SELECTORS.welcomeContainer);
        if (container) {
            const title = container.querySelector('.msg-title');
            const msgBox = container.querySelector('.msg-box');

            container.style.background = 'transparent';
            if (title) title.className += ' glass-welcome-title';
            if (msgBox) msgBox.className += ' glass-welcome-msg';
        }
    }

    function applyTextOverflowStyles() {
        const elements = document.querySelectorAll(SELECTORS.textOverflow);
        elements.forEach(el => {
            if (!el.classList.contains('glass-text-overflow')) {
                el.classList.add('glass-text-overflow');
            }
        });
    }

    function applyTabsExtraContentStyles() {
        const elements = document.querySelectorAll(SELECTORS.tabsExtra);
        elements.forEach(el => {
            if (!el.classList.contains('glass-tabs-extra')) {
                el.classList.add('glass-tabs-extra');
            }
        });
    }

    function applyNamePrimaryStyles() {
        const elements = document.querySelectorAll(SELECTORS.namePrimary);
        elements.forEach(el => {
            if (!el.classList.contains('glass-name-primary')) {
                el.classList.add('glass-name-primary');
            }
        });
    }

    function applyAvatarGlassEffect() {
        const avatars = document.querySelectorAll(SELECTORS.avatars);
        avatars.forEach(avatar => {
            // Skip if already processed
            if (processedAvatars.has(avatar)) return;

            processedAvatars.add(avatar);
            avatar.classList.add('glass-avatar');
        });
    }

    function applyTypographyStyles() {
        const elements = document.querySelectorAll(SELECTORS.typography);
        elements.forEach(el => {
            if (!el.classList.contains('glass-typography')) {
                el.classList.add('glass-typography');
            }
        });
    }

    function applyTabsColorStyles() {
        // More targeted approach - avoid universal selector
        const tabsContainers = document.querySelectorAll('.ant-tabs');
        tabsContainers.forEach(container => {
            if (!container.classList.contains('glass-tabs-color')) {
                container.classList.add('glass-tabs-color');
                // Apply to direct children only
                const children = container.querySelectorAll(':scope > *');
                children.forEach(child => {
                    if (!child.classList.contains('glass-tabs-color')) {
                        child.classList.add('glass-tabs-color');
                    }
                });
            }
        });
    }

    // Batch all apply operations
    function applyAllStyles() {
        applyWelcomeMessageStyles();
        applyTextOverflowStyles();
        applyTabsExtraContentStyles();
        applyNamePrimaryStyles();
        applyAvatarGlassEffect();
        applyTypographyStyles();
        applyTabsColorStyles();
    }

    // Remove functions using classes
    function removeWelcomeMessageStyles() {
        const container = document.querySelector(SELECTORS.welcomeContainer);
        if (container) {
            const title = container.querySelector('.msg-title');
            const msgBox = container.querySelector('.msg-box');

            container.style.background = '';
            if (title) title.classList.remove('glass-welcome-title');
            if (msgBox) msgBox.classList.remove('glass-welcome-msg');
        }
    }

    function removeAllStyleClasses() {
        const classesToRemove = [
            'glass-text-overflow',
            'glass-tabs-extra',
            'glass-name-primary',
            'glass-typography',
            'glass-tabs-color',
            'glass-avatar'
        ];

        classesToRemove.forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(el => {
                el.classList.remove(className);
            });
        });

        processedAvatars.clear?.();
    }

    if (enable) {
        // Cache main container elements
        const containers = [
            document.querySelector(SELECTORS.buttonContainer),
            document.querySelector(SELECTORS.drawerContent),
            document.querySelector(SELECTORS.textareaContainer),
            document.querySelector(SELECTORS.textareaInputBox),
            document.querySelector(SELECTORS.callButtonsContainer),
            document.querySelector(SELECTORS.friendListCard),
            document.querySelector(SELECTORS.friendListBody),
            document.querySelector(SELECTORS.tabsContainer),
            document.querySelector(SELECTORS.searchContainer),
            document.querySelector(SELECTORS.userListContainer),
            document.querySelector(SELECTORS.messageListContainer)
        ];

        // Apply glass effect to containers
        containers.forEach(el => {
            if (el && !el.classList.contains('glass-effect')) {
                el.classList.add('glass-effect');
            }
        });

        const sendButton = document.querySelector(SELECTORS.sendButton);
        if (sendButton && !sendButton.classList.contains('glass-button')) {
            sendButton.classList.add('glass-button');
        }

        // Initial apply
        applyAllStyles();

        // Create HEAVILY debounced observer
        if (!window.transparencyObserver) {
            let debounceTimeout;
            let rafId;

            window.transparencyObserver = new MutationObserver(() => {
                if (!window.transparencyEnabled) return;

                // Clear previous timeout and RAF
                clearTimeout(debounceTimeout);
                if (rafId) cancelAnimationFrame(rafId);

                // Debounce for 300ms (aggressive debouncing for this use case)
                debounceTimeout = setTimeout(() => {
                    rafId = requestAnimationFrame(() => {
                        applyAllStyles();
                    });
                }, 300);
            });

            // Watch only specific containers, not entire body
            const observeTargets = [
                document.querySelector(SELECTORS.userListContainer),
                document.querySelector(SELECTORS.messageListContainer),
                document.querySelector(SELECTORS.friendListBody)
            ].filter(Boolean);

            // If targets exist, observe them. Otherwise fall back to body with longer debounce
            if (observeTargets.length > 0) {
                observeTargets.forEach(target => {
                    window.transparencyObserver.observe(target, {
                        childList: true,
                        subtree: true,
                        attributes: false,
                        characterData: false
                    });
                });
            } else {
                // Fallback: observe body but ignore most changes
                window.transparencyObserver.observe(document.body, {
                    childList: true,
                    subtree: false, // Only immediate children
                    attributes: false,
                    characterData: false
                });
            }
        }

        window.transparencyEnabled = true;

    } else {
        // Disable
        if (window.transparencyObserver) {
            window.transparencyObserver.disconnect();
            window.transparencyObserver = null;
        }

        window.transparencyEnabled = false;

        // Remove glass effect from containers
        document.querySelectorAll('.glass-effect').forEach(el => {
            el.classList.remove('glass-effect');
        });

        const sendButton = document.querySelector(SELECTORS.sendButton);
        if (sendButton) {
            sendButton.classList.remove('glass-button');
        }

        // Remove all styles
        removeWelcomeMessageStyles();
        removeAllStyleClasses();
    }
}

function fadingout() {
    // Prevent multiple simultaneous effects
    if (window._fadingOutActive) {
        return;
    }
    window._fadingOutActive = true;

    // Inject styles only once (global scope check)
    if (!document.getElementById("waveStyle")) {
        const css = document.createElement("style");
        css.id = "waveStyle";
        css.textContent = `
            @keyframes fadeGradient {
                0%, 100% { background-position: 0% 0%; }
                50% { background-position: 100% 100%; }
            }
            @keyframes wave {
                2% { transform: translateX(1); }
                25% { transform: translateX(-25%); }
                50% { transform: translateX(-50%); }
                75% { transform: translateX(-25%); }
                100% { transform: translateX(1); }
            }
            @keyframes shimmerSlide {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            .wave {
                background: rgb(255 255 255 / 40%);
                border-radius: 1000% 1000% 0 0;
                position: fixed;
                width: 200%;
                height: 12em;
                animation: wave 10s -3s linear infinite;
                transform: translate3d(0, 0, 0);
                bottom: 0;
                left: 0;
                z-index: 1000000000;
                will-change: transform;
            }
            .wave:nth-of-type(2) {
                bottom: -1.25em;
                animation: wave 18s linear reverse infinite;
            }
            .wave:nth-of-type(3) {
                bottom: -2.5em;
                animation: wave 20s -1s reverse infinite;
            }
            .shimmer {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: shimmerSlide 2s ease-in-out;
                will-change: left;
            }
        `;
        document.head.appendChild(css);
    }

    // Pre-defined color schemes (cached)
    const colorSchemes = [
        ['#ff006e', '#ff758f', '#ffb3c6', '#ffffff'],
        ['#d90429', '#ef233c', '#ff6b9d', '#ffc2d1'],
        ['#c9184a', '#ff4d6d', '#ff8fa3', '#ffccd5'],
        ['#ff0054', '#ff5c8a', '#ffa3c7', '#ffe5ec'],
        ['#e63946', '#f77f00', '#ff9e00', '#ffb703'],
    ];
    const [c1, c2, c3, c4] = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];

    // Create main gradient container
    const d = document.createElement("div");
    d.className = "fade-gradient-container";

    // Batch style application using cssText (single reflow)
    d.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999999999;
        background: linear-gradient(315deg, ${c1} 3%, ${c2} 38%, ${c3} 68%, ${c4} 98%);
        background-size: 400% 400%;
        background-attachment: fixed;
        animation: fadeGradient 10s ease infinite;
        clip-path: circle(0% at 50% 50%);
        will-change: clip-path;
    `;

    // Create waves using DocumentFragment for batch insertion
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement("div");
        wave.className = "wave";
        fragment.appendChild(wave);
    }

    // Add shimmer
    const shimmer = document.createElement("div");
    shimmer.className = "shimmer";
    fragment.appendChild(shimmer);

    d.appendChild(fragment);

    // Create backdrop blur
    const backdrop = document.createElement("div");
    backdrop.className = "fade-backdrop-blur";
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999999998;
        backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        will-change: backdrop-filter;
    `;

    // Batch DOM insertion
    document.body.appendChild(backdrop);
    document.body.appendChild(d);

    // Store timeout IDs for potential cleanup
    const timeouts = [];

    // Smooth expand animation with backdrop blur
    requestAnimationFrame(() => {
        d.style.transition = "clip-path 2s cubic-bezier(0.4, 0, 0.2, 1)";
        d.style.clipPath = "circle(150% at 50% 50%)";

        backdrop.style.transition = "backdrop-filter 2s cubic-bezier(0.4, 0, 0.2, 1), -webkit-backdrop-filter 2s cubic-bezier(0.4, 0, 0.2, 1)";
        backdrop.style.backdropFilter = "blur(20px)";
        backdrop.style.WebkitBackdropFilter = "blur(20px)";
    });

    // Contract animation
    timeouts.push(setTimeout(() => {
        d.style.transition = "clip-path 2s cubic-bezier(0.4, 0, 0.2, 1)";
        d.style.clipPath = "circle(0% at 50% 50%)";

        backdrop.style.transition = "backdrop-filter 2s cubic-bezier(0.4, 0, 0.2, 1), -webkit-backdrop-filter 2s cubic-bezier(0.4, 0, 0.2, 1)";
        backdrop.style.backdropFilter = "blur(0px)";
        backdrop.style.WebkitBackdropFilter = "blur(0px)";
    }, 1000));

    // Cleanup
    timeouts.push(setTimeout(() => {
        d.remove();
        backdrop.remove();
        window._fadingOutActive = false;
    }, 5000));

    // Store timeouts for potential cancellation
    window._fadingOutTimeouts = timeouts;
}



function addAutoAudioGlow(enable = true) {
  // If disabling, stop the existing monitor
  if (!enable) {
    if (globalAudioGlowMonitor) {
      globalAudioGlowMonitor.disconnect();
      globalAudioGlowMonitor = null;
    }
    return null;
  }

  // If already running, don't create a new instance
  if (globalAudioGlowMonitor) {
    return globalAudioGlowMonitor;
  }

  // Single animation frame for ALL avatars (huge performance gain)
  let globalAnimationFrame = null;
  const activeAvatars = new Map();
  const activeObservers = new Map();
  const hiddenMeters = new Set();

  // Pre-defined color schemes with pre-calculated opacity variants
  const colorSchemes = [
    {
      colors: ['rgba(255, 0, 128, OPACITY)', 'rgba(128, 0, 255, OPACITY)', 'rgba(0, 128, 255, OPACITY)'],
      name: 'rainbow'
    },
    {
      colors: ['rgba(255, 94, 77, OPACITY)', 'rgba(255, 165, 0, OPACITY)', 'rgba(255, 215, 0, OPACITY)'],
      name: 'sunset'
    },
    {
      colors: ['rgba(0, 255, 136, OPACITY)', 'rgba(0, 229, 255, OPACITY)', 'rgba(128, 0, 255, OPACITY)'],
      name: 'neon'
    },
    {
      colors: ['rgba(186, 85, 211, OPACITY)', 'rgba(255, 20, 147, OPACITY)', 'rgba(255, 105, 180, OPACITY)'],
      name: 'purple'
    },
    {
      colors: ['rgba(0, 191, 255, OPACITY)', 'rgba(30, 144, 255, OPACITY)', 'rgba(138, 43, 226, OPACITY)'],
      name: 'electric'
    }
  ];

  // Cache color calculations
  const colorCache = new Map();
  function getCachedColors(scheme, opacity) {
    const key = `${scheme.name}-${opacity.toFixed(2)}`;
    if (!colorCache.has(key)) {
      colorCache.set(key, scheme.colors.map(c => c.replace('OPACITY', opacity.toString())));
    }
    return colorCache.get(key);
  }

  function getStableId(container) {
    const nameElement = container.querySelector('.name div');
    const avatarImg = container.querySelector('.avatar img');
    const avatarText = container.querySelector('.avatar text');

    let id = nameElement?.textContent || '';
    if (avatarImg) {
      id += '-' + avatarImg.src.slice(-20);
    } else if (avatarText) {
      id += '-' + avatarText.textContent;
    }

    return id || 'avatar-' + Math.random();
  }

  function getColorForUser(userId) {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorSchemes[hash % colorSchemes.length];
  }

  function setupGlowForAvatar(container) {
    const profileContainer = container.querySelector('.sc-dUjcNx.dKhrdL');
    if (!profileContainer) return null;

    const containerId = getStableId(container);
    if (activeObservers.has(containerId)) return containerId;

    const colorScheme = getColorForUser(containerId);

    // Avatar state object
    const avatarState = {
      container,
      profileContainer,
      currentIntensity: 0,
      targetIntensity: 0,
      hasAudio: false,
      cornerLinesVisible: false,
      glowVisible: false,
      barVisible: false,
      meterElement: null,
      colorScheme,
      // Cached DOM references
      cornerLines: null,
      cornerLineElements: null,
      audioBar: null,
      // Previous values for change detection
      prevBarHeight: 0,
      prevGlowIntensity: 0,
      prevCornerOpacity: 0
    };

    // Create corner accent lines with will-change
    const cornerLines = document.createElement('div');
    cornerLines.className = 'audio-corner-lines';
    cornerLines.style.cssText = `
      position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px;
      pointer-events: none; z-index: 9999; opacity: 0;
      transition: opacity 0.3s ease; will-change: opacity;
    `;

    const corners = ['tl', 'tr', 'bl', 'br'];
    const cornerLineElements = [];

    corners.forEach(corner => {
      const line = document.createElement('div');
      line.className = `corner-${corner}`;
      const isTop = corner.includes('t');
      const isLeft = corner.includes('l');

      line.style.cssText = `
        position: absolute;
        ${isTop ? 'top: 0;' : 'bottom: 0;'}
        ${isLeft ? 'left: 0;' : 'right: 0;'}
        width: 35%; height: 35%;
        border-${isTop ? 'top' : 'bottom'}: 4px solid;
        border-${isLeft ? 'left' : 'right'}: 4px solid;
        box-sizing: border-box;
        transition: border-color 0.2s ease;
        will-change: border-color, filter;
      `;
      cornerLines.appendChild(line);
      cornerLineElements.push(line);
    });

    // Create audio bar with will-change
    const audioBar = document.createElement('div');
    audioBar.className = 'audio-visualizer-bar';
    audioBar.style.cssText = `
      position: absolute; right: 1px; bottom: 0; width: 8px; height: 0%;
      background: linear-gradient(180deg, #1890ff, #0050b3);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(24, 144, 255, 0.6), 0 0 15px rgba(24, 144, 255, 0.4);
      opacity: 0; transition: opacity 0.3s ease;
      pointer-events: none; z-index: 10001;
      will-change: height, opacity;
    `;

    profileContainer.style.cssText += `
      position: relative; overflow: visible;
      transition: box-shadow 0.3s ease, border 0.3s ease, transform 0.3s ease;
      will-change: box-shadow, border, transform;
    `;

    profileContainer.appendChild(cornerLines);
    profileContainer.appendChild(audioBar);

    // Store cached references
    avatarState.cornerLines = cornerLines;
    avatarState.cornerLineElements = cornerLineElements;
    avatarState.audioBar = audioBar;

    function updateMeterElement() {
      const newMeterElement = container.querySelector('.meter .ant-row');

      if (newMeterElement && !avatarState.meterElement) {
        avatarState.meterElement = newMeterElement;
        hiddenMeters.add(newMeterElement);
      } else if (!newMeterElement && avatarState.meterElement) {
        avatarState.meterElement = null;
        avatarState.hasAudio = false;
        avatarState.targetIntensity = 0;
      } else if (newMeterElement) {
        avatarState.meterElement = newMeterElement;
      }

      return avatarState.meterElement;
    }

    function checkAudioLevel() {
      const currentMeter = updateMeterElement();

      if (!currentMeter) {
        avatarState.hasAudio = false;
        avatarState.targetIntensity = 0;
        return;
      }

      const audioLevel = currentMeter.children.length;

      // Hide bars (batch operation)
      const bars = currentMeter.querySelectorAll('div');
      if (bars.length > 0) {
        bars.forEach(bar => {
          if (bar.style.opacity !== '0') {
            bar.style.cssText += 'opacity: 0; transition: opacity 0.3s ease;';
          }
        });
      }

      if (audioLevel === 0) {
        avatarState.hasAudio = false;
        avatarState.targetIntensity = 0;
      } else {
        avatarState.hasAudio = true;
        avatarState.targetIntensity = Math.min(audioLevel / 15, 1);
      }
    }

    updateMeterElement();

    // Setup meter observer
    let meterObserver = null;
    function setupMeterObserver() {
      if (meterObserver) {
        meterObserver.disconnect();
      }

      const currentMeter = updateMeterElement();
      if (currentMeter) {
        meterObserver = new MutationObserver(checkAudioLevel);
        meterObserver.observe(currentMeter, {
          childList: true,
          subtree: false,
          attributes: false
        });
      }
    }

    setupMeterObserver();

    // Meter container observer
    const meterContainerObserver = new MutationObserver(() => {
      setupMeterObserver();
      checkAudioLevel();
    });

    const meterContainer = container.querySelector('.sc-dUjcNx.dKhrdL');
    if (meterContainer) {
      meterContainerObserver.observe(meterContainer, {
        childList: true,
        subtree: true,
        attributes: false
      });
    }

    activeObservers.set(containerId, {
      meterObserver,
      meterContainerObserver,
      container,
      colorScheme: colorScheme.name
    });

    activeAvatars.set(containerId, avatarState);

    // Start global animation loop if not running
    if (!globalAnimationFrame) {
      startGlobalAnimation();
    }

    return containerId;
  }

  // SINGLE animation loop for ALL avatars
  function startGlobalAnimation() {
    function animate() {
      // Skip if no active avatars
      if (activeAvatars.size === 0) {
        globalAnimationFrame = null;
        return;
      }

      activeAvatars.forEach((state) => {
        // Skip animation if no audio and intensity is 0
        if (!state.hasAudio && state.currentIntensity === 0) {
          return;
        }

        // Smooth interpolation
        const lerpSpeed = state.targetIntensity > state.currentIntensity ? 0.15 : 0.08;
        state.currentIntensity += (state.targetIntensity - state.currentIntensity) * lerpSpeed;

        if (state.currentIntensity < 0.01 && state.targetIntensity === 0) {
          state.currentIntensity = 0;
        }

        const intensity = state.currentIntensity;

        // Handle corner lines - only update on state change
        if (state.hasAudio && !state.cornerLinesVisible) {
          state.cornerLinesVisible = true;
          state.cornerLines.style.opacity = '1';
        } else if (!state.hasAudio && state.cornerLinesVisible) {
          state.cornerLinesVisible = false;
          state.cornerLines.style.opacity = '0';
        }

        // Update corner line colors - only when visible and changed
        if (state.cornerLinesVisible && intensity > 0) {
          const colorIntensity = 0.4 + (intensity * 0.6);

          // Only update if intensity changed significantly
          if (Math.abs(colorIntensity - state.prevCornerOpacity) > 0.05) {
            const glowSize = 8 + (intensity * 20);
            const dynamicColors = getCachedColors(state.colorScheme, colorIntensity);

            state.cornerLineElements.forEach((line, index) => {
              const color = dynamicColors[index % dynamicColors.length];
              line.style.borderColor = color;
              line.style.filter = `drop-shadow(0 0 ${glowSize}px ${color})`;
            });

            state.prevCornerOpacity = colorIntensity;
          }
        }

        // Handle audio bar - only update on state change
        if (state.hasAudio && !state.barVisible) {
          state.barVisible = true;
          state.audioBar.style.opacity = '1';
        } else if (!state.hasAudio && state.barVisible) {
          state.barVisible = false;
          state.audioBar.style.opacity = '0';
        }

        // Update bar height - only if changed significantly
        if (state.barVisible && intensity > 0) {
          const barHeightPercent = 10 + (intensity * 80);
          if (Math.abs(barHeightPercent - state.prevBarHeight) > 2) {
            state.audioBar.style.height = `${barHeightPercent}%`;
            state.prevBarHeight = barHeightPercent;
          }
        } else if (state.barVisible && state.prevBarHeight !== 0) {
          state.audioBar.style.height = '0%';
          state.prevBarHeight = 0;
        }

        // Handle avatar glow
        if (state.hasAudio && !state.glowVisible) {
          state.glowVisible = true;
        } else if (!state.hasAudio && state.glowVisible) {
          state.glowVisible = false;
          state.profileContainer.style.boxShadow = 'none';
          state.profileContainer.style.border = 'none';
          state.profileContainer.style.transform = 'scale(1)';
        }

        // Update glow - only if changed significantly
        if (state.glowVisible && intensity > 0) {
          const glowIntensity = 0.3 + (intensity * 0.7);

          if (Math.abs(glowIntensity - state.prevGlowIntensity) > 0.05) {
            const blurSize = 15 + (intensity * 20);
            const spreadSize = 2 + (intensity * 4);
            const glowColors = getCachedColors(state.colorScheme, glowIntensity);

            state.profileContainer.style.boxShadow = `
              0 0 ${blurSize}px ${spreadSize}px ${glowColors[0]},
              0 0 ${blurSize * 1.3}px ${spreadSize * 0.5}px ${glowColors[1]},
              inset 0 0 ${blurSize * 0.5}px ${glowColors[0]}
            `;
            state.profileContainer.style.border = `2px solid ${glowColors[1]}`;
            state.profileContainer.style.transform = `scale(${1 + intensity * 0.03})`;

            state.prevGlowIntensity = glowIntensity;
          }
        }
      });

      globalAnimationFrame = requestAnimationFrame(animate);
    }

    globalAnimationFrame = requestAnimationFrame(animate);
  }

  function restoreMeters() {
    hiddenMeters.forEach(meterElement => {
      if (meterElement) {
        const bars = meterElement.querySelectorAll('div');
        bars.forEach(bar => {
          bar.style.opacity = '1';
        });
      }
    });
    hiddenMeters.clear();
  }

  function scanAndSetupAvatars() {
    const avatarContainers = document.querySelectorAll('.ant-col');
    const currentIds = new Set();

    avatarContainers.forEach((container) => {
      const id = setupGlowForAvatar(container);
      if (id) {
        currentIds.add(id);
      }
    });

    // Cleanup removed avatars
    activeObservers.forEach((value, key) => {
      if (!currentIds.has(key)) {
        if (value.meterObserver) value.meterObserver.disconnect();
        if (value.meterContainerObserver) value.meterContainerObserver.disconnect();

        const state = activeAvatars.get(key);
        if (state) {
          state.profileContainer.style.cssText += 'box-shadow: none; border: none; transform: scale(1);';
          if (state.cornerLines?.parentNode) state.cornerLines.remove();
          if (state.audioBar?.parentNode) state.audioBar.remove();
        }

        activeObservers.delete(key);
        activeAvatars.delete(key);
      }
    });

    return currentIds.size;
  }

  scanAndSetupAvatars();

  const parentContainer = document.querySelector('.ant-row-flex.inline-flex');
  if (!parentContainer) {
    console.error('Parent container not found');
    return null;
  }

  // Debounced rescan
  let rescanTimeout;
  const parentObserver = new MutationObserver((mutations) => {
    let shouldRescan = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const hasRelevantNode = (nodes) => {
          for (const node of nodes) {
            if (node.nodeType === 1 &&
                (node.classList?.contains('ant-col') || node.querySelector?.('.ant-col'))) {
              return true;
            }
          }
          return false;
        };

        if (hasRelevantNode(mutation.addedNodes) || hasRelevantNode(mutation.removedNodes)) {
          shouldRescan = true;
          break;
        }
      }
    }

    if (shouldRescan) {
      clearTimeout(rescanTimeout);
      rescanTimeout = setTimeout(() => {
        scanAndSetupAvatars();
      }, 150);
    }
  });

  parentObserver.observe(parentContainer, {
    childList: true,
    subtree: true,
    attributes: false
  });

  const monitor = {
    disconnect: () => {
      parentObserver.disconnect();
      clearTimeout(rescanTimeout);
      if (globalAnimationFrame) {
        cancelAnimationFrame(globalAnimationFrame);
        globalAnimationFrame = null;
      }

      activeObservers.forEach(value => {
        if (value.meterObserver) value.meterObserver.disconnect();
        if (value.meterContainerObserver) value.meterContainerObserver.disconnect();
      });

      activeAvatars.forEach(state => {
        state.profileContainer.style.cssText += 'box-shadow: none; border: none; transform: scale(1);';
        if (state.cornerLines?.parentNode) state.cornerLines.remove();
        if (state.audioBar?.parentNode) state.audioBar.remove();
      });

      restoreMeters();
      activeObservers.clear();
      activeAvatars.clear();
      colorCache.clear();
    },
    getActiveCount: () => activeAvatars.size,
    rescan: () => scanAndSetupAvatars()
  };

  globalAudioGlowMonitor = monitor;
  return monitor;
}




function StylishBackground(enable) {
    // Centralized cleanup tracking
    if (!window._bgCleanup) {
        window._bgCleanup = {
            timeouts: [],
            intervals: [],
            animationStyles: new Set(),
            visibilityListenerAdded: false
        };
    }

    const cleanup = window._bgCleanup;
    let latestRequestId = 0;

    // Helper to add tracked timeout
    function addTimeout(fn, delay) {
        const id = setTimeout(() => {
            fn();
            cleanup.timeouts = cleanup.timeouts.filter(t => t !== id);
        }, delay);
        cleanup.timeouts.push(id);
        return id;
    }

    // Inject styles ONCE globally
    if (!document.getElementById('ps-bg-style')) {
        const s = document.createElement("style");
        s.id = "ps-bg-style";
        s.textContent = `
            .bg-ps-layer {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; overflow: hidden;
            }
            .bg-ps-layer.paused * {
                animation-play-state: paused !important;
            }
            @keyframes sunPulse {
                0%, 100% { opacity: 0.15; filter: brightness(1.05) blur(10px); }
                50% { opacity: .35; filter: brightness(1.25) blur(16px); }
            }
            @keyframes psDustFloat {
                0% { transform: translateY(0) translateX(0) scale(1); opacity: .15; }
                50% { transform: translateY(-25px) translateX(20px) scale(1.6); opacity: .9; }
                100% { transform: translateY(0) translateX(0) scale(1); opacity: .15; }
            }
            .bg-zoom-container {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;
            }
            .bg-zoom-image {
                width: 100%; height: 100%; background-size: cover; background-position: center;
                will-change: transform; position: relative;
                filter: brightness(.75) contrast(1.05) saturate(1.1);
            }
            .bg-sun-glow {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: radial-gradient(circle at 80% 20%, rgba(255,255,220,.28) 0%, rgba(255,230,160,.18) 20%, rgba(255,200,120,.10) 40%, transparent 70%);
                mix-blend-mode: screen; animation: sunPulse 8s ease-in-out infinite;
                pointer-events: none;
            }
        `;
        document.head.appendChild(s);
    }

    // Create reusable particle container (create once, reuse forever)
    if (!window._bgParticleContainer) {
        const dust = document.createElement("div");
        dust.className = "bg-ps-layer";
        dust.id = "bg-particle-container";

        // Create particles using DocumentFragment for batch insertion
        const fragment = document.createDocumentFragment();
        const particleCount = 45;

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement("div");
            const size = Math.random() * 3 + 1;
            p.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255,255,255,.9);
                box-shadow: 0 0 ${size*3}px rgba(255,255,255,.7);
                top: ${Math.random()*100}%;
                left: ${Math.random()*100}%;
                animation: psDustFloat ${Math.random()*6+6}s ease-in-out infinite;
                animation-delay: ${Math.random()*-10}s;
                opacity: .4;
            `;
            fragment.appendChild(p);
        }

        dust.appendChild(fragment);
        window._bgParticleContainer = dust;
    }

    const setCustomBackground = (url = "https://picsum.photos/1920/1080") => {
        if (!stylishBgEnabled) return;

        const requestId = ++latestRequestId;
        const body = document.body;
        const uniqueUrl = `${url}?t=${Date.now()}`;
        const img = new Image();
        img.src = uniqueUrl;

        img.onload = () => {
            if (!stylishBgEnabled || requestId !== latestRequestId) return;

            // Enable transparency features ONCE only
            if (!transparencyEnabled) {
                fadingout();

                // Batch all enables in a single timeout
                addTimeout(() => {
                    addAutoAudioGlow(true);
                    Transparency(true);
                    toggleClock(true);
                    addAvatarBorder(true);
                    transparencyEnabled = true;
                }, 1500);
            }

            // Remove old background
            const oldBg = document.getElementById('custom-bg-overlay');
            if (oldBg && requestId === latestRequestId) {
                oldBg.style.opacity = '0';
                addTimeout(() => {
                    if (oldBg.parentNode) oldBg.remove();
                }, 1200);
            }

            // Create new overlay
            const overlay = document.createElement("div");
            overlay.id = "custom-bg-overlay";
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                opacity: 0; transition: opacity 1.4s ease;
                pointer-events: none; z-index: -1;
            `;

            const zoomContainer = document.createElement("div");
            zoomContainer.className = "bg-zoom-container";

            const panX = (Math.random() - 0.5) * 4;
            const panY = (Math.random() - 0.5) * 4;

            // Create animation keyframe
            const animId = `zoom-${requestId}`;
            const styleEl = document.createElement('style');
            styleEl.id = `anim-${animId}`;
            styleEl.textContent = `
                @keyframes ${animId} {
                    0% { transform: scale(1) translate(0,0); }
                    100% { transform: scale(1.02) translate(${panX}%,${panY}%); }
                }
            `;
            document.head.appendChild(styleEl);
            cleanup.animationStyles.add(styleEl.id);

            const zoomImage = document.createElement("div");
            zoomImage.className = "bg-zoom-image";
            zoomImage.style.cssText = `
                background-image: url(${uniqueUrl});
                animation: ${animId} 12s ease-in-out forwards;
            `;

            // Create sun glow only (light sweep removed)
            const sunGlow = document.createElement("div");
            sunGlow.className = "bg-sun-glow";

            // Batch DOM operations
            zoomImage.appendChild(sunGlow);
            zoomContainer.appendChild(zoomImage);

            // Force reflow (optimized)
            void zoomImage.offsetWidth;

            // Reuse particle container instead of creating new one
            const dustClone = window._bgParticleContainer.cloneNode(true);
            dustClone.removeAttribute('id'); // Remove ID from clone

            overlay.appendChild(zoomContainer);
            overlay.appendChild(dustClone);
            body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });
        };

        img.onerror = () => {
            console.error('Failed to load background image');
        };
    };

    const restoreOriginalBackground = () => {
        transparencyEnabled = false;
        stylishBgEnabled = false;

        latestRequestId++;

        // Clear all tracked timeouts
        cleanup.timeouts.forEach(id => clearTimeout(id));
        cleanup.timeouts = [];

        // Clear all intervals
        cleanup.intervals.forEach(id => clearInterval(id));
        cleanup.intervals = [];

        // Remove animation styles
        cleanup.animationStyles.forEach(id => {
            const styleEl = document.getElementById(id);
            if (styleEl) styleEl.remove();
        });
        cleanup.animationStyles.clear();

        // Disable features with proper timing
        addTimeout(() => {
            addAutoAudioGlow(false);
            Transparency(false);
        }, 300);

        const body = document.body;
        const oldBg = document.getElementById('custom-bg-overlay');

        body.style.cssText = `
            background-image: url(${base64Tile});
            background-repeat: repeat;
            background-size: auto;
            background-position: top left;
        `;

        if (oldBg) {
            oldBg.style.opacity = '0';
            addTimeout(() => {
                if (oldBg.parentNode) oldBg.remove();
            }, 800);
        }
    };

    // Add visibility change listener ONCE
    if (!cleanup.visibilityListenerAdded) {
        let visibilityTimeout;

        document.addEventListener('visibilitychange', () => {
            // Debounce visibility changes
            clearTimeout(visibilityTimeout);

            visibilityTimeout = setTimeout(() => {
                const dust = document.querySelector('.bg-ps-layer');
                const zoomContainer = document.querySelector('.bg-zoom-container');

                if (document.hidden) {
                    if (dust) dust.classList.add('paused');
                    if (zoomContainer) zoomContainer.classList.add('paused');

                    cleanup.intervals.forEach(id => clearInterval(id));
                    cleanup.intervals = [];
                } else {
                    if (dust) dust.classList.remove('paused');
                    if (zoomContainer) zoomContainer.classList.remove('paused');

                    if (stylishBgEnabled && cleanup.intervals.length === 0) {
                        setCustomBackground();
                        const intervalId = setInterval(() => {
                            if (stylishBgEnabled) setCustomBackground();
                        }, 10000);
                        cleanup.intervals.push(intervalId);
                    }
                }
            }, 100); // Debounce 100ms
        });

        cleanup.visibilityListenerAdded = true;
    }

    if (enable) {
        stylishBgEnabled = true;

        if (typeof audioManager !== 'undefined') {
            audioManager.play("Stylish");
        }

        // Clear existing intervals
        cleanup.intervals.forEach(id => clearInterval(id));
        cleanup.intervals = [];

        setCustomBackground();

        const intervalId = setInterval(() => {
            if (stylishBgEnabled) setCustomBackground();
        }, 10000);
        cleanup.intervals.push(intervalId);

    } else {
        cleanup.intervals.forEach(id => clearInterval(id));
        cleanup.intervals = [];

        restoreOriginalBackground();
        toggleClock(false);
    }
}
///////// DONE /////////


function getIploggerVisitors() {
    const url = 'https://iplogger.org/logger/';
    const fd = new FormData();
    fd.append('interval', 'all');
    fd.append('unique', 'on');
    fd.append('filters', '');
    fd.append('page', '1');
    fd.append('sort', 'created');
    fd.append('order', 'desc');
    fd.append('code', 'Y4Wa5V8CrUpN');

    GM_xmlhttpRequest({
        method: 'POST',
        url: url,
        data: fd,
        headers: {
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'x-requested-with': 'XMLHttpRequest'
        },
        onload: function(resp) {
            try {
                const j = JSON.parse(resp.responseText);
                const visitors = j.content.map(htmlString => {
                    const div = document.createElement('div');
                    div.innerHTML = htmlString;
                    return {
                        ip: div.querySelector('.ip-address')?.textContent.trim(),
                        country: div.querySelector('.country-name')?.textContent.trim(),
                        city: div.querySelector('.country-description')?.textContent.trim(),
                        date: div.querySelector('.ip-date')?.textContent.trim(),
                        time: div.querySelector('.ip-time')?.textContent.trim(),
                        platform: div.querySelector('.platform span')?.textContent.trim(),
                        browser: div.querySelector('.browser span')?.textContent.trim()
                    };
                }).filter(visitor => visitor.country !== 'United States');
                showVisitorsModal(visitors);
            } catch (err) {
                console.error('Parsing error:', err, resp.responseText);
            }
        },
        onerror: function(err) {
            console.error('GM_xmlhttpRequest error:', err);
        }
    });
}

const countryFlags = {
    'Tunisia': '🇹🇳', 'Indonesia': '🇮🇩', 'Somalia': '🇸🇴', 'Egypt': '🇪🇬',
    'Ecuador': '🇪🇨', 'Morocco': '🇲🇦', 'India': '🇮🇳', 'United States': '🇺🇸',
    'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Australia': '🇦🇺',
    'Brazil': '🇧🇷', 'Canada': '🇨🇦', 'China': '🇨🇳', 'France': '🇫🇷',
    'Germany': '🇩🇪', 'Japan': '🇯🇵', 'Mexico': '🇲🇽', 'Russia': '🇷🇺',
    'United Kingdom': '🇬🇧', 'Spain': '🇪🇸', 'Italy': '🇮🇹', 'Turkey': '🇹🇷',
    'Poland': '🇵🇱', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Sweden': '🇸🇪',
    'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Switzerland': '🇨🇭',
    'Austria': '🇦🇹', 'Portugal': '🇵🇹', 'Greece': '🇬🇷', 'Czech Republic': '🇨🇿',
    'Romania': '🇷🇴', 'Hungary': '🇭🇺', 'Ukraine': '🇺🇦', 'South Korea': '🇰🇷',
    'Thailand': '🇹🇭', 'Vietnam': '🇻🇳', 'Philippines': '🇵🇭', 'Malaysia': '🇲🇾',
    'Singapore': '🇸🇬', 'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩', 'Saudi Arabia': '🇸🇦',
    'United Arab Emirates': '🇦🇪', 'Israel': '🇮🇱', 'South Africa': '🇿🇦', 'Nigeria': '🇳🇬',
    'Kenya': '🇰🇪', 'Colombia': '🇨🇴', 'Chile': '🇨🇱', 'Peru': '🇵🇪',
    'Venezuela': '🇻🇪', 'Ireland': '🇮🇪', 'New Zealand': '🇳🇿'
};

function showVisitorsModal(visitors) {
    // Load Twemoji if needed
    const loadTwemoji = (callback) => {
        if (window.twemoji) {
            callback();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@twemoji/api@latest/dist/twemoji.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = callback;
            document.head.appendChild(script);
        }
    };

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'visitors-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 30px;
        width: 95%;
        max-width: 1400px;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transform: scale(0.9);
        transition: transform 0.3s ease;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding-bottom: 16px;
    `;

    const title = document.createElement('h2');
    title.textContent = `Visitors (${visitors.length})`;
    title.style.cssText = `
        margin: 0;
        font-size: 28px;
        color: rgba(255, 255, 255, 0.95);
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `;

    const headerButtons = document.createElement('div');
    headerButtons.style.cssText = `
        display: flex;
        gap: 10px;
        align-items: center;
    `;

    const refreshBtn = document.createElement('button');
    refreshBtn.innerHTML = '↻';
    refreshBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        font-size: 24px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        transition: all 0.2s ease;
    `;
    refreshBtn.onmouseover = () => {
        refreshBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        refreshBtn.style.transform = 'rotate(180deg)';
    };
    refreshBtn.onmouseout = () => {
        refreshBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        refreshBtn.style.transform = 'rotate(0deg)';
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        font-size: 28px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        transition: all 0.2s ease;
    `;
    closeBtn.onmouseover = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        closeBtn.style.transform = 'rotate(90deg)';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        closeBtn.style.transform = 'rotate(0deg)';
    };

    header.appendChild(title);
    header.appendChild(headerButtons);
    headerButtons.appendChild(refreshBtn);
    headerButtons.appendChild(closeBtn);
  Backdrop();
    // Create table
    const table = document.createElement('table');
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    `;

    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr style="background: rgba(255, 255, 255, 0.05);">
            <th style="padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); font-weight: 600; color: rgba(255, 255, 255, 0.95);">IP Address</th>
            <th style="padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); font-weight: 600; color: rgba(255, 255, 255, 0.95);">Country</th>
            <th style="padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); font-weight: 600; color: rgba(255, 255, 255, 0.95);">City</th>
            <th style="padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); font-weight: 600; color: rgba(255, 255, 255, 0.95);">Date</th>
            <th style="padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); font-weight: 600; color: rgba(255, 255, 255, 0.95);">Time</th>
            <th style="padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); font-weight: 600; color: rgba(255, 255, 255, 0.95);">Platform</th>
            <th style="padding: 14px 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.2); font-weight: 600; color: rgba(255, 255, 255, 0.95);">Browser</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Find most recent visitor
    let mostRecentIndex = 0;
    let mostRecentDate = new Date(0);

    visitors.forEach((visitor, idx) => {
        if (visitor.date && visitor.time) {
            const dateStr = `${visitor.date} ${visitor.time}`;
            const visitorDate = new Date(dateStr);
            if (visitorDate > mostRecentDate) {
                mostRecentDate = visitorDate;
                mostRecentIndex = idx;
            }
        }
    });

    visitors.forEach((visitor, idx) => {
        const isRecent = idx === mostRecentIndex;
        const tr = document.createElement('tr');
        tr.style.cssText = `
            background: ${isRecent ? 'rgba(76, 175, 80, 0.2)' : (idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)')};
            transition: background 0.2s ease;
        `;
        tr.onmouseover = () => tr.style.background = isRecent ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.15)';
        tr.onmouseout = () => tr.style.background = isRecent ? 'rgba(76, 175, 80, 0.2)' : (idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)');

        const flagEmoji = countryFlags[visitor.country] || '🏴';
        const countryDisplay = `<span class="country-flag">${flagEmoji}</span> ${visitor.country || '-'}`;

        tr.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9);">${visitor.ip || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9);">${countryDisplay}</td>
            <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9);">${visitor.city || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9);">${visitor.date || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9);">${visitor.time || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9);">${visitor.platform || '-'}</td>
            <td style="padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.9);">${visitor.browser || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Custom scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
        #visitors-modal-overlay div::-webkit-scrollbar {
            width: 10px;
        }
        #visitors-modal-overlay div::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
        }
        #visitors-modal-overlay div::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }
        #visitors-modal-overlay div::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        .country-flag img {
            width: 20px;
            height: 20px;
            vertical-align: middle;
            margin-right: 8px;
        }
    `;
    document.head.appendChild(style);

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(table);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Parse Twemoji flags
    loadTwemoji(() => {
        if (window.twemoji) {
            const flags = modal.querySelectorAll('.country-flag');
            flags.forEach(flag => {
                twemoji.parse(flag, {
                    folder: 'svg',
                    ext: '.svg',
                    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/'
                });
            });
        }
    });

    // Fade in animation
    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);

    // Close modal function
    const closeModal = () => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        }, 300);
    };

    closeBtn.onclick = () => {
    closeBackdrop();
    closeModal();
};


    refreshBtn.onclick = () => {
        refreshBtn.style.pointerEvents = 'none';
        refreshBtn.style.opacity = '0.5';
        const originalContent = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '⟳';
        refreshBtn.style.animation = 'spin 1s linear infinite';

        const spinStyle = document.createElement('style');
        spinStyle.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(spinStyle);

        const url = 'https://iplogger.org/logger/';
        const fd = new FormData();
        fd.append('interval', 'all');
        fd.append('unique', 'on');
        fd.append('filters', '');
        fd.append('page', '1');
        fd.append('sort', 'created');
        fd.append('order', 'desc');
        fd.append('code', 'Y4Wa5V8CrUpN');

        GM_xmlhttpRequest({
            method: 'POST',
            url: url,
            data: fd,
            headers: {
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'x-requested-with': 'XMLHttpRequest'
            },
            onload: function(resp) {
                try {
                    const j = JSON.parse(resp.responseText);
                    const newVisitors = j.content.map(htmlString => {
                        const div = document.createElement('div');
                        div.innerHTML = htmlString;
                        return {
                            ip: div.querySelector('.ip-address')?.textContent.trim(),
                            country: div.querySelector('.country-name')?.textContent.trim(),
                            city: div.querySelector('.country-description')?.textContent.trim(),
                            date: div.querySelector('.ip-date')?.textContent.trim(),
                            time: div.querySelector('.ip-time')?.textContent.trim(),
                            platform: div.querySelector('.platform span')?.textContent.trim(),
                            browser: div.querySelector('.browser span')?.textContent.trim()
                        };
                    }).filter(visitor => visitor.country !== 'United States');

                    closeModal();
                    closeBackdrop();
                    setTimeout(() => {
                        showVisitorsModal(newVisitors);
                        document.head.removeChild(spinStyle);
                    }, 300);
                } catch (err) {
                    console.error('Refresh error:', err);
                    refreshBtn.style.pointerEvents = 'auto';
                    refreshBtn.style.opacity = '1';
                    refreshBtn.innerHTML = originalContent;
                    refreshBtn.style.animation = '';
                    document.head.removeChild(spinStyle);
                }
            },
            onerror: function(err) {
                console.error('Refresh request error:', err);
                refreshBtn.style.pointerEvents = 'auto';
                refreshBtn.style.opacity = '1';
                refreshBtn.innerHTML = originalContent;
                refreshBtn.style.animation = '';
                document.head.removeChild(spinStyle);
            }
        });
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeModal();
closeBackdrop();
        }
    };

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeBackdrop();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}



function addIPButton() {
  const row = document.querySelector('.ant-row-flex.ant-row-flex-start.ant-row-flex-middle[style*="height: 30px;"]');
  if (!row) {
    return;
  }

  const notificationCol = Array.from(row.querySelectorAll('.ant-col')).find(col => {
    const blind = col.querySelector('.blind');
    return blind && blind.textContent === 'Notification On';
  });

  if (!notificationCol) {
    return;
  }

  const newCol = document.createElement('div');
  newCol.className = 'ant-col';
  newCol.style.paddingLeft = '2px';
  newCol.style.paddingRight = '2px';

  const newButton = document.createElement('button');
  newButton.type = 'button';
  newButton.className = 'ant-btn no-border ant-btn-link';
  newButton.style.padding = '3px 2px 0px';
  newButton.style.height = 'auto';
  newButton.style.color = 'rgb(24, 144, 255)';
  newButton.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  newButton.setAttribute('data-original-bg', 'rgba(0, 0, 0, 0)');
  newButton.setAttribute('data-original-color', 'rgb(24, 144, 255)');
  newButton.setAttribute('data-original-border', 'rgba(0, 0, 0, 0)');

  const buttonSpan = document.createElement('span');
  buttonSpan.textContent = 'IP';
  newButton.appendChild(buttonSpan);

  const blindDiv = document.createElement('div');
  blindDiv.className = 'blind';
  blindDiv.textContent = 'IP';
  newButton.appendChild(blindDiv);

  newButton.onclick = function() {
    const popover = document.createElement('div');
    popover.style.cssText = `
        position: fixed;
        z-index: 99999999;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transform-origin: 50% bottom;
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.2s ease;
    `;

    const message = document.createElement('div');
    message.style.cssText = `
        color: rgba(255, 255, 255, 0.95);
        font-size: 15px;
        margin-bottom: 16px;
        text-align: center;
    `;
    message.textContent = 'Send IP checker?';

    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
    `;

    const noButton = document.createElement('button');
    noButton.textContent = 'No';
    noButton.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.9);
        padding: 6px 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
    `;
    noButton.onmouseover = () => noButton.style.background = 'rgba(255, 255, 255, 0.15)';
    noButton.onmouseout = () => noButton.style.background = 'rgba(255, 255, 255, 0.1)';

    const checkButton = document.createElement('button');
    checkButton.textContent = 'Check';
    checkButton.style.cssText = `
        background: rgba(255, 200, 0, 0.2);
        border: 1px solid rgba(255, 200, 0, 0.3);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.95);
        padding: 6px 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    checkButton.onmouseover = () => checkButton.style.background = 'rgba(255, 200, 0, 0.3)';
    checkButton.onmouseout = () => checkButton.style.background = 'rgba(255, 200, 0, 0.2)';

    const yesButton = document.createElement('button');
    yesButton.textContent = 'Yes';
    yesButton.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.95);
        padding: 6px 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    yesButton.onmouseover = () => yesButton.style.background = 'rgba(255, 255, 255, 0.3)';
    yesButton.onmouseout = () => yesButton.style.background = 'rgba(255, 255, 255, 0.2)';

    buttonsDiv.appendChild(noButton);
    buttonsDiv.appendChild(checkButton);
    buttonsDiv.appendChild(yesButton);
    popover.appendChild(message);
    popover.appendChild(buttonsDiv);

    const buttonRect = newButton.getBoundingClientRect();
    popover.style.left = `${buttonRect.left + (buttonRect.width / 2) - 160}px`;
    popover.style.top = `${buttonRect.top - 140}px`;

    document.body.appendChild(popover);

    setTimeout(() => {
        popover.style.opacity = '1';
        popover.style.transform = 'scale(1)';
    }, 10);

    const closePopover = () => {
        popover.style.opacity = '0';
        popover.style.transform = 'scale(0.9)';
        setTimeout(() => document.body.removeChild(popover), 200);
    };

    noButton.onclick = closePopover;

    checkButton.onclick = function() {
        closePopover();
        getIploggerVisitors();
    };

    yesButton.onclick = function() {
        closePopover();

        const textarea = document.querySelector('.ant-mentions.input-box textarea');
        if (textarea) {
            textarea.focus();
            const textToAdd = "![](https://ezstat.ru/1uhuV4.jpg)";
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            document.execCommand('insertText', false, textToAdd);
        }

        setTimeout(() => {
            const sendButton = document.querySelector('.ant-btn.send-box.ant-btn-primary.ant-btn-sm');
            if (sendButton) {
                sendButton.click();
            }

            setTimeout(() => {
                getIploggerVisitors();
            }, 1000);
        }, 250);
    };
  };

  newCol.appendChild(newButton);
  notificationCol.after(newCol);
}

async function initialize() {
const css = GatheredCSS();

const waitingMessage = document.createElement('div');
waitingMessage.id = 'f4t-waiting-message';
waitingMessage.innerHTML = `
  <div style="${css.waitingMessageInner}">
    <span class="f4t-shimmer-text">Join to load</span>
  </div>
`;
waitingMessage.style.cssText = css.waitingMessage;
document.body.appendChild(waitingMessage);

const style = document.createElement('style');
style.id = 'f4t-waiting-styles';
style.textContent = css.waitingStyles;
document.head.appendChild(style);


    function detectHangUpButton() {
        const buttons = document.querySelectorAll('button[type="button"]');
        for (const btn of buttons) {
            const blindDiv = btn.querySelector('div');
            if (blindDiv && blindDiv.textContent.trim() === 'Hang up this call') {
                return true;
            }
            const icon = btn.querySelector('i');
            if (icon && icon.style.color.includes('245, 34, 45') && icon.querySelector('svg[data-icon="line"]')) {

                return true;
            }
        }
        return false;
    }

    const checkForHangUpButton = async () => {
    if (detectHangUpButton()) {
        waitingMessage.style.opacity = '0';


        setTimeout(() => {
            waitingMessage.style.opacity = '0';
            waitingMessage.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                if (waitingMessage.parentNode) waitingMessage.remove();
                if (style.parentNode) style.remove();

                createSettingsUi();
                SettingsPanelModal();
         //     createSocialButton();
                createToggleInterfaceButton();
                createModerationButton();
                createUserSearchButton();
                createRoomSettingsButton();

const messagesButton = document.getElementById('f4t-msg-btn');
const gearButton = document.getElementById('f4t-gear-btn');
const socialButton = document.getElementById('f4t-social-btn');
const moderationButton = document.getElementById('f4t-Moderation-btn');
const toggleButton = document.getElementById('f4t-toggle-interface-btn');
const searchButton = document.getElementById('f4t-usersearch-btn');
const RoomSettingsButton = document.getElementById('f4t-roomSettings-btn');

const buttons = [messagesButton, gearButton, RoomSettingsButton, socialButton, moderationButton, searchButton, toggleButton];

buttons.forEach(btn => {
    if (!btn) return;
    btn.style.transition = 'none';
    btn.style.opacity = '0';
    btn.style.transform = 'translateY(-10px)';
});

setTimeout(() => {
    buttons.forEach((btn, index) => {
        if (!btn) return;
        setTimeout(() => {
            btn.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
        }, index * 100);
    });
}, 20);
                startInitialization();
            }, 200);
        }, 200);
    } else {
        setTimeout(checkForHangUpButton, 500);
    }
};

    checkForHangUpButton();



function ShowOnlineModal(users) {
    document.getElementById('f4t-online-modal')?.remove();

    let backdrop = document.getElementById('f4t-gear-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'f4t-gear-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: transparent;
            z-index: 9999;
            display: none;
        `;
        document.body.appendChild(backdrop);
    }

    const modal = document.createElement('div');
    modal.id = 'f4t-online-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50px;
        left: 10px;
        background: rgba(26,26,26,0.3);
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 10001;
        min-width: 320px;
        max-width: 400px;
        max-height: 70vh;
        font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
        border: 1px solid rgba(74,85,104,0.3);
        backdrop-filter: blur(5px) saturate(150%);
        color: #e2e8f0;
        overflow: hidden;
        display: none;
        transition: opacity 0.3s ease, transform 0.3s ease, max-height 0.4s ease;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 20px 20px 10px 20px;
        border-bottom: 1px solid rgba(74,85,104,0.3);
    `;

    const topRow = document.createElement('div');
    topRow.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const title = document.createElement('h3');
    title.textContent = `Who's Online (${users.length})`;
    title.style.cssText = `
        margin: 0;
        font-size: 18px;
        color: #e2e8f0;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: rgba(74,85,104,0.2);
        border: none;
        color: #e2e8f0;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s ease;
    `;
    closeBtn.onclick = function () {
        closeModal();
    };

    topRow.append(title, closeBtn);
    header.appendChild(topRow);

    // Search input
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search user...';
    searchBox.style.cssText = `
        width: 100%;
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid rgba(74,85,104,0.4);
        background: rgba(255,255,255,0.05);
        color: #e2e8f0;
        font-size: 14px;
        outline: none;
        transition: border 0.2s ease;
    `;
    searchBox.addEventListener('focus', () => {
        searchBox.style.border = '1px solid rgba(148,163,184,0.7)';
    });
    searchBox.addEventListener('blur', () => {
        searchBox.style.border = '1px solid rgba(74,85,104,0.4)';
    });
    header.appendChild(searchBox);

    modal.appendChild(header);

    // Scrollable list
    const content = document.createElement('div');
    content.style.cssText = `
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
        max-height: calc(70vh - 100px);
        transition: opacity 0.3s ease;
    `;

    // Loading spinner
    const loadingSpinner = document.createElement('div');
    loadingSpinner.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        gap: 12px;
    `;
    loadingSpinner.innerHTML = `
        <div style="
            width: 40px;
            height: 40px;
            border: 3px solid rgba(226,232,240,0.2);
            border-top-color: #e2e8f0;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        "></div>
        <div style="color: rgba(226,232,240,0.7); font-size: 14px;">Loading users...</div>
    `;

    // Add keyframes for spinner animation and fade-in
    if (!document.getElementById('f4t-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'f4t-spinner-style';
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes fadeInUser {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    content.appendChild(loadingSpinner);
    modal.appendChild(content);
    document.body.appendChild(modal);

    setTimeout(() => {
        repositionOnlineFriendsDisplay(modal);
    }, 100);

    backdrop.style.display = 'block';
    modal.style.display = 'block';
    modal.style.opacity = '0';
    modal.style.transform = 'translateY(-20px)';

    // Set initial smaller height for loading state
    modal.style.maxHeight = '500px';

    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    }, 50);


    // Render users after modal animation completes
    setTimeout(() => {
        const renderUsers = (filter = '') => {
            // Fade out content first
            content.style.opacity = '0';

            setTimeout(() => {
                content.innerHTML = ''; // Remove spinner
                const filtered = users.filter(u => u.name.toLowerCase().includes(filter.toLowerCase()));

                if (filtered.length === 0) {
                    content.innerHTML = `<div style="text-align:center; opacity:0.7; padding:20px;">No matching users</div>`;
                    content.style.opacity = '1';
                    return;
                }

                // Use DocumentFragment for better performance with large lists
                const fragment = document.createDocumentFragment();

                filtered.forEach((u, index) => {
                    const userDiv = document.createElement('div');
                    userDiv.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 8px;
                        border-radius: 8px;
                        transition: background-color 0.2s ease;
                        opacity: 0;
                        animation: fadeInUser 0.4s ease forwards;
                        animation-delay: ${Math.min(index * 0.02, 0.5)}s;
                    `;
                    userDiv.innerHTML = `
                        <img src="${u.avatar}" style="width: 36px; height: 36px; border-radius: 50%;" alt="${u.name}">
                        <div style="font-size: 14px; color: #e2e8f0;">${u.name}</div>
                    `;
                    userDiv.addEventListener('mouseenter', () => {
                        userDiv.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    });
                    userDiv.addEventListener('mouseleave', () => {
                        userDiv.style.backgroundColor = 'transparent';
                    });
                    fragment.appendChild(userDiv);
                });

                content.appendChild(fragment); // Add all users at once

                // Smoothly expand modal to full height
                modal.style.maxHeight = '70vh';

                // Fade content back in
                setTimeout(() => {
                    content.style.opacity = '1';
                }, 50);

                // Reposition after users are added and height changes


            }, 300); // Wait for fade out
        };

        renderUsers();
        setTimeout(() => {
                    repositionOnlineFriendsDisplay(modal);
                }, 1500);

        // Enable live search after initial render
        searchBox.addEventListener('input', e => renderUsers(e.target.value));
    }, 350);

    function closeModal() {
        modal.style.opacity = '0';
        modal.style.transform = 'translateY(-20px)';
        backdrop.style.display = 'none';
        setTimeout(() => modal.remove(), 100);
        setTimeout(() => {
            repositionOnlineFriendsDisplay();
        }, 150);
    }

    backdrop.onclick = closeModal;
}



///////// DONE /////////
function SettingsPanelModal() {
    const messagesBtn = document.getElementById('f4t-msg-btn');
    if (!messagesBtn) return;

    // Inject CSS once globally
    if (!document.getElementById('settings-panel-styles')) {
        const style = document.createElement('style');
        style.id = 'settings-panel-styles';
        style.textContent = `
            .f4t-gear-btn {
                position: fixed;
                left: 50px;
                background: linear-gradient(270deg, var(--buttonGradientStart), var(--buttonGradientMid), var(--buttonGradientEnd));
                transition: all 0.3s ease;
            }
            .f4t-gear-btn:hover {
                background: linear-gradient(270deg, var(--buttonGradientHover), var(--buttonGradientMid), var(--buttonGradientEnd));
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }
            .f4t-gear-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: transparent;
                z-index: 9999;
                display: none;
            }
            .f4t-gear-panel {
                position: fixed;
                top: 50px;
                left: 10px;
                background: rgba(26,26,26,0.3);
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                z-index: 10000;
                min-width: 320px;
                max-width: 400px;
                max-height: 70vh;
                font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
                display: none;
                border: 1px solid rgba(74,85,104,0.3);
                backdrop-filter: blur(5px) saturate(150%);
                overflow: hidden;
                color: #e2e8f0;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            .settings-btn {
                padding: 8px 12px;
                border-radius: 6px;
                background: rgba(0,0,0,0);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(5px);
                cursor: pointer;
                transition: background 0.2s ease;
                width: 100%;
            }
            .settings-btn:hover {
                background: rgba(255,255,255,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    // Check if gear button already exists
    let gearBtn = document.getElementById('f4t-gear-btn');

    if (!gearBtn) {
        gearBtn = document.createElement('button');
        gearBtn.id = 'f4t-gear-btn';
        gearBtn.innerHTML = '⚙';
        gearBtn.title = 'Settings';
        gearBtn.className = 'f4t-gear-btn';
        gearBtn.style.cssText = css.gearButton + `left:50px;`;
        document.body.appendChild(gearBtn);
    }

    // Check if panel already exists
    let panel = document.getElementById('f4t-gear-panel');
    let backdrop = document.getElementById('f4t-gear-backdrop');

    if (!panel) {
        // Create backdrop
        backdrop = document.createElement('div');
        backdrop.id = 'f4t-gear-backdrop';
        backdrop.className = 'f4t-gear-backdrop';

        // Create panel
        panel = document.createElement('div');
        panel.id = 'f4t-gear-panel';
        panel.className = 'f4t-gear-panel';

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 20px;
            border-bottom: 1px solid rgba(74,85,104,0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Settings';
        title.style.cssText = `margin: 0; font-size: 18px; color: #e2e8f0;`;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.id = 'panel-close-btn';
        closeBtn.style.cssText = `
            background: rgba(74,85,104,0.2);
            border: none;
            color: #e2e8f0;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s ease;
        `;

        header.appendChild(title);
        header.appendChild(closeBtn);
        panel.appendChild(header);

        // Content container
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `position: relative; max-height: calc(70vh - 60px);`;

        // Settings content
        const settingsContent = document.createElement('div');
        settingsContent.id = 'settings-content';
        settingsContent.style.cssText = `
            padding: 16px;
            display: flex;
            flex-direction: column;
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;

        // Users content
        const usersContent = document.createElement('div');
        usersContent.id = 'users-content';
        usersContent.style.cssText = `
            padding: 16px;
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s ease, transform 0.3s ease;
            overflow-y: auto;
            max-height: calc(70vh - 60px);
        `;

        contentContainer.appendChild(settingsContent);
        contentContainer.appendChild(usersContent);
        panel.appendChild(contentContainer);

        document.body.appendChild(backdrop);
        document.body.appendChild(panel);

        // Cache DOM references
        const refs = {
            settingsContent,
            usersContent,
            panel,
            backdrop
        };

        // Populate settings once
        populateSettings(refs);

        // Setup event delegation for panel
        setupEventDelegation(refs);

        // Store cleanup reference
        window._settingsPanelCleanup = () => {
            backdrop.remove();
            panel.remove();
            gearBtn.remove();
        };
    }

    // Toggle panel (using cached references)
    gearBtn.onclick = () => togglePanel();
}
///////// DONE /////////

///////// DONE /////////
function populateSettings(refs) {
    const { settingsContent } = refs;

    // Build HTML once
    settingsContent.innerHTML = `
        <div style="margin-bottom:16px;">
            <label for="notif-vol" style="display:block; margin-bottom:6px; color:#e2e8f0;">
                Notifications Volume
            </label>
            <input type="range" id="notif-vol" min="0" max="1" step="0.01" value="0.5" style="width: 100%;">
        </div>
        <div style="margin-bottom:16px;">
            <label for="dnd-toggle" style="display:flex; align-items:center; gap:8px; color:#e2e8f0;">
                <input type="checkbox" id="dnd-toggle">
                Enable Dark mode
            </label>
        </div>
        <div style="margin-bottom:16px;">
            <label for="ShuffleToggle" style="display:flex; align-items:center; gap:8px; color:#e2e8f0;">
                <input type="checkbox" id="ShuffleToggle">
                Stylish background
            </label>
        </div>

        <div style="margin-bottom:16px;">
            <button id="clear-followers-btn" class="settings-btn">Clear Followers</button>
        </div>
        <div style="margin-bottom:16px;">
            <button id="globalOnline" class="settings-btn">Who's online?</button>
        </div>
        <div style="margin-bottom:16px;">
            <button id="screenRecorder" class="settings-btn">Screen Recorder</button>
        </div>
                <div style="margin-bottom:16px;">
            <button id="db-btn" class="settings-btn">Database</button>
        </div>
    `;

    // Setup input listeners (only once)
    const volumeSlider = document.getElementById("notif-vol");
    if (volumeSlider) {
        volumeSlider.value = audioManager.getVolume();
        volumeSlider.oninput = (e) => {
            audioManager.setVolume(parseFloat(e.target.value));
        };
    }

    const darkModeToggle = document.getElementById('dnd-toggle');
    if (darkModeToggle) {
        darkModeToggle.onchange = (e) => {
            audioManager.play("DarkModeOn");
            DarkModex(e.target.checked);
            try {
                localStorage['f4t:dark_mode'] = e.target.checked.toString();
            } catch (error) {
                console.error('localStorage error:', error);
            }
        };
    }

    const stylishBgToggle = document.getElementById('ShuffleToggle');
    if (stylishBgToggle) {
        stylishBgToggle.onchange = (e) => {
            if (e.target.checked) {
                StylishBackground(true);
            } else {
                fadingout();
                setTimeout(() => {
                    StylishBackground(false);
                    addAvatarBorder(false);
                }, 1000);
            }
        };
    }
}


function setupEventDelegation(refs) {
    const { panel, backdrop, settingsContent, usersContent } = refs;

    // Database state
    let dbInterval = null;
    let isDbRunning = false;
    let dbModalInstance = null;
    let currentInterval = 3000; // Default 3 seconds
    let notificationElement = null;

    // Create notification element (just text)
    function createNotification() {
        if (notificationElement) return notificationElement;

        const notification = document.createElement('div');
        notification.id = 'db-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 325px;
            color: #4CAF50;
            z-index: 9999;
            font-size: 14px;
            font-weight: 500;
            pointer-events: none;
        `;
        document.body.appendChild(notification);
        notificationElement = notification;
        return notification;
    }

    // Update notification with smooth transition
    function updateNotification(message) {
        const notification = createNotification();

        // Fade out briefly

        // Change text and fade back in
        setTimeout(() => {
            notification.textContent = message;
            notification.style.opacity = '1';
        }, 150);
    }

    // Single click handler for all buttons using event delegation
    panel.addEventListener('click', (e) => {
        const target = e.target;

        // Close button
        if (target.id === 'panel-close-btn') {
            e.stopPropagation();
            closePanel();
            return;
        }

        // Clear followers button
        if (target.id === 'clear-followers-btn') {
            showConfirmationDialog(e.clientX, e.clientY, () => {
                delete localStorage['friends:userMap'];
                delete localStorage['groups:groupMap'];
            });
            return;
        }

        // Global online button
        if (target.id === 'globalOnline') {
            closePanel();
            fetchOnlineUsers();
            return;
        }

        // Screen recorder button
        if (target.id === 'screenRecorder') {
            closePanel();
            if (typeof openScreenRecorderModal !== 'undefined') {
                openScreenRecorderModal();
            }
            return;
        }

        // Database button
        if (target.id === 'db-btn') {
            closePanel();

            // If modal already exists, just show it
            if (dbModalInstance) {
                dbModalInstance.modal.style.display = 'block';
                dbModalInstance.backdrop.style.display = 'block';
                return;
            }

            // Create modal
            const modal = document.createElement('div');
            modal.id = 'db-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1e1e1e;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                z-index: 10001;
                min-width: 400px;
            `;

            modal.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #fff; font-size: 20px;">Database Manager</h2>
                    <button id="db-modal-close" style="background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px;">×</button>
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="color: #fff; font-size: 14px; display: block; margin-bottom: 8px;">
                        Collection Interval: <span id="interval-value">3</span> seconds
                    </label>
                    <input type="range" id="interval-slider" min="1" max="10" value="3" step="1" style="width: 100%;" />
                </div>
                <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                    <button id="db-start-btn" class="settings-btn" style="flex: 1;">Start</button>
                    <button id="db-check-btn" class="settings-btn" style="flex: 1;">Check</button>
                </div>
                <div style="margin-bottom: 16px;">
                    <button id="db-save-btn" class="settings-btn" style="width: 100%;">Save Database Locally</button>
                </div>
                <div id="db-status" style="color: #aaa; font-size: 14px; text-align: center; padding: 8px; background: #2a2a2a; border-radius: 6px;"></div>
                <div id="db-list" style="max-height: 400px; overflow-y: auto; margin-top: 16px;"></div>
            `;

            // Create backdrop
            const dbBackdrop = document.createElement('div');
            dbBackdrop.id = 'db-backdrop';
            dbBackdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 10000;
            `;

            document.body.appendChild(dbBackdrop);
            document.body.appendChild(modal);

            // Store modal instance
            dbModalInstance = { modal, backdrop: dbBackdrop };

            // Event listeners
            const startBtn = modal.querySelector('#db-start-btn');
            const checkBtn = modal.querySelector('#db-check-btn');
            const saveBtn = modal.querySelector('#db-save-btn');
            const closeBtn = modal.querySelector('#db-modal-close');
            const statusDiv = modal.querySelector('#db-status');
            const listDiv = modal.querySelector('#db-list');
            const intervalSlider = modal.querySelector('#interval-slider');
            const intervalValue = modal.querySelector('#interval-value');

            // Interval slider
            intervalSlider.oninput = (e) => {
                const value = e.target.value;
                intervalValue.textContent = value;
                currentInterval = value * 1000;

                // If running, restart with new interval
                if (isDbRunning) {
                    clearInterval(dbInterval);
                    dbInterval = setInterval(fetchAndSaveUsersToDb, currentInterval);
                    updateStatus(`Collecting every ${value} seconds | Total: ${getTotalUsers()}`);
                }
            };

            // Get total users
            function getTotalUsers() {
                try {
                    const dbData = localStorage['f4t:database'];
                    if (dbData) {
                        return JSON.parse(dbData).length;
                    }
                } catch (e) {}
                return 0;
            }

            // Update status
            function updateStatus(message, color = '#4CAF50') {
                statusDiv.textContent = message;
                statusDiv.style.color = color;
            }

            // Fetch and save function
            function fetchAndSaveUsersToDb() {
                function generateToken() {
                    const loadTime = Date.now() - Math.floor(Math.random() * 5000);
                    const iso = new Date(loadTime).toISOString();
                    const rand = Math.random();
                    const s = `${loadTime}|${iso}|${rand}`;
                    const bytes = Array.from(s).map(c => c.charCodeAt(0) ^ 104);
                    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
                }

                const generatedToken = generateToken();

                fetch(
                    `https://free4talk-sync.herokuapp.com/sync/get/free4talk/groups/?a=sync-get-free4talk-groups&v=536-1&t=${Date.now()}`,
                    {
                        method: "POST",
                        headers: {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9,fr;q=0.8,ar;q=0.7",
                            "content-type": "text/plain;charset=UTF-8"
                        },
                        body: JSON.stringify({ body: {}, _: generatedToken }),
                        mode: "cors",
                        credentials: "omit"
                    }
                )
                .then(response => response.json())
                .then(data => {
                    const users = [];
                    if (data.success && data.data) {
                        Object.values(data.data).forEach(group => {
                            if (group?.clients?.length) {
                                group.clients.forEach(client => {
                                    if (client.name && client.id && client.avatar) {
                                        users.push({
                                            name: client.name,
                                            id: client.id,
                                            avatar: client.avatar
                                        });
                                    }
                                });
                            }
                        });
                    }

                    // Get existing database
                    let savedUsers = [];
                    try {
                        const dbData = localStorage['f4t:database'];
                        if (dbData) {
                            savedUsers = JSON.parse(dbData);
                        }
                    } catch (e) {
                        console.error('Error reading database:', e);
                    }

                    // Check for new users
                    const existingIds = new Set(savedUsers.map(u => u.id));
                    let newCount = 0;

                    users.forEach(user => {
                        if (!existingIds.has(user.id)) {
                            savedUsers.push(user);
                            newCount++;
                        }
                    });

                    // Save to localStorage
                    localStorage['f4t:database'] = JSON.stringify(savedUsers);

                    // Update status in real-time
                    const intervalSec = currentInterval / 1000;
                    let statusMessage;

                    if (newCount > 0) {
                        statusMessage = `✓ Added ${newCount} new user(s) | Total: ${savedUsers.length} | Interval: ${intervalSec}s`;
                    } else {
                        statusMessage = `Collecting every ${intervalSec}s | Total: ${savedUsers.length} | No new users`;
                    }

                    updateStatus(statusMessage, '#4CAF50');
                    updateNotification(statusMessage);
                })
                .catch(err => {
                    console.error('Database fetch failed:', err);
                    const errorMsg = '❌ Failed to fetch users';
                    updateStatus(errorMsg, '#dc3545');
                    updateNotification(errorMsg);
                });
            }

            // Display users function
            function displayDatabaseUsers() {
                let savedUsers = [];
                try {
                    const dbData = localStorage['f4t:database'];
                    if (dbData) {
                        savedUsers = JSON.parse(dbData);
                    }
                } catch (e) {
                    console.error('Error reading database:', e);
                }

                if (savedUsers.length === 0) {
                    listDiv.innerHTML = '<p style="color: #aaa; text-align: center;">No users in database yet</p>';
                    return;
                }

                listDiv.innerHTML = `
                    <div style="margin-bottom: 12px; color: #4CAF50; font-weight: bold; text-align: center;">
                        Total Users: ${savedUsers.length}
                    </div>
                    ${savedUsers.map(user => `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 8px; background: #2a2a2a; border-radius: 8px; margin-bottom: 8px;">
                            <img src="${user.avatar}" style="width: 40px; height: 40px; border-radius: 50%;" />
                            <div style="flex: 1;">
                                <div style="color: #fff; font-weight: 500;">${user.name}</div>
                                <div style="color: #888; font-size: 12px;">${user.id}</div>
                            </div>
                        </div>
                    `).join('')}
                `;
            }

            // Save database locally function
            function saveDbLocally() {
                try {
                    const dbData = localStorage['f4t:database'];
                    if (!dbData) {
                        alert('No database to save!');
                        return;
                    }

                    const savedUsers = JSON.parse(dbData);
                    const fileContent = JSON.stringify(savedUsers, null, 4);
                    const blob = new Blob([fileContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'f4tDataBase.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    updateStatus(`💾 Saved ${savedUsers.length} users to f4tDataBase.txt`, '#4CAF50');
                } catch (e) {
                    console.error('Error saving database:', e);
                    alert('Failed to save database');
                }
            }

            // Start button
            startBtn.onclick = () => {
                if (!isDbRunning) {
                    isDbRunning = true;
                    fetchAndSaveUsersToDb();
                    dbInterval = setInterval(fetchAndSaveUsersToDb, currentInterval);
                    startBtn.textContent = 'Stop';
                    startBtn.style.background = '#dc3545';
                    intervalSlider.disabled = false;
                } else {
                    isDbRunning = false;
                    if (dbInterval) {
                        clearInterval(dbInterval);
                        dbInterval = null;
                    }
                    startBtn.textContent = 'Start';
                    startBtn.style.background = '';
                    updateStatus('Stopped', '#aaa');
                    intervalSlider.disabled = false;

                    // Fully remove modal and notification when stopped
                    if (dbModalInstance) {
                        dbModalInstance.backdrop.remove();
                        dbModalInstance.modal.remove();
                        dbModalInstance = null;
                    }
                    if (notificationElement) {
                        notificationElement.remove();
                        notificationElement = null;
                    }
                }
            };

            // Check button
            checkBtn.onclick = () => {
                displayDatabaseUsers();
            };

            // Save button
            saveBtn.onclick = () => {
                saveDbLocally();
            };

            // Close handlers - just hide, don't remove
            const hideModal = () => {
                modal.style.display = 'none';
                dbBackdrop.style.display = 'none';
            };

            closeBtn.onclick = hideModal;
            dbBackdrop.onclick = hideModal;

            return;
        }

        // Back button (for users content)
        if (target.textContent === '← Back') {
            showSettings();
            return;
        }
    });

    // Backdrop click
    backdrop.onclick = closePanel;
}



function closePanel() {
    const panel = document.getElementById('f4t-gear-panel');
    const backdrop = document.getElementById('f4t-gear-backdrop');
    const onlineFriendsDisplay = document.getElementById('online-friends-display');

    if (onlineFriendsDisplay) {
        onlineFriendsDisplay.style.cssText += 'transition: transform 0.3s ease; transform: translateY(0);';
    }

    panel.style.cssText += 'opacity: 0; transform: translateY(-20px);';
    backdrop.style.display = 'none';

    setTimeout(() => {
        panel.style.display = 'none';
        showSettings();
    }, 300);
}
function togglePanel() {
    const panel = document.getElementById('f4t-gear-panel');
    const backdrop = document.getElementById('f4t-gear-backdrop');
    const onlineFriendsDisplay = document.getElementById('online-friends-display');

    if (panel.style.display === 'none' || !panel.style.display) {
        backdrop.style.display = 'block';
        panel.style.display = 'block';
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';

            if (onlineFriendsDisplay) {
                const rect = panel.getBoundingClientRect();
                onlineFriendsDisplay.style.cssText += `
                    transition: transform 0.3s ease;
                    transform: translateY(${rect.bottom + 30 - 58}px);
                `;
            }
        }, 50);
    } else {
        closePanel();
    }
}
function showSettings() {
    const settingsContent = document.getElementById('settings-content');
    const usersContent = document.getElementById('users-content');

    if (usersContent) {
        usersContent.style.cssText += 'opacity: 0; transform: translateX(100%);';
    }

    setTimeout(() => {
        if (settingsContent) {
            settingsContent.style.cssText += 'opacity: 1; transform: translateX(0);';
        }
    }, 150);
}
function showConfirmationDialog(x, y, onConfirm) {
    const existingDialog = document.getElementById('confirmation-dialog');
    if (existingDialog) existingDialog.remove();

    const dialog = document.createElement('div');
    dialog.id = 'confirmation-dialog';
    dialog.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 12px 16px;
        color: white;
        font-size: 14px;
        z-index: 10001;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        min-width: 180px;
    `;

    dialog.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: 500;">Clear all followers?</div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button data-action="confirm-yes" style="
                padding: 6px 14px;
                border-radius: 6px;
                background: rgba(239, 68, 68, 0.2);
                color: #f87171;
                border: 1px solid rgba(239, 68, 68, 0.3);
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
            ">Yes</button>
            <button data-action="confirm-no" style="
                padding: 6px 14px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                color: #e2e8f0;
                border: 1px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s ease;
            ">No</button>
        </div>
    `;

    document.body.appendChild(dialog);

    // Event delegation for dialog buttons
    dialog.onclick = (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm-yes') {
            onConfirm();
            dialog.remove();
        } else if (action === 'confirm-no') {
            dialog.remove();
        }
    };

    // Click outside to close (with proper cleanup)
    let closeDialogHandler;
    setTimeout(() => {
        closeDialogHandler = (e) => {
            if (!dialog.contains(e.target)) {
                dialog.remove();
                document.removeEventListener('click', closeDialogHandler);
            }
        };
        document.addEventListener('click', closeDialogHandler);
    }, 100);
}
function fetchOnlineUsers() {
    const groupsData = window.UpdatedGroupsData;
    const users = [];

    if (groupsData && groupsData.success && groupsData.data) {
        Object.values(groupsData.data).forEach(group => {
            if (group?.clients?.length) {
                group.clients.forEach(client => {
                    if (client.name && client.id && client.avatar) {
                        users.push({
                            name: client.name,
                            id: client.id,
                            avatar: client.avatar
                        });
                    }
                });
            }
        });
    }

    if (typeof ShowOnlineModal !== 'undefined') {
        ShowOnlineModal(users);
        //  console.log(users);
        //BatchFollowing(users);
    }
}
///////// DONE /////////
async function BatchFollowing(usersOnline) {
    const batchSize = 80; // change to 60 for larger batch
    let successCount = 0;
    const followedUsers = new Set(); // users we've successfully followed or skipped
    const triedUsers = new Set();    // users we've already attempted
    const successfulFollows = [];    // store successful follow IDs

    // --- FOLLOW BATCH ---
    while (successCount < batchSize) {
        let needed = batchSize - successCount;

        let currentBatch = usersOnline
            .filter(u => !followedUsers.has(u.id) && !triedUsers.has(u.id))
            .slice(0, needed);

        if (currentBatch.length === 0) {
            console.log("No more new users to try.");
            break;
        }

        currentBatch.forEach(u => triedUsers.add(u.id));

        const results = await Promise.all(
            currentBatch.map(async (user) => {
                const userId = user.id;
                try {
                    const res = await followUser(userId);
                    return { userId, res };
                } catch (err) {
                    return { userId, res: { success: false, error: 'exception', details: err } };
                }
            })
        );

        const retryUsers = [];
        results.forEach(({ userId, res }) => {
            if (res.success) {
                console.log(`✅ Followed ${userId}`);
                successCount++;
                followedUsers.add(userId);
                successfulFollows.push(userId);
            } else if (res.error === 'server_error') {
                console.log(`⚠️ Server error for ${userId}, will retry in next batch`);
                retryUsers.push({ id: userId });
            } else if (res.error === 'unverified') {
                console.log(`⛔ User ${userId} unverified, skipping`);
                followedUsers.add(userId);
            } else {
                console.log(`❌ Unknown error for ${userId}:`, res);
                followedUsers.add(userId);
            }
        });

        usersOnline = retryUsers.concat(
            usersOnline.filter(u => !followedUsers.has(u.id) && !retryUsers.some(r => r.id === u.id))
        );
    }

    console.log(`🎯 Follow batch complete. Total followed: ${successCount}`);
    console.log(`📝 Successfully followed IDs:`, successfulFollows);

    // --- WAIT BEFORE UNFOLLOW ---
    await new Promise(r => setTimeout(r, 3000));

    // --- UNFOLLOW ALL SUCCESSFUL FOLLOWS WITH RETRIES ---
    let unfollowQueue = [...successfulFollows];
    const maxRetries = 3;
    const retryCount = {};

    while (unfollowQueue.length > 0) {
        const results = await Promise.all(
            unfollowQueue.map(async (userId) => {
                try {
                    const res = await unfollowUser(userId);
                    return { userId, res };
                } catch (err) {
                    return { userId, res: { success: false, error: 'exception', details: err } };
                }
            })
        );

        const nextQueue = [];
        results.forEach(({ userId, res }) => {
            if (res.success) {
                console.log(`✅ Unfollowed ${userId}`);
            } else {
                retryCount[userId] = (retryCount[userId] || 0) + 1;
                if (retryCount[userId] <= maxRetries) {
                    console.log(`⚠️ Error unfollowing ${userId}, retry ${retryCount[userId]}`);
                    nextQueue.push(userId);
                } else {
                    console.log(`❌ Max retries reached for ${userId}, skipping`);
                }
            }
        });

        if (nextQueue.length > 0) await new Promise(r => setTimeout(r, 2000));
        unfollowQueue = nextQueue;
    }

    console.log(`🎯 Unfollow batch complete.`);

    return successfulFollows; // return followed IDs for further use
}






let ws = null;
let pingInterval = null;

function connectWebSocket() {
    const wsUrl = 'wss://free4talk-ws-s1.herokuapp.com/ws/socket-io/?pathname=%2F&EIO=3&transport=websocket';

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        // WebSocket connected
    };

    ws.onmessage = (event) => {
        const message = event.data;

        // Handle initial connection message
        if (message.startsWith('0')) {
            const data = JSON.parse(message.substring(1));

            // Send probe message
            ws.send('2probe');

            // Setup ping interval
            if (pingInterval) clearInterval(pingInterval);
            pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send('2'); // Send ping
                }
            }, data.pingInterval || 25000);
        }

        // Handle probe response
        if (message === '3probe') {
            ws.send('5'); // Upgrade to websocket
        }

        // Handle Socket.IO messages (starting with 42)
        if (message.startsWith('42')) {
            const payload = JSON.parse(message.substring(2));

            // Handle specific events
            if (payload[0] === 'groups:changes') {
                // Handle group changes here
            }
        }

        // Handle connection ready (40)
        if (message === '40') {
         //   subscribeToChannels();
        }
    };

    ws.onerror = (error) => {
        // WebSocket error
    };

    ws.onclose = () => {
        if (pingInterval) clearInterval(pingInterval);
      //  setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
    };
}

function subscribeToChannels() {
    // Subscribe to channels
    ws.send('42["subscribe",{"name":"channels:free4talk"}]');
    ws.send('42["version",541]');
    ws.send(`42["subscribe",{"name":"messages","token":"${userToken}"}]`);
    ws.send(`42["subscribe",{"name":"users","token":"${userToken}"}]`);
}






function createSocialButton() {
    const css = GatheredCSS();
    const gearBtn = document.getElementById('f4t-gear-btn');
    if (!gearBtn) return;

    const socialBtn = document.createElement('button');
    socialBtn.id = 'f4t-social-btn';
    socialBtn.innerHTML = '👥&#xfe0e;';
    socialBtn.title = 'Social';

    socialBtn.style.cssText = css.socialButton + `left: ${parseInt(gearBtn.style.left || '10', 10) + gearBtn.offsetWidth + 6}px;`;

    socialBtn.addEventListener('mouseenter', () => {
        socialBtn.style.cssText += css.socialButtonHoverGradient + css.socialButtonHoverTransform;
    });

    socialBtn.addEventListener('mouseleave', () => {
        socialBtn.style.cssText = css.socialButton + `left: ${parseInt(gearBtn.style.left || '10', 10) + gearBtn.offsetWidth + 6}px;` + css.socialButtonDefaultGradient + css.socialButtonDefaultTransform;
    });

    let panel = document.getElementById('f4t-social-panel');
    let backdrop = document.getElementById('f4t-social-backdrop');
    let isPanelOpen = false;

    const closePanel = () => {
        const onlineFriendsDisplay = document.getElementById('online-friends-display');
        if (onlineFriendsDisplay) {
            onlineFriendsDisplay.style.transition = 'transform 0.3s ease';
            onlineFriendsDisplay.style.transform = 'translateY(0)';
        }
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-20px)';
        backdrop.style.display = 'none';
        setTimeout(() => {
            panel.style.display = 'none';
            isPanelOpen = false;
        }, 300);
    };

    if (!panel) {
        backdrop = document.createElement('div');
        backdrop.id = 'f4t-social-backdrop';
        backdrop.style.cssText = css.socialBackdrop;

        panel = document.createElement('div');
        panel.id = 'f4t-social-panel';
        panel.style.cssText = css.socialPanel;

        const header = document.createElement('div');
        header.style.cssText = css.socialPanelHeader;

        const title = document.createElement('h3');
        title.textContent = 'Room Participants';
        title.style.cssText = css.socialPanelTitle;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = css.socialPanelCloseBtn;

        header.appendChild(title);
        header.appendChild(closeBtn);
        panel.appendChild(header);

        const content = document.createElement('div');
        content.id = 'f4t-participant-list';
        content.style.cssText = css.socialPanelContent;

        panel.appendChild(content);
        document.body.appendChild(backdrop);
        document.body.appendChild(panel);

        backdrop.addEventListener('click', closePanel);
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closePanel();
        });
    }

    socialBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const onlineFriendsDisplay = document.getElementById('online-friends-display');
        if (!isPanelOpen) {
            backdrop.style.display = 'block';
            panel.style.display = 'block';
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-20px)';
            panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            updateSocialParticipantList();
            setTimeout(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
                if (onlineFriendsDisplay) {
                    const rect = panel.getBoundingClientRect();
                    onlineFriendsDisplay.style.transition = 'transform 0.3s ease';
                    onlineFriendsDisplay.style.transform = `translateY(${rect.bottom + 30 - 58}px)`;
                }
            }, 100);
            isPanelOpen = true;

        } else {
            closePanel();
        }
    });

    document.body.appendChild(socialBtn);
}

function createToggleInterfaceButton() {
    const css = GatheredCSS();
    const gearBtn = document.getElementById('f4t-gear-btn');
    if (!gearBtn) {
        return;
    }

    const socialBtn = document.getElementById('f4t-social-btn');
    const previousBtn = socialBtn || gearBtn;

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'f4t-toggle-interface-btn';
    toggleBtn.innerHTML = '⬅';
    toggleBtn.title = 'Hide UI';
    toggleBtn.style.cssText = css.toggleButton;

    const previousRect = previousBtn.getBoundingClientRect();
    toggleBtn.style.position = 'fixed';
    toggleBtn.style.top = previousRect.top + 'px';
    toggleBtn.style.left = (previousRect.right + 104) + 'px';
    document.body.appendChild(toggleBtn);


toggleBtn.addEventListener('click', () => {
  audioManager.play("HideShowInterface");
    const isHidden = !toggleBtn.classList.contains('f4t-hidden');
    document.body.classList.toggle('f4t-script-ui-hidden', isHidden);
    toggleBtn.classList.toggle('f4t-hidden', isHidden);
      const onlineFriendsDisplay = document.getElementById('online-friends-display');
  if (onlineFriendsDisplay) {
    onlineFriendsDisplay.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    const currentY = onlineFriendsDisplay.style.transform.match(/translateY\(([^)]+)\)/)?.[1] || '0px';
    const xOffset = isHidden ? -20 : 0;
    onlineFriendsDisplay.style.transform = `translateX(${xOffset}px) translateY(${currentY})`;
    onlineFriendsDisplay.style.opacity = isHidden ? '0' : '1';
    onlineFriendsDisplay.style.pointerEvents = isHidden ? 'none' : 'auto';
  }


    const currentLeft = toggleBtn.getBoundingClientRect().left;
    const slideX = isHidden ? -currentLeft : 0;

    toggleBtn.style.transition = 'transform 0.40s ease-in-out, box-shadow 0.40s ease-in-out, background 0.40s ease-in-out';
    toggleBtn.style.transform = `translateX(${slideX}px) rotate(${isHidden ? 180 : 0}deg)`;

    toggleBtn.title = isHidden ? 'Show Script UI' : 'Hide Script UI';
});


   if (!document.getElementById('f4t-script-ui-hide-styles')) {
    const style = document.createElement('style');
    style.id = 'f4t-script-ui-hide-styles';
    style.textContent = css.hideUI;
    document.head.appendChild(style);
}
}
















function DarkModetransition(toDark = true) {
  const targetSelectors = [
    ".iVfUra > div",
    ".ant-btn.app",
    ".name-info.notranslate",
    ".ant-btn-link",
    ".ant-btn-background-ghost.ant-btn-primary",
    ".dKhrdL .audio-status-text .user-status",
    ".iIKqtQ .primary"
  ];

  function applyStyle(el) {
    if (!el.dataset.originalBg) el.dataset.originalBg = getComputedStyle(el).backgroundColor;
    if (!el.dataset.originalColor) el.dataset.originalColor = getComputedStyle(el).color;
    if (!el.dataset.originalBorder) el.dataset.originalBorder = getComputedStyle(el).borderColor;

    el.style.transition = "background-color 3s ease, color 3s ease, border-color 3s ease";

    if (el.matches(".name-info.notranslate, .ant-btn-link")) {
      el.style.color = toDark ? "white" : el.dataset.originalColor;
    } else if (el.matches(".ant-btn-background-ghost.ant-btn-primary")) {
      el.style.color = toDark ? "white" : el.dataset.originalColor;
      el.style.borderColor = toDark ? "white" : el.dataset.originalBorder;
    } else if (el.matches(".dKhrdL .audio-status-text .user-status")) {
      el.style.color = toDark ? "black" : el.dataset.originalColor;
    } else if (el.matches(".iIKqtQ .primary")) {
      el.style.color = toDark ? "white" : el.dataset.originalColor;
    } else {
      el.style.backgroundColor = toDark ? "black" : el.dataset.originalBg;
    }
  }

  targetSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(applyStyle);
  });

  if (toDark) {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            targetSelectors.forEach(selector => {
              if (node.matches(selector)) applyStyle(node);
              node.querySelectorAll(selector).forEach(applyStyle);
            });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.DarkModeObserver = observer;
  } else if (window.DarkModeObserver) {
    window.DarkModeObserver.disconnect();
    window.DarkModeObserver = null;
    targetSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(applyStyle);
    });
  }
}

let originalStyles = null;
let darkModeStyleElement = null;
let isDarkModeActive = false;
let isTransitioning = false;

const TRANSITION_DURATION = 2000;
const OVERLAY_OPACITY_DELAY = 50;
const STYLE_CHANGE_DELAY = 100;

function DarkModex(enable = true) {
    if (isDarkModeActive === enable || isTransitioning) return;

    isTransitioning = true;
    isDarkModeActive = enable;

    const bgElement = document.body;
    let overlay = document.querySelector('#f4t-dark-overlay');

    const setTransitions = (elements, properties) => {
        elements.forEach(el => {
            if (el) el.style.transition = `${properties} ${TRANSITION_DURATION}ms ease-in-out`;
        });
    };

    const clearTransitions = (elements) => {
        elements.forEach(el => {
            if (el) el.style.transition = '';
        });
    };

    const getComputedStyleValue = (el, prop) => {
        return el ? getComputedStyle(el)[prop] || '' : '';
    };

const getElements = () => {
    const selectors = {
        allButtons: 'button:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]):not([title*="tampermonkey"]):not([title*="script"])',
        antButtons: '.ant-btn:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]):not([title*="tampermonkey"]):not([title*="script"])',
        customIconBtn: '.ant-btn.custom-icon-btn:not([id^="f4t-"]):not([class*="f4t-"])',
        tabElements: '.ant-tabs-nav-container:not([id^="f4t-"]), .ant-tabs-bar:not([id^="f4t-"]), .ant-tabs-extra-content:not([id^="f4t-"]), .ant-tabs-tabpane:not([id^="f4t-"])',
        svgElements: '.ant-row-flex.gutter4.my-bg svg[data-icon="line"] path, .ant-drawer-content:not([id^="f4t-"]) svg[data-icon="line"] path, .ant-tabs-tabpane:not([id^="f4t-"]) svg[data-icon="line"] path, .ant-btn.custom-icon-btn svg[data-icon="line"] path',
        mentionsContainer: '.ant-mentions:not([id^="f4t-"]):not([class*="f4t-"])'
    };

    const container = document.querySelector('.ant-row-flex.gutter4.my-bg');
    const targetButtons = container ? Array.from(container.querySelectorAll('button.ant-btn:not([id^="f4t-"]):not([class*="f4t-"])')) : [];

    return {
        allButtons: [...Array.from(document.querySelectorAll(selectors.allButtons)), ...Array.from(document.querySelectorAll(selectors.antButtons))],
        targetButtons,
        customIconBtn: Array.from(document.querySelectorAll(selectors.customIconBtn)),
        drawer: document.querySelector('.ant-drawer-content:not([id^="f4t-"])'),
        mentionsTextarea: document.querySelector('.ant-mentions textarea:not([id^="f4t-"])'),
        mentionsContainer: document.querySelector(selectors.mentionsContainer),
        tabElements: Array.from(document.querySelectorAll(selectors.tabElements)),
        svgElements: Array.from(document.querySelectorAll(selectors.svgElements))
    };
};

    const storeOriginalStyles = (elements) => {
        return {
            allButtons: elements.allButtons.map(btn => ({
                element: btn,
                original: {
                    color: getComputedStyleValue(btn, 'color'),
                    backgroundColor: getComputedStyleValue(btn, 'backgroundColor')
                }
            })),
            targetButtons: elements.targetButtons.map(btn => ({
                element: btn,
                original: {
                    backgroundColor: getComputedStyleValue(btn, 'backgroundColor'),
                    color: getComputedStyleValue(btn, 'color')
                }
            })),

            drawer: elements.drawer ? {
                element: elements.drawer,
                original: {
                    backgroundColor: getComputedStyleValue(elements.drawer, 'backgroundColor')
                }
            } : null,
            mentionsTextarea: elements.mentionsTextarea ? {
                element: elements.mentionsTextarea,
                original: {
                    backgroundColor: getComputedStyleValue(elements.mentionsTextarea, 'backgroundColor'),
                    color: getComputedStyleValue(elements.mentionsTextarea, 'color')
                }
            } : null,
            tabElements: elements.tabElements.map(el => ({
                element: el,
                original: {
                    backgroundColor: getComputedStyleValue(el, 'backgroundColor')
                }
            })),
            svgElements: elements.svgElements.map(path => ({
                element: path,
                original: {
                    fill: getComputedStyleValue(path, 'fill')
                }
            }))
        };
    };

    const createOverlay = () => {
        if (overlay) return overlay;

        overlay = document.createElement("div");
        overlay.id = 'f4t-dark-overlay';
        Object.assign(overlay.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: "0",
            opacity: "0",
            transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`
        });

        bgElement.style.position = "relative";
        bgElement.insertBefore(overlay, bgElement.firstChild);
        return overlay;
    };

const createStyleElement = () => {
    if (!darkModeStyleElement) {
        darkModeStyleElement = document.createElement('style');
        darkModeStyleElement.id = 'f4t-dark-mode-styles';
        document.head.appendChild(darkModeStyleElement);
    }

    darkModeStyleElement.innerHTML = `
        .ant-drawer-content:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            background-color: #000000 !important;
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-tabs-tabpane:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            background-color: #000000 !important;
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-mentions textarea:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            background-color: #000000 !important;
            color: #ffffff !important;
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out, color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-mentions textarea:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"])::placeholder {
            color: #cccccc !important;
            transition: color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-mentions:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            background-color: #000000 !important;
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-tabs-nav-container:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]),
        .ant-tabs-bar:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]),
        .ant-tabs-extra-content:not([id^="f4t-"]):not([id*="tampermonkey"]) {
            background-color: #000000 !important;
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-row-flex.gutter4.my-bg .ant-btn:not([id^="f4t-"]):not([class*="f4t-"]) {
            background-color: #000000 !important;
            border-color: #000000 !important;
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out, border-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-btn.custom-icon-btn:not([id^="f4t-"]):not([class*="f4t-"]) {
            background-color: #000000 !important;
            border-color: #000000 !important;
            color: #ffffff !important;
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out, border-color ${TRANSITION_DURATION}ms ease-in-out, color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-row-flex.gutter4.my-bg svg[data-icon="line"] path:not([id^="f4t-"]),
        .ant-drawer-content:not([id^="f4t-"]):not([class*="f4t-"]) svg[data-icon="line"] path,
        .ant-tabs-tabpane:not([id^="f4t-"]):not([class*="f4t-"]) svg[data-icon="line"] path,
        .ant-btn.custom-icon-btn svg[data-icon="line"] path {
            fill: white !important;
            transition: fill ${TRANSITION_DURATION}ms ease-in-out !important;
        }
    `;
};
const createTransitionStyleElement = () => {
    if (!darkModeStyleElement) {
        darkModeStyleElement = document.createElement('style');
        darkModeStyleElement.id = 'f4t-dark-mode-styles';
        document.head.appendChild(darkModeStyleElement);
    }

    darkModeStyleElement.innerHTML = `
        .ant-drawer-content:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-tabs-tabpane:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-mentions textarea:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out, color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-mentions:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]) {
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-tabs-nav-container:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]),
        .ant-tabs-bar:not([id^="f4t-"]):not([class*="f4t-"]):not([id*="tampermonkey"]),
        .ant-tabs-extra-content:not([id^="f4t-"]):not([id*="tampermonkey"]) {
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-row-flex.gutter4.my-bg .ant-btn:not([id^="f4t-"]):not([class*="f4t-"]) {
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out, border-color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-btn.custom-icon-btn:not([id^="f4t-"]):not([class*="f4t-"]) {
            transition: background-color ${TRANSITION_DURATION}ms ease-in-out, border-color ${TRANSITION_DURATION}ms ease-in-out, color ${TRANSITION_DURATION}ms ease-in-out !important;
        }
        .ant-row-flex.gutter4.my-bg svg[data-icon="line"] path:not([id^="f4t-"]),
        .ant-drawer-content:not([id^="f4t-"]):not([class*="f4t-"]) svg[data-icon="line"] path,
        .ant-tabs-tabpane:not([id^="f4t-"]):not([class*="f4t-"]) svg[data-icon="line"] path,
        .ant-btn.custom-icon-btn svg[data-icon="line"] path {
            transition: fill ${TRANSITION_DURATION}ms ease-in-out !important;
        }
    `;
};
    const applyDarkStyles = (styles) => {
        styles.allButtons.forEach(({ element }) => {
            element.style.color = 'white';
        });
        styles.targetButtons.forEach(({ element }) => {
            element.style.backgroundColor = 'black';
        });

        if (styles.drawer?.element) {
            styles.drawer.element.style.backgroundColor = '#0a1014';
        }
        if (styles.mentionsTextarea?.element) {
            styles.mentionsTextarea.element.style.backgroundColor = '#000000';
            styles.mentionsTextarea.element.style.color = '#ffffff';
        }
        styles.tabElements.forEach(({ element }) => {
            element.style.backgroundColor = '#000000';
        });
        styles.svgElements.forEach(({ element }) => {
            element.style.fill = 'white';
        });
    };

    const restoreOriginalStyles = (styles) => {
        styles.allButtons.forEach(({ element, original }) => {
            element.style.color = original.color;
            element.style.backgroundColor = original.backgroundColor;
        });
        styles.targetButtons.forEach(({ element, original }) => {
            element.style.backgroundColor = original.backgroundColor;
            element.style.color = original.color;
        });

        if (styles.drawer?.element && styles.drawer.original) {
            styles.drawer.element.style.backgroundColor = styles.drawer.original.backgroundColor;
        }
        if (styles.mentionsTextarea?.element && styles.mentionsTextarea.original) {
            styles.mentionsTextarea.element.style.backgroundColor = styles.mentionsTextarea.original.backgroundColor;
            styles.mentionsTextarea.element.style.color = styles.mentionsTextarea.original.color;
        }
        styles.tabElements.forEach(({ element, original }) => {
            element.style.backgroundColor = original.backgroundColor;
        });
        styles.svgElements.forEach(({ element, original }) => {
            element.style.fill = original.fill;
        });
    };

    const getAllElements = (styles) => {
        return [
            ...styles.allButtons.map(item => item.element),
            ...styles.targetButtons.map(item => item.element),
            styles.drawer?.element,
            styles.mentionsTextarea?.element,
            ...styles.tabElements.map(item => item.element),
            ...styles.svgElements.map(item => item.element)
        ].filter(el => el);
    };

    const elements = getElements();

    if (!originalStyles) {
        originalStyles = storeOriginalStyles(elements);
    }

    const allElements = getAllElements(originalStyles);

    if (enable) {
        overlay = createOverlay();
        createStyleElement();
        DarkModetransition();

        setTransitions(allElements, 'color, background-color, fill');

        setTimeout(() => {
            overlay.style.opacity = "1";
        }, 10);

        setTimeout(() => {
            applyDarkStyles(originalStyles);
        }, 20);

        setTimeout(() => {
            clearTransitions(allElements);
            isTransitioning = false;
        }, TRANSITION_DURATION + 50);

    } else {
        createTransitionStyleElement();
        DarkModetransition(false);

        setTransitions(allElements, 'color, background-color, fill');

        if (overlay) {
            overlay.style.opacity = '0';
        }

        setTimeout(() => {
            restoreOriginalStyles(originalStyles);
        }, 20);

        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.remove();
                overlay = null;
            }
            if (darkModeStyleElement && darkModeStyleElement.parentNode) {
                darkModeStyleElement.remove();
                darkModeStyleElement = null;
            }
            clearTransitions(allElements);
            isTransitioning = false;
        }, TRANSITION_DURATION + 50);
    }
}

function clickTabsPreload() {


    const clickButton = (blindText) => {
        const buttons = document.querySelectorAll('button.btn-blind');
        for (const btn of buttons) {
            const textDiv = btn.querySelector('div.blind');
            if (textDiv && textDiv.textContent.trim() === blindText) {
                btn.click();
                return true;
            }
        }
        return false;
    };

    if (clickButton('Social Box')) {
        setTimeout(() => {
            if (clickButton('Application')) {
                setTimeout(() => {
                    clickButton('Chat Box');
                }, 10);
            }
        }, 10);
    }

    const observer = new MutationObserver((mutations, obs) => {
        const el = document.querySelector('.ant-tabs-nav-wrap');
        if (el) {

            obs.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}
clickTabsPreload();

async function startInitialization() {
        await fetchRelationships();
        setupNotificationSystem();
        createMessagesUI();
        checkAndDisplayOnlineFriends();
    addIPButton();
   setTimeout(logUnreadFriendsVerbose, 1000);
   setTimeout(connectWebSocket, 2000);







        setInterval(checkAndDisplayOnlineFriends, 5000);
    }
}
setupWebSocketInterceptor(currentUserEID);
if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
initialize();}
})();
