/* exported AppView, AppGrid */
const { Clutter, GLib, GObject, Graphene, Meta, Shell, St } = imports.gi;

const AppFavorites = imports.ui.appFavorites;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Extension = Me.imports.extension;
const IconGrid = imports.ui.iconGrid;
const Main = imports.ui.main;
const Params = imports.misc.params;
const Util = imports.misc.util;

var MAX_COLUMNS = 5;
var MIN_COLUMNS = 4;
var MIN_ROWS = 4;

var AppIcon = GObject.registerClass(
  {
    Signals: {
      'menu-state-changed': { param_types: [GObject.TYPE_BOOLEAN] },
      'sync-tooltip': {}
    }
  },
  class AppIcon extends St.Button {
    _init(app) {
      super._init({
        style_class: 'app-well-app',
        pivot_point: new Graphene.Point({ x: 0.5, y: 0.5 }),
        reactive: true,
        button_mask: St.ButtonMask.ONE | St.ButtonMask.TWO,
        can_focus: true
      });

      this.app = app;
      this.id = app.get_id();
      this.name = app.get_name();

      this._iconContainer = new St.Widget({ layout_manager: new Clutter.BinLayout(), x_expand: true, y_expand: true });

      this.set_child(this._iconContainer);

      this._delegate = this;

      // // Get the isDraggable property without passing it on to the BaseIcon:
      // let appIconParams = Params.parse(iconParams, { isDraggable: true }, true);
      // let isDraggable = appIconParams['isDraggable'];
      // delete iconParams['isDraggable'];
      const iconParams = {};
      iconParams['createIcon'] = this._createIcon.bind(this);
      iconParams['setSizeManually'] = true;
      this.icon = new IconGrid.BaseIcon(app.get_name(), iconParams);
      this._iconContainer.add_child(this.icon);

      this.label_actor = this.icon.label;

      this._stateChangedId = this.app.connect('notify::state', () => {
        this._makeFullscreen();
      });

      this.connect('destroy', this._onDestroy.bind(this));
    }

    _makeFullscreen() {
      if (this.app.state == Shell.AppState.RUNNING) {
        // Extension.tenFoot.hide();
        const windows = this.app.get_windows();
        if (windows.length === 1) {
          windows[0].connect('shown', () => {
            log('window shown');
            // Extension.tenFoot.hide();
          });
          windows[0].make_fullscreen();
          // Extension.tenFoot.hide(false);
        }
      } else {
        // Extension.tenFoot.show();
      }
    }

    _onDestroy() {
      if (this._stateChangedId > 0) {
        this.app.disconnect(this._stateChangedId);
      }
      this._stateChangedId = 0;
    }

    _createIcon(iconSize) {
      return this.app.create_icon_texture(iconSize);
    }

    vfunc_clicked(button) {
      this.activate(button);
    }

    getId() {
      return this.app.get_id();
    }

    activateWindow(metaWindow) {
      if (metaWindow) {
        Main.activateWindow(metaWindow);
      } else {
        // Main.overview.hide();
      }
    }

    activate(button) {
      let event = Clutter.get_current_event();
      let modifiers = event ? event.get_state() : 0;
      let isMiddleButton = button && button == Clutter.BUTTON_MIDDLE;
      let isCtrlPressed = (modifiers & Clutter.ModifierType.CONTROL_MASK) != 0;
      let openNewWindow =
        this.app.can_open_new_window() && this.app.state == Shell.AppState.RUNNING && (isCtrlPressed || isMiddleButton);

      if (this.app.state == Shell.AppState.STOPPED || openNewWindow) this.animateLaunch();

      if (openNewWindow) {
        this.app.open_new_window(-1);
      } else {
        this.app.activate();
      }
    }

    animateLaunch() {
      this.icon.animateZoomOut();
    }

    animateLaunchAtPos(x, y) {
      this.icon.animateZoomOutAtPos(x, y);
    }

    shellWorkspaceLaunch(params) {
      let { stack } = new Error();
      log('shellWorkspaceLaunch is deprecated, use app.open_new_window() instead\n%s'.format(stack));

      params = Params.parse(params, { workspace: -1, timestamp: 0 });

      this.app.open_new_window(params.workspace);
    }

    scaleAndFade() {
      this.reactive = false;
      this.ease({
        scale_x: 0.75,
        scale_y: 0.75,
        opacity: 128
      });
    }

    undoScaleAndFade() {
      this.reactive = true;
      this.ease({
        scale_x: 1.0,
        scale_y: 1.0,
        opacity: 255
      });
    }
  }
);

var ViewStackLayout = GObject.registerClass(
  {
    Signals: { 'allocated-size-changed': { param_types: [GObject.TYPE_INT, GObject.TYPE_INT] } }
  },
  class ViewStackLayout extends Clutter.BinLayout {
    vfunc_allocate(actor, box, flags) {
      let availWidth = box.x2 - box.x1;
      let availHeight = box.y2 - box.y1;
      // Prepare children of all views for the upcoming allocation, calculate all
      // the needed values to adapt available size
      this.emit('allocated-size-changed', availWidth, availHeight);
      super.vfunc_allocate(actor, box, flags);
    }
  }
);

var AppView = GObject.registerClass(
  {
    Signals: {
      'view-loaded': {}
    }
  },
  class AppView extends St.Widget {
    _init(params = {}, gridParams = {}) {
      super._init(
        Params.parse(params, {
          layout_manager: new Clutter.BinLayout(),
          x_expand: true,
          y_expand: true
        })
      );

      gridParams = Params.parse(
        gridParams,
        {
          columnLimit: MAX_COLUMNS,
          minRows: MIN_ROWS,
          minColumns: MIN_COLUMNS,
          padWithSpacing: true
        },
        true
      );

      // TODO: Should probably use the paginated grid
      this._grid = new IconGrid.IconGrid(gridParams);
      // this._grid = new IconGrid.PaginatedIconGrid(gridParams);

      this._grid.connect('child-focused', (grid, actor) => {
        this._childFocused(actor);
      });
      this._grid.connect('key-press-event', this._onKeyPress.bind(this));

      // Standard hack for ClutterBinLayout
      this._grid.x_expand = true;
      this._grid._delegate = this;

      this._items = new Map();
      this._orderedItems = [];
      this._viewLoadedHandlerId = 0;
      this._viewIsReady = false;

      this._scrollView = new St.ScrollView({
        // style_class: 'all-apps',
        overlay_scrollbars: true,
        x_expand: true,
        y_expand: true,
        reactive: true
        // style: 'background-color: blue;'
      });
      this.add_actor(this._scrollView);
      this._scrollView.set_policy(St.PolicyType.NEVER, St.PolicyType.EXTERNAL);

      this._stack = new St.Widget({ layout_manager: new Clutter.BinLayout() });
      this._stack.add_actor(this._grid);

      let box = new St.BoxLayout({
        // vertical: true,
        x_align: Clutter.ActorAlign.CENTER
        // y_align: Clutter.ActorAlign.START,
        // style: 'background-color: green;'
      });
      box.add_actor(this._stack);
      this._scrollView.add_actor(box);

      // this._scrollView.connect('scroll-event', this._onScroll.bind(this));

      this._availWidth = 0;
      this._availHeight = 0;

      // defer redisplay
      this._redisplayWorkId = Main.initializeDeferredWork(this, this._redisplay.bind(this));
      // this._hideWorkId = Main.initializeDeferredWork(this, this._hideScreen.bind(this));

      Shell.AppSystem.get_default().connect('installed-changed', () => {
        this._viewIsReady = false;
        AppFavorites.getAppFavorites().reload();
        this._queueRedisplay();
      });
      AppFavorites.getAppFavorites().connect('changed', this._queueRedisplay.bind(this));
    }

    _queueRedisplay() {
      Main.queueDeferredWork(this._redisplayWorkId);
    }

    _childFocused(icon) {
      Util.ensureActorVisibleInScrollView(this._scrollView, icon);
      this._lastFocused = icon;
    }

    _onKeyPress(actor, event) {
      let symbol = event.get_key_symbol();
      let direction = null;
      if (symbol === Clutter.KEY_Tab || symbol === Clutter.KEY_Right) {
        direction = St.DirectionType.RIGHT;
      } else if (symbol === Clutter.KEY_ISO_Left_Tab || symbol === Clutter.KEY_Left) {
        direction = St.DirectionType.LEFT;
      } else if (symbol === Clutter.KEY_Up) {
        direction = St.DirectionType.UP;
      } else if (symbol === Clutter.KEY_Down) {
        direction = St.DirectionType.DOWN;
      }

      if (this._lastFocused && direction) {
        this._grid.navigate_focus(this._lastFocused, direction, false);
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    }

    _selectAppInternal(id) {
      if (this._items.has(id)) this._items.get(id).navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
      else log('No such application %s'.format(id));
    }

    selectApp(id) {
      if (this._items.has(id)) {
        let item = this._items.get(id);

        if (item.mapped) {
          this._selectAppInternal(id);
        } else {
          // Need to wait until the view is mapped
          let signalId = item.connect('notify::mapped', (actor) => {
            if (actor.mapped) {
              actor.disconnect(signalId);
              this._selectAppInternal(id);
            }
          });
        }
      } else {
        // Need to wait until the view is built
        let signalId = this.connect('view-loaded', () => {
          this.disconnect(signalId);
          this.selectApp(id);
        });
      }
    }
    _compareItems(a, b) {
      return a.name.localeCompare(b.name);
    }

    _redisplay() {
      let oldApps = this._orderedItems.slice();
      let oldAppIds = oldApps.map((icon) => icon.id);
      // TODO: allow custom ordering?
      let newApps = this._loadApps().sort(this._compareItems);
      let newAppIds = newApps.map((icon) => icon.id);

      let addedApps = newApps.filter((icon) => !oldAppIds.includes(icon.id));
      let removedApps = oldApps.filter((icon) => !newAppIds.includes(icon.id));

      // Remove old app icons
      removedApps.forEach((icon) => {
        let iconIndex = this._orderedItems.indexOf(icon);
        let id = icon.id;

        this._orderedItems.splice(iconIndex, 1);
        icon.destroy();
        this._items.delete(id);
      });

      // Add new app icons
      addedApps.forEach((icon) => {
        let iconIndex = newApps.indexOf(icon);

        this._orderedItems.splice(iconIndex, 0, icon);
        this._grid.addItem(icon, iconIndex);
        this._items.set(icon.id, icon);
      });

      this._viewIsReady = true;
      this.emit('view-loaded');
    }

    _loadApps() {
      let appIcons = [];

      let favorites = AppFavorites.getAppFavorites().getFavoriteMap();

      let appSys = Shell.AppSystem.get_default();

      this._folderIcons = [];

      for (let appId in favorites) {
        let icon = this._items.get(appId);
        if (!icon) {
          let app = appSys.lookup_app(appId);
          icon = new AppIcon(app);
        }
        appIcons.push(icon);
      }
      return appIcons;
    }

    // _onScroll() {
    //   // log('_onScroll');
    // }

    adaptToSize(width, height) {
      let box = new Clutter.ActorBox();
      box.x1 = 0;
      box.x2 = width;
      box.y1 = 0;
      box.y2 = height;
      box = this.get_theme_node().get_content_box(box);
      box = this._scrollView.get_theme_node().get_content_box(box);
      box = this._grid.get_theme_node().get_content_box(box);
      let availWidth = box.x2 - box.x1;
      let availHeight = box.y2 - box.y1;
      // let oldNPages = this._grid.nPages();

      log(`availWidth: ${availWidth}, availHeight: ${availHeight}`);
      this._grid.adaptToSize(availWidth, availHeight);

      let fadeOffset = Math.min(this._grid.topPadding, this._grid.bottomPadding);
      this._scrollView.update_fade_effect(fadeOffset, 0);
      if (fadeOffset > 0) this._scrollView.get_effect('fade').fade_edges = true;

      if (this._availWidth != availWidth || this._availHeight != availHeight /*|| oldNPages != this._grid.nPages()*/) {
        Meta.later_add(Meta.LaterType.BEFORE_REDRAW, () => {
          return GLib.SOURCE_REMOVE;
        });
      }

      this._availWidth = availWidth;
      this._availHeight = availHeight;
    }
  }
);

var AppGrid = GObject.registerClass(
  class AppGrid extends St.BoxLayout {
    _init(params = {}) {
      super._init(
        Params.parse(
          params,
          {
            style_class: 'tf-app-grid app-display',
            vertical: true,
            x_expand: true,
            y_expand: true
          },
          true
        )
      );
      this.appView = new AppView();

      this._viewStackLayout = new ViewStackLayout();
      this._viewStack = new St.Widget({ x_expand: true, y_expand: true, layout_manager: this._viewStackLayout });
      this._viewStackLayout.connect('allocated-size-changed', this._onAllocatedSizeChanged.bind(this));

      this._viewStack.add_actor(this.appView);

      this.add_actor(this._viewStack);
    }

    _onAllocatedSizeChanged(actor, width, height) {
      let box = new Clutter.ActorBox();
      box.x1 = box.y1 = 0;
      box.x2 = width;
      box.y2 = height;
      box = this._viewStack.get_theme_node().get_content_box(box);
      let availWidth = box.x2 - box.x1;
      let availHeight = box.y2 - box.y1;
      this.appView.adaptToSize(availWidth, availHeight);
    }
  }
);
