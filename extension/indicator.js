/* exported TenFootIndicator */
const { Gio, GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Extension = Me.imports.extension;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Util = imports.misc.util;

var TenFootIndicator = GObject.registerClass(
  class TenFootIndicator extends PanelMenu.Button {
    _init(name) {
      super._init(0.5, _(name));

      this._hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
      // this._hbox.add_child(this._container);

      let icon = new St.Icon({
        gicon: new Gio.ThemedIcon({ name: 'video-display' }),
        style_class: 'system-status-icon'
      });
      this._hbox.add_child(icon);

      this._hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));

      this.add_child(this._hbox);

      const infoItem = new PopupMenu.PopupMenuItem('TenFootGnome v0.1', { hover: false, reactive: false });
      this.menu.addMenuItem(infoItem);

      const aboutItem = new PopupMenu.PopupMenuItem('About');
      this.menu.addMenuItem(aboutItem);
      aboutItem.connect('activate', this._openAbout.bind(this));

      this._propSeparator = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(this._propSeparator);

      this.settings = ExtensionUtils.getSettings(SCHEMA_KEY);

      this.startupOption = new PopupMenu.PopupSwitchMenuItem(
        'Show on Startup',
        this.settings.get_boolean('show-on-startup')
      );
      this.startupOption.connect('toggled', this._toggleStartup.bind(this));
      this.menu.addMenuItem(this.startupOption);

      // this.startupOption
      // this._startupToggle = this.settings.get_boolean ('show-on-startup');
      // Bind the switch to the `show-indicator` key
      // this.settings.bind(
      //   'show-on-startup',
      //   this._startupToggle,
      //   'active',
      //   Gio.SettingsBindFlags.DEFAULT
      // );
      // const settingsItem = new PopupMenu.PopupMenuItem('Settings');
      // this.menu.addMenuItem(settingsItem);

      const openItem = new PopupMenu.PopupMenuItem('Open Interface');
      this.menu.addMenuItem(openItem);
      openItem.connect('activate', this._openInterface.bind(this));
    }

    _openAbout() {
      Util.spawn(['xdg-open', 'https://github.com/dudewheresmycode/TenFootGnome']);
    }

    _openInterface() {
      Extension.tenFoot.show();
    }

    _toggleStartup(actor, value) {
      log(`_toggleStartup: ${value}`);
      this.settings.set_boolean('show-on-startup', value);
    }
  }
);
