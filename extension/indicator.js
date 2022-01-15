/* exported TenFootIndicator */
const { Gio, GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Extension = Me.imports.extension;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

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

      this._propSeparator = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(this._propSeparator);

      const openItem = new PopupMenu.PopupMenuItem('Open Interface');
      this.menu.addMenuItem(openItem);
      openItem.connect('activate', this._openInterface.bind(this));

      const settingsItem = new PopupMenu.PopupMenuItem('Settings');
      this.menu.addMenuItem(settingsItem);
    }

    _openInterface() {
      Extension.tenFoot.show();
    }
  }
);
