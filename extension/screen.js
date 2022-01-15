/* exported TenFootScreen */
const { Clutter, Shell, St } = imports.gi;

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MenuList = Me.imports.menuList;
const AppGrid = Me.imports.appGrid;

var TenFootScreen = class {
  constructor() {
    Main.layoutManager.tenfootGroup = new St.Widget({
      name: 'tenfootGroup',
      style_class: 'tf-group',
      x_expand: true,
      y_expand: true,
      visible: false,
      clip_to_allocation: true,
      layout_manager: new Clutter.BinLayout()
    });
    // Main.layoutManager.addChrome(Main.layoutManager.tenfootGroup);
    Main.layoutManager.addTopChrome(Main.layoutManager.tenfootGroup);

    this.actor = Main.layoutManager.tenfootGroup;
    // this.actor.get_accessible().set_role(Atk.Role.WINDOW);
    // // add to the very top of the ui stack to cover all other components
    Main.layoutManager.uiGroup.set_child_below_sibling(this.actor, global.top_window_group);

    // add menu
    // TODO: Add view manager to switch between these views
    this.list = new MenuList.MenuList({ visible: false });
    // add some test items
    this.list.addItem({ id: 'app', label: 'Launch App' });
    this.list.addItem({ id: 'settings', label: 'Settings' });
    this.list.addItem({ id: 'exit', label: 'Exit' });
    this.actor.add_child(this.list);

    this.list.connect('activate', this._itemClick.bind(this));

    this.apps = new AppGrid.AppGrid({ visible: true });
    this.actor.add_child(this.apps);

    Main.layoutManager.connect('startup-prepared', () => {
      this.actor.set_position(0, 0);
      this.actor.set_size(global.screen_width, global.screen_height);
    });

    Main.layoutManager.connect('startup-complete', () => {
      // TODO: Build an auto-startup user pref
      this.showModal();
    });

    this.actor.connect('show', () => {
      this._grabFocus();
    });

    global.stage.connect('key-press-event', this._onStageKeyPressed.bind(this));

    Shell.AppSystem.get_default().connect('app-state-changed', this._updateRunningCount.bind(this));
    this._updateRunningCount();
  }

  _updateRunningCount() {
    const apps = Shell.AppSystem.get_default().get_running();
    this._nAppsRunning = apps.length;
    if (this._nAppsRunning) {
      this.hideModal();
    } else {
      this.showModal();
    }
  }

  _grabFocus() {
    if (this.apps.visible) {
      if (!this.apps.appView._viewIsReady) {
        this.apps.appView.connect('view-loaded', () => {
          this.apps.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
        });
      } else {
        this.apps.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
      }
    } else if (this.list.visible) {
      this.list.grab_key_focus();
    }
  }

  _onStageKeyPressed(actor, event) {
    let shift = event.has_shift_modifier();
    let code = event.get_key_code();
    let symbol = event.get_key_symbol();
    log(`key-shift: ${shift}`);
    log(`key-symbol: ${symbol}`);
    log(`key-code: ${code}`);

    // press shift-Q to exit interface
    if (symbol == Clutter.KEY_Escape || symbol == Clutter.KEY_Q) {
      this.hideModal();
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }

  _itemClick(userList, activatedItem) {
    switch (activatedItem.id) {
      case 'exit':
        this.hideModal();
        break;
    }
  }

  showModal() {
    if (!this._grabModal()) {
      // TODO: Make this error visible to the user
      log('Could not acquire modal grab for the 10-foot screen');
    }
    this.actor.show();
    Main.panel.hide();
  }

  hideModal() {
    this._removeModal();
    Main.panel.show();
    this.actor.hide();
  }

  _removeModal() {
    if (this._isModal) {
      log('popModal');
      const res = Main.popModal(this.actor);
      log('result: ', res);
      this._isModal = false;
    }
  }

  _grabModal() {
    if (this._isModal) {
      return true;
    }
    this._isModal = Main.pushModal(this.actor, { actionMode: Shell.ActionMode.NORMAL });
    return this._isModal;
  }
};
