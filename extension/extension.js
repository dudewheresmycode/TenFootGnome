/* extension.js */
/* exported init, debug */
// const { Clutter, Gio, GObject, Meta, Shell, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const TenFootIndicator = Me.imports.indicator;
const TenFootScreen = Me.imports.screen;
const Main = imports.ui.main;
// const PopupMenu = imports.ui.popupMenu;
// const PanelMenu = imports.ui.panelMenu;

window.SCHEMA_KEY = 'org.gnome.shell.extensions.tenfootgnome';

function debug(...args) {
  log(`[tenfoot]`, ...args);
}

var tenFoot = null;
var restoreShouldAnimate;

class TenFoot {
  constructor() {
    this._isModal = false;
    this._desktopHidden = false;
    // this.connect('destroy', this._onDestroy.bind(this));
  }

  enable() {
    debug(`Starting ${Me.metadata.name}`);
    let indicatorName = `${Me.metadata.name} Indicator`;

    // Create a panel button
    this._indicator = new TenFootIndicator.TenFootIndicator(indicatorName);

    // add to the panel area
    Main.panel.addToStatusArea(indicatorName, this._indicator);

    this.screen = new TenFootScreen.TenFootScreen();

    restoreShouldAnimate = Main.wm._shouldAnimate;
    Main.wm._shouldAnimate = function (_actor) {
      return false;
    };
  }

  disable() {
    debug('Restoring window animations');
    Main.wm._shouldAnimate = restoreShouldAnimate;
    debug(`disabling ${Me.metadata.name}`);
    this.screen.hideModal();
    this.screen.destroy();
    this.screen = null;
    this._indicator.destroy();
    this._indicator = null;
  }

  show() {
    this.screen.showModal();
  }

  hide(closeModal = true) {
    if (closeModal) {
      this.screen.hideModal();
    } else {
      log('hide');
      this.screen.actor.hide();
    }
  }
  // _hideDesktop() {
  //   this._desktopHidden = true;
  //   Main.panel.hide();
  //   Main.layoutManager.overviewGroup.hide();
  //   // ubuntu dock extension
  //   Main.extensionManager.disableExtension('ubuntu-dock@ubuntu.com');
  // }

  // _restoreDesktop() {
  //   this._desktopHidden = false;
  //   Main.panel.show();
  //   Main.layoutManager.overviewGroup.show();
  //   // ubuntu dock extension
  //   Main.extensionManager.enableExtension('ubuntu-dock@ubuntu.com');
  // }
}

function init() {
  tenFoot = new TenFoot();
  return tenFoot;
}
