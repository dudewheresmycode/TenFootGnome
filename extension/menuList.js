/* exported MenuList, MenuListItem */
const { Clutter, GObject, Meta, St } = imports.gi;

const _SCROLL_ANIMATION_TIME = 500;

var MenuListItem = GObject.registerClass(
  { Signals: { activate: {} } },
  class MenuListItem extends St.Button {
    _init({ id, label }, parent) {
      let layout = new St.BoxLayout({
        vertical: true,
        x_align: Clutter.ActorAlign.START
      });
      super._init({
        style_class: 'tf-menu-item',
        button_mask: St.ButtonMask.ONE | St.ButtonMask.THREE,
        can_focus: true,
        x_expand: true,
        child: layout,
        label,
        reactive: true
      });

      this.id = id;
      this.list = parent;

      this.connect('notify::hover', () => {
        this._setSelected(this.hover);
      });

      this.connect('key-press-event', this._onKeyPress.bind(this));
    }

    _onKeyPress(actor, event) {
      log(actor.get_name());
      let symbol = event.get_key_symbol();
      if (symbol === Clutter.KEY_Tab || symbol === Clutter.KEY_Down) {
        log('Tab down');
        this.list.navigate_focus(actor, St.DirectionType.TAB_FORWARD, true);
        return Clutter.EVENT_STOP;
      } else if (symbol === Clutter.KEY_ISO_Left_Tab || symbol === Clutter.KEY_Up) {
        log('Tab up');
        this.list.navigate_focus(actor, St.DirectionType.TAB_BACKWARD, true);
        return Clutter.EVENT_STOP;
      }
      return Clutter.EVENT_PROPAGATE;
    }

    vfunc_key_focus_in() {
      super.vfunc_key_focus_in();
      this._setSelected(true);
    }

    vfunc_key_focus_out() {
      super.vfunc_key_focus_out();
      this._setSelected(false);
    }
    vfunc_clicked() {
      this.emit('activate');
    }

    _setSelected(selected) {
      if (selected) {
        this.add_style_pseudo_class('selected');
        this.grab_key_focus();
      } else {
        this.remove_style_pseudo_class('selected');
      }
    }
  }
);

var MenuList = GObject.registerClass(
  {
    Signals: {
      activate: { param_types: [MenuListItem.$gtype] },
      'item-added': { param_types: [MenuListItem.$gtype] }
    }
  },
  class MenuList extends St.ScrollView {
    _init(params = {}) {
      super._init({
        ...params,
        style_class: 'tf-menu',
        x_expand: true,
        y_expand: true
      });
      this.set_policy(St.PolicyType.NEVER, St.PolicyType.AUTOMATIC);

      this._box = new St.BoxLayout({ vertical: true, style_class: 'tf-menu-list', pseudo_class: 'expanded' });

      this.add_actor(this._box);
      this._items = {};
    }

    scrollToItem(item) {
      let box = item.get_allocation_box();

      let adjustment = this.get_vscroll_bar().get_adjustment();

      let value = box.y1 + adjustment.step_increment / 2.0 - adjustment.page_size / 2.0;
      adjustment.ease(value, {
        mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        duration: _SCROLL_ANIMATION_TIME
      });
    }

    jumpToItem(item) {
      let box = item.get_allocation_box();

      let adjustment = this.get_vscroll_bar().get_adjustment();

      let value = box.y1 + adjustment.step_increment / 2.0 - adjustment.page_size / 2.0;

      adjustment.set_value(value);
    }

    addItem(data) {
      let item = new MenuListItem(data, this);
      this._items[data.id] = item;
      this._box.add_child(item);

      item.connect('activate', this._onItemActivated.bind(this));

      // Try to keep the focused item front-and-center
      item.connect('key-focus-in', () => this.scrollToItem(item));

      this._moveFocusToItems();
    }

    removeItem(label) {
      let item = this._items[label];
      if (!item) {
        return;
      }
      item.destroy();
      delete this._items[label];
    }

    numItems() {
      return Object.keys(this._items).length;
    }

    _moveFocusToItems() {
      let hasItems = Object.keys(this._items).length > 0;

      if (!hasItems) return;

      if (global.stage.get_key_focus() != this) return;

      let focusSet = this.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
      if (!focusSet) {
        Meta.later_add(Meta.LaterType.BEFORE_REDRAW, () => {
          this._moveFocusToItems();
          return false;
        });
      }
    }

    _onItemActivated(activatedItem) {
      log('_onItemActivated', activatedItem.id);
      this.emit('activate', activatedItem);
    }

    vfunc_key_focus_in() {
      super.vfunc_key_focus_in();
      this._moveFocusToItems();
    }

    // vfunc_allocate() {
    //   debug('vfunc_allocate');
    //   this.grab_key_focus();
    // }
  }
);
