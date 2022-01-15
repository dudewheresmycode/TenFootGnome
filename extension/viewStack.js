/* exported ViewStackLayout */
const { Clutter, GObject } = imports.gi;

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
