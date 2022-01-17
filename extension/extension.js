/* extension.js */
/* exported init */
const { Gio, Meta, Shell } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Settings = Me.imports.settings;
const TenFootIndicator = Me.imports.indicator;
const TenFootScreen = Me.imports.screen;
const Main = imports.ui.main;

// global constants
window.SCHEMA_KEY = 'org.gnome.shell.extensions.tenfootgnome';
window.HELP_URL = 'https://dudewheresmycode.github.io/TenFootGnome/';

const MEDIA_KEYS_SCHEMA = 'org.gnome.settings-daemon.plugins.media-keys';
const DISABLE_ANIMATIONS = true;
var restoreShouldAnimate;

class TenFoot {
  constructor() {}

  enable() {
    log(`${Me.metadata.name} enabling`);
    // Create a panel indicator
    let indicatorName = `${Me.metadata.name} Indicator`;
    this._indicator = new TenFootIndicator.TenFootIndicator(indicatorName);
    Main.panel.addToStatusArea(indicatorName, this._indicator);

    // Create the fullscreen 10-foot interface
    this.screen = new TenFootScreen.TenFootScreen();

    this.settings = ExtensionUtils.getSettings(SCHEMA_KEY);

    // if (
    //   !Main.wm.addKeybinding(
    //     'home-static',
    //     new Gio.Settings({ schema_id: MEDIA_KEYS_SCHEMA }),
    //     Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
    //     Shell.ActionMode.NORMAL,
    //     this._exitKeyHandler.bind(this)
    //   )
    // ) {
    //   log('Could not bind to home key!');
    // }

    Main.wm.addKeybinding(
      'tf-exit-shortcut',
      Settings.SETTINGS,
      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
      Shell.ActionMode.ALL,
      this._exitKeyHandler.bind(this)
    );

    Main.wm.addKeybinding(
      'tf-home-shortcut',
      Settings.SETTINGS,
      Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
      Shell.ActionMode.ALL,
      this._homeKeyHandler.bind(this)
    );

    if (DISABLE_ANIMATIONS) {
      restoreShouldAnimate = Main.wm._shouldAnimate;
      Main.wm._shouldAnimate = function (_actor) {
        return false;
      };
    }
  }

  _exitKeyHandler() {
    this.hide();
  }

  _homeKeyHandler() {
    // TODO: exit all running apps?
    log('_homeKeyHandler');
  }

  disable() {
    log(`${Me.metadata.name} disabling`);
    this.screen.hideModal();
    this.screen.destroy();
    this.screen = null;
    this._indicator.destroy();
    this._indicator = null;
    if (DISABLE_ANIMATIONS) {
      Main.wm._shouldAnimate = restoreShouldAnimate;
    }
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
  log(`${Me.metadata.name} init`);
  return new TenFoot();
}
