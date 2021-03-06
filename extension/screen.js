/* exported TenFootScreen */
const { Clutter, Meta, Shell, St } = imports.gi;

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MenuList = Me.imports.menuList;
const AppGrid = Me.imports.appGrid;
const Sounds = Me.imports.sounds;

var TenFootScreen = class {
  constructor() {
    this.lightbox = new St.Widget({
      visible: false,
      // can_focus: false,
      // reactive: false,
      style: 'background-color: #000'
    });
    Main.layoutManager.addTopChrome(this.lightbox);

    this.actor = new St.Widget({
      name: 'tenfootGroup',
      style_class: 'tf-group',
      x_expand: true,
      y_expand: true,
      // can_focus: false,
      // reactive: false,
      visible: false,
      clip_to_allocation: true,
      layout_manager: new Clutter.BinLayout()
    });
    this._isShown = false;

    Main.layoutManager.addTopChrome(this.actor);

    this.settings = ExtensionUtils.getSettings(SCHEMA_KEY);

    // add menu
    // TODO: Add view manager to switch between these views
    this.list = new MenuList.ListViewManager({ visible: false });
    this.actor.add_child(this.list);

    this.apps = new AppGrid.AppGrid({ visible: true });
    this.actor.add_child(this.apps);

    this.sounds = new Sounds.Sounds();

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
      this._grabFocus(this.apps);
    });

    this.list.connect('show', () => {
      this._grabFocus(this.list);
    });
    this.apps.appView.connect('view-loaded', () => {
      this._grabFocus(this.apps.appView);
    });
    this.apps.connect('show', () => {
      this._grabFocus(this.apps.appView, St.DirectionType.TAB_BACKWARD);
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
    // this._grabFocus();
  }

  homeScreen() {
    this.list.hide();
    this.apps.show();
    // this._grabFocus();
  }

  _adjustSize() {
    this.lightbox.set_position(0, 0);
    this.lightbox.set_size(global.screen_width, global.screen_height);

    this.actor.set_position(0, 0);
    // this.actor.queue_relayout();
    this.actor.set_size(Main.layoutManager.primaryMonitor.width, Main.layoutManager.primaryMonitor.height);
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

  _grabFocus(actor, direction = St.DirectionType.TAB_FORWARD) {
    // fixes issue where item becomes active, but not focused,
    // likely a race condition if the first focusable child doesn't exist when we move the focus to the root
    let focusSet = actor.navigate_focus(null, direction, false);
    if (!focusSet) {
      Meta.later_add(Meta.LaterType.BEFORE_REDRAW, () => {
        actor.navigate_focus(null, direction, false);
        return false;
      });
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
      log('Could not acquire modal grab for the 10-foot screen!');
    }
    this._isShown = true;
    // set to the very top of the ui stack to cover all other components
    Main.layoutManager.uiGroup.set_child_below_sibling(this.actor, global.top_window_group);
    // set our lightbox below the main ui group
    Main.layoutManager.uiGroup.set_child_below_sibling(this.lightbox, this.actor);

    this.lightbox.show();

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

    this._removeModal();
    this.lightbox.hide();
    this.actor.hide();
    // reset
    this.homeScreen();
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
    this._isModal = Main.pushModal(this.actor, {
      actionMode: Shell.ActionMode.NONE
      // seems to fix unclutter, we don't need the mouse pointer anyways
      // options: Meta.ModalOptions.POINTER_ALREADY_GRABBED
    });
    return this._isModal;
  }
};
