/* exported TenFootScreen */
const { Clutter, Meta, Shell, St } = imports.gi;

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
    this._isShown = false;
    // Main.layoutManager.addChrome(Main.layoutManager.tenfootGroup);
    Main.layoutManager.addTopChrome(Main.layoutManager.tenfootGroup);

    this.settings = ExtensionUtils.getSettings(SCHEMA_KEY);

    this.actor = Main.layoutManager.tenfootGroup;
    // this.actor.get_accessible().set_role(Atk.Role.WINDOW);

    // add menu
    // TODO: Add view manager to switch between these views
    this.list = new MenuList.ListViewManager({ visible: false });
    this.actor.add_child(this.list);

    this.apps = new AppGrid.AppGrid({ visible: true });
    this.actor.add_child(this.apps);

    Main.layoutManager.connect('startup-prepared', () => {
      this._adjustSize();
    });

    Main.layoutManager.connect('startup-complete', () => {
      if (this.settings.get_boolean('show-on-startup')) {
        this.showModal();
      }
    });

    this.actor.connect('show', () => {
      this._adjustSize();
      this._grabFocus();
    });

    global.stage.connect('key-press-event', this._onStageKeyPressed.bind(this));

    Shell.AppSystem.get_default().connect('app-state-changed', this._updateRunningCount.bind(this));
  }

  exit() {
    this.hideModal(true);
    this.homeScreen();
  }
  showSettings() {
    this.apps.hide();
    this.list.show();
    this._grabFocus();
  }

  homeScreen() {
    this.list.hide();
    this.apps.show();
    this._grabFocus();
  }

  _adjustSize() {
    this.actor.set_position(0, 0);
    this.actor.set_size(global.screen_width, global.screen_height);
  }

  _updateRunningCount(appSys, app) {
    if (app) {
      if (app.state == Shell.AppState.STARTING) {
        return;
      }
    }
    const apps = Shell.AppSystem.get_default().get_running();
    this._nAppsRunning = apps.length;
    if (this._nAppsRunning) {
      this.hideModal(false);
    } else if (this._isShown) {
      this.showModal(true);
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
      this.list.mainView.grab_key_focus();
      this.list.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
    }
  }

  _onStageKeyPressed(actor, event) {
    // let shift = event.has_shift_modifier();
    // let code = event.get_key_code();
    let symbol = event.get_key_symbol();

    // press Q to exit interface
    if (symbol == Clutter.KEY_Q || symbol == 113) {
      // 113 = lowercase Q
      this.hideModal(true);
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }

  showModal(skipAnimation = false) {
    if (!this._grabModal()) {
      // TODO: Make this error visible to the user
      log('Could not acquire modal grab for the 10-foot screen');
    }
    this._isShown = true;
    // set to the very top of the ui stack to cover all other components
    Main.layoutManager.uiGroup.set_child_below_sibling(this.actor, global.top_window_group);

    // global.display.set_cursor(Meta.Cursor.NONE);
    global.display.set_cursor(Meta.Cursor.CROSSHAIR);

    if (!this.actor.visible) {
      this.actor.show();
      if (!skipAnimation) {
        this.actor.opacity = 0;
        this.actor.ease({
          opacity: 255,
          duration: 1000,
          mode: Clutter.AnimationMode.EASE_OUT_QUAD
        });
      } else {
        this.actor.opacity = 255;
      }
    }
  }

  hideModal(userHidden = false) {
    this.actor.remove_all_transitions();
    this.actor.opacity = 0;
    if (userHidden) {
      this._isShown = false;
    }
    global.display.set_cursor(Meta.Cursor.DEFAULT);
    this._removeModal();
    this.actor.hide();
  }

  _removeModal() {
    if (this._isModal) {
      Main.popModal(this.actor);
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
