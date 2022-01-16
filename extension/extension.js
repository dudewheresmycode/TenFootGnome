/* extension.js */
/* exported init */
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const TenFootIndicator = Me.imports.indicator;
const TenFootScreen = Me.imports.screen;
const Main = imports.ui.main;

window.SCHEMA_KEY = 'org.gnome.shell.extensions.tenfootgnome';

var tenFoot = null;
var restoreShouldAnimate;

class TenFoot {
  constructor() {
    this._isModal = false;
    this._desktopHidden = false;
  }

  enable() {
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
    Main.wm._shouldAnimate = restoreShouldAnimate;
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
      this.screen.actor.hide();
    }
  }
}

function init() {
  tenFoot = new TenFoot();
  return tenFoot;
}
